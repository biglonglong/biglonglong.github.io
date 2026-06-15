document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.post-content .highlight').forEach(highlight => {
        const pre = highlight.querySelector('pre');
        const code = pre?.querySelector('code');
        if (!code || code.scrollHeight <= 260) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrap collapsed';
        highlight.before(wrapper);
        wrapper.append(highlight);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'code-collapse-btn';
        button.textContent = 'Expand';
        button.setAttribute('aria-expanded', 'false');
        wrapper.append(button);

        button.addEventListener('click', () => {
            const collapsed = wrapper.classList.toggle('collapsed');
            button.textContent = collapsed ? 'Expand' : 'Collapse';
            button.setAttribute('aria-expanded', String(!collapsed));
        });
    });
});
