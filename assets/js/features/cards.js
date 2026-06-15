document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.post-entry');
    if (!cards.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(({ target, isIntersecting }) => {
                if (!isIntersecting) return;
                target.classList.remove('skeleton');
                observer.unobserve(target);
            });
        }, { rootMargin: '0px 0px 80px 0px' });

        cards.forEach((card) => {
            card.classList.add('skeleton');
            observer.observe(card);
        });
    }

    if (reducedMotion) return;
    cards.forEach((card) => {
        card.addEventListener('pointerdown', (event) => {
            if (event.button !== 0) return;
            const rect = card.getBoundingClientRect();
            const dot = document.createElement('span');
            dot.className = 'ripple-dot';
            dot.style.left = `${event.clientX - rect.left}px`;
            dot.style.top = `${event.clientY - rect.top}px`;
            dot.addEventListener('animationend', () => dot.remove(), { once: true });
            card.appendChild(dot);
        });
    });
});
