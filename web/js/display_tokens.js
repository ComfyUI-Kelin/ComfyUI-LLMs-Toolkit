import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "ComfyUI-LLMs-Toolkit.displayTokens",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        // We only care about the OpenAI Compatible Adapter node
        if (nodeData.name === "OpenAICompatibleLoader") {
            const onExecuted = nodeType.prototype.onExecuted;
            
            nodeType.prototype.onExecuted = function(message) {
                // Call original if it exists
                if (onExecuted) {
                    onExecuted.apply(this, arguments);
                }
                
                // If we got our token usage text string
                if (message && message.text && message.text.length > 0) {
                    const text = message.text[0]; // Gets our formatted usage string
                    
                    // See if we already created a widget for this, if not create one
                    let tokenWidget = this.widgets?.find(w => w.name === "display_token_usage");
                    
                    if (!tokenWidget) {
                        tokenWidget = this.addWidget("text", "display_token_usage", text, () => {}, { 
                            multiline: true, 
                            serialize: false // don't save to workflow
                        });
                        
                        // Force widget to bottom if it wasn't there
                        const y = this.size[1];
                        tokenWidget.y = y;
                        tokenWidget.disabled = true; // Make it look like a label, readonly
                        
                        // Recalculate node size
                        this.size[1] = Math.max(this.size[1], this.computeSize([this.size[0], this.size[1]])[1]);
                    } else {
                        tokenWidget.value = text;
                    }
                    
                    // Force UI update
                    app.graph.setDirtyCanvas(true, true);
                }
            };
        }
    }
});
