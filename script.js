// Ensure DOM is fully loaded before running script
document.addEventListener('DOMContentLoaded', () => {

    // --- CodeMirror Editor Setup ---
    const htmlEditorEl = document.getElementById('html-code');
    const cssEditorEl = document.getElementById('css-code');
    const jsEditorEl = document.getElementById('js-code');
    const livePreviewEl = document.getElementById('live-preview');

    // Initialize CodeMirror instances
    // For more options, refer to CodeMirror documentation: https://codemirror.net/doc/manual.html#config
    const htmlEditor = CodeMirror.fromTextArea(htmlEditorEl, {
        mode: 'xml', // Use 'xml' mode for HTML
        theme: 'dracula', // Example theme
        lineNumbers: true,
        autoCloseTags: true, // For HTML
        matchBrackets: true,
        // Add more HTML-specific settings if needed
    });

    const cssEditor = CodeMirror.fromTextArea(cssEditorEl, {
        mode: 'css',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        // Add more CSS-specific settings if needed
    });

    const jsEditor = CodeMirror.fromTextArea(jsEditorEl, {
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        // Add more JS-specific settings if needed
    });

    // --- Real-time Preview Logic ---
    const updatePreview = () => {
        const htmlCode = htmlEditor.getValue();
        const cssCode = cssEditor.getValue();
        const jsCode = jsEditor.getValue();

        // Get the iframe's document
        const iframeDoc = livePreviewEl.contentDocument || livePreviewEl.contentWindow.document;

        // Construct the full HTML content to inject into the iframe
        // IMPORTANT: The <script> tag should ideally be at the end of <body> for performance.
        const fullContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Live Preview</title>
                <style>${cssCode}</style>
            </head>
            <body>
                ${htmlCode}
                <script>${jsCode}<\/script> </body>
            </html>
        `;

        iframeDoc.open();
        iframeDoc.write(fullContent);
        iframeDoc.close();
    };

    // Update preview whenever code changes in any editor
    htmlEditor.on('change', updatePreview);
    cssEditor.on('change', updatePreview);
    jsEditor.on('change', updatePreview);

    // Initial preview update on load
    updatePreview();


    // --- Menu Button Functionality ---

    const loadFileInput = document.getElementById('file-input');
    const loadFileBtn = document.getElementById('load-file-btn');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');

    // Load File Button
    loadFileBtn.addEventListener('click', () => {
        loadFileInput.click(); // Programmatically click the hidden file input
    });

    loadFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target.result;
            const fileExtension = file.name.split('.').pop().toLowerCase();

            switch (fileExtension) {
                case 'html':
                    htmlEditor.setValue(content);
                    break;
                case 'css':
                    cssEditor.setValue(content);
                    break;
                case 'js':
                    jsEditor.setValue(content);
                    break;
                default:
                    alert('Unsupported file type. Please load .html, .css, or .js files.');
            }
        };

        reader.onerror = () => {
            alert('Failed to read file.');
        };

        reader.readAsText(file);
    });

    // Download All Code Button
    downloadAllBtn.addEventListener('click', () => {
        const htmlCode = htmlEditor.getValue();
        const cssCode = cssEditor.getValue();
        const jsCode = jsEditor.getValue();

        // Use FileSaver.js to download files
        if (htmlCode.trim() !== '') {
            const htmlBlob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
            saveAs(htmlBlob, 'index.html');
        }
        if (cssCode.trim() !== '') {
            const cssBlob = new Blob([cssCode], { type: 'text/css;charset=utf-8' });
            saveAs(cssBlob, 'style.css');
        }
        if (jsCode.trim() !== '') {
            const jsBlob = new Blob([jsCode], { type: 'text/javascript;charset=utf-8' });
            saveAs(jsBlob, 'script.js');
        }

        if (htmlCode.trim() === '' && cssCode.trim() === '' && jsCode.trim() === '') {
            alert('No code to download. Please enter some code first.');
        }
    });

    // Clear All Fields Button
    clearAllBtn.addEventListener('click', () => {
        const confirmClear = confirm('Are you sure you want to clear all code fields? This action cannot be undone.');
        if (confirmClear) {
            htmlEditor.setValue('');
            cssEditor.setValue('');
            jsEditor.setValue('');
            updatePreview(); // Clear the preview as well
        }
    });

    // --- Desktop View Notification ---
    const desktopNotification = document.getElementById('desktop-notification');
    const isMobile = () => window.innerWidth < 1025; // Define mobile breakpoint

    const toggleNotification = () => {
        if (isMobile()) {
            desktopNotification.style.display = 'block';
        } else {
            desktopNotification.style.display = 'none';
        }
    };

    // Check on load and on resize
    toggleNotification();
    window.addEventListener('resize', toggleNotification);

    // Initial resize to trigger CodeMirror layout adjustment
    // This is often needed after CodeMirror is initialized in a dynamic layout
    setTimeout(() => {
        htmlEditor.refresh();
        cssEditor.refresh();
        jsEditor.refresh();
    }, 100); // Small delay to ensure all elements are rendered
});
