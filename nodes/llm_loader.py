from typing import Optional
from nodes.openai_compatible import ProviderRegistry


class LLM_Loader:
    """
    Custom node for loading LLM models via a base URL and model name
    """

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "provider": ([
                    "Qwen/通义千问",
                    "DeepSeek/深度求索",
                    "DouBao/豆包",
                    "Spark/星火",
                    "GLM/智谱清言",
                    "Moonshot/月之暗面",
                    "Baichuan/百川",
                    "MiniMax/MiniMax",
                    "StepFun/阶跃星辰",
                    "SenseChat/日日新",
                    "Custom/自定义"
                ], {
                    "default": "Qwen/通义千问"
                }),
                "model": ("STRING", {
                    "default": "",
                    "label": "模型名称"
                }),
                "api_key": ("STRING", {
                    "default": "",
                    "label": "API Key"
                }),
            },
            "optional": {
                "custom_base_url": ("STRING", {
                    "default": "",
                    "label": "自定义 Base URL",
                    "placeholder": "https://api.example.com/v1"
                }),
            }
        }

    @classmethod
    def VALIDATE_INPUTS(cls, provider, model, api_key, custom_base_url=""):
        """Validate inputs"""
        if provider == "Custom/自定义" and (not custom_base_url or not custom_base_url.strip()):
            return "选择自定义时,必须填写自定义 Base URL"
        if not model or not model.strip():
            return "Model name cannot be empty"
        if not api_key or not api_key.strip():
            return "API Key cannot be empty"
        return True

    RETURN_TYPES = ("LLM_CONFIG",)
    RETURN_NAMES = ("llm_config",)
    FUNCTION = "generate"
    CATEGORY = "🚦ComfyUI_LLMs_Toolkit/Loader"

    def generate(self, provider: str, model: str, api_key: str, custom_base_url: str = ""):
        # Use ProviderRegistry as single source of truth
        if provider == "Custom/自定义":
            actual_base_url = custom_base_url.strip()
            print(f"[LLMs_Toolkit] 配置加载: Custom URL ({actual_base_url}) / {model}")
        else:
            provider_config = ProviderRegistry.get_provider(provider)
            actual_base_url = provider_config.base_url
            print(f"[LLMs_Toolkit] 配置加载: {provider} / {model}")

        config = {
            "provider": provider,
            "base_url": actual_base_url,
            "model": model,
            "api_key": api_key
        }

        return (config,)

# 注册节点
NODE_CLASS_MAPPINGS = {"LLM_Loader": LLM_Loader}
NODE_DISPLAY_NAME_MAPPINGS = {"LLM_Loader": "LLMs Loader"}

