document.addEventListener('DOMContentLoaded', () => {
    const archive = document.querySelector('.explore-archive');
    if (!archive) return;
    const selected = new URLSearchParams(location.search).get('tag') || '';
    const buttons = document.querySelectorAll('.explore-tags a[data-tag]');
    const known = [...buttons].some(button => button.dataset.tag === selected);
    const tag = known ? selected : '';
    for (const button of buttons) {
        if (button.dataset.tag === tag) button.setAttribute('aria-current', 'true');
    }
    for (const entry of archive.querySelectorAll('.archive-entry')) {
        entry.hidden = Boolean(tag) && !entry.dataset.tags.split('|').includes(tag);
    }
    for (const group of archive.querySelectorAll('.archive-month, .archive-year')) {
        group.hidden = !group.querySelector('.archive-entry:not([hidden])');
    }
});
