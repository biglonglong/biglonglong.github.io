export function createShell(fileSystem) {
    const defaultHome = fileSystem.users[fileSystem.defaultUser].home;
    const state = { user: fileSystem.defaultUser, cwd: defaultHome, previousCwd: defaultHome,
        env: Object.create(null), exported: Object.create(null),
        get isAdmin() { return fileSystem.users[this.user].uid === 0; } };
    const sessions = [];

    function home() { return fileSystem.users[state.user].home; }

    function resolve(path) { return fileSystem.resolve(path, state.cwd, home()); }

    function canAccess(path) {
        if (state.isAdmin) return true;
        const parts = path.split('/').filter(Boolean);
        for (let index = 1; index <= parts.length; index++) {
            const node = fileSystem.resolve(`/${parts.slice(0, index).join('/')}`).node;
            if (node?.admin || (node?.private && node.owner !== state.user)
                || (node?.source === 'local' && node.type !== 'directory' && !node.public && node.owner !== state.user)) return false;
        }
        return true;
    }

    function canWrite(path) {
        if (state.isAdmin) return true;
        return path === home() || path.startsWith(`${home()}/`);
    }

    function promptPath() {
        return state.cwd === home() ? '~'
            : state.cwd.startsWith(`${home()}/`) ? `~${state.cwd.slice(home().length)}`
            : state.cwd;
    }

    function changeDirectory(input) {
        const destination = input === '-' ? state.previousCwd : (input || '~');
        const resolved = resolve(destination);
        if (resolved.node?.type !== 'directory' || !canAccess(resolved.path)) return false;
        state.previousCwd = state.cwd;
        state.cwd = resolved.path;
        return true;
    }

    function switchUser(user) {
        if (!Object.hasOwn(fileSystem.users, user)) return false;
        sessions.push({ user: state.user, cwd: state.cwd, previousCwd: state.previousCwd });
        state.user = user;
        state.cwd = fileSystem.users[user].home;
        state.previousCwd = state.cwd;
        return true;
    }

    function exitUser() {
        const previous = sessions.pop();
        if (!previous) return false;
        Object.assign(state, previous);
        return true;
    }

    return { state, home, resolve, canAccess, canWrite, promptPath, changeDirectory, switchUser, exitUser };
}
