import { frameThrottle } from './utils.js';

const header = document.querySelector('.header');
if (header) {
    const measure = () => document.documentElement.style.setProperty('--sticky-header-height', `${header.getBoundingClientRect().height}px`);
    const updateScrolled = frameThrottle(() => header.classList.toggle('scrolled', window.scrollY > 40));
    new ResizeObserver(measure).observe(header);
    window.addEventListener('scroll', updateScrolled, { passive: true });
    measure();
    updateScrolled();
}

const menu = document.getElementById('menu');
if (menu) {
    try { menu.scrollLeft = Number(localStorage.getItem('menu-scroll-position')) || 0; } catch (_) {}
    menu.addEventListener('scroll', () => {
        try { localStorage.setItem('menu-scroll-position', menu.scrollLeft); } catch (_) {}
    }, { passive: true });
}

document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const hash = anchor.getAttribute('href');
    let target;
    try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch (_) { return; }
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    if (target.id === 'top') history.replaceState(null, '', location.pathname + location.search);
    else history.pushState(null, '', hash);
});

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const dark = document.body.classList.toggle('dark');
    try { localStorage.setItem('pref-theme', dark ? 'dark' : 'light'); } catch (_) {}
});
