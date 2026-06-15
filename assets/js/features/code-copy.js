const settings = document.getElementById('code-copy-settings');
if (settings) {
    const label = settings.dataset.label;
    document.querySelectorAll('pre > code').forEach(code => {
        const table = code.closest('table');
        if (table && code.closest('td') === table.querySelector('td')) return;
        const container = code.closest('.highlight') || code.parentElement;
        if (container.querySelector('.copy-code')) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'copy-code';
        button.textContent = label;
        let timer;
        button.addEventListener('click', async () => {
            let copied = false;
            try {
                await navigator.clipboard.writeText(code.textContent);
                copied = true;
            } catch (_) {
                const selection = getSelection();
                const saved = Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange());
                const range = document.createRange();
                range.selectNodeContents(code);
                selection.removeAllRanges();
                selection.addRange(range);
                try { copied = document.execCommand('copy'); } catch (_) {}
                selection.removeAllRanges();
                saved.forEach(range => selection.addRange(range));
            }
            button.textContent = copied ? '✓ copied!' : 'Copy failed';
            button.classList.toggle('copied', copied);
            clearTimeout(timer);
            timer = setTimeout(() => {
                button.textContent = label;
                button.classList.remove('copied');
            }, 2000);
        });
        container.append(button);
    });
}
