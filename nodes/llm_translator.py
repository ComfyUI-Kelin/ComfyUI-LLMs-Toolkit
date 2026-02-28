"""
LLM Translator — Unix-philosophy translation node.

Do One Thing and Do It Well: translate text via LLM API.
Reuses the shared LLMClient for robustness.
"""

import time
import json
from typing import Dict, Any, Tuple

try:
    from .api_client import LLMClient
except ImportError:
    from api_client import LLMClient


class LLMTranslator:
    """
    LLM驱动的极简翻译节点 - Unix哲学设计
    Do One Thing and Do It Well.
    """

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "llm_config": ("LLM_CONFIG",),
                "text": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "placeholder": "Input text here..."
                }),
                "target_language": ([
                    "English",
                    "Chinese (Simplified)",
                    "Chinese (Traditional)",
                    "Japanese",
                    "Korean",
                    "French",
                    "German",
                    "Spanish",
                    "Russian",
                    "Italian",
                    "Portuguese",
                    "Dutch",
                    "Arabic"
                ], {
                    "default": "English"
                }),
            },
            "optional": {
                "glossary": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "placeholder": "Optional glossary (Term = Translation)"
                }),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("translated_text",)
    FUNCTION = "translate"
    CATEGORY = "🚦ComfyUI_LLMs_Toolkit/Utility"

    def translate(
        self,
        llm_config: Dict[str, Any],
        text: str,
        target_language: str,
        glossary: str = ""
    ) -> Tuple[str]:
        """Execute translation. Returns error text on failure instead of crashing."""
        if not text.strip():
            return ("",)

        start_time = time.time()

        # Build system instruction
        system_instruction = (
            f"You are a professional translator. Translate the following text into {target_language}. "
            "Maintain the original tone, style, and formatting. "
            "Output ONLY the translated text, no explanations."
        )
        if glossary.strip():
            system_instruction += f"\n\nGlossary (Strictly follow):\n{glossary}"

        # Build payload
        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": text}
        ]
        payload = {
            "model": llm_config.get("model", ""),
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 4096
        }

        # Call API via shared client
        try:
            client = LLMClient(
                base_url=llm_config.get("base_url", ""),
                api_key=llm_config.get("api_key", ""),
                max_retries=3,
                timeout=60,
            )
            translated_text, _ = client.chat(payload)

            elapsed = int((time.time() - start_time) * 1000)
            print(f"[LLM Translator] {len(text)} chars -> {target_language} ({elapsed}ms)")

            return (translated_text.strip(),)

        except Exception as e:
            elapsed = int((time.time() - start_time) * 1000)
            print(f"[LLM Translator] ✗ Translation failed ({elapsed}ms): {e}")
            return (f"[Translation Error] {str(e)[:200]}",)


# ComfyUI Node Registration
NODE_CLASS_MAPPINGS = {"LLMTranslator": LLMTranslator}
NODE_DISPLAY_NAME_MAPPINGS = {"LLMTranslator": "LLM Translator (Simple)"}
