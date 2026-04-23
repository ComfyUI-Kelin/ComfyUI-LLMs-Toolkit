import base64
import json
import io
from PIL import Image
from typing import Optional, Union
import torch

# ── Config ──────────────────────────────────────────────────────────────
MAX_IMAGES = 8


class ImagePrep:
    """
    Preprocess up to {MAX_IMAGES} images into base64 data-URIs for LLM vision input.
    Only connected slots are processed; unused slots cost nothing.
    """

    @classmethod
    def INPUT_TYPES(cls):
        optional = {
            "format": (["PNG", "JPEG", "WebP", "GIF", "BMP", "TIFF"], {"default": "PNG"}),
            "quality": (["High", "Medium", "Low"], {"default": "High"}),
        }
        for i in range(2, MAX_IMAGES + 1):
            optional[f"image_{i}"] = ("IMAGE", {"default": None})
        return {
            "required": {
                "image": ("IMAGE", {"default": None}),
            },
            "optional": optional,
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("processed_image",)
    FUNCTION = "preprocess"
    CATEGORY = "🚦ComfyUI_LLMs_Toolkit/Image"

    # ── Internal ────────────────────────────────────────────────────────

    def _tensor_to_pil(self, tensor: torch.Tensor) -> Image.Image:
        arr = tensor.cpu().numpy()
        if len(arr.shape) == 3 and arr.shape[2] == 1:
            arr = arr.squeeze(-1)
        return Image.fromarray((arr * 255).astype("uint8"))

    def _encode(self, image: Image.Image, fmt: str, quality_val: int) -> str:
        size_map = {"High": 1024, "Medium": 768, "Low": 512}
        max_size = size_map.get(fmt, 1024)
        if max(image.size) > max_size:
            image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

        buf = io.BytesIO()
        kw = {"format": fmt}
        if fmt in ("JPEG", "WebP"):
            kw["quality"] = quality_val
        image.save(buf, **kw)

        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        print(f"[LLMs_Toolkit] encoded={buf.tell()/1024:.1f}KB {fmt} ({image.width}x{image.height})")
        return f"data:image/{fmt.lower()};base64,{b64}"

    def _process_tensor(self, t: torch.Tensor, fmt, qval):
        urls = []
        if len(t.shape) == 4:
            for i in range(t.shape[0]):
                urls.append(self._encode(self._tensor_to_pil(t[i]), fmt, qval))
        else:
            urls.append(self._encode(self._tensor_to_pil(t), fmt, qval))
        return urls

    # ── Entry ───────────────────────────────────────────────────────────

    def preprocess(self, image=None, format="PNG", quality="High", **kwargs):
        quality_val = {"High": 95, "Medium": 75, "Low": 50}.get(quality, 95)

        slots = [image] + [kwargs.get(f"image_{i}") for i in range(2, MAX_IMAGES + 1)]
        imgs = [s for s in slots if s is not None]

        if not imgs:
            raise ValueError("At least one image input must be provided.")

        urls = []
        for img in imgs:
            if isinstance(img, torch.Tensor):
                urls.extend(self._process_tensor(img, format, quality_val))
            elif isinstance(img, Image.Image):
                urls.append(self._encode(img, format, quality_val))
            else:
                raise ValueError("Unsupported image type. Expected torch.Tensor or PIL.Image.")

        return (json.dumps(urls),)


NODE_CLASS_MAPPINGS = {"ImagePrep": ImagePrep}
NODE_DISPLAY_NAME_MAPPINGS = {"ImagePrep": "Image Prep"}
