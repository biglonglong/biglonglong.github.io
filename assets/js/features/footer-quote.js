import { onIdle } from './utils.js';
import { footerQuotes } from './footer-quotes.js';

document.addEventListener('DOMContentLoaded', () => {
    const footer = document.querySelector('.footer');
    if (!footer) return;

    onIdle(() => {
        const quote = document.createElement('div');
        quote.className = 'footer-quote';
        quote.title = '点击换一条';
        const today = new Date();
        const dayKey = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        let index = dayKey % footerQuotes.length;
        let changeTimer;

        const showQuote = () => { quote.textContent = `"${footerQuotes[index]}"`; };
        showQuote();
        quote.addEventListener('click', () => {
            index = (index + 1) % footerQuotes.length;
            quote.style.opacity = '0';
            clearTimeout(changeTimer);
            changeTimer = setTimeout(() => {
                showQuote();
                quote.style.opacity = '';
            }, 200);
        });
        footer.appendChild(quote);
    });
});
