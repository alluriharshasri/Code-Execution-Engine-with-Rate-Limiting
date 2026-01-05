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
                    { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
                    { token: 'keyword', foreground: 'ff7b72' },
                    { token: 'string', foreground: 'a5d6ff' },
                    { token: 'number', foreground: '79c0ff' },
                    { token: 'type', foreground: '7ee787' },
                    { token: 'function', foreground: 'd2a8ff' },
                    { token: 'variable', foreground: 'ffa657' },
                ],
                colors: {
                    'editor.background': '#0d1117',
                    'editor.foreground': '#e6edf3',
                    'editor.lineHighlightBackground': '#161b2233',
                    'editorLineNumber.foreground': '#6e7681',
                    'editorLineNumber.activeForeground': '#e6edf3',
                    'editor.selectionBackground': '#264f78',
                    'editor.inactiveSelectionBackground': '#264f7855',
                    'editorCursor.foreground': '#58a6ff',
                    'editorGutter.background': '#0d1117',
                }
            });

            // Define custom light theme
            monaco.editor.defineTheme('custom-light', {
                base: 'vs',
                inherit: true,
                rules: [
                    { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
                    { token: 'keyword', foreground: 'cf222e' },
                    { token: 'string', foreground: '0a3069' },
                    { token: 'number', foreground: '0550ae' },
                    { token: 'type', foreground: '116329' },
                    { token: 'function', foreground: '8250df' },
                    { token: 'variable', foreground: '953800' },
                ],
                colors: {
                    'editor.background': '#ffffff',
                    'editor.foreground': '#1f2328',
                    'editor.lineHighlightBackground': '#f6f8fa',
                    'editorLineNumber.foreground': '#8c959f',
                    'editorLineNumber.activeForeground': '#1f2328',
                    'editor.selectionBackground': '#0969da33',
                    'editorCursor.foreground': '#0969da',
                    'editorGutter.background': '#ffffff',
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
                fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                fontLigatures: true,
                lineNumbers: 'on',
                minimap: { enabled: true },
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
                padding: { top: 12, bottom: 12 },
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