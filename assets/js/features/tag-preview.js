(function () {
    document.addEventListener('DOMContentLoaded', function () {
        if (!document.querySelector('.post-tags a[data-count]')) return;
        var bubble = document.createElement('div');
        bubble.id = 'tag-preview-bubble';
        bubble.innerHTML = '<span class="tag-bubble-name"></span><span class="tag-bubble-count"></span>';
        document.body.appendChild(bubble);

        var nameEl  = bubble.querySelector('.tag-bubble-name');
        var countEl = bubble.querySelector('.tag-bubble-count');
        var hideTimer;

        function showBubble(anchor) {
            clearTimeout(hideTimer);
            var tag   = anchor.dataset.tag;
            var count = anchor.dataset.count;
            if (!tag || count === undefined) return;
            nameEl.textContent  = '#' + tag;
            countEl.textContent = count + ' 篇文章';
            // 定位到链接正上方
            var rect = anchor.getBoundingClientRect();
            bubble.style.left = Math.max(8, Math.min(rect.left, document.documentElement.clientWidth - bubble.offsetWidth - 8)) + 'px';
            bubble.style.top = Math.max(8, rect.top - bubble.offsetHeight - 8) + 'px';
            // 先定位再展示（offsetHeight 需要已挂载）
            requestAnimationFrame(function () {
                bubble.style.top = Math.max(8, rect.top - bubble.offsetHeight - 8) + 'px';
                bubble.classList.add('visible');
            });
        }

        function hideBubble() {
            hideTimer = setTimeout(function () {
                bubble.classList.remove('visible');
            }, 80);
        }
        window.addEventListener('scroll', hideBubble, { passive: true });

        document.addEventListener('mouseover', function (e) {
            var a = e.target.closest('.post-tags a[data-count]');
            if (a) showBubble(a);
        });
        document.addEventListener('mouseout', function (e) {
            if (e.target.closest('.post-tags a[data-count]')) hideBubble();
        });
    });
})();
