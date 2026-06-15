document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.post-content img')) return;
        /* ---- 图片 Lightbox（支持键盘左右翻图） ---- */
        var overlay = document.createElement('div');
        overlay.id = 'lightbox-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', '图片预览');
        var lbImg = document.createElement('img');
        lbImg.id = 'lightbox-img';
        lbImg.alt = 'preview';
        var closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', '关闭图片预览');
        closeBtn.id = 'lightbox-close';
        closeBtn.innerHTML = '&times;';
        // 翻图按钮
        var prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.setAttribute('aria-label', '上一张图片');
        prevBtn.id = 'lightbox-prev';
        prevBtn.innerHTML = '&#10094;'; // ❮
        var nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.setAttribute('aria-label', '下一张图片');
        nextBtn.id = 'lightbox-next';
        nextBtn.innerHTML = '&#10095;'; // ❯
        overlay.appendChild(prevBtn);
        overlay.appendChild(lbImg);
        overlay.appendChild(nextBtn);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);

        // 收集当前页所有可展示图片
        var lbImgs = Array.from(document.querySelectorAll('.post-content img')).filter(img => !img.closest('a, .link'));
        var lbCurrentIdx = 0;
        var previousFocus;
        var previousOverflow;

        function updateNavBtns() {
            prevBtn.classList.toggle('hidden', lbCurrentIdx <= 0);
            nextBtn.classList.toggle('hidden', lbCurrentIdx >= lbImgs.length - 1);
            prevBtn.disabled = lbCurrentIdx <= 0;
            nextBtn.disabled = lbCurrentIdx >= lbImgs.length - 1;
        }

        function openLightbox(idx, slideDir) {
            lbCurrentIdx = idx;
            var img = lbImgs[idx];
            if (!img) return;
            lbImg.classList.remove('slide-left', 'slide-right');
            void lbImg.offsetWidth; // reflow
            if (slideDir) lbImg.classList.add(slideDir);
            lbImg.src = img.currentSrc || img.src;
            lbImg.alt = img.alt || '';
            if (!overlay.classList.contains('open')) {
                previousFocus = document.activeElement;
                previousOverflow = document.body.style.overflow;
            }
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
            updateNavBtns();
            closeBtn.focus();
        }
        function closeLightbox() {
            overlay.classList.remove('open');
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus({ preventScroll: true });
        }

        lbImgs.forEach(function (img, idx) {
            img.tabIndex = 0;
            img.setAttribute('role', 'button');
            img.setAttribute('aria-label', (img.alt || '图片') + '：放大预览');
            img.addEventListener('click', function () { openLightbox(idx, null); });
            img.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(idx, null); }
            });
        });

        prevBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (lbCurrentIdx > 0) openLightbox(lbCurrentIdx - 1, 'slide-right');
        });
        nextBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (lbCurrentIdx < lbImgs.length - 1) openLightbox(lbCurrentIdx + 1, 'slide-left');
        });
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target === closeBtn) closeLightbox();
        });
        document.addEventListener('keydown', function (e) {
            if (!overlay.classList.contains('open')) return;
            if (e.key === 'Tab') {
                e.preventDefault();
                const buttons = [prevBtn, nextBtn, closeBtn].filter(button => !button.disabled);
                const index = buttons.indexOf(document.activeElement);
                buttons[(index + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
            }
            if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
            else if (e.key === 'ArrowLeft'  && lbCurrentIdx > 0) { openLightbox(lbCurrentIdx - 1, 'slide-right'); }
            else if (e.key === 'ArrowRight' && lbCurrentIdx < lbImgs.length - 1) { openLightbox(lbCurrentIdx + 1, 'slide-left'); }
        });


});
