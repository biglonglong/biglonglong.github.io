document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('rocket-back-top');
    if (!button) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let returning = false;
    let returnTimer;

    function updateVisibility() {
        if (window.scrollY <= 2) {
            returning = false;
            clearTimeout(returnTimer);
        }
        const visible = window.scrollY > 300 && !returning;
        button.classList.toggle('visible', visible);
        button.tabIndex = visible ? 0 : -1;
        button.setAttribute('aria-hidden', String(!visible));
    }

    button.addEventListener('click', () => {
        returning = true;
        if (!reducedMotion.matches) button.classList.add('launching');
        updateVisibility();
        setTimeout(() => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }), reducedMotion.matches ? 0 : 240);
        clearTimeout(returnTimer);
        returnTimer = setTimeout(() => {
            returning = false;
            updateVisibility();
        }, 1500);
    });
    button.addEventListener('animationend', event => {
        if (event.animationName !== 'rocket-flight') return;
        button.style.visibility = 'hidden';
        button.classList.remove('launching');
        setTimeout(() => { button.style.visibility = ''; }, 300);
    });
    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
});
