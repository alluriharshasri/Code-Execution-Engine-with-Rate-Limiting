/**
 * Language Selector Module
 * Handles programming language selection and Monaco Editor language mapping
 */

const LanguageSelector = {
    STORAGE_KEY: 'code-editor-language',
    selectElement: null,
    currentLanguage: 'python',

    // Language configurations with Monaco language IDs and sample code
    languages: {
        python: {
            name: 'Python',
            monacoLang: 'python',
            sample: `# Python Hello World
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
`
        },
        javascript: {
            name: 'JavaScript',
            monacoLang: 'javascript',
            sample: `// JavaScript Hello World
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));
`
        },
        typescript: {
            name: 'TypeScript',
            monacoLang: 'typescript',
            sample: `// TypeScript Hello World
function greet(name: string): string {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));
`
        },
        java: {
            name: 'Java',
            monacoLang: 'java',
            sample: `// Java Hello World
public class Main {
    public static void main(String[] args) {
        System.out.println(greet("World"));
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}
`
        },
        cpp: {
            name: 'C++',
            monacoLang: 'cpp',
            sample: `// C++ Hello World
#include <iostream>
#include <string>

std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}

int main() {
    std::cout << greet("World") << std::endl;
    return 0;
}
`
        },
        c: {
            name: 'C',
            monacoLang: 'c',
            sample: `// C Hello World
#include <stdio.h>

void greet(const char* name) {
    printf("Hello, %s!\\n", name);
}

int main() {
    greet("World");
    return 0;
}
`
        },
        go: {
            name: 'Go',
            monacoLang: 'go',
            sample: `// Go Hello World
package main

import "fmt"

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name)
}

func main() {
    fmt.Println(greet("World"))
}
`
        },
        rust: {
            name: 'Rust',
            monacoLang: 'rust',
            sample: `// Rust Hello World
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    println!("{}", greet("World"));
}
`
        },
        ruby: {
            name: 'Ruby',
            monacoLang: 'ruby',
            sample: `# Ruby Hello World
def greet(name)
  "Hello, #{name}!"
end

puts greet("World")
`
        },
        php: {
            name: 'PHP',
            monacoLang: 'php',
            sample: `<?php
// PHP Hello World
function greet($name) {
    return "Hello, " . $name . "!";
}

echo greet("World") . "\\n";
?>
`
        }
    },

    /**
     * Initialize the language selector
     */
    init() {
        this.selectElement = document.getElementById('language-select');
        
        // Load saved language preference
        const savedLanguage = this.loadLanguage();
        if (savedLanguage && this.languages[savedLanguage]) {
            this.currentLanguage = savedLanguage;
            if (this.selectElement) {
                this.selectElement.value = savedLanguage;
            }
        }

        // Bind change event
        if (this.selectElement) {
            this.selectElement.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    },

    /**
     * Set the current language
     * @param {string} language - Language identifier
     */
    setLanguage(language) {
        if (!this.languages[language]) {
            console.warn(`Unsupported language: ${language}`);
            return;
        }

        this.currentLanguage = language;
        this.saveLanguage(language);

        // Update CodeMirror mode if editor exists
        if (window.Editor && window.Editor.cmEditor) {
            window.Editor.setLanguageMode(language);
        }

        // Dispatch event for other modules
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language, config: this.languages[language] }
        }));
    },

    /**
     * Get the current language configuration
     * @returns {Object} - Current language config
     */
    getCurrentConfig() {
        return this.languages[this.currentLanguage];
    },

    /**
     * Get language configuration by identifier
     * @param {string} language - Language identifier
     * @returns {Object|null} - Language config or null
     */
    getConfig(language) {
        return this.languages[language] || null;
    },

    /**
     * Get sample code for current language
     * @returns {string} - Sample code
     */
    getSampleCode() {
        return this.languages[this.currentLanguage]?.sample || '';
    },

    /**
     * Save language preference to localStorage
     * @param {string} language - Language to save
     */
    saveLanguage(language) {
        try {
            localStorage.setItem(this.STORAGE_KEY, language);
        } catch (e) {
            console.warn('Could not save language preference:', e);
        }
    },

    /**
     * Load language preference from localStorage
     * @returns {string|null} - Saved language or null
     */
    loadLanguage() {
        try {
            return localStorage.getItem(this.STORAGE_KEY);
        } catch (e) {
            console.warn('Could not load language preference:', e);
            return null;
        }
    },

    /**
     * Get all available languages
     * @returns {Object} - All language configurations
     */
    getAllLanguages() {
        return { ...this.languages };
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    LanguageSelector.init();
});

// Make LanguageSelector globally available
window.LanguageSelector = LanguageSelector;