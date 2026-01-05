/**
 * Run Code Module
 * Handles code execution and UI state
 * (Aligned with current FastAPI backend)
 */

const RunCode = {
    runButton: null,
    loadingOverlay: null,
    loadingMessage: null,
    isRunning: false,

    /**
     * Initialize run functionality
     */
    init() {
        this.runButton = document.getElementById("run-btn");
        this.loadingOverlay = document.getElementById("loading-overlay");
        this.loadingMessage = document.getElementById("loading-message");

        if (this.runButton) {
            this.runButton.addEventListener("click", () => this.execute());
        }

        this.initToastSystem();
    },

    /**
     * Execute code
     */
    async execute() {
        if (this.isRunning) return;

        const code = window.Editor?.getCode();
        const language = window.LanguageSelector?.currentLanguage || "python";

        if (!code || !code.trim()) {
            window.Toast?.show("Please enter some code to run", "warning");
            window.Editor?.focus();
            return;
        }

        this.isRunning = true;
        this.setButtonState(true);
        this.showLoading("Running your code...");
        window.OutputBox?.showLoading("Executing...");

        try {
            const result = await window.API.executeCode(code, language);

            window.OutputBox?.showResult({
                output: result.output,
            });

            window.Toast?.show("Code executed successfully", "success");
        } catch (error) {
            console.error("Execution error:", error);

            window.OutputBox?.showResult({
                error: error.message || "Execution failed",
            });

            window.Toast?.show(error.message || "Execution failed", "error");
        } finally {
            this.isRunning = false;
            this.hideLoading();
            this.setButtonState(false);
        }
    },

    /**
     * Show loading overlay
     */
    showLoading(message) {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add("active");
        }
        this.updateLoadingMessage(message);
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove("active");
        }
    },

    /**
     * Update loading message
     */
    updateLoadingMessage(message) {
        if (this.loadingMessage) {
            this.loadingMessage.textContent = message;
        }
    },

    /**
     * Enable / disable run button
     */
    setButtonState(disabled) {
        if (!this.runButton) return;

        this.runButton.disabled = disabled;
        this.runButton.innerHTML = disabled
            ? '<i class="fas fa-spinner fa-spin"></i> Running...'
            : '<i class="fas fa-play"></i> Run';
    },

    /**
     * Simple toast notification system
     */
    initToastSystem() {
        window.Toast = {
            container: document.getElementById("toast-container"),

            show(message, type = "info", duration = 4000) {
                if (!this.container) return;

                const toast = document.createElement("div");
                toast.className = `toast ${type}`;

                toast.innerHTML = `
                    <span class="toast-message">${message}</span>
                `;

                this.container.appendChild(toast);

                setTimeout(() => {
                    toast.remove();
                }, duration);
            },
        };
    },
};

// Init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    RunCode.init();
});

// Expose globally
window.RunCode = RunCode;
