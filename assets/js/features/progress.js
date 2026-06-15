import { frameThrottle } from './utils.js';

(function () {
    /* ---- 阅读进度条 ---- */
    document.addEventListener('DOMContentLoaded', function () {
        // 仅在文章页展示（有 .post-content）
        const content = document.querySelector('.post-content');
        if (!content) return;

        const bar = document.createElement('div');
        bar.id = 'reading-progress';
        document.body.appendChild(bar);

        function updateProgress() {
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docH > 0 ? Math.max(0, Math.min(100, (window.scrollY / docH) * 100)) : 0;
            bar.style.width = pct + '%';
            bar.classList.toggle('visible', pct > 0 && pct < 100);
        }

        const schedule = frameThrottle(updateProgress);
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        new ResizeObserver(schedule).observe(document.body);
        updateProgress();
    });

})();
