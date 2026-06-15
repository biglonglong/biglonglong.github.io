document.addEventListener('DOMContentLoaded', () => {
/* ---- blockquote 类型徽章（识别 [!TIP] [!NOTE] [!WARN] 首行） ---- */
document.querySelectorAll('.post-content blockquote').forEach(function (bq) {
    var first = bq.querySelector('p:first-child');
    if (!first) return;
    var txt = first.textContent.trim();
    var map = {
        '[!TIP]':  { cls: 'bq-tip',  badgeCls: 'bq-badge-tip',  icon: '💡', label: 'Tip'  },
        '[!NOTE]': { cls: 'bq-note', badgeCls: 'bq-badge-note', icon: '📌', label: 'Note' },
        '[!WARN]': { cls: 'bq-warn', badgeCls: 'bq-badge-warn', icon: '⚠️', label: 'Warn' },
        '[!WARNING]': { cls: 'bq-warn', badgeCls: 'bq-badge-warn', icon: '⚠️', label: 'Warning' },
    };
    var match = Object.keys(map).find(function (k) { return txt.startsWith(k); });
    if (!match) return;
    var cfg = map[match];
    bq.classList.add(cfg.cls);
    var badge = document.createElement('p');
    badge.className = 'bq-badge ' + cfg.badgeCls;
    badge.innerHTML = cfg.icon + ' ' + cfg.label;
    bq.insertBefore(badge, first);
    // 去掉原来的 [!XXX] 标记文字
    const walker = document.createTreeWalker(first, NodeFilter.SHOW_TEXT);
    let remaining = match;
    while (remaining && walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent.trimStart();
        const length = Math.min(text.length, remaining.length);
        if (text.slice(0, length) !== remaining.slice(0, length)) break;
        node.textContent = text.slice(length);
        remaining = remaining.slice(length);
    }
    if (!first.textContent) first.remove();
});


});
