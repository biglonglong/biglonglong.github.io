import { frameThrottle } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.section-latest').forEach((nav) => {
        const links = Array.from(nav.querySelectorAll('a'));
        const gap = parseFloat(getComputedStyle(nav).columnGap) || 0;

        function fitLinks() {
            links.forEach((link) => { link.hidden = false; });
            const widths = links.map((link) => link.getBoundingClientRect().width);
            const available = nav.clientWidth;
            let used = 0;
            let full = false;

            links.forEach((link, index) => {
                if (full || (index > 0 && used + gap + widths[index] > available)) {
                    link.hidden = true;
                    full = true;
                } else {
                    used += (index > 0 ? gap : 0) + widths[index];
                }
            });
        }

        const schedule = frameThrottle(fitLinks);
        if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(nav);
        else window.addEventListener('resize', schedule, { passive: true });
        document.fonts?.ready.then(schedule);
        fitLinks();
    });
});
