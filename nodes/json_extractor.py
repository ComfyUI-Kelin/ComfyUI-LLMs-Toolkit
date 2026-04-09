import json
from typing import Any, Tuple

from comfy_api.latest import IO


class JSONExtractor:
    """
    Extract value from JSON string by key.
    """

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "json_string": ("STRING", {
                    "forceInput": True
                }),
                "key": ("STRING", {
                    "default": "",
                    "label": "Key to extract"
                })
            }
        }

    RETURN_TYPES = (IO.AnyType.io_type,)
    RETURN_NAMES = ("value",)
    FUNCTION = "extract"
    CATEGORY = "🚦ComfyUI_LLMs_Toolkit/JSON"

    def extract(self, json_string: str, key: str) -> Tuple[Any]:
        """
        Extract value from JSON string by key.
        
        Args:
            json_string: JSON string to parse
            key: Key to extract (supports nested keys like 'user.name')
            
        Returns:
            Extracted value as string
        """
        try:
            # Parse JSON string
            data = json.loads(json_string)
            
            # Handle nested keys (e.g., "user.profile.name")
            keys = key.split('.')
            value = data
            
            for k in keys:
                if isinstance(value, dict):
                    value = value.get(k)
                    if value is None:
                        return (f"Key '{k}' not found",)
                else:
                    return (f"Cannot access key '{k}' on non-dict value",)
            
            # Preserve scalar JSON types so downstream nodes can receive native values.
            if isinstance(value, (dict, list)):
                result = json.dumps(value, ensure_ascii=False)
            elif isinstance(value, (str, int, float, bool)) or value is None:
                result = value
            else:
                result = str(value)
            
            preview = str(result)[:50]
            print(f"[LLMs_Toolkit] extracted {key}={preview}...")
            return (result,)
            
        except json.JSONDecodeError as e:
            error_msg = f"Invalid JSON: {str(e)}"
            print(f"[LLMs_Toolkit] {error_msg}")
            return (error_msg,)
        except Exception as e:
            error_msg = f"Extraction error: {str(e)}"
            print(f"[LLMs_Toolkit] {error_msg}")
            return (error_msg,)


# Register the node
NODE_CLASS_MAPPINGS = {"JSONExtractor": JSONExtractor}
NODE_DISPLAY_NAME_MAPPINGS = {"JSONExtractor": "JSON Extractor"}
