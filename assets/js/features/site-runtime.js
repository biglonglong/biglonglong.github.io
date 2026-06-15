document.addEventListener('DOMContentLoaded', () => {
    const element = document.getElementById('site-runtime');
    if (!element) return;

    const start = Date.parse(element.dataset.start);
    if (Number.isNaN(start)) return;

    function formatRuntime() {
        let elapsed = Math.max(0, Date.now() - start);
        const days = Math.floor(elapsed / 86400000);
        elapsed %= 86400000;
        const hours = Math.floor(elapsed / 3600000);
        elapsed %= 3600000;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const pad = (value) => String(value).padStart(2, '0');
        return `${days} 天 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    function buildDigits(text) {
        element.replaceChildren(...Array.from(text, (char) => {
            if (!/\d/.test(char)) return document.createTextNode(char);
            const digit = document.createElement('span');
            digit.className = 'flip-digit';
            digit.textContent = char;
            return digit;
        }));
    }

    function updateRuntime() {
        const text = formatRuntime();
        const digits = text.match(/\d/g) || [];
        const spans = element.querySelectorAll('.flip-digit');
        if (spans.length !== digits.length) {
            buildDigits(text);
            return;
        }
        spans.forEach((span, index) => {
            if (span.textContent === digits[index]) return;
            span.textContent = digits[index];
            span.classList.remove('flip');
            void span.offsetWidth;
            span.classList.add('flip');
        });
    }

    updateRuntime();
    setInterval(updateRuntime, 1000);
});
