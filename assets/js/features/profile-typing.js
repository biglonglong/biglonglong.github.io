const copy = document.querySelector('.profile-copy');

if (copy && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const targets = copy.querySelectorAll('h1, .profile-subtitle, .profile-note');
    const buttons = copy.querySelector('.buttons');
    if (buttons) buttons.style.visibility = 'hidden';
    const segmenter = typeof Intl.Segmenter === 'function'
        ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
        : null;
    const entries = Array.from(targets, element => {
        const height = element.getBoundingClientRect().height;
        element.style.minHeight = `${height}px`;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!node.nodeValue.trim()) continue;
            const text = node.nodeValue;
            nodes.push({ node, letters: segmenter
                ? Array.from(segmenter.segment(text), part => part.segment)
                : Array.from(text) });
            node.nodeValue = '';
        }
        return { element, nodes };
    });

    const pause = () => new Promise(resolve => setTimeout(resolve, 45));
    async function type() {
        for (const { element, nodes } of entries) {
            element.classList.add('is-typing');
            for (const { node, letters } of nodes) {
                for (const letter of letters) {
                    node.nodeValue += letter;
                    await pause();
                }
            }
            element.classList.remove('is-typing');
        }
        if (buttons) {
            buttons.style.visibility = '';
            buttons.classList.add('is-popping');
        }
    }
    type();
}
