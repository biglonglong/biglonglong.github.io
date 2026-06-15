export function bindSearchKeyboard({ box, input, results, cancelPending }) {
    box.addEventListener('focusin', (event) => {
        results.querySelector('.focus')?.classList.remove('focus');
        event.target.closest('li')?.classList.add('focus');
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || event.isComposing || document.getElementById('lightbox-overlay')?.classList.contains('open')) return;
        event.preventDefault();
        cancelPending();
        let destination = new URL(box.dataset.homeUrl, location.origin).href;
        if (document.referrer) {
            const previous = new URL(document.referrer);
            if (previous.origin === location.origin && previous.pathname !== location.pathname) destination = previous.href;
        }
        location.assign(destination);
    }, true);

    box.addEventListener('keydown', (event) => {
        if (event.isComposing) return;
        const links = Array.from(results.querySelectorAll('a'));
        const index = links.indexOf(document.activeElement);
        if (event.key === 'ArrowDown' && links.length) {
            event.preventDefault();
            links[Math.min(index + 1, links.length - 1)].focus();
        } else if (event.key === 'ArrowUp' && index >= 0) {
            event.preventDefault();
            (index === 0 ? input : links[index - 1]).focus();
        } else if (event.key === 'ArrowRight' && index >= 0) {
            links[index].click();
        }
    });
}
