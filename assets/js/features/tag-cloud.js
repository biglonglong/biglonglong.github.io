import { onIdle } from './utils.js';
document.addEventListener('DOMContentLoaded', () => {
/* ---- 标签云字体缩放（空闲时执行，非首屏关键路径） ---- */
onIdle(function() {
    var tagItems = document.querySelectorAll('.explore-tag-list li[data-count]');
    if (tagItems.length) {
        var counts = Array.from(tagItems).map(function(li) { return +li.dataset.count; });
        var min = Math.min.apply(null, counts);
        var max = Math.max.apply(null, counts);
        tagItems.forEach(function(li) {
            var c = +li.dataset.count;
            var ratio = max > min ? (c - min) / (max - min) : 0.5;
            // 字体范围 13px ~ 22px
            var fs = 13 + Math.round(ratio * 9);
            var a = li.querySelector('a');
            if (a) a.style.fontSize = fs + 'px';
        });
    }
});


});
