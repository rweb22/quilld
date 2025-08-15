/**
 * QuillM - Quill Manager
 * Aggregator for all Quill extensions and configurations
 */

class QuillM {
  constructor() {
    this.extensions = new Map();
    this.themes = {
      default: 'snow',
      bubble: 'bubble'
    };
    
    this.defaultConfig = {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['blockquote', 'link'],
          ['clean']
        ],
        history: {
          delay: 1000,
          maxStack: 50,
          userOnly: true
        }
      },
      placeholder: 'Start typing...',
      readOnly: false
    };

    // Initialize extensions
    this.initializeExtensions();
  }

  /**
   * Initialize and register all extensions
   */
  initializeExtensions() {
    // Register Quote extension if QuoteManager is available
    if (typeof QuoteManager !== 'undefined') {
      this.extensions.set('quote', {
        name: 'quote',
        type: 'manager',
        managerClass: QuoteManager
      });
    }
  }

  /**
   * Create a new Quill editor instance with all extensions
   * @param {string|HTMLElement} container - Container selector or element
   * @param {Object} config - Configuration options
   * @returns {Object} Enhanced Quill instance with extension managers
   */
  createEditor(container, config = {}) {
    // Merge configurations
    const finalConfig = this.mergeConfig(this.defaultConfig, config);
    
    // Create Quill instance
    const quill = new Quill(container, finalConfig);
    
    // Initialize extension managers
    const managers = this.initializeManagers(quill);
    
    // Return enhanced Quill instance
    return this.createEnhancedQuill(quill, managers);
  }

  /**
   * Initialize extension managers
   * @param {Object} quill - Quill instance
   * @returns {Object} Extension managers
   */
  initializeManagers(quill) {
    const managers = {};
    
    // Initialize Quote manager if available
    if (this.extensions.has('quote')) {
      const quoteExtension = this.extensions.get('quote');
      if (quoteExtension.managerClass) {
        managers.quote = new quoteExtension.managerClass(quill);
      }
    }
    
    return managers;
  }

  /**
   * Create enhanced Quill instance with extension methods
   * @param {Object} quill - Original Quill instance
   * @param {Object} managers - Extension managers
   * @returns {Object} Enhanced Quill instance
   */
  createEnhancedQuill(quill, managers) {
    // Add extension managers to quill instance
    quill.managers = managers;
    
    // Add convenience methods for quote functionality
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
    }
    
    // Add export/import methods
    quill.exportContent = () => {
      return {
        delta: quill.getContents(),
        html: quill.root.innerHTML,
        text: quill.getText()
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
    
    // Utility method to get extension manager
    quill.getManager = (extensionName) => {
      return managers[extensionName] || null;
    };
    
    return quill;
  }

  /**
   * Create a simple editor with minimal toolbar
   * @param {string|HTMLElement} container - Container selector or element
   * @param {Object} config - Additional configuration
   * @returns {Object} Enhanced Quill instance
   */
  createSimpleEditor(container, config = {}) {
    const simpleConfig = {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link', 'clean']
        ]
      },
      placeholder: 'Type here...',
      ...config
    };
    
    return this.createEditor(container, simpleConfig);
  }

  /**
   * Create a bubble editor (tooltip-style toolbar)
   * @param {string|HTMLElement} container - Container selector or element
   * @param {Object} config - Additional configuration
   * @returns {Object} Enhanced Quill instance
   */
  createBubbleEditor(container, config = {}) {
    const bubbleConfig = {
      theme: 'bubble',
      placeholder: 'Click to start typing...',
      ...config
    };
    
    return this.createEditor(container, bubbleConfig);
  }

  /**
   * Create a read-only viewer
   * @param {string|HTMLElement} container - Container selector or element
   * @param {Object} content - Content to display
   * @returns {Object} Enhanced Quill instance
   */
  createViewer(container, content = {}) {
    const viewerConfig = {
      theme: 'snow',
      modules: {
        toolbar: false
      },
      readOnly: true
    };
    
    const viewer = this.createEditor(container, viewerConfig);
    
    if (content.delta) {
      viewer.setContents(content.delta);
    } else if (content.html) {
      viewer.root.innerHTML = content.html;
    } else if (content.text) {
      viewer.setText(content.text);
    }
    
    return viewer;
  }

  /**
   * Create editor with quote functionality enabled
   * @param {string|HTMLElement} container - Container selector or element
   * @param {Object} config - Additional configuration
   * @returns {Object} Enhanced Quill instance with quotes
   */
  createQuoteEditor(container, config = {}) {
    const quoteConfig = {
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['blockquote', 'quote'], // Add quote button
          ['link', 'clean']
        ]
      },
      ...config
    };
    
    return this.createEditor(container, quoteConfig);
  }

  /**
   * Merge configuration objects deeply
   * @param {Object} defaultConfig - Default configuration
   * @param {Object} userConfig - User configuration
   * @returns {Object} Merged configuration
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
   * Register a new extension
   * @param {string} name - Extension name
   * @param {Object} extension - Extension configuration
   */
  registerExtension(name, extension) {
    this.extensions.set(name, extension);
  }

  /**
   * Get available extensions
   * @returns {Array} List of extension names
   */
  getExtensions() {
    return Array.from(this.extensions.keys());
  }

  /**
   * Load CSS files for extensions
   * @param {Array} cssFiles - Array of CSS file URLs
   */
  loadCSS(cssFiles = []) {
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
   * Get version information
   * @returns {Object} Version information
   */
  getVersion() {
    return {
      quillm: '1.0.0',
      quill: Quill.version || 'unknown',
      extensions: this.getExtensions()
    };
  }
}

// Create global instance
const quillM = new QuillM();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QuillM, quillM };
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return { QuillM, quillM };
  });
} else {
  // Browser global
  window.QuillM = QuillM;
  window.quillM = quillM;
}
