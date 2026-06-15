document.addEventListener("DOMContentLoaded", function () {
        const content = document.querySelector('.post-content');
        if (!content || typeof window.renderMathInElement !== 'function') return;
        window.renderMathInElement(content, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
        });
    });
