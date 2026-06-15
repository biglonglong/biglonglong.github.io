export function editTerminalFile(terminalWindow, { path, content, save, signal }) {
    return new Promise(resolve => {
        const editor = document.createElement('div');
        editor.className = 'terminal-editor';
        const textarea = document.createElement('textarea');
        textarea.className = 'terminal-editor-text';
        textarea.value = content;
        textarea.readOnly = true;
        textarea.spellcheck = false;
        textarea.setAttribute('aria-label', `Edit ${path}`);
        const status = document.createElement('div');
        status.className = 'terminal-editor-status';
        const command = document.createElement('input');
        command.className = 'terminal-editor-command';
        command.setAttribute('aria-label', 'Editor command');
        command.hidden = true;
        editor.append(textarea, status, command);
        terminalWindow.appendChild(editor);
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
        let saved = content;
        let mode = 'NORMAL';
        let closed = false;
        const updateStatus = message => { status.textContent = message || `${path}  -- ${mode} --  ${textarea.value !== saved ? '[modified]' : ''}`; };
        const close = () => {
            if (closed) return;
            closed = true;
            signal?.removeEventListener('abort', close);
            editor.remove();
            resolve();
        };
        signal?.addEventListener('abort', close, { once: true });
        if (signal?.aborted) { close(); return; }
        textarea.addEventListener('input', () => updateStatus());
        textarea.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                event.preventDefault();
                mode = 'NORMAL';
                textarea.readOnly = true;
                updateStatus();
            } else if (mode === 'NORMAL' && event.key === 'i') {
                event.preventDefault();
                mode = 'INSERT';
                textarea.readOnly = false;
                updateStatus();
            } else if (mode === 'NORMAL' && event.key === ':') {
                event.preventDefault();
                command.hidden = false;
                command.value = ':';
                command.focus();
            }
        });
        command.addEventListener('keydown', async event => {
            if (event.key === 'Escape') {
                command.hidden = true;
                textarea.focus();
                return;
            }
            if (event.key !== 'Enter') return;
            event.preventDefault();
            const action = command.value.trim();
            command.hidden = true;
            textarea.focus();
            if (action === ':q!' || (action === ':q' && textarea.value === saved)) { close(); return; }
            if (action === ':q') { updateStatus('No write since last change (use :q! to discard)'); return; }
            if (action !== ':w' && action !== ':wq') { updateStatus(`Unknown editor command: ${action}`); return; }
            try {
                await save(textarea.value);
                if (closed) return;
                saved = textarea.value;
                if (action === ':wq') close();
                else updateStatus(`${path} written`);
            } catch (error) { if (!closed) updateStatus(error.message); }
        });
        updateStatus();
        textarea.focus();
    });
}
