import { frameThrottle } from './utils.js';

const container = document.getElementById('toc-container');
if (container) {
    const links = Array.from(container.querySelectorAll('a[href^="#"]'));
    const entries = links.flatMap(link => {
        try {
            const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
            return heading ? [{ link, heading }] : [];
        } catch (_) { return []; }
    });
    let active;
    const update = frameThrottle(() => {
        let current = entries[0];
        for (const entry of entries) {
            if (entry.heading.getBoundingClientRect().top <= innerHeight * 0.25) current = entry;
        }
        if (!current || current === active) return;
        active?.link.classList.remove('active');
        active?.link.removeAttribute('aria-current');
        current.link.classList.add('active');
        current.link.setAttribute('aria-current', 'location');
        active = current;
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
}
