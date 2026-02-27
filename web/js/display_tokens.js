import { app } from "../../scripts/app.js";
import { ComfyWidgets } from "../../scripts/widgets.js";

app.registerExtension({
    name: "ComfyUI-LLMs-Toolkit.displayTokens",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        // We only care about the OpenAI Compatible Adapter node
        if (nodeData.name === "OpenAICompatibleLoader") {
            const onExecuted = nodeType.prototype.onExecuted;

            nodeType.prototype.onExecuted = function (message) {
                // Call original if it exists
                if (onExecuted) {
                    onExecuted.apply(this, arguments);
                }

                // If we got our token usage text string
                if (message && message.text && message.text.length > 0) {
                    const text = message.text[0]; // Gets our formatted usage string

                    // See if we already created a widget for this
                    let tokenWidget = this.widgets?.find(w => w.name === "display_token_usage_widget");

                    if (!tokenWidget) {
                        try {
                            const w = ComfyWidgets["STRING"](this, "display_token_usage_widget", ["STRING", { multiline: true }], app).widget;
                            w.inputEl.readOnly = true;
                            w.inputEl.style.opacity = 0.8;
                            w.value = text;
                            tokenWidget = w;
                        } catch (error) {
                            console.error("[LLMs_Toolkit] Failed to create display widget:", error);
                        }
                    } else {
                        tokenWidget.value = text;
                    }

                    // Resize node to fit the new text
                    requestAnimationFrame(() => {
                        const sz = this.computeSize();
                        if (sz[0] < this.size[0]) {
                            sz[0] = this.size[0];
                        }
                        if (sz[1] < this.size[1]) {
                            sz[1] = this.size[1];
                        }
                        this.onResize?.(sz);
                        app.graph.setDirtyCanvas(true, false);
                    });
                }
            };
        }
    }
});
