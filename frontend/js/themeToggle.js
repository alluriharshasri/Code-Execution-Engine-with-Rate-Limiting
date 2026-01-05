/**
 * Theme Toggle Module
 * Handles dark/light theme switching with persistence
 */

const ThemeToggle = {
    STORAGE_KEY: 'code-editor-theme',
    DARK_THEME: 'dark-theme',
    LIGHT_THEME: 'light-theme',
    
    currentTheme: null,
    toggleButton: null,
    themeIcon: null,

    /**
     * Initialize the theme toggle functionality
     */
    init() {
        this.toggleButton = document.getElementById('theme-toggle');
        this.themeIcon = document.getElementById('theme-icon');
        
        // Load saved theme or default to dark
        this.currentTheme = this.loadTheme() || this.DARK_THEME;
        this.applyTheme(this.currentTheme);
        
        // Bind click event
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggle());
        }

        // Listen for system theme changes
        this.watchSystemTheme();
    },

    /**
     * Toggle between dark and light themes
     */
    toggle() {
        this.currentTheme = this.currentTheme === this.DARK_THEME 
            ? this.LIGHT_THEME 
            : this.DARK_THEME;
        
        this.applyTheme(this.currentTheme);
        this.saveTheme(this.currentTheme);
        
        // Update Monaco Editor theme if editor exists
        if (window.Editor && window.Editor.monacoEditor) {
            window.Editor.updateTheme();
        }
    },

    /**
     * Apply a theme to the document
     * @param {string} theme - Theme to apply
     */
    applyTheme(theme) {
        document.body.classList.remove(this.DARK_THEME, this.LIGHT_THEME);
        document.body.classList.add(theme);
        this.updateIcon(theme);
    },

    /**
     * Update the theme toggle icon
     * @param {string} theme - Current theme
     */
    updateIcon(theme) {
        if (!this.themeIcon) return;
        
        if (theme === this.DARK_THEME) {
            this.themeIcon.classList.remove('fa-sun');
            this.themeIcon.classList.add('fa-moon');
        } else {
            this.themeIcon.classList.remove('fa-moon');
            this.themeIcon.classList.add('fa-sun');
        }
    },

    /**
     * Save theme preference to localStorage
     * @param {string} theme - Theme to save
     */
    saveTheme(theme) {
        try {
            localStorage.setItem(this.STORAGE_KEY, theme);
        } catch (e) {
            console.warn('Could not save theme preference:', e);
        }
    },

    /**
     * Load theme preference from localStorage
     * @returns {string|null} - Saved theme or null
     */
    loadTheme() {
        try {
            return localStorage.getItem(this.STORAGE_KEY);
        } catch (e) {
            console.warn('Could not load theme preference:', e);
            return null;
        }
    },

    /**
     * Watch for system theme changes
     */
    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't set a preference
                if (!this.loadTheme()) {
                    this.currentTheme = e.matches ? this.DARK_THEME : this.LIGHT_THEME;
                    this.applyTheme(this.currentTheme);
                }
            });
        }
    },

    /**
     * Check if current theme is dark
     * @returns {boolean}
     */
    isDarkTheme() {
        return this.currentTheme === this.DARK_THEME;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    ThemeToggle.init();
});

// Make ThemeToggle globally available
window.ThemeToggle = ThemeToggle;