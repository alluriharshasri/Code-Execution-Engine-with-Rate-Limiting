/**
 * Run Code Module
 * Handles code execution, loading states, and rate limiting UI
 */

const RunCode = {
    runButton: null,
    loadingOverlay: null,
    loadingMessage: null,
    isRunning: false,

    /**
     * Initialize the run code functionality
     */
    init() {
        this.runButton = document.getElementById('run-btn');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.loadingMessage = document.getElementById('loading-message');

        if (this.runButton) {
            this.runButton.addEventListener('click', () => this.execute());
        }

        // Listen for rate limit updates
        window.addEventListener('rateLimitUpdated', (e) => {
            this.updateRateLimitDisplay(e.detail);
        });

        // Initialize toast notification system
        this.initToastSystem();
    },

    /**
     * Execute the code
     */
    async execute() {
        if (this.isRunning) return;

        const code = window.Editor?.getCode();
        const language = window.LanguageSelector?.currentLanguage || 'python';

        // Validate code
        if (!code || !code.trim()) {
            window.Toast?.show('Please enter some code to run', 'warning');
            window.Editor?.focus();
            return;
        }

        this.isRunning = true;
        this.showLoading(`Executing ${window.LanguageSelector?.getCurrentConfig()?.name || language} code...`);
        this.setButtonState(true);
        window.OutputBox?.showLoading('Connecting to execution server...');

        try {
            // Update loading message
            this.updateLoadingMessage('Running your code...');

            const result = await window.API.executeCode(code, language);
            
            // Show result
            window.OutputBox?.showResult(result);

            if (result.success && result.exitCode === 0) {
                window.Toast?.show('Code executed successfully', 'success');
            } else if (result.stderr || result.error) {
                window.Toast?.show('Execution completed with errors', 'error');
            }
        } catch (error) {
            console.error('Execution error:', error);
            
            window.OutputBox?.showResult({
                error: error.message || 'An unexpected error occurred',
                exitCode: 1
            });

            window.Toast?.show(error.message || 'Execution failed', 'error');
        } finally {
            this.isRunning = false;
            this.hideLoading();
            this.setButtonState(false);
        }
    },

    /**
     * Show loading overlay
     * @param {string} message - Loading message
     */
    showLoading(message) {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('active');
        }
        this.updateLoadingMessage(message);
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('active');
        }
    },

    /**
     * Update loading message
     * @param {string} message - New message
     */
    updateLoadingMessage(message) {
        if (this.loadingMessage) {
            this.loadingMessage.textContent = message;
        }
    },

    /**
     * Set run button state
     * @param {boolean} disabled - Whether to disable the button
     */
    setButtonState(disabled) {
        if (this.runButton) {
            this.runButton.disabled = disabled;
            
            if (disabled) {
                this.runButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
            } else {
                this.runButton.innerHTML = '<i class="fas fa-play"></i> Run';
            }
        }
    },

    /**
     * Update rate limit display
     * @param {Object} state - Rate limit state
     */
    updateRateLimitDisplay(state) {
        const remainingEl = document.getElementById('requests-remaining');
        const statusEl = document.getElementById('rate-limit-status');

        if (remainingEl) {
            remainingEl.textContent = state.remaining;
        }

        if (statusEl) {
            statusEl.innerHTML = `<i class="fas fa-clock"></i> Requests: ${state.remaining}/${state.limit}`;
            
            // Add warning color if low
            if (state.remaining <= 2) {
                statusEl.style.color = 'var(--warning-color)';
            } else {
                statusEl.style.color = '';
            }
        }

        // Disable run button if rate limit exceeded
        if (state.remaining <= 0 && this.runButton) {
            this.runButton.disabled = true;
            window.Toast?.show('Rate limit exceeded. Please wait.', 'warning');
        }
    },

    /**
     * Initialize toast notification system
     */
    initToastSystem() {
        window.Toast = {
            container: document.getElementById('toast-container'),
            
            show(message, type = 'info', duration = 4000) {
                if (!this.container) return;

                const toast = document.createElement('div');
                toast.className = `toast ${type}`;
                
                const icons = {
                    success: 'fa-check-circle',
                    error: 'fa-exclamation-circle',
                    warning: 'fa-exclamation-triangle',
                    info: 'fa-info-circle'
                };

                toast.innerHTML = `
                    <i class="fas ${icons[type] || icons.info}"></i>
                    <span class="toast-message">${message}</span>
                    <button class="toast-close"><i class="fas fa-times"></i></button>
                `;

                this.container.appendChild(toast);

                // Bind close button
                const closeBtn = toast.querySelector('.toast-close');
                closeBtn.addEventListener('click', () => this.dismiss(toast));

                // Auto dismiss
                setTimeout(() => this.dismiss(toast), duration);

                return toast;
            },

            dismiss(toast) {
                if (!toast) return;
                
                toast.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }
        };
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    RunCode.init();
});

// Make RunCode globally available
window.RunCode = RunCode;