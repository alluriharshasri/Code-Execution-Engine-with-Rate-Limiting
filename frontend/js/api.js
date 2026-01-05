/**
 * API Service for Code Execution Engine
 * Handles communication with FastAPI backend
 * (Aligned with current backend implementation)
 */

const API = {
    // Backend base URL
    BASE_URL: "http://localhost:8000",

    /**
     * Execute code on the backend
     * @param {string} code - Code to execute
     * @param {string} language - Programming language
     * @returns {Promise<Object>} - Execution result
     */
    async executeCode(code, language) {
        try {
            const response = await fetch(`${this.BASE_URL}/execute`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: code,
                    language: language,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // FastAPI error format
                throw new Error(data.detail || "Execution failed");
            }

            // Current backend returns only status + output
            return {
                success: true,
                output: data.output,
            };
        } catch (error) {
            // Network / backend down
            if (
                error instanceof TypeError &&
                error.message.toLowerCase().includes("fetch")
            ) {
                throw new Error(
                    "Cannot connect to backend. Please ensure FastAPI server is running."
                );
            }

            throw error;
        }
    },

    /**
     * Check backend health
     * @returns {Promise<Object>}
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.BASE_URL}/health`);
            return await response.json();
        } catch (error) {
            return {
                status: "error",
                message: "Backend unreachable",
            };
        }
    },
};

// Expose API globally
window.API = API;
