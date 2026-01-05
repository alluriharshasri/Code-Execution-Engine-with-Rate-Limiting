/**
 * Output Box Module
 * Handles displaying execution results and managing output area
 */

const OutputBox = {
    outputElement: null,
    executionTimeElement: null,
    clearButton: null,

    /**
     * Initialize the output box
     */
    init() {
        this.outputElement = document.getElementById('output-box');
        this.executionTimeElement = document.getElementById('execution-time');
        this.clearButton = document.getElementById('clear-output-btn');

        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => this.clear());
        }
    },

    /**
     * Show output from code execution
     * @param {Object} result - Execution result object
     */
    showResult(result) {
        if (!this.outputElement) return;

        let html = '';
        
        // Check if there's an error
        if (result.error) {
            html = this.formatError(result.error);
            this.outputElement.className = 'output-content error';
        } else {
            // Build output sections
            const sections = [];

            // Standard output
            if (result.stdout || result.output) {
                const output = result.stdout || result.output;
                sections.push(this.formatSection('Output', output, 'output-stdout'));
            }

            // Standard error
            if (result.stderr) {
                sections.push(this.formatSection('Errors', result.stderr, 'output-stderr'));
            }

            // If no output at all
            if (sections.length === 0 && result.exitCode === 0) {
                sections.push('<div class="output-stdout">Program executed successfully with no output.</div>');
            }

            // Execution info
            const infoItems = [];
            if (result.exitCode !== undefined && result.exitCode !== null) {
                infoItems.push(`Exit Code: ${result.exitCode}`);
            }
            if (result.executionTime) {
                infoItems.push(`Time: ${this.formatTime(result.executionTime)}`);
            }

            if (infoItems.length > 0) {
                sections.push(`<div class="output-info">${infoItems.join(' | ')}</div>`);
            }

            html = sections.join('');
            this.outputElement.className = result.exitCode === 0 
                ? 'output-content success' 
                : 'output-content error';
        }

        this.outputElement.innerHTML = html;
        this.updateExecutionTime(result.executionTime);
    },

    /**
     * Format an output section
     * @param {string} title - Section title
     * @param {string} content - Section content
     * @param {string} className - CSS class for the section
     * @returns {string} - HTML string
     */
    formatSection(title, content, className) {
        return `
            <div class="output-section">
                <div class="output-section-title">${this.escapeHtml(title)}</div>
                <div class="${className}">${this.escapeHtml(content)}</div>
            </div>
        `;
    },

    /**
     * Format an error message
     * @param {string} error - Error message
     * @returns {string} - HTML string
     */
    formatError(error) {
        return `
            <div class="output-section">
                <div class="output-section-title">Error</div>
                <div class="output-stderr">${this.escapeHtml(error)}</div>
            </div>
        `;
    },

    /**
     * Show loading state
     * @param {string} message - Loading message
     */
    showLoading(message = 'Executing code...') {
        if (!this.outputElement) return;

        this.outputElement.className = 'output-content running';
        this.outputElement.innerHTML = `
            <div class="output-placeholder">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
        this.updateExecutionTime(null);
    },

    /**
     * Show placeholder state
     */
    showPlaceholder() {
        if (!this.outputElement) return;

        this.outputElement.className = 'output-content';
        this.outputElement.innerHTML = `
            <div class="output-placeholder">
                <i class="fas fa-play-circle"></i>
                <p>Run your code to see the output here</p>
            </div>
        `;
        this.updateExecutionTime(null);
    },

    /**
     * Clear the output
     */
    clear() {
        this.showPlaceholder();
        window.Toast?.show('Output cleared', 'info');
    },

    /**
     * Update the execution time display
     * @param {number|null} time - Execution time in seconds
     */
    updateExecutionTime(time) {
        if (!this.executionTimeElement) return;

        if (time !== null && time !== undefined) {
            this.executionTimeElement.textContent = `⏱ ${this.formatTime(time)}`;
        } else {
            this.executionTimeElement.textContent = '';
        }
    },

    /**
     * Format time for display
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    formatTime(seconds) {
        if (seconds < 0.001) {
            return `${(seconds * 1000000).toFixed(0)}µs`;
        } else if (seconds < 1) {
            return `${(seconds * 1000).toFixed(2)}ms`;
        } else {
            return `${seconds.toFixed(3)}s`;
        }
    },

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    OutputBox.init();
});

// Make OutputBox globally available
window.OutputBox = OutputBox;