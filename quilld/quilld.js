/**
 * QuillD - Quill Direct
 * Single comprehensive editor with all essential features
 * ES6 Module version for React projects
 */

import Quill from 'quill';
import QuoteManager from './quote.js';

class QuillD {
    constructor() {
        this.defaultConfig = {
            theme: 'snow',
            modules: {
                toolbar: [
                    // Headers
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    // Basic formatting
                    ['bold', 'italic', 'underline'],
                    // Subscript/Superscript
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    // Lists
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    // Block elements
                    ['blockquote', 'code-block'],
                    // Indentation
                    [{ 'indent': '+1'}, { 'indent': '-1' }],
                    // Link
                    ['link'],
                    // Clean formatting
                    ['clean']
                ],
                history: {
                    delay: 1000,
                    maxStack: 50,
                    userOnly: true
                },
                placeholder: 'Start writing...',
                readOnly: false
            }
        };

        // Word count module configuration
        this.wordCountConfig = {
            container: null,
            showWordCount: true,
            showCharCount: true,
            showCharCountNoSpaces: false,
            maxWords: null,
            maxChars: null
        };
    }

    /**
     * Create QuillD editor with all features
     * @param {string|HTMLElement} container - Container selector or element
     * @param {Object} options - Configuration options
     * @returns {Object} Enhanced Quill instance
     */
    createEditor(container, options = {}) {
        try {
            // Better container handling
            let targetContainer = container;
            
            // If container is a string, treat it as a selector
            if (typeof container === 'string') {
                targetContainer = document.querySelector(container);
                if (!targetContainer) {
                    throw new Error(`QuillD: Container not found with selector: ${container}`);
                }
            }
            
            // If container is not a valid DOM element
            if (!targetContainer || !targetContainer.nodeType) {
                throw new Error('QuillD: Invalid container. Must be a DOM element or valid CSS selector.');
            }

            // Check if Quill is available
            if (typeof Quill === 'undefined') {
                throw new Error('QuillD: Quill is not loaded. Please include Quill.js before QuillD.');
            }

            // Merge configurations
            const config = this.mergeConfig(this.defaultConfig, options.config || {});
            
            // Create Quill instance
            const quill = new Quill(targetContainer, config);

            // Initialize word count if requested
            if (options.wordCount !== false) {
                this.initializeWordCount(quill, options.wordCount || {});
            }

            // Initialize quote functionality if available
            const managers = this.initializeExtensions(quill);

            // Create enhanced instance
            return this.createEnhancedQuill(quill, managers, options);

        } catch (error) {
            console.error('QuillD: Failed to create editor:', error);
            throw error;
        }
    }

    /**
     * Initialize extensions (Quote system)
     */
    initializeExtensions(quill) {
        const managers = {};
        
        // Initialize Quote manager
        try {
            managers.quote = new QuoteManager(quill);
            console.log('QuillD: Quote manager initialized successfully');
        } catch (error) {
            console.warn('QuillD: Failed to initialize QuoteManager:', error);
        }

        return managers;
    }

    /**
     * Initialize word count functionality
     */
    initializeWordCount(quill, wordCountOptions = {}) {
        const options = { ...this.wordCountConfig, ...wordCountOptions };
        
        // Create word count container if not provided
        let container = options.container;
        if (!container) {
            container = document.createElement('div');
            container.className = 'quilld-word-count';
            // Insert after the editor
            const editorContainer = quill.container.parentNode;
            editorContainer.appendChild(container);
        } else if (typeof container === 'string') {
            container = document.querySelector(container);
        }

        if (!container) {
            console.warn('QuillD: Word count container not found');
            return;
        }

        // Word count tracking
        const updateWordCount = () => {
            const text = quill.getText();
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            const chars = text.length;
            const charsNoSpaces = text.replace(/\s/g, '').length;

            let html = '';

            if (options.showWordCount) {
                const wordClass = options.maxWords && words.length > options.maxWords ? 'over-limit' : '';
                html += `<span class="${wordClass}">Words: ${words.length}${options.maxWords ? `/${options.maxWords}` : ''}</span>`;
            }

            if (options.showCharCount) {
                const charClass = options.maxChars && chars > options.maxChars ? 'over-limit' : '';
                html += `<span class="${charClass}"> Characters: ${chars}${options.maxChars ? `/${options.maxChars}` : ''}</span>`;
            }

            if (options.showCharCountNoSpaces) {
                html += `<span> Characters (no spaces): ${charsNoSpaces}</span>`;
            }

            container.innerHTML = html;
        };

        // Update on text change
        quill.on('text-change', updateWordCount);
        
        // Initial update
        updateWordCount();

        // Add word count methods to quill instance
        quill.getWordCount = () => {
            const text = quill.getText();
            return text.trim().split(/\s+/).filter(word => word.length > 0).length;
        };

        quill.getCharCount = () => {
            return quill.getText().length;
        };

        quill.getCharCountNoSpaces = () => {
            return quill.getText().replace(/\s/g, '').length;
        };
    }

    /**
     * Create enhanced Quill instance
     */
    createEnhancedQuill(quill, managers, options) {
        // Add managers
        quill.managers = managers;

        // Add quote functionality if available
        if (managers.quote) {
            quill.insertQuote = (content, author) => {
                return managers.quote.insertQuote(content, author);
            };

            quill.showQuoteDialog = (defaultContent) => {
                return managers.quote.showQuoteDialog(defaultContent);
            };

            quill.isValidQuoteContent = (content) => {
                return managers.quote.isValidQuoteContent(content);
            };

            quill.getValidationDetails = (content) => {
                return managers.quote.getValidationDetails(content);
            };
        }

        // Add utility methods
        quill.exportContent = () => {
            return {
                delta: quill.getContents(),
                html: quill.root.innerHTML,
                text: quill.getText(),
                wordCount: quill.getWordCount ? quill.getWordCount() : null,
                charCount: quill.getCharCount ? quill.getCharCount() : null
            };
        };

        quill.importContent = (content) => {
            if (content.delta) {
                quill.setContents(content.delta);
            } else if (content.html) {
                quill.root.innerHTML = content.html;
            } else if (content.text) {
                quill.setText(content.text);
            }
        };

        quill.clear = () => {
            quill.setText('');
        };

        quill.getManager = (extensionName) => {
            return managers[extensionName] || null;
        };

        // Add destroy method for cleanup
        quill.destroy = () => {
            try {
                // Clean up managers
                if (managers.quote) {
                    // Quote manager doesn't have a destroy method, but we can clean up event listeners
                    console.log('QuillD: Cleaning up quote manager');
                }

                // Remove word count container if we created it
                const wordCountContainer = quill.container.parentNode.querySelector('.quilld-word-count');
                if (wordCountContainer) {
                    wordCountContainer.remove();
                }

                // Standard Quill cleanup
                if (typeof quill.off === 'function') {
                    quill.off();
                }
                
                console.log('QuillD: Editor destroyed successfully');
            } catch (error) {
                console.error('QuillD: Error during cleanup:', error);
            }
        };

        return quill;
    }

    /**
     * Deep merge configuration objects
     */
    mergeConfig(defaultConfig, userConfig) {
        const merged = JSON.parse(JSON.stringify(defaultConfig));
        
        for (const key in userConfig) {
            if (userConfig.hasOwnProperty(key)) {
                if (typeof userConfig[key] === 'object' &&
                    !Array.isArray(userConfig[key]) &&
                    userConfig[key] !== null) {
                    merged[key] = this.mergeConfig(merged[key] || {}, userConfig[key]);
                } else {
                    merged[key] = userConfig[key];
                }
            }
        }
        
        return merged;
    }

    /**
     * Load required CSS files
     */
    loadCSS(cssFiles = ['./quilld.css, ./quote.css']) {
        cssFiles.forEach(cssFile => {
            if (!document.querySelector(`link[href="${cssFile}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssFile;
                document.head.appendChild(link);
            }
        });
    }

    /**
     * Get version and feature information
     */
    getInfo() {
        return {
            version: '1.0.0',
            quillVersion: Quill.version || 'unknown',
            features: [
                'Headers (H1-H6)',
                'Basic Formatting (Bold, Italic, Underline)',
                'Subscript/Superscript',
                'Lists (Ordered, Bullet)',
                'Blockquote',
                'Code Block',
                'Links',
                'Custom Quotes',
                'Word Count',
                'Character Count'
            ],
            extensions: QuoteManager ? ['Quote'] : []
        };
    }
}

// Create and export the singleton instance
const quillD = new QuillD();

// Export both the class and the instance
export { QuillD, quillD };
export default quillD;
