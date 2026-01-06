/**
 * Output Box Module
 * Displays execution results from backend
 * (Aligned with current FastAPI response)
 */

const OutputBox = {
    outputElement: null,
    clearButton: null,

    /**
     * Initialize output box
     */
    init() {
        this.outputElement = document.getElementById("output-box");
        this.clearButton = document.getElementById("clear-output-btn");

        if (this.clearButton) {
            this.clearButton.addEventListener("click", () => this.clear());
        }

        this.showPlaceholder();
    },

    /**
     * Show execution result
     * @param {Object} result
     */
    showResult(result) {
        if (!this.outputElement) return;

        // Error case
        if (result.error) {
            this.outputElement.className = "output-content error";
            this.outputElement.innerHTML = `<div class="output-section"><div class="output-section-title error-title"><i class="fas fa-times-circle"></i> Error</div><pre class="output-stderr">${this.escapeHtml(result.error)}</pre></div>`;
            return;
        }

        // Success case
        this.outputElement.className = "output-content success";
        
        const output = result.output?.trim();
        if (output) {
            this.outputElement.innerHTML = `<div class="output-section"><div class="output-section-title success-title"><i class="fas fa-check-circle"></i> Code Executed Successfully</div><pre class="output-stdout">${this.escapeHtml(output)}</pre></div>`;
        } else {
            this.outputElement.innerHTML = `<div class="output-section"><div class="output-section-title success-title"><i class="fas fa-check-circle"></i> Code Executed Successfully</div><pre class="output-stdout output-empty">No output produced.</pre></div>`;
        }
    },

    /**
     * Show loading state
     */
    showLoading(message = "Executing code...") {
        if (!this.outputElement) return;

        this.outputElement.className = "output-content running";
        this.outputElement.innerHTML = `<div class="output-placeholder"><div class="loading-spinner"></div><p>${this.escapeHtml(message)}</p></div>`;
    },

    /**
     * Show placeholder state
     */
    showPlaceholder() {
        if (!this.outputElement) return;

        this.outputElement.className = "output-content";
        this.outputElement.innerHTML = `<div class="output-placeholder"><i class="fas fa-terminal"></i><p>Run your code to see the output here</p></div>`;
    },

    /**
     * Clear output
     */
    clear() {
        this.showPlaceholder();
        window.Toast?.show("Output cleared", "info");
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return "";
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
};

// Init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    OutputBox.init();
});

// Expose globally
window.OutputBox = OutputBox;
