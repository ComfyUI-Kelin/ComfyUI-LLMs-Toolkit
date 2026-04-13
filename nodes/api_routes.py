"""
LLM Provider Management API Routes for ComfyUI.

Provides RESTful endpoints for managing LLM provider configurations
(API keys, base URLs, models). Data is persisted to config/providers.json.

Routes are registered via ComfyUI's PromptServer at startup.
"""

import os
import json
import shutil
import uuid
import logging
from pathlib import Path
from aiohttp import web

# Resolve config paths relative to the plugin root
_PLUGIN_ROOT = Path(__file__).resolve().parent.parent
_CONFIG_DIR = _PLUGIN_ROOT / "config"
_PROVIDERS_FILE = _CONFIG_DIR / "providers.json"
_DEFAULT_PROVIDERS_FILE = _CONFIG_DIR / "default_providers.json"

logger = logging.getLogger("[LLMs_Toolkit.Routes]")


# ─── Data Access Layer ───────────────────────────────────────────────────────

def _ensure_providers_file() -> dict:
    """
    Ensure providers.json exists. If not, copy from default_providers.json.
    Returns the parsed providers data with schema migration applied.
    """
    _CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    if not _PROVIDERS_FILE.exists():
        if _DEFAULT_PROVIDERS_FILE.exists():
            shutil.copy2(_DEFAULT_PROVIDERS_FILE, _PROVIDERS_FILE)
            try:
                os.chmod(_PROVIDERS_FILE, 0o600)
            except OSError:
                pass  # Windows doesn't support Unix permissions
            logger.info(f"Initialized providers.json from defaults.")
        else:
            # Fallback: create empty structure
            data = {"providers": []}
            _PROVIDERS_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
            try:
                os.chmod(_PROVIDERS_FILE, 0o600)
            except OSError:
                pass  # Windows doesn't support Unix permissions
            logger.warning("No default_providers.json found, created empty providers.json.")

    data = _load_providers()
    
    # ── Schema Migration ──────────────────────────────────────────────────
    if _DEFAULT_PROVIDERS_FILE.exists():
        try:
            with open(_DEFAULT_PROVIDERS_FILE, "r", encoding="utf-8") as f:
                default_data = json.load(f)
                default_providers = {p.get("id"): p for p in default_data.get("providers", []) if p.get("id")}
                
            needs_save = False
            for p in data.get("providers", []):
                # If it's a system provider (or ID matches a default), ensure it has all default keys
                if p.get("id") in default_providers:
                    dp = default_providers[p["id"]]
                    for key, val in dp.items():
                        if key not in p:
                            p[key] = val
                            needs_save = True
            
            if needs_save:
                _save_providers(data)
                logger.info("Migrated providers.json schema to include missing default fields.")
        except Exception as e:
            logger.error(f"Schema migration failed: {e}")

    return data


def _load_providers() -> dict:
    """Load and return providers data from disk."""
    try:
        with open(_PROVIDERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError) as e:
        logger.error(f"Failed to load providers.json: {e}")
        return {"providers": []}


def _save_providers(data: dict):
    """Persist providers data to disk."""
    _CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(_PROVIDERS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    # Restrict file permissions — API keys should only be readable by owner
    try:
        os.chmod(_PROVIDERS_FILE, 0o600)
    except OSError:
        pass  # Windows doesn't support Unix permissions


# ─── API Route Handlers ─────────────────────────────────────────────────────

def _mask_key(key: str) -> str:
    """Mask an API key for safe transmission to the frontend."""
    if not key:
        return ""
    if len(key) <= 8:
        return "••••"
    return key[:3] + "••••••" + key[-4:]


async def get_providers(request: web.Request) -> web.Response:
    """GET /llm_toolkit/providers — Return all provider configurations."""
    import copy
    data = _ensure_providers_file()
    safe_data = copy.deepcopy(data)
    for p in safe_data.get("providers", []):
        p["apiKey"] = _mask_key(p.get("apiKey", ""))
    return web.json_response(safe_data)


async def save_provider(request: web.Request) -> web.Response:
    """POST /llm_toolkit/providers — Create or update a provider (upsert by id)."""
    try:
        body = await request.json()
    except json.JSONDecodeError:
        return web.json_response({"error": "Invalid JSON body"}, status=400)

    provider_id = body.get("id")
    if not provider_id:
        # New provider — generate UUID
        provider_id = str(uuid.uuid4())[:8]
        body["id"] = provider_id
        body["isSystem"] = False

    # Ensure required fields have defaults
    body.setdefault("name", "Unnamed Provider")
    body.setdefault("type", "openai")
    body.setdefault("apiKey", "")
    body.setdefault("apiHost", "")
    body.setdefault("models", [])
    body.setdefault("enabled", True)

    data = _ensure_providers_file()
    providers = data.get("providers", [])

    # Upsert: find existing by id and replace, or append
    found = False
    for i, p in enumerate(providers):
        if p.get("id") == provider_id:
            # Preserve existing key if frontend sent back a masked value
            incoming_key = body.get("apiKey", "")
            if not incoming_key or "\u2022\u2022\u2022\u2022" in incoming_key:
                body["apiKey"] = p.get("apiKey", "")
            # Preserve isSystem flag from existing record
            body["isSystem"] = p.get("isSystem", False)
            providers[i] = body
            found = True
            break

    if not found:
        providers.append(body)

    data["providers"] = providers
    _save_providers(data)

    logger.info(f"{'Updated' if found else 'Created'} provider: {body.get('name')} ({provider_id})")
    # Return masked key in the response to avoid leaking it
    import copy
    safe_body = copy.deepcopy(body)
    safe_body["apiKey"] = _mask_key(safe_body.get("apiKey", ""))
    return web.json_response({"status": "ok", "provider": safe_body})


async def delete_provider(request: web.Request) -> web.Response:
    """DELETE /llm_toolkit/providers/{id} — Remove a user-created provider."""
    provider_id = request.match_info.get("id")
    if not provider_id:
        return web.json_response({"error": "Provider ID is required"}, status=400)

    data = _ensure_providers_file()
    providers = data.get("providers", [])

    # Find the provider
    target = None
    for p in providers:
        if p.get("id") == provider_id:
            target = p
            break

    if target is None:
        return web.json_response({"error": "Provider not found"}, status=404)

    if target.get("isSystem", False):
        return web.json_response({"error": "Cannot delete system provider"}, status=403)

    providers = [p for p in providers if p.get("id") != provider_id]
    data["providers"] = providers
    _save_providers(data)

    logger.info(f"Deleted provider: {provider_id}")
    return web.json_response({"status": "ok"})


async def check_provider(request: web.Request) -> web.Response:
    """POST /llm_toolkit/providers/check — Test API key connectivity."""
    try:
        body = await request.json()
    except json.JSONDecodeError:
        return web.json_response({"error": "Invalid JSON body"}, status=400)

    provider_id = body.get("providerId", "").strip()
    api_host = body.get("apiHost", "").strip()
    model = body.get("model", "").strip()

    # Priority: explicit non-masked apiKey from frontend > stored key by providerId
    raw_key = body.get("apiKey", "").strip()
    if raw_key and "••••" not in raw_key:
        api_key = raw_key
    elif provider_id:
        api_key = ""
        data = _load_providers()
        for p in data.get("providers", []):
            if p.get("id") == provider_id:
                api_key = p.get("apiKey", "")
                break
    else:
        api_key = raw_key

    if not api_key or not api_host:
        return web.json_response({"error": "apiKey and apiHost are required"}, status=400)

    # Use the shared LLMClient to perform a minimal test call
    try:
        import api_client
        import asyncio
        skip_ssl = body.get("skipSSLVerify", False)
        client = api_client.LLMClient(base_url=api_host, api_key=api_key, skip_ssl_verify=skip_ssl)
        
        # 1. Try fetching models (doesn't consume tokens)
        try:
            await asyncio.to_thread(client.list_models)
        except Exception as e_models:
            logger.warning(f"Check API: /models failed ({str(e_models)[:100]}), falling back to /chat/completions")
            
            # 2. Fallback to a minimal chat completion if /models is not supported
            payload = {
                "model": model or "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": "Hi"}],
                "max_tokens": 1,
                "stream": False
            }
            await asyncio.to_thread(client.chat, payload)

        return web.json_response({
            "status": "ok",
            "message": "Connection successful"
        })

    except Exception as e:
        error_msg = str(e)[:500]
        hint = ""
        error_lower = error_msg.lower()
        if "401" in error_msg or "unauthorized" in error_lower or "authentication" in error_lower:
            hint = "API Key may be invalid or expired. Please check and re-enter."
        elif "403" in error_msg or "forbidden" in error_lower:
            hint = "Access denied. Your API Key may lack required permissions."
        elif "404" in error_msg or "not found" in error_lower:
            hint = "Model or endpoint not found. Please verify the model name and Base URL."
        elif "429" in error_msg or "rate" in error_lower or "quota" in error_lower:
            hint = "Rate limited or quota exceeded. Check your usage on the provider's website."
        elif "timeout" in error_lower or "timed out" in error_lower:
            hint = "Connection timed out. Check your network or try again later."
        elif "ssl" in error_lower or "certificate" in error_lower:
            hint = "SSL certificate error. Try enabling 'Skip SSL Verification' for this provider."
        elif "connection" in error_lower or "refused" in error_lower or "resolve" in error_lower:
            hint = "Cannot connect to the server. Please check the Base URL and your network."

        return web.json_response({
            "status": "error",
            "message": error_msg,
            "hint": hint
        }, status=502)


async def fetch_models(request: web.Request) -> web.Response:
    """POST /llm_toolkit/providers/models - Fetch available models from provider API."""
    try:
        body = await request.json()
    except json.JSONDecodeError:
        return web.json_response({"error": "Invalid JSON body"}, status=400)

    provider_id = body.get("providerId", "").strip()
    api_host = body.get("apiHost", "").strip()
    skip_ssl = body.get("skipSSLVerify", False)

    # Look up API key from stored config
    api_key = ""
    raw_key = body.get("apiKey", "").strip()
    if raw_key and "•" not in raw_key:  # not masked
        api_key = raw_key
    elif provider_id:
        data = _load_providers()
        for p in data.get("providers", []):
            if p.get("id") == provider_id:
                api_key = p.get("apiKey", "")
                break

    if not api_key or not api_host:
        return web.json_response({"error": "apiKey and apiHost are required"}, status=400)

    try:
        import api_client
        import asyncio
        client = api_client.LLMClient(base_url=api_host, api_key=api_key, skip_ssl_verify=skip_ssl)
        result = await asyncio.to_thread(client.list_models)

        # Extract model IDs from the response
        models = []
        if isinstance(result, dict) and "data" in result:
            for m in result["data"]:
                if isinstance(m, dict) and "id" in m:
                    models.append(m["id"])

        models.sort()
        return web.json_response({"status": "ok", "models": models})
    except Exception as e:
        return web.json_response({
            "status": "error",
            "message": str(e)[:500]
        }, status=502)


async def get_usage_stats(request: web.Request) -> web.Response:
    """GET /llm_toolkit/usage — Return token usage history (last 500 entries)."""
    from collections import deque
    usage_file = _CONFIG_DIR / "usage.jsonl"
    max_entries = 500
    stats = deque(maxlen=max_entries)
    
    if usage_file.exists():
        try:
            with open(usage_file, "r", encoding="utf-8") as f:
                for line in f:
                    stripped = line.strip()
                    if stripped:
                        try:
                            stats.append(json.loads(stripped))
                        except json.JSONDecodeError:
                            continue  # skip corrupted lines
        except Exception as e:
            logger.error(f"Failed to read usage stats: {e}")
            
    return web.json_response({"status": "ok", "usage": list(stats)})


# ─── Route Registration (decorator-based, same pattern as ComfyUI-Manager) ──

try:
    from server import PromptServer

    @PromptServer.instance.routes.get("/llm_toolkit/providers")
    async def _route_get_providers(request):
        return await get_providers(request)

    @PromptServer.instance.routes.get("/llm_toolkit/usage")
    async def _route_get_usage(request):
        return await get_usage_stats(request)

    @PromptServer.instance.routes.post("/llm_toolkit/providers")
    async def _route_save_provider(request):
        return await save_provider(request)

    @PromptServer.instance.routes.delete("/llm_toolkit/providers/{id}")
    async def _route_delete_provider(request):
        return await delete_provider(request)

    @PromptServer.instance.routes.post("/llm_toolkit/providers/check")
    async def _route_check_provider(request):
        return await check_provider(request)

    @PromptServer.instance.routes.post("/llm_toolkit/providers/models")
    async def _route_fetch_models(request):
        return await fetch_models(request)

    print("[LLMs_Toolkit] ✓ All API routes registered (including /llm_toolkit/usage)")
except Exception as e:
    print(f"[LLMs_Toolkit] ✗ Failed to register API routes: {e}")
    import traceback
    traceback.print_exc()
