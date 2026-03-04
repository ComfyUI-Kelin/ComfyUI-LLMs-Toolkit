import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";
import { $el } from "../../../scripts/ui.js";

// ============================================================================
// CSS Styles Loader
// ============================================================================
$el("link", {
    parent: document.head,
    rel: "stylesheet",
    type: "text/css",
    href: "extensions/ComfyUI-LLMs-Toolkit/css/provider_manager.css"
});

// ============================================================================
// UI Component
// ============================================================================
// ─── Provider Specific SVG Icons ─────────────────────────────────────────────

const PROVIDER_ICONS = {
    "qwen": `<svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Qwen</title><path d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z" fill="url(#lobe-icons-qwen-fill)" fill-rule="nonzero"></path><defs><linearGradient id="lobe-icons-qwen-fill" x1="0%" x2="100%" y1="0%" y2="0%"><stop offset="0%" stop-color="#6336E7" stop-opacity=".84"></stop><stop offset="100%" stop-color="#6F69F7" stop-opacity=".84"></stop></linearGradient></defs></svg>`,
    "deepseek": `<svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>DeepSeek</title><path d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z" fill="#4D6BFE"></path></svg>`
};

class ProviderManager {
    constructor() {
        this.providers = [];
        this.selectedId = null;
        this.searchQuery = "";
        this.modal = null;
        this.currentDraft = null;
    }

    hasUnsavedChanges() {
        if (!this.selectedId || !this.currentDraft) return false;
        const original = this.providers.find(p => p.id === this.selectedId);
        if (!original) return false;

        const draftCopy = JSON.parse(JSON.stringify(this.currentDraft));
        delete draftCopy._isNew;
        const origCopy = JSON.parse(JSON.stringify(original));
        delete origCopy._isNew;

        return JSON.stringify(draftCopy) !== JSON.stringify(origCopy);
    }

    checkUnsaved(onProceed) {
        if (!this.hasUnsavedChanges()) {
            onProceed();
            return;
        }
        this.showConfirm(
            "Unsaved Changes",
            "You have unsaved changes.\\nAre you sure you want to discard them?",
            onProceed
        );
    }

    showDialog(options) {
        const overlay = $el("div.llm-pm-prompt-overlay");
        const dialogContent = [$el("h3", options.title)];
        if (options.message) {
            dialogContent.push($el("div", {
                style: { fontSize: "0.9em", color: "var(--descrip-text)", whiteSpace: "pre-wrap", margin: "10px 0", lineHeight: "1.4" },
                textContent: options.message
            }));
        }

        let inputElement = null;
        if (options.showInput) {
            inputElement = $el("input", { type: "text", value: options.inputDefault || "" });
            dialogContent.push(inputElement);
        }

        const closeDialog = () => {
            if (document.body.contains(overlay)) document.body.removeChild(overlay);
        };

        const actions = [];
        if (!options.alertOnly) {
            actions.push($el("button.cancel", {
                textContent: options.cancelText || "Cancel",
                onclick: () => {
                    closeDialog();
                    if (options.onCancel) options.onCancel();
                }
            }));
        }

        const confirmBtn = $el("button.confirm", {
            textContent: options.confirmText || "OK",
            onclick: () => {
                closeDialog();
                if (options.onConfirm) options.onConfirm(inputElement ? inputElement.value : null);
            }
        });
        actions.push(confirmBtn);

        dialogContent.push($el("div.llm-pm-prompt-actions", actions));
        const dialogBox = $el("div.llm-pm-prompt-dialog", dialogContent);
        overlay.appendChild(dialogBox);
        document.body.appendChild(overlay);

        if (inputElement) {
            inputElement.onkeydown = (e) => {
                if (e.key === "Enter") confirmBtn.click();
                if (e.key === "Escape" && !options.alertOnly) actions[0].click();
            };
            inputElement.focus();
            inputElement.select();
        }
    }

    showPrompt(title, defaultValue, callback) {
        this.showDialog({
            title: title, showInput: true, inputDefault: defaultValue,
            confirmText: "Confirm", onConfirm: callback
        });
    }

    showAlert(title, message) {
        this.showDialog({ title: title, message: message, alertOnly: true, confirmText: "OK" });
    }

    showConfirm(title, message, onConfirm) {
        this.showDialog({ title: title, message: message, confirmText: "Confirm", onConfirm: onConfirm });
    }

    async loadProviders() {
        try {
            const res = await api.fetchApi("/llm_toolkit/providers");
            const data = await res.json();
            this.providers = data.providers || [];

            // Auto-select first if none selected
            if (!this.selectedId && this.providers.length > 0) {
                this.selectedId = this.providers[0].id;
            }
            // Ensure selectedId is still valid
            if (this.selectedId && !this.providers.find(p => p.id === this.selectedId)) {
                this.selectedId = this.providers[0]?.id || null;
            }

            this.render();
        } catch (e) {
            console.error("[LLMs_Toolkit] Failed to load providers:", e);
            this.showAlert("Error", "Failed to load provider configuration. Please check the terminal logs.");
        }
    }

    async saveProvider(providerData) {
        try {
            const res = await api.fetchApi("/llm_toolkit/providers", {
                method: "POST",
                body: JSON.stringify(providerData)
            });
            const data = await res.json();
            if (data.status === "ok") {
                await this.loadProviders();
                this.selectedId = data.provider.id;
                this.render();
            } else {
                this.showAlert("Save Failed", data.error);
            }
        } catch (e) {
            console.error(e);
            this.showAlert("Error", "Save failed.");
        }
    }

    async deleteProvider(id) {
        this.showConfirm(
            "Delete Provider",
            "Are you sure you want to delete this custom provider?\\nThis action cannot be undone.",
            async () => {
                try {
                    const res = await api.fetchApi(`/llm_toolkit/providers/${id}`, { method: "DELETE" });
                    const data = await res.json();
                    if (data.status === "ok") {
                        if (this.selectedId === id) this.selectedId = null;
                        await this.loadProviders();
                    } else {
                        this.showAlert("Delete Failed", data.error);
                    }
                } catch (e) {
                    console.error(e);
                    this.showAlert("Error", "Delete failed.");
                }
            }
        );
    }

    async checkConnectivity(apiHost, apiKey, model) {
        try {
            const btn = document.getElementById("pm-check-btn");
            if (btn) btn.textContent = "Checking...";

            const res = await api.fetchApi("/llm_toolkit/providers/check", {
                method: "POST",
                body: JSON.stringify({ apiHost, apiKey, model })
            });
            const data = await res.json();

            if (data.status === "ok") {
                this.showAlert("Success", "✅ Connection successful! API Key and Base URL are configured correctly.");
            } else {
                this.showAlert("Connection Failed", "❌ " + data.message);
            }
        } catch (e) {
            console.error(e);
            this.showAlert("Error", "❌ Request failed. Network error or CORS issue.");
        } finally {
            const btn = document.getElementById("pm-check-btn");
            if (btn) btn.textContent = "Check";
        }
    }

    show() {
        if (this.modal) {
            this.modal.style.display = "flex";
            this.loadProviders();
            return;
        }

        // Create main modal structure
        this.contentContainer = $el("div.llm-pm-content");
        this.sidebarListContainer = $el("div.llm-pm-list");

        const closeBtn = $el("span.llm-pm-close", {
            innerHTML: "&times;",
            onclick: () => {
                this.checkUnsaved(() => {
                    this.modal.style.display = "none";
                    this.currentDraft = null;
                    // Trigger full redraw of graph to apply changes
                    if (app.graph) {
                        app.graph.setDirtyCanvas(true);
                    }
                });
            }
        });

        const searchInput = $el("input", {
            type: "text",
            placeholder: "Search providers/models...",
            oninput: (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderSidebar();
            }
        });

        const addBtn = $el("button.llm-pm-add-btn", {
            textContent: "+ Custom Provider",
            onclick: () => {
                this.checkUnsaved(() => this.createNewProvider());
            },
            style: { padding: "6px 16px", fontSize: "0.9em", borderRadius: "4px", minHeight: "unset" }
        });

        const usageBtn = $el("button.llm-pm-add-btn", {
            innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 5h8" /><path d="M13 9h5" /><path d="M13 15h8" /><path d="M13 19h5" /><path d="M3 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" /><path d="M3 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" /></svg> Usage Stats`,
            onclick: () => {
                this.checkUnsaved(() => {
                    this.selectedId = "USAGE_STATS";
                    this.render();
                });
            },
            style: { padding: "6px 16px", fontSize: "0.9em", borderRadius: "4px", minHeight: "unset", marginTop: "10px", background: "transparent", border: "1px dashed var(--border-color)", color: "var(--fg-color)" }
        });

        this.modal = $el("div.comfy-modal.llm-pm-modal", {
            parent: document.body,
            style: { display: "flex", zIndex: 10000 }
        }, [
            $el("div.llm-pm-header", [
                $el("h2.llm-pm-title", "⚙️ LLM Provider & Model Manager"),
                closeBtn
            ]),
            $el("div.llm-pm-body", [
                $el("div.llm-pm-sidebar", [
                    $el("div.llm-pm-search", [searchInput]),
                    this.sidebarListContainer,
                    $el("div.llm-pm-sidebar-footer", [addBtn, usageBtn])
                ]),
                this.contentContainer
            ])
        ]);

        this.loadProviders();
    }

    createNewProvider() {
        const newTempId = "temp-" + Date.now();
        const newProvider = {
            id: newTempId,
            name: "New Custom Provider",
            type: "openai",
            apiKey: "",
            apiHost: "",
            models: [],
            enabled: true,
            isSystem: false,
            _isNew: true
        };
        this.providers.push(newProvider);
        this.selectedId = newTempId;
        this.render();
        // Focus the name input automatically
        setTimeout(() => {
            const input = document.getElementById("pm-input-name");
            if (input) {
                input.focus();
                input.select();
            }
        }, 50);
    }

    render() {
        this.renderSidebar();
        this.renderContent();
    }

    renderSidebar() {
        this.sidebarListContainer.innerHTML = "";

        const filtered = this.providers.filter(p => {
            const matchesName = p.name.toLowerCase().includes(this.searchQuery);
            const matchesModel = p.models.some(m => m.toLowerCase().includes(this.searchQuery));
            return matchesName || matchesModel;
        });

        filtered.forEach(p => {
            const isActive = this.selectedId === p.id;

            const tags = [$el("span.llm-pm-tag" + (p.enabled ? ".on" : ""), p.enabled ? "ON" : "OFF")];
            if (p.isSystem) tags.unshift($el("span.llm-pm-tag", "System"));

            const item = $el("div.llm-pm-item" + (isActive ? ".active" : ""), {
                onclick: () => {
                    if (this.selectedId === p.id) return;
                    this.checkUnsaved(() => {
                        this.selectedId = p.id;
                        this.render();
                    });
                }
            }, [
                $el("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, [
                    PROVIDER_ICONS[p.id] ? $el("span", { innerHTML: PROVIDER_ICONS[p.id], style: { display: "flex", alignItems: "center", fontSize: "1.2em" } }) : "",
                    $el("span", p.name)
                ]),
                $el("div", { style: { flex: 1 } }),
                $el("div.llm-pm-item-tags", tags)
            ]);

            this.sidebarListContainer.appendChild(item);
        });
    }

    async renderContent() {
        this.contentContainer.innerHTML = "";

        if (this.selectedId === "USAGE_STATS") {
            const loading = $el("div.llm-pm-empty", "Loading usage history...");
            this.contentContainer.appendChild(loading);

            try {
                const res = await api.fetchApi("/llm_toolkit/usage");
                if (!res.ok) {
                    this.contentContainer.innerHTML = "";
                    if (res.status === 404) {
                        this.contentContainer.appendChild($el("div.llm-pm-empty", "Usage API not available. Please restart ComfyUI to activate the new route."));
                    } else {
                        this.contentContainer.appendChild($el("div.llm-pm-empty", `API error: HTTP ${res.status}. Check terminal logs.`));
                    }
                    return;
                }
                const data = await res.json();

                this.contentContainer.innerHTML = "";
                this.contentContainer.appendChild($el("h2", { textContent: "API Usage Dashboard", style: { margin: "0 0 12px 0" } }));

                if (!data.usage || data.usage.length === 0) {
                    this.contentContainer.appendChild($el("div.llm-pm-empty", "No usage data recorded yet. Run a generation first."));
                    return;
                }

                // ── Summary Cards ──────────────────────────────────────
                const rows = data.usage;
                const totalCalls = rows.length;
                const okCalls = rows.filter(r => r.status !== "error").length;
                const errorCalls = totalCalls - okCalls;
                const totalTokens = rows.reduce((s, r) => s + (r.total_tokens || 0), 0);
                const avgLatency = Math.round(rows.reduce((s, r) => s + (r.elapsed_ms || 0), 0) / totalCalls);

                const cardStyle = { flex: "1", padding: "12px 16px", background: "var(--comfy-input-bg)", borderRadius: "8px", border: "1px solid var(--border-color)", textAlign: "center" };
                const cardLabel = { fontSize: "0.75em", color: "var(--descrip-text)", marginBottom: "4px" };
                const cardValue = { fontSize: "1.3em", fontWeight: "bold", color: "var(--fg-color)" };

                const fmtTokens = (t) => t >= 1000000 ? `${(t / 1000000).toFixed(1)}M` : t >= 1000 ? `${(t / 1000).toFixed(1)}K` : String(t);

                const summaryRow = $el("div", { style: { display: "flex", gap: "12px", marginBottom: "16px" } }, [
                    $el("div", { style: cardStyle }, [
                        $el("div", { style: cardLabel, textContent: "Total Calls" }),
                        $el("div", { style: cardValue, textContent: String(totalCalls) })
                    ]),
                    $el("div", { style: cardStyle }, [
                        $el("div", { style: cardLabel, textContent: "Success / Error" }),
                        $el("div", { style: cardValue, innerHTML: `<span style="color:#4CAF50">${okCalls}</span> / <span style="color:${errorCalls > 0 ? '#f44336' : 'var(--descrip-text)'}">${errorCalls}</span>` })
                    ]),
                    $el("div", { style: cardStyle }, [
                        $el("div", { style: cardLabel, textContent: "Total Tokens" }),
                        $el("div", { style: cardValue, textContent: fmtTokens(totalTokens) })
                    ]),
                    $el("div", { style: cardStyle }, [
                        $el("div", { style: cardLabel, textContent: "Avg Latency" }),
                        $el("div", { style: cardValue, textContent: `${avgLatency} ms` })
                    ]),
                ]);
                this.contentContainer.appendChild(summaryRow);

                // ── Data Table ─────────────────────────────────────────
                const table = $el("table", { style: { width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9em" } });
                const thead = $el("tr", { style: { borderBottom: "2px solid var(--border-color)", color: "var(--descrip-text)" } });
                ["Status", "Time", "Provider", "Model", "Tokens (In/Out)", "Latency"].forEach(h => {
                    thead.appendChild($el("th", { style: { padding: "8px" }, textContent: h }));
                });
                table.appendChild(thead);

                // Show newest first
                rows.reverse().forEach(row => {
                    const isError = row.status === "error";
                    const tr = $el("tr", { style: { borderBottom: "1px solid var(--border-color)", background: isError ? "rgba(244,67,54,0.08)" : "transparent" } });
                    const date = new Date(row.timestamp * 1000).toLocaleString();

                    tr.appendChild($el("td", { style: { padding: "8px", textAlign: "center" }, innerHTML: isError ? `<span style="color:#f44336" title="Error">✗</span>` : `<span style="color:#4CAF50" title="OK">✓</span>` }));
                    tr.appendChild($el("td", { style: { padding: "8px" }, textContent: date }));
                    tr.appendChild($el("td", { style: { padding: "8px", fontWeight: "bold" }, textContent: row.provider }));
                    tr.appendChild($el("td", { style: { padding: "8px" }, textContent: row.model }));
                    tr.appendChild($el("td", { style: { padding: "8px" }, textContent: isError ? "-" : `${row.input_tokens} / ${row.output_tokens}` }));
                    tr.appendChild($el("td", { style: { padding: "8px", color: "var(--descrip-text)" }, textContent: `${row.elapsed_ms} ms` }));
                    table.appendChild(tr);
                });

                const tableContainer = $el("div", { style: { overflowY: "auto", flex: "1" } }, [table]);
                this.contentContainer.appendChild(tableContainer);

            } catch (e) {
                console.error(e);
                this.contentContainer.innerHTML = "";
                this.contentContainer.appendChild($el("div.llm-pm-empty", "Failed to load usage data. Check logs."));
            }
            return;
        }

        const provider = this.providers.find(p => p.id === this.selectedId);
        if (!provider) {
            this.contentContainer.appendChild(
                $el("div.llm-pm-empty", "Select a provider from the sidebar to edit.")
            );
            return;
        }

        // Live working copy
        this.currentDraft = JSON.parse(JSON.stringify(provider));
        const draft = this.currentDraft;

        // -- Header row (Name & Enable switch)
        const nameInput = $el("input", {
            id: "pm-input-name",
            type: "text",
            value: draft.name,
            placeholder: "Provider Name",
            oninput: (e) => draft.name = e.target.value
        });

        const enableSwitch = $el("label.llm-pm-switch", [
            $el("input", {
                type: "checkbox",
                checked: draft.enabled,
                onchange: (e) => {
                    draft.enabled = e.target.checked;
                    this.saveProvider(draft); // auto save toggle
                }
            }),
            $el("span.llm-pm-slider")
        ]);

        // -- API Key
        const keyInput = $el("input", {
            type: "password",
            value: draft.apiKey,
            placeholder: "sk-...",
            oninput: (e) => draft.apiKey = e.target.value
        });

        const toggleVisibilityBtn = $el("button", {
            innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
            onclick: () => {
                if (keyInput.type === "password") {
                    keyInput.type = "text";
                    toggleVisibilityBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
                } else {
                    keyInput.type = "password";
                    toggleVisibilityBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
                }
            },
            title: "Toggle Visibility",
            style: {
                padding: "4px 8px", fontSize: "0.85em", borderRadius: "4px", minHeight: "unset",
                display: "inline-flex", alignItems: "center", background: "transparent", color: "var(--descrip-text)", border: "1px solid var(--border-color)", cursor: "pointer"
            }
        });

        const checkBtn = $el("button", {
            id: "pm-check-btn",
            innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:4px"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm3.707 10.293a1 1 0 0 0 -1.414 0l-3.293 3.292l-1.293 -1.292a1 1 0 1 0 -1.414 1.414l2 2a1 1 0 0 0 1.414 0l4 -4a1 1 0 0 0 0 -1.414m-.707 -9.294l4 4.001h-4z" /></svg> Check API`,
            onclick: () => this.checkConnectivity(draft.apiHost, draft.apiKey, draft.models[0] || ""),
            style: {
                padding: "4px 12px", fontSize: "0.85em", borderRadius: "4px", minHeight: "unset",
                display: "inline-flex", alignItems: "center"
            }
        });

        // -- URL
        const urlInput = $el("input", {
            type: "text",
            value: draft.apiHost,
            placeholder: "https://api.../v1",
            oninput: (e) => {
                draft.apiHost = e.target.value;
                const prev = document.getElementById("pm-url-preview");
                if (prev) prev.textContent = `Preview: ${draft.apiHost} /chat/completions`;
            }
        });

        // -- Models
        const modelsContainer = $el("div.llm-pm-models");
        const renderModels = () => {
            modelsContainer.innerHTML = "";
            draft.models.forEach((m, idx) => {
                const nameSpan = $el("span", {
                    textContent: m,
                    style: { cursor: "pointer" },
                    title: "Double-click to edit",
                    ondblclick: () => {
                        this.showPrompt("Edit Model Name:", m, (newName) => {
                            if (newName && newName.trim()) {
                                draft.models[idx] = newName.trim();
                                renderModels();
                            }
                        });
                    }
                });
                modelsContainer.appendChild($el("span.llm-pm-model-tag", [
                    nameSpan,
                    $el("span.llm-pm-model-del", {
                        innerHTML: "&times;",
                        title: "Delete model",
                        onclick: () => {
                            draft.models.splice(idx, 1);
                            renderModels();
                        }
                    })
                ]));
            });

            // Add button
            modelsContainer.appendChild($el("span.llm-pm-model-add", {
                textContent: "+ Add Model",
                onclick: () => {
                    this.showPrompt("Enter Model Name (e.g. gpt-4o):", "", (name) => {
                        if (name && name.trim()) {
                            draft.models.push(name.trim());
                            renderModels();
                        }
                    });
                }
            }));
        };
        renderModels();

        // -- Action Buttons
        const saveBtn = $el("button", {
            innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:4px"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 3a1 1 0 0 1 .707 .293l4 4a1 1 0 0 1 .293 .707v10a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h1v4a1 1 0 0 0 .883 .993l.117 .007h6a1 1 0 0 0 1 -1v-4zm-4 8a2.995 2.995 0 0 0 -2.995 2.898a1 1 0 0 0 -.005 .102a3 3 0 1 0 3 -3m1 -8v3h-4v-3z" /></svg> Save`,
            style: {
                fontWeight: "bold", background: "#4CAF50", color: "white",
                padding: "6px 16px", fontSize: "0.9em", borderRadius: "4px", minHeight: "unset",
                display: "inline-flex", alignItems: "center", transition: "all 0.3s ease"
            },
            onclick: async () => {
                const originalHtml = saveBtn.innerHTML;
                saveBtn.innerHTML = `⏳ Saving...`;
                saveBtn.disabled = true;

                if (draft._isNew) delete draft._isNew;
                await this.saveProvider(draft);

                saveBtn.innerHTML = `✅ Saved!`;
                saveBtn.style.background = "#3d8b40"; // slightly darker green
                setTimeout(() => {
                    saveBtn.innerHTML = originalHtml;
                    saveBtn.style.background = "#4CAF50";
                    saveBtn.disabled = false;
                }, 1500);
            }
        });

        const deleteBtn = $el("button", {
            innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:4px"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19 2a3 3 0 0 1 3 3v14a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3 -3v-14a3 3 0 0 1 3 -3zm-4 9h-6l-.117 .007a1 1 0 0 0 .117 1.993h6l.117 -.007a1 1 0 0 0 -.117 -1.993z" /></svg> Delete`,
            style: {
                color: "var(--error-text)", borderColor: "var(--error-text)",
                padding: "6px 16px", fontSize: "0.9em", borderRadius: "4px", minHeight: "unset",
                display: "inline-flex", alignItems: "center"
            },
            onclick: () => this.deleteProvider(draft.id)
        });


        // Build DOM
        const fields = [
            $el("div.llm-pm-field", [
                $el("label", [
                    $el("span", "Provider Name" + (draft.isSystem ? " (System)" : "")),
                    $el("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, [
                        $el("span", { style: { fontSize: "0.8em", fontWeight: "normal" } }, "Enable in Nodes"),
                        enableSwitch
                    ])
                ]),
                nameInput
            ]),

            $el("div.llm-pm-field", [
                $el("label", "Base URL"),
                urlInput,
                $el("div.llm-pm-field-hint", {
                    id: "pm-url-preview",
                    textContent: `Preview: ${draft.apiHost} /chat/completions`
                })
            ]),

            $el("div.llm-pm-field", [
                $el("label", "API Key"),
                $el("div.llm-pm-input-group", [keyInput, toggleVisibilityBtn, checkBtn]),
                $el("div.llm-pm-field-hint", "Keys are stored locally in config/providers.json in plaintext.")
            ]),

            $el("div.llm-pm-field", [
                $el("label", "Available Models"),
                modelsContainer
            ]),

            $el("div.llm-pm-actions", [
                (draft.isSystem || draft._isNew) ? $el("div") : deleteBtn,
                $el("div.llm-pm-actions-right", [saveBtn])
            ])
        ];

        fields.forEach(f => this.contentContainer.appendChild(f));
    }
}

// ============================================================================
// Registration & Node Extensions
// ============================================================================
app.registerExtension({
    name: "ComfyUI.LLMsToolkit.ProviderManager",

    // UI Setup
    async setup() {
        const manager = new ProviderManager();

        try {
            const { ComfyButton } = await import("../../../scripts/ui/components/button.js");
            const { ComfyButtonGroup } = await import("../../../scripts/ui/components/buttonGroup.js");

            const llmGroup = new ComfyButtonGroup(
                new ComfyButton({
                    icon: "robot",
                    content: "LLMs_Manager",
                    tooltip: "Manage LLM API Providers & Model Config",
                    action: () => manager.show(),
                    classList: "comfyui-button comfyui-menu-mobile-collapse primary"
                }).element
            );

            app.menu?.settingsGroup.element.before(llmGroup.element);
            console.log("[LLMs_Toolkit] LLMs button injected into ComfyUI menu.");
        } catch (e) {
            console.warn("[LLMs_Toolkit] New-style menu API not available, using fallback.", e);
            const floatBtn = $el("button", {
                textContent: "LLMs_Manager",
                title: "Manage LLM API Providers & Models",
                onclick: () => manager.show(),
                style: {
                    position: "fixed",
                    top: "10px",
                    right: "300px",
                    zIndex: "9990",
                    padding: "4px 10px",
                    cursor: "pointer",
                    background: "var(--comfy-input-bg, #333)",
                    color: "var(--input-text, white)",
                    border: "1px solid var(--border-color, #666)",
                    borderRadius: "4px",
                    fontSize: "13px",
                    fontWeight: "bold"
                }
            });
            document.body.appendChild(floatBtn);
        }
    },

    // Node Interception for Dynamic Model Dropdowns
    async nodeCreated(node) {
        if (node.comfyClass === "OpenAICompatibleLoader") {
            const providerWidget = node.widgets.find(w => w.name === "provider");
            const modelWidget = node.widgets.find(w => w.name === "model");

            if (providerWidget && modelWidget) {
                // Fetch current providers to have the mapping of Provider -> Models
                let providersCache = [];
                try {
                    const res = await api.fetchApi("/llm_toolkit/providers");
                    const data = await res.json();
                    providersCache = data.providers || [];
                } catch (e) {
                    console.error("[LLMs_Toolkit] Failed to fetch providers for node", e);
                }

                const updateModelOptions = (selectedProviderLabel) => {
                    if (selectedProviderLabel === "LLM_CONFIG (from input)") {
                        modelWidget.options.values = ["LLM_CONFIG (from input)"];
                        if (modelWidget.value !== "LLM_CONFIG (from input)") {
                            modelWidget.value = "LLM_CONFIG (from input)";
                        }
                        return;
                    }

                    // Match provider by name, must be enabled
                    const found = providersCache.find(p => p.name === selectedProviderLabel && p.enabled);
                    if (found && found.models && found.models.length > 0) {
                        modelWidget.options.values = found.models;
                        if (!found.models.includes(modelWidget.value)) {
                            modelWidget.value = found.models[0];
                        }
                    } else {
                        modelWidget.options.values = ["LLM_CONFIG (from input)"];
                        modelWidget.value = "LLM_CONFIG (from input)";
                    }
                    app.graph.setDirtyCanvas(true);
                };

                // Initial setup based on current value
                if (providerWidget.value) {
                    updateModelOptions(providerWidget.value);
                }

                // Listen for changes on the provider widget
                const originalCallback = providerWidget.callback;
                providerWidget.callback = function () {
                    updateModelOptions(this.value);
                    if (originalCallback) {
                        originalCallback.apply(this, arguments);
                    }
                };
            }
        }
    }
});
