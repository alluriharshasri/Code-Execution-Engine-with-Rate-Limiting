/**
 * API Service for Code Execution Engine
 * Handles all communication with the backend server
 */

const API = {
    // Base URL for the API - update this to match your backend
    BASE_URL: 'http://localhost:8000',
    
    // Rate limiting state
    rateLimitState: {
        remaining: 10,
        limit: 10,
        resetTime: null
    },

    /**
     * Execute code on the backend
     * @param {string} code - The code to execute
     * @param {string} language - The programming language
     * @returns {Promise<Object>} - The execution result
     */
    async executeCode(code, language) {
        try {
            const response = await fetch(`${this.BASE_URL}/api/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    language: language
                })
            });

            // Update rate limit info from headers
            this.updateRateLimitFromResponse(response);

            const data = await response.json();

            if (!response.ok) {
                // Handle rate limit exceeded
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait before trying again.');
                }
                throw new Error(data.detail || data.message || 'Execution failed');
            }

            return {
                success: true,
                output: data.output || '',
                stdout: data.stdout || '',
                stderr: data.stderr || '',
                exitCode: data.exit_code ?? data.exitCode ?? 0,
                executionTime: data.execution_time ?? data.executionTime ?? null,
                error: data.error || null
            };
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Cannot connect to server. Please ensure the backend is running.');
            }
            throw error;
        }
    },

    /**
     * Check server health
     * @returns {Promise<Object>} - Health status
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.BASE_URL}/api/health`);
            return await response.json();
        } catch (error) {
            return { status: 'error', message: 'Server unreachable' };
        }
    },

    /**
     * Get supported languages from the backend
     * @returns {Promise<Array>} - List of supported languages
     */
    async getSupportedLanguages() {
        try {
            const response = await fetch(`${this.BASE_URL}/api/languages`);
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.warn('Could not fetch supported languages:', error);
            return null;
        }
    },

    /**
     * Update rate limit state from response headers
     * @param {Response} response - The fetch response
     */
    updateRateLimitFromResponse(response) {
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const limit = response.headers.get('X-RateLimit-Limit');
        const reset = response.headers.get('X-RateLimit-Reset');

        if (remaining !== null) {
            this.rateLimitState.remaining = parseInt(remaining, 10);
        }
        if (limit !== null) {
            this.rateLimitState.limit = parseInt(limit, 10);
        }
        if (reset !== null) {
            this.rateLimitState.resetTime = new Date(parseInt(reset, 10) * 1000);
        }

        // Dispatch event to update UI
        window.dispatchEvent(new CustomEvent('rateLimitUpdated', {
            detail: this.rateLimitState
        }));
    },

    /**
     * Get current rate limit state
     * @returns {Object} - Current rate limit state
     */
    getRateLimitState() {
        return { ...this.rateLimitState };
    }
};

// Make API globally available
window.API = API;