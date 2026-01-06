/**
 * Code Editor Module
 * Handles Monaco Editor initialization and editor operations
 */

const Editor = {
    monacoEditor: null,
    containerElement: null,
    isMonacoLoaded: false,

    /**
     * Initialize the code editor
     */
    init() {
        this.containerElement = document.getElementById('monaco-editor');

        if (!this.containerElement) {
            console.error('Monaco editor container not found');
            return;
        }

        // Bind action buttons
        this.bindButtons();

        // Initialize Monaco Editor
        this.initMonaco();
    },

    /**
     * Initialize Monaco Editor
     */
    initMonaco() {
        // Configure Monaco loader
        require.config({
            paths: {
                'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs'
            }
        });

        // Load Monaco
        require(['vs/editor/editor.main'], () => {
            this.isMonacoLoaded = true;

            // Define custom dark theme
            monaco.editor.defineTheme('custom-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
                    { token: 'keyword', foreground: 'f472b6' },
                    { token: 'string', foreground: '86efac' },
                    { token: 'number', foreground: '93c5fd' },
                    { token: 'type', foreground: '22d3ee' },
                    { token: 'function', foreground: 'c4b5fd' },
                    { token: 'variable', foreground: 'fcd34d' },
                ],
                colors: {
                    'editor.background': '#0a0e14',
                    'editor.foreground': '#e8edf4',
                    'editor.lineHighlightBackground': '#1a202920',
                    'editorLineNumber.foreground': '#4b5563',
                    'editorLineNumber.activeForeground': '#e8edf4',
                    'editor.selectionBackground': '#22c55e30',
                    'editor.inactiveSelectionBackground': '#22c55e15',
                    'editorCursor.foreground': '#22c55e',
                    'editorGutter.background': '#0a0e14',
                    'editorWidget.background': '#12171e',
                    'editorWidget.border': '#2a3441',
                    'editorHoverWidget.background': '#12171e',
                    'editorHoverWidget.border': '#2a3441',
                }
            });

            // Define custom light theme
            monaco.editor.defineTheme('custom-light', {
                base: 'vs',
                inherit: true,
                rules: [
                    { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
                    { token: 'keyword', foreground: 'db2777' },
                    { token: 'string', foreground: '059669' },
                    { token: 'number', foreground: '2563eb' },
                    { token: 'type', foreground: '0891b2' },
                    { token: 'function', foreground: '7c3aed' },
                    { token: 'variable', foreground: 'd97706' },
                ],
                colors: {
                    'editor.background': '#ffffff',
                    'editor.foreground': '#0f172a',
                    'editor.lineHighlightBackground': '#f1f5f9',
                    'editorLineNumber.foreground': '#94a3b8',
                    'editorLineNumber.activeForeground': '#0f172a',
                    'editor.selectionBackground': '#16a34a25',
                    'editorCursor.foreground': '#16a34a',
                    'editorGutter.background': '#ffffff',
                    'editorWidget.background': '#f8fafc',
                    'editorWidget.border': '#e2e8f0',
                    'editorHoverWidget.background': '#f8fafc',
                    'editorHoverWidget.border': '#e2e8f0',
                }
            });

            const languageConfig = window.LanguageSelector?.getCurrentConfig() || {
                monacoLang: 'python'
            };

            const isDark = window.ThemeToggle?.isDarkTheme() ?? true;

            // Create the editor
            this.monacoEditor = monaco.editor.create(this.containerElement, {
                value: this.loadSavedCode() || '',
                language: languageConfig.monacoLang || 'python',
                theme: isDark ? 'custom-dark' : 'custom-light',
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                fontLigatures: true,
                lineNumbers: 'on',
                minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                wordWrap: 'on',
                bracketPairColorization: { enabled: true },
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                formatOnPaste: true,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                renderWhitespace: 'selection',
                padding: { top: 8, bottom: 8 },
                fixedOverflowWidgets: true,
                lineHeight: 22,
                letterSpacing: 0.3,
                renderLineHighlight: 'line',
                scrollbar: {
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                    useShadows: false,
                },
            });

            // Add keyboard shortcut for running code
            this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                document.getElementById('run-btn')?.click();
            });

            // Auto-save on change
            this.monacoEditor.onDidChangeModelContent(() => {
                this.saveCode();
            });

            // Handle window resize
            window.addEventListener('resize', () => {
                this.monacoEditor?.layout();
            });
        });
    },

    /**
     * Bind action buttons
     */
    bindButtons() {
        // Clear button
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCode());
        }

        // Copy button
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyCode());
        }
    },

    /**
     * Set the Monaco Editor language mode
     * @param {string} language - Language identifier
     */
    setLanguageMode(language) {
        const config = window.LanguageSelector?.getConfig(language);
        if (config && this.monacoEditor) {
            monaco.editor.setModelLanguage(this.monacoEditor.getModel(), config.monacoLang);
        }
    },

    /**
     * Update the Monaco Editor theme based on current theme
     */
    updateTheme() {
        if (!this.monacoEditor || !this.isMonacoLoaded) return;
        
        const isDark = window.ThemeToggle?.isDarkTheme();
        monaco.editor.setTheme(isDark ? 'custom-dark' : 'custom-light');
    },

    /**
     * Get the current code from the editor
     * @returns {string} - Current code
     */
    getCode() {
        return this.monacoEditor ? this.monacoEditor.getValue() : '';
    },

    /**
     * Set code in the editor
     * @param {string} code - Code to set
     */
    setCode(code) {
        if (this.monacoEditor) {
            this.monacoEditor.setValue(code);
        }
    },

    /**
     * Clear the editor
     */
    clearCode() {
        if (this.monacoEditor) {
            this.monacoEditor.setValue('');
            this.monacoEditor.focus();
        }
        this.clearSavedCode();
        window.Toast?.show('Editor cleared', 'info');
    },

    /**
     * Copy code to clipboard
     */
    async copyCode() {
        const code = this.getCode();
        
        if (!code.trim()) {
            window.Toast?.show('Nothing to copy', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(code);
            window.Toast?.show('Code copied to clipboard', 'success');
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopy(code);
        }
    },

    /**
     * Fallback copy method for older browsers
     * @param {string} text - Text to copy
     */
    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            window.Toast?.show('Code copied to clipboard', 'success');
        } catch (err) {
            window.Toast?.show('Failed to copy code', 'error');
        }
        
        document.body.removeChild(textarea);
    },

    /**
     * Save code to localStorage
     */
    saveCode() {
        try {
            const code = this.getCode();
            localStorage.setItem('code-editor-content', code);
        } catch (e) {
            // Ignore storage errors
        }
    },

    /**
     * Load saved code from localStorage
     * @returns {string|null} - Saved code or null
     */
    loadSavedCode() {
        try {
            return localStorage.getItem('code-editor-content');
        } catch (e) {
            return null;
        }
    },

    /**
     * Clear saved code from localStorage
     */
    clearSavedCode() {
        try {
            localStorage.removeItem('code-editor-content');
        } catch (e) {
            // Ignore storage errors
        }
    },

    /**
     * Focus the editor
     */
    focus() {
        if (this.monacoEditor) {
            this.monacoEditor.focus();
        }
    },

    /**
     * Refresh the editor layout
     */
    refresh() {
        if (this.monacoEditor) {
            this.monacoEditor.layout();
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure other modules are ready
    setTimeout(() => {
        Editor.init();
    }, 100);
});

// Make Editor globally available
window.Editor = Editor;