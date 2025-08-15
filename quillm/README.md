# QuillM - Quill Rich Text Editor Manager

A powerful aggregator and extension manager for Quill.js that simplifies the creation of rich text editors with custom extensions.

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Extensions](#extensions)
- [Configuration](#configuration)
- [Examples](#examples)
- [Contributing](#contributing)

## 🚀 Installation

### Include Required Files

```html
<!-- Quill CSS (required) -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.bubble.min.css" rel="stylesheet">

<!-- QuillM CSS -->
<link href="path/to/quillm.css" rel="stylesheet">

<!-- Your extension CSS files -->
<link href="path/to/quote.css" rel="stylesheet">

<!-- Quill JS (required) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.min.js"></script>

<!-- Your extension JS files -->
<script src="path/to/quote.js"></script>

<!-- QuillM JS -->
<script src="path/to/quillm.js"></script>
```

### NPM/Module Installation

```javascript
// If using modules
import { QuillM, quillM } from './quillm.js';
// or
const { QuillM, quillM } = require('./quillm.js');
```

## 🏁 Quick Start

### Basic Usage

```javascript
// Use the global instance
const editor = quillM.createEditor('#editor-container');

// Or create your own instance
const manager = new QuillM();
const editor = manager.createEditor('#my-editor');
```

### Insert a Quote

```javascript
// Insert a simple text quote
editor.insertQuote("This is a simple quote");

// Insert a quote with rich text and author
editor.insertQuote({
    html: "Innovation distinguishes between a <strong>leader</strong> and a follower.",
    author: "Steve Jobs"
});

// Create a quote from selected text
editor.createQuoteFromSelection("Optional Author Name");
```

## 📖 API Reference

### QuillM Class

#### Constructor

```javascript
const quillM = new QuillM();
```

Creates a new QuillM instance with default configuration and initializes all available extensions.

#### Methods

##### `createEditor(container, config)`

Creates a full-featured Quill editor with all extensions.

**Parameters:**
- `container` (string|HTMLElement): CSS selector or DOM element
- `config` (Object, optional): Configuration object

**Returns:** Enhanced Quill instance

```javascript
const editor = quillM.createEditor('#editor', {
    theme: 'snow',
    placeholder: 'Start typing...',
    modules: {
        toolbar: [
            ['bold', 'italic'],
            ['link', 'image']
        ]
    }
});
```

##### `createSimpleEditor(container, config)`

Creates a minimal editor with basic formatting options.

**Parameters:**
- `container` (string|HTMLElement): CSS selector or DOM element
- `config` (Object, optional): Additional configuration

**Returns:** Enhanced Quill instance with minimal toolbar

```javascript
const simpleEditor = quillM.createSimpleEditor('#simple-editor');
```

##### `createBubbleEditor(container, config)`

Creates a bubble-style editor (tooltip toolbar).

**Parameters:**
- `container` (string|HTMLElement): CSS selector or DOM element
- `config` (Object, optional): Additional configuration

**Returns:** Enhanced Quill instance with bubble theme

```javascript
const bubbleEditor = quillM.createBubbleEditor('#bubble-editor', {
    placeholder: 'Click to start typing...'
});
```

##### `createViewer(container, content)`

Creates a read-only content viewer.

**Parameters:**
- `container` (string|HTMLElement): CSS selector or DOM element
- `content` (Object, optional): Content to display

**Returns:** Read-only Quill instance

```javascript
const viewer = quillM.createViewer('#viewer', {
    html: '<h1>Title</h1><p>Content...</p>'
});
```

##### `registerExtension(name, extension)`

Register a new custom extension.

**Parameters:**
- `name` (string): Extension name
- `extension` (Object): Extension configuration

```javascript
quillM.registerExtension('myExtension', {
    blot: MyCustomBlot,
    manager: MyCustomManager
});
```

##### `getExtensions()`

Get list of available extensions.

**Returns:** Array of extension names

```javascript
const extensions = quillM.getExtensions();
// ['quote', 'myExtension']
```

##### `getVersion()`

Get version information.

**Returns:** Object with version details

```javascript
const version = quillM.getVersion();
// {
//   quillm: '1.0.0',
//   quill: '1.3.7',
//   extensions: ['quote']
// }
```

### Enhanced Quill Instance

All editors created by QuillM are enhanced with additional methods and properties.

#### Properties

- `managers`: Object containing extension managers
  ```javascript
  editor.managers.quote // QuoteManager instance
  ```

#### Methods

##### `insertQuote(content, index)`

Insert a quote block at specified position.

**Parameters:**
- `content` (string|Object): Quote content
- `index` (number, optional): Position to insert

**Returns:** Insertion index

```javascript
// Simple text quote
editor.insertQuote("Simple quote text");

// Rich text quote with author
editor.insertQuote({
    html: "Rich <strong>text</strong> quote",
    text: "Rich text quote",
    author: "Author Name"
});

// Insert at specific position
editor.insertQuote("Quote at position 10", 10);
```

##### `createQuoteFromSelection(author)`

Convert selected text to a quote block.

**Parameters:**
- `author` (string, optional): Author attribution

**Returns:** Insertion index or null if no selection

```javascript
// Basic quote from selection
editor.createQuoteFromSelection();

// Quote with author
editor.createQuoteFromSelection("John Doe");
```

##### `getAllQuotes()`

Get all quote blocks in the editor.

**Returns:** Array of quote objects

```javascript
const quotes = editor.getAllQuotes();
// [
//   {
//     index: 0,
//     content: { html: "...", text: "...", author: "..." },
//     element: HTMLElement
//   }
// ]
```

##### `exportContent()`

Export editor content with all custom formats.

**Returns:** Object containing all content representations

```javascript
const content = editor.exportContent();
// {
//   delta: {...},           // Quill Delta format
//   html: "...",           // HTML representation
//   text: "...",           // Plain text
//   quotes: [...]          // Array of quote objects
// }
```

##### `importContent(content)`

Import content with custom formats.

**Parameters:**
- `content` (Object): Content object from exportContent()

```javascript
const savedContent = editor.exportContent();
// ... later ...
newEditor.importContent(savedContent);
```

##### `getManager(extensionName)`

Get extension manager by name.

**Parameters:**
- `extensionName` (string): Name of the extension

**Returns:** Manager instance or null

```javascript
const quoteManager = editor.getManager('quote');
if (quoteManager) {
    quoteManager.insertQuote("Direct manager access");
}
```

## 🔌 Extensions

### Quote Extension

The Quote extension creates non-editable quote blocks with rich text content.

#### Quote Content Format

```javascript
// Simple string
"Just a text quote"

// Rich object
{
    html: "Rich <strong>HTML</strong> content",    // HTML representation
    text: "Rich HTML content",                     // Plain text
    author: "Author Name"                          // Optional author
}
```

#### QuoteManager Methods

```javascript
const quoteManager = editor.managers.quote;

// Insert quote
quoteManager.insertQuote(content, index);

// Create from selection
quoteManager.createQuoteFromSelection(author);

// Get all quotes
quoteManager.getAllQuotes();

// Remove all quotes
quoteManager.removeAllQuotes();
```

### Adding Custom Extensions

1. Create your extension blot:
```javascript
class MyBlot extends Quill.import('blots/block/embed') {
    static blotName = 'myblot';
    static tagName = 'div';
    // ... implementation
}
```

2. Create extension manager:
```javascript
class MyManager {
    constructor(quill) {
        this.quill = quill;
    }
    // ... methods
}
```

3. Register with QuillM:
```javascript
quillM.registerExtension('myExtension', {
    blot: MyBlot,
    manager: MyManager
});
```

## ⚙️ Configuration

### Default Configuration

```javascript
{
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
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
}
```

### Custom Configuration

Configuration objects are deeply merged with defaults:

```javascript
const editor = quillM.createEditor('#editor', {
    placeholder: 'Custom placeholder',
    modules: {
        toolbar: [
            ['bold', 'italic'],
            ['link']
        ],
        // Other modules preserved from defaults
    }
});
```

## 💡 Examples

### Basic Blog Editor

```javascript
const blogEditor = quillM.createEditor('#blog-editor', {
    placeholder: 'Write your blog post...',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean']
        ]
    }
});

// Add a quote
blogEditor.insertQuote({
    html: "The best blogs share <em>personal insights</em>.",
    author: "Content Expert"
});
```

### Comment System

```javascript
const commentEditor = quillM.createSimpleEditor('#comment-editor', {
    placeholder: 'Write your comment...'
});

// Enable quote replies
document.getElementById('quote-reply').addEventListener('click', () => {
    const selection = commentEditor.getSelection();
    if (selection && selection.length > 0) {
        commentEditor.createQuoteFromSelection();
    }
});
```

### Content Display

```javascript
// Load saved content
fetch('/api/content/123')
    .then(response => response.json())
    .then(content => {
        const viewer = quillM.createViewer('#content-display', content);
    });
```

### Multi-Editor Setup

```javascript
// Create multiple editors with shared configuration
const editorConfig = {
    modules: {
        toolbar: [
            ['bold', 'italic'],
            ['link'],
            ['clean']
        ]
    }
};

const editor1 = quillM.createEditor('#editor1', editorConfig);
const editor2 = quillM.createEditor('#editor2', editorConfig);

// Sync quotes between editors
function syncQuote(sourceEditor, targetEditor) {
    const quotes = sourceEditor.getAllQuotes();
    quotes.forEach(quote => {
        targetEditor.insertQuote(quote.content);
    });
}
```

## 🎨 Styling

### Custom Themes

QuillM includes enhanced styling for better visual appeal. You can customize the appearance:

```css
/* Override quote block styling */
.ql-quote-content {
    background: linear-gradient(135deg, #your-color1, #your-color2);
    border-left-color: #your-accent-color;
}

/* Custom editor container */
.quillm-container {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### Responsive Design

QuillM includes responsive breakpoints:

```css
@media (max-width: 768px) {
    .ql-quote-content {
        padding: 16px 20px;
        margin: 0 -4px;
    }
}
```

## 🔧 Utility Methods

### Static Methods

```javascript
// Insert quote in any Quill instance
QuillM.insertQuote(quillInstance, "Quote content");

// Get version info
const version = QuillM.getVersion();
```

### Event Handling

```javascript
// Listen to content changes
editor.on('text-change', function(delta, oldDelta, source) {
    const quotes = editor.getAllQuotes();
    console.log(`Editor has ${quotes.length} quotes`);
});

// Listen to selection changes
editor.on('selection-change', function(range, oldRange, source) {
    if (range && range.length > 0) {
        // User has selected text - could show quote button
    }
});
```

## 🐛 Troubleshooting

### Common Issues

**Q: Quotes are not styled correctly**
A: Ensure `quote.css` is loaded after Quill's CSS files.

**Q: Extension not working**
A: Check that the extension files are loaded before `quillm.js`.

**Q: Can't insert quotes**
A: Verify that `QuoteBlot` is properly registered with Quill.

### Debug Mode

```javascript
// Enable console logging for debugging
const quillM = new QuillM();
quillM.debug = true;

// Check extension registration
console.log('Available extensions:', quillM.getExtensions());

// Verify manager creation
const editor = quillM.createEditor('#editor');
console.log('Quote manager:', editor.managers.quote);
```

## 📄 Browser Support

QuillM supports all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
git clone https://github.com/your-username/quillm.git
cd quillm
# Open test.html in browser for development
```

## 📞 Support

- Create an issue for bugs or feature requests
- Check existing issues before creating new ones
- Provide minimal reproduction examples

---

**QuillM** - Making rich text editing extensible and delightful! ✨