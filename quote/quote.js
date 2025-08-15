/**
 * Enhanced Quote System with Validation
 * Public Interface: QuoteManager only
 * Internal: QuoteValidator, QuoteBlot
 */

import Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');

/**
 * INTERNAL: Quote Validator Class
 * Used internally by QuoteBlot and QuoteManager
 */
class QuoteValidator {
  static isValidQuoteContent(richText) {
    if (!richText || typeof richText !== 'string') {
      return true;
    }

    const temp = document.createElement('div');
    temp.innerHTML = richText;

    return (
      !this.hasQuoteBlocks(temp) &&
      !this.hasBlockquotes(temp) &&
      !this.hasQuoteMarkers(temp) &&
      !this.hasQuoteClasses(temp) &&
      !this.hasQuoteAttributes(temp)
    );
  }

  static hasQuoteBlocks(container) {
    const quoteSelectors = [
      '.ql-quote-block',
      '.quote-block',
      '.quote',
      '.quotation'
    ];
    return quoteSelectors.some(selector => 
      container.querySelector(selector) !== null
    );
  }

  static hasBlockquotes(container) {
    return container.querySelector('blockquote') !== null;
  }

  static hasQuoteClasses(container) {
    const elements = container.querySelectorAll('*');
    for (let element of elements) {
      const className = element.className || '';
      if (typeof className === 'string' && className.toLowerCase().includes('quote')) {
        return true;
      }
    }
    return false;
  }

  static hasQuoteAttributes(container) {
    const quoteAttributes = [
      '[data-quote]',
      '[data-quotation]',
      '[data-cite]',
      '[role="blockquote"]'
    ];
    return quoteAttributes.some(selector => 
      container.querySelector(selector) !== null
    );
  }

  static hasQuoteMarkers(container) {
    const textContent = container.textContent || '';
    const lines = textContent.split('\n');
    return lines.some(line => /^\s*>\s/.test(line.trim()));
  }

  static getValidationDetails(richText) {
    if (!richText || typeof richText !== 'string') {
      return { isValid: true, reasons: [] };
    }

    const temp = document.createElement('div');
    temp.innerHTML = richText;
    const reasons = [];

    if (this.hasQuoteBlocks(temp)) {
      reasons.push('Contains quote block elements');
    }
    if (this.hasBlockquotes(temp)) {
      reasons.push('Contains HTML blockquote elements');
    }
    if (this.hasQuoteMarkers(temp)) {
      reasons.push('Contains quote markers (lines starting with >)');
    }
    if (this.hasQuoteClasses(temp)) {
      reasons.push('Contains elements with quote-related CSS classes');
    }
    if (this.hasQuoteAttributes(temp)) {
      reasons.push('Contains elements with quote-related attributes');
    }

    return {
      isValid: reasons.length === 0,
      reasons: reasons
    };
  }

  static sanitizeQuoteContent(richText) {
    if (!richText || typeof richText !== 'string') {
      return richText;
    }

    const temp = document.createElement('div');
    temp.innerHTML = richText;

    // Remove quote blocks
    temp.querySelectorAll('.ql-quote-block, .quote-block, .quote, .quotation').forEach(el => el.remove());
    
    // Convert blockquotes to paragraphs
    temp.querySelectorAll('blockquote').forEach(blockquote => {
      const p = document.createElement('p');
      p.innerHTML = blockquote.innerHTML;
      blockquote.parentNode.replaceChild(p, blockquote);
    });

    // Remove quote attributes
    temp.querySelectorAll('[data-quote], [data-quotation], [data-cite]').forEach(el => {
      el.removeAttribute('data-quote');
      el.removeAttribute('data-quotation');
      el.removeAttribute('data-cite');
    });

    // Clean quote markers from text
    const textNodes = this.getTextNodes(temp);
    textNodes.forEach(node => {
      node.textContent = node.textContent.replace(/^>\s*/gm, '');
    });

    return temp.innerHTML;
  }

  static getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    return textNodes;
  }
}

/**
 * INTERNAL: Quote Blot Class
 * Registered with Quill internally, not accessed externally
 */
class QuoteBlot extends BlockEmbed {
  static blotName = 'quote';
  static tagName = 'div';
  static className = 'ql-quote-block';

  static create(value) {
    const node = super.create();
    
    if (!value || typeof value !== 'object') {
      value = { content: '', author: '' };
    }

    // Internal validation and sanitization
    let content = value.content || '';
    if (!QuoteValidator.isValidQuoteContent(content)) {
      console.warn('Invalid quote content detected, sanitizing...');
      content = QuoteValidator.sanitizeQuoteContent(content);
    }

    const quoteContent = document.createElement('div');
    quoteContent.className = 'ql-quote-content';
    
    const quoteText = document.createElement('div');
    quoteText.className = 'ql-quote-text';
    quoteText.innerHTML = content;
    
    const quoteAuthor = document.createElement('div');
    quoteAuthor.className = 'ql-quote-author';
    quoteAuthor.textContent = value.author || '';
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'ql-quote-delete';
    deleteButton.innerHTML = '×';
    deleteButton.setAttribute('title', 'Delete quote');
    deleteButton.type = 'button';
    
    quoteContent.appendChild(quoteText);
    quoteContent.appendChild(quoteAuthor);
    node.appendChild(quoteContent);
    node.appendChild(deleteButton);
    
    this.setupDeleteHandler(node, deleteButton);
    
    return node;
  }

  static setupDeleteHandler(node, deleteButton) {
    deleteButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const quillContainer = node.closest('.ql-container');
      if (quillContainer && quillContainer.parentNode.__quill) {
        const quill = quillContainer.parentNode.__quill;
        const blot = Quill.find(node);
        if (blot) {
          blot.remove();
          quill.focus();
        }
      } else {
        node.remove();
      }
    });
  }

  static value(node) {
    const quoteText = node.querySelector('.ql-quote-text');
    const quoteAuthor = node.querySelector('.ql-quote-author');
    
    return {
      content: quoteText ? quoteText.innerHTML : '',
      author: quoteAuthor ? quoteAuthor.textContent : ''
    };
  }

  constructor(domNode, value) {
    super(domNode, value);
    this.domNode.contentEditable = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.domNode.addEventListener('selectstart', (e) => {
      e.preventDefault();
    });

    this.domNode.addEventListener('click', (e) => {
      if (e.target.classList.contains('ql-quote-delete')) {
        return;
      }
      
      const quill = Quill.find(this.domNode.closest('.ql-container'));
      if (quill) {
        const index = quill.getIndex(this);
        quill.setSelection(index + 1, 0);
      }
    });
  }
}

// Register the blot internally
Quill.register(QuoteBlot);

/**
 * PUBLIC: Quote Manager Class
 * This is the only class that should be accessed externally
 */
class QuoteManager {
  constructor(quill) {
    this.quill = quill;
    this.setupPasteHandler();
    this.setupToolbarHandler();
  }

  /**
   * PUBLIC: Insert a quote with validation
   * Main method for external quote insertion
   */
  insertQuote(content, author = '') {
    const selection = this.quill.getSelection();
    if (!selection) {
      this.showToast('Please place cursor where you want to insert the quote', 'warning');
      return false;
    }

    // Use internal validator
    if (!QuoteValidator.isValidQuoteContent(content)) {
      const details = QuoteValidator.getValidationDetails(content);
      this.showValidationError(details.reasons);
      return false;
    }

    if (this.isInsideQuote(selection.index)) {
      this.showToast('Quotes cannot be nested inside other quotes', 'warning');
      return false;
    }

    try {
      this.quill.insertEmbed(selection.index, 'quote', {
        content: content,
        author: author
      });
      
      this.quill.setSelection(selection.index + 1, 0);
      return true;
    } catch (error) {
      console.error('Failed to insert quote:', error);
      this.showToast('Failed to insert quote', 'error');
      return false;
    }
  }

  /**
   * PUBLIC: Check if content is valid for quote insertion
   * Exposes validation without exposing validator class
   */
  isValidQuoteContent(content) {
    return QuoteValidator.isValidQuoteContent(content);
  }

  /**
   * PUBLIC: Get validation details for content
   * Useful for external validation feedback
   */
  getValidationDetails(content) {
    return QuoteValidator.getValidationDetails(content);
  }

  /**
   * PUBLIC: Show quote insertion dialog
   * Main UI method for quote insertion
   */
  showQuoteDialog(defaultContent = '') {
    const modal = document.createElement('div');
    modal.className = 'quote-modal';
    modal.innerHTML = `
      <div class="quote-modal-overlay"></div>
      <div class="quote-modal-content">
        <h3>Insert Quote</h3>
        <div class="quote-form">
          <label for="quote-content">Quote Content:</label>
          <div id="quote-content" class="quote-content-editor" contenteditable="true">${defaultContent}</div>
          
          <label for="quote-author">Author:</label>
          <input type="text" id="quote-author" placeholder="Enter author name">
          
          <div class="quote-actions">
            <button type="button" id="quote-cancel">Cancel</button>
            <button type="button" id="quote-insert">Insert Quote</button>
          </div>
        </div>
      </div>
    `;

    this.styleModal(modal);
    document.body.appendChild(modal);
    this.setupModalHandlers(modal);
  }

  // PRIVATE: Internal methods (not part of public API)
  isInsideQuote(index) {
    const [block] = this.quill.getLine(index);
    return block && (
      block.domNode.closest('.ql-quote-block') || 
      block.domNode.classList.contains('ql-quote-block')
    );
  }

  setupToolbarHandler() {
    this.quill.getModule('toolbar').addHandler('quote', () => {
      this.handleQuoteButton();
    });
  }

  /**
   * Handle quote button in toolbar with proper error checking
   */
  setupToolbarHandler() {
    try {
      // Check if toolbar module exists
      const toolbar = this.quill.getModule('toolbar');
      
      if (!toolbar) {
        console.warn('QuoteManager: No toolbar module found. Quote button will not be available.');
        return;
      }
      
      // Check if toolbar has addHandler method
      if (typeof toolbar.addHandler !== 'function') {
        console.warn('QuoteManager: Toolbar module does not support addHandler. Using alternative setup.');
        this.setupAlternativeToolbarHandler();
        return;
      }
      
      // Register quote handler
      toolbar.addHandler('quote', () => {
        this.handleQuoteButton();
      });
      
      console.log('QuoteManager: Quote toolbar handler registered successfully');
      
    } catch (error) {
      console.error('QuoteManager: Error setting up toolbar handler:', error);
      // Try alternative setup
      this.setupAlternativeToolbarHandler();
    }
  }

  /**
   * Alternative toolbar setup when addHandler is not available
   */
  setupAlternativeToolbarHandler() {
    try {
      // Wait for DOM to be ready and look for quote button
      setTimeout(() => {
        const quoteButton = this.quill.container.querySelector('.ql-quote');
        if (quoteButton) {
          quoteButton.addEventListener('click', () => {
            this.handleQuoteButton();
          });
          console.log('QuoteManager: Alternative quote button handler setup complete');
        } else {
          console.warn('QuoteManager: Quote button not found in toolbar');
        }
      }, 100);
    } catch (error) {
      console.error('QuoteManager: Error in alternative toolbar setup:', error);
    }
  }


  styleModal(modal) {
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
    `;

    const modalContent = modal.querySelector('.quote-modal-content');
    modalContent.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    `;

    const contentEditor = modal.querySelector('#quote-content');
    contentEditor.style.cssText = `
      border: 1px solid #ddd;
      padding: 12px;
      border-radius: 4px;
      min-height: 100px;
      margin-bottom: 16px;
      background: #fafafa;
    `;

    const authorInput = modal.querySelector('#quote-author');
    authorInput.style.cssText = `
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 16px;
    `;
  }

  setupModalHandlers(modal) {
    const overlay = modal.querySelector('.quote-modal-overlay');
    const cancelBtn = modal.querySelector('#quote-cancel');
    const insertBtn = modal.querySelector('#quote-insert');
    const contentEditor = modal.querySelector('#quote-content');
    const authorInput = modal.querySelector('#quote-author');

    const closeModal = () => {
      document.body.removeChild(modal);
      this.quill.focus();
    };

    overlay.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    insertBtn.addEventListener('click', () => {
      const content = contentEditor.innerHTML;
      const author = authorInput.value;

      if (this.insertQuote(content, author)) {
        closeModal();
      }
    });

    contentEditor.focus();
  }

  setupPasteHandler() {
    this.quill.root.addEventListener('paste', (e) => {
      const selection = this.quill.getSelection();
      if (!selection) return;

      if (this.isInsideQuote(selection.index)) {
        e.preventDefault();
        
        const clipboardData = e.clipboardData || window.clipboardData;
        const htmlData = clipboardData.getData('text/html');
        const textData = clipboardData.getData('text/plain');

        let contentToInsert = htmlData || textData;

        if (!QuoteValidator.isValidQuoteContent(contentToInsert)) {
          this.showToast('Cannot paste quotes inside existing quotes', 'warning');
          return;
        }

        if (htmlData) {
          this.quill.clipboard.dangerouslyPasteHTML(selection.index, contentToInsert);
        } else {
          this.quill.insertText(selection.index, contentToInsert);
        }
      }
    });
  }

  showValidationError(reasons) {
    const message = reasons.length > 0 
      ? `Cannot insert quote: ${reasons.join(', ')}`
      : 'Invalid quote content detected';
      
    this.showToast(message, 'warning');
  }

  showToast(message, type = 'info') {
    const colors = {
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
      info: '#3b82f6'
    };

    const toast = document.createElement('div');
    toast.className = `quote-toast quote-toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }
}

// EXPORT: Only QuoteManager is publicly accessible
export default QuoteManager;

// For backward compatibility, also export as named export
export { QuoteManager };

// Global access for browser environments - only QuoteManager
if (typeof window !== 'undefined') {
  window.QuoteManager = QuoteManager;
}
