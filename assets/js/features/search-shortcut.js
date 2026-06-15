document.addEventListener('DOMContentLoaded', () => {
/* ---- 搜索键盘快捷键（/ 键或 Ctrl/Cmd+K 聚焦） ---- */
var searchInput = document.querySelector('#searchbox input');
if (searchInput) {
    // 根据系统平台显示对应快捷键（Mac 用 ⌘，其他用 Ctrl）
    var isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
    var modKey = isMac ? '⌘' : 'Ctrl';
    var hint = document.createElement('span');
    hint.className = 'search-shortcut';
    hint.innerHTML = '<kbd>' + modKey + '</kbd><kbd>K</kbd>';
    searchInput.parentNode.style.position = 'relative';
    searchInput.parentNode.appendChild(hint);
    if (document.activeElement === searchInput) hint.style.opacity = '0';
    // 聚焦时隐藏提示，失焦时显示
    searchInput.addEventListener('focus', function () { hint.style.opacity = '0'; hint.style.pointerEvents = 'none'; });
    searchInput.addEventListener('blur', function () { hint.style.opacity = ''; hint.style.pointerEvents = ''; });
}
document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        if (searchInput) { e.preventDefault(); searchInput.focus(); }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        if (searchInput) { e.preventDefault(); searchInput.focus(); }
    }
});


});
