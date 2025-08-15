1. Include Required Files
```
<!-- Quill.js Core -->
<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
<script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>

<!-- QuillD System -->
<link href="./quilld.css" rel="stylesheet">
<link href="./quote.css" rel="stylesheet">
<script src="./quote.js"></script>
<script src="./quilld.js"></script>
```

2. Create an Editor
```
// Basic editor
const editor = quillD.createEditor('#my-editor');

// Editor with word count
const editor = quillD.createEditor('#my-editor', {
  wordCount: {
    showWordCount: true,
    showCharCount: true,
    maxWords: 500
  }
});
```

3. Use Quote Functionality
```
// Insert a quote
editor.insertQuote(
  '<p>Innovation distinguishes between a leader and a follower.</p>',
  'Steve Jobs'
);

// Show quote dialog
editor.showQuoteDialog();
```

Theme Control
```
// Light theme
document.querySelectorAll('.quilld-container').forEach(container => {
  container.classList.add('quilld-light');
});

// Dark theme
document.querySelectorAll('.quilld-container').forEach(container => {
  container.classList.add('quilld-dark');
});

// Auto theme (follows system preference)
document.querySelectorAll('.quilld-container').forEach(container => {
  container.classList.remove('quilld-light', 'quilld-dark');
});
```

Creates a new QuillD editor instance.
```
const editor = quillD.createEditor('#editor', {
  wordCount: {
    showWordCount: true,
    showCharCount: true,
    maxWords: 1000,
    maxChars: 5000
  },
  config: {
    placeholder: 'Start writing...',
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        ['link', 'clean']
      ]
    }
  }
});
```

Returns content in multiple formats.
```
const content = editor.exportContent();
// Returns: { delta, html, text, wordCount, charCount }
```

Imports content into the editor.
```
// From HTML
editor.importContent({ html: '<p>Content</p>' });

// From Delta
editor.importContent({ delta: quillDelta });

// From plain text
editor.importContent({ text: 'Plain text' });
```

Inserts a validated quote block.
```
const success = editor.insertQuote(
  '<p>Quote content with <strong>formatting</strong></p>',
  'Author Name'
);
```

Opens the quote insertion dialog.
```
editor.showQuoteDialog('<p>Pre-filled content</p>');
```

Validates content for quote insertion.
```
const isValid = editor.isValidQuoteContent('<p>Some content</p>');
```

Returns detailed validation information.
```
const details = editor.getValidationDetails(content);
// Returns: { isValid: boolean, reasons: string[] }
```

Word Count
```
editor.getWordCount()
// Returns current word count.

editor.getCharCount()
// Returns current character count.

editor.getCharCountNoSpaces()
// Returns character count excluding spaces.
```

Version and feature information.
```
const info = quillD.getInfo();
// Returns: { version, quillVersion, features, extensions }
```