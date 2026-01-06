/**
 * Resizer Module
 * Handles the resizable splitter between editor and output panels
 */

const Resizer = {
    resizer: null,
    editorPanel: null,
    outputPanel: null,
    isResizing: false,
    startX: 0,
    startY: 0,
    startEditorWidth: 0,
    startOutputWidth: 0,
    startEditorHeight: 0,
    startOutputHeight: 0,

    /**
     * Initialize the resizer
     */
    init() {
        this.resizer = document.getElementById('resizer');
        this.editorPanel = document.getElementById('editor-panel');
        this.outputPanel = document.getElementById('output-panel');

        if (!this.resizer || !this.editorPanel || !this.outputPanel) {
            console.error('Resizer: Required elements not found');
            return;
        }

        this.bindEvents();
    },

    /**
     * Check if layout is vertical (mobile)
     */
    isVertical() {
        return window.innerWidth <= 900;
    },

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Mouse events
        this.resizer.addEventListener('mousedown', (e) => this.startResize(e));
        document.addEventListener('mousemove', (e) => this.resize(e));
        document.addEventListener('mouseup', () => this.stopResize());

        // Touch events for mobile
        this.resizer.addEventListener('touchstart', (e) => this.startResize(e.touches[0]));
        document.addEventListener('touchmove', (e) => {
            if (this.isResizing) {
                e.preventDefault();
                this.resize(e.touches[0]);
            }
        }, { passive: false });
        document.addEventListener('touchend', () => this.stopResize());

        // Double click to reset
        this.resizer.addEventListener('dblclick', () => this.reset());
    },

    /**
     * Start resizing
     */
    startResize(e) {
        this.isResizing = true;
        document.body.classList.add('resizing');
        this.resizer.classList.add('active');

        this.startX = e.clientX;
        this.startY = e.clientY;

        if (this.isVertical()) {
            // Get computed heights including any inline styles
            this.startEditorHeight = this.editorPanel.offsetHeight;
            this.startOutputHeight = this.outputPanel.offsetHeight;
        } else {
            this.startEditorWidth = this.editorPanel.getBoundingClientRect().width;
            this.startOutputWidth = this.outputPanel.getBoundingClientRect().width;
        }

        e.preventDefault?.();
    },

    /**
     * Handle resize movement
     */
    resize(e) {
        if (!this.isResizing) return;

        if (this.isVertical()) {
            const deltaY = e.clientY - this.startY;
            const newEditorHeight = this.startEditorHeight + deltaY;
            const newOutputHeight = this.startOutputHeight - deltaY;

            // Minimum heights to keep headers visible
            const minEditorHeight = 100;
            const minOutputHeight = 80;

            if (newEditorHeight >= minEditorHeight && newOutputHeight >= minOutputHeight) {
                this.editorPanel.style.flex = '0 0 auto';
                this.editorPanel.style.height = `${newEditorHeight}px`;
                this.outputPanel.style.flex = '0 0 auto';
                this.outputPanel.style.height = `${newOutputHeight}px`;
                
                // Trigger Monaco layout update
                window.Editor?.monacoEditor?.layout();
            }
        } else {
            const deltaX = e.clientX - this.startX;
            const newEditorWidth = this.startEditorWidth + deltaX;
            const newOutputWidth = this.startOutputWidth - deltaX;

            // Minimum widths - ensure buttons remain visible
            const minEditorWidth = 500;
            const minOutputWidth = 250;
            
            if (newEditorWidth >= minEditorWidth && newOutputWidth >= minOutputWidth) {
                this.editorPanel.style.flex = 'none';
                this.editorPanel.style.width = `${newEditorWidth}px`;
                this.outputPanel.style.flex = '1';
                this.outputPanel.style.width = '';
                this.outputPanel.style.maxWidth = 'none';
                
                // Trigger Monaco layout update
                window.Editor?.monacoEditor?.layout();
            }
        }
    },

    /**
     * Stop resizing
     */
    stopResize() {
        if (this.isResizing) {
            this.isResizing = false;
            document.body.classList.remove('resizing');
            this.resizer.classList.remove('active');
            window.Editor?.monacoEditor?.layout();
        }
    },

    /**
     * Reset panels to default sizes
     */
    reset() {
        if (this.isVertical()) {
            this.editorPanel.style.flex = '1';
            this.editorPanel.style.height = '';
            this.editorPanel.style.minHeight = '';
            this.outputPanel.style.flex = '1';
            this.outputPanel.style.height = '';
        } else {
            this.editorPanel.style.flex = 'none';
            this.editorPanel.style.width = '65%';
            this.outputPanel.style.flex = '1';
            this.outputPanel.style.width = '';
            this.outputPanel.style.maxWidth = '35%';
        }
        window.Editor?.monacoEditor?.layout();
        window.Toast?.show('Panel sizes reset', 'info');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Resizer.init();
});

// Make Resizer globally available
window.Resizer = Resizer;
