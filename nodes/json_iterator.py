import json
import os
import signal
import sys

# Global counter: key=file_path, value=current_index
_JSON_ITER_COUNTERS = {}


def _interrupt_handler(signum, frame):
    """Called when the iterator is exhausted, terminating the workflow queue."""
    print("[JSONIterator] All items iterated. Stopping workflow.")
    sys.exit(0)


class JSONIterator:
    """
    Load a local JSON file or a directory containing JSON files and iterate through them.
    - If a directory is provided: Iterates through all .json files in it.
    - If a JSON file containing an array is provided: Iterates through its items.
    - If a regular JSON file is provided: Returns its content (1 iteration).
    """

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "file_path": ("STRING", {"default": "", "multiline": False, "placeholder": "/path/to/folder_or_file.json"}),
                "start_index": ("INT", {"default": 0, "min": 0, "max": 0xffffffffffffffff, "step": 1}),
                "auto_next": ("BOOLEAN", {"default": True, "label_on": "Auto (iterates each run)", "label_off": "Manual (use start_index)"}),
                "reset_iterator": ("BOOLEAN", {"default": False, "label_on": "Reset NOW", "label_off": "Continue"}),
            },
        }

    RETURN_TYPES = ("STRING", "INT", "INT")
    RETURN_NAMES = ("json_string", "current_index", "total_items")
    FUNCTION = "iterate"
    CATEGORY = "🚦ComfyUI_LLMs_Toolkit/JSON"

    @classmethod
    def IS_CHANGED(cls, file_path, start_index, auto_next, reset_iterator):
        # Always re-run so the counter can advance each execution
        return float("NaN")

    def iterate(self, file_path, start_index, auto_next, reset_iterator):
        global _JSON_ITER_COUNTERS

        # --- Validate path ---
        if not file_path or not os.path.exists(file_path):
            print(f"[JSONIterator] Path not found: {file_path}")
            return (f'{{"error": "Path not found: {file_path}"}}', -1, 0)

        data_items = []
        is_directory = os.path.isdir(file_path)

        # --- Gather items to iterate ---
        if is_directory:
            # Case 1: Directory - find all .json files
            files = [f for f in os.listdir(file_path) if f.lower().endswith('.json')]
            files.sort()
            if not files:
                return (f'{{"error": "No .json files found in directory: {file_path}"}}', -1, 0)
            data_items = [os.path.join(file_path, f) for f in files]
        else:
            # Case 2: Single File
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = json.load(f)
                if isinstance(content, list):
                    # It's an array - iterate its items
                    data_items = content
                else:
                    # It's a single object - wrap it
                    data_items = [content]
            except Exception as e:
                return (f'{{"error": "Failed to load JSON file: {str(e)}"}}', -1, 0)

        total_items = len(data_items)
        if total_items == 0:
            return (f'{{"error": "No items to iterate."}}', -1, 0)

        # --- Counter management ---
        key = file_path

        if reset_iterator or key not in _JSON_ITER_COUNTERS:
            _JSON_ITER_COUNTERS[key] = start_index
            if reset_iterator:
                print(f"[JSONIterator] Iterator reset to index {start_index} for: {file_path}")

        # --- Determine index to use ---
        if auto_next:
            current_idx = _JSON_ITER_COUNTERS[key]
        else:
            current_idx = start_index

        # --- Check bounds: stop the workflow if exhausted ---
        if current_idx >= total_items:
            print(f"[JSONIterator] All {total_items} items iterated. Stopping workflow.")
            signal.signal(signal.SIGINT, _interrupt_handler)
            signal.raise_signal(signal.SIGINT)
            return (f'{{"error": "Iterator exhausted (index {current_idx} >= {total_items})"}}', current_idx, total_items)

        # --- Get current item ---
        item = data_items[current_idx]
        
        # If it's a file path string (from directory iteration), load it
        if is_directory:
            try:
                with open(item, 'r', encoding='utf-8') as f:
                    final_data = json.load(f)
                result_str = json.dumps(final_data, ensure_ascii=False)
            except Exception as e:
                result_str = f'{{"error": "Failed to load file {item}: {str(e)}"}}'
        else:
            # If it's already a loaded item (from array or single object)
            if isinstance(item, str):
                result_str = item
            else:
                result_str = json.dumps(item, ensure_ascii=False)

        # --- Advance counter ---
        if auto_next:
            _JSON_ITER_COUNTERS[key] += 1
            remaining = total_items - (_JSON_ITER_COUNTERS[key])
            print(f"[JSONIterator] Output index {current_idx}. Remaining: {remaining}")

        return (result_str, current_idx, total_items)


NODE_CLASS_MAPPINGS = {
    "JSONIterator": JSONIterator
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "JSONIterator": "JSON Iterator"
}
