export function createTerminalConfig(container) {
    const config = { theme: 'dark' };

    function applyTheme(theme) {
        config.theme = theme;
        container.classList.toggle('terminal-light', theme === 'light');
    }

    function setTheme(theme) {
        if (!['dark', 'light'].includes(theme)) return false;
        applyTheme(theme);
        try { localStorage.setItem('terminalTheme', theme); } catch (_) { /* storage may be disabled */ }
        return true;
    }

    let savedTheme = 'dark';
    try { savedTheme = localStorage.getItem('terminalTheme') || 'dark'; } catch (_) { /* use default */ }
    applyTheme(['dark', 'light'].includes(savedTheme) ? savedTheme : 'dark');
    return { config, setTheme };
}

export function createTerminalSettings(storage) {
    const prefix = 'terminal:set:';
    const current = () => storage ?? globalThis.localStorage;

    function list() {
        const values = Object.create(null);
        try {
            const store = current();
            for (let i = 0; i < store.length; i++) {
                const key = store.key(i);
                if (key?.startsWith(prefix)) values[key.slice(prefix.length)] = store.getItem(key);
            }
        } catch { /* Storage may be unavailable. */ }
        return values;
    }

    function get(name) {
        try { return current().getItem(prefix + name); }
        catch { return null; }
    }

    function put(name, value) {
        try { current().setItem(prefix + name, value); }
        catch { throw new Error('set: Local storage is unavailable'); }
    }

    function remove(name) {
        try { current().removeItem(prefix + name); }
        catch { throw new Error('set: Local storage is unavailable'); }
    }

    function clear() {
        try {
            const store = current();
            for (let i = store.length - 1; i >= 0; i--) {
                const key = store.key(i);
                if (key?.startsWith(prefix)) store.removeItem(key);
            }
            store.removeItem('terminalTheme');
        } catch { /* File reset still works if localStorage is blocked. */ }
    }

    return { list, get, put, remove, clear };
}
