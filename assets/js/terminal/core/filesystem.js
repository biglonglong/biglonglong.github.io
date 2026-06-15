import { isBrowserProgram } from './programs.js';

const directory = children => ({ type: 'directory', children });

export function normalizePath(input, cwd, userHome = cwd) {
    const path = input === '~' ? userHome : input.startsWith('~/') ? userHome + input.slice(1) : input;
    const parts = (path.startsWith('/') ? path : `${cwd}/${path}`).split('/');
    const resolved = [];
    for (const part of parts) {
        if (!part || part === '.') continue;
        if (part === '..') resolved.pop();
        else resolved.push(part);
    }
    return `/${resolved.join('/')}`;
}

export function createFileSystem(entries, users, baseUrl = '/home/terminal/', defaultUser = 'guest') {
    if (!users[defaultUser]) throw new Error(`Unknown default terminal user: ${defaultUser}`);
    const homePath = users[defaultUser].home;
    const root = directory({});
    const adminUser = Object.keys(users).find(name => users[name].uid === 0);
    if (!adminUser) throw new Error('Terminal requires an account with UID 0');
    const adminHome = users[adminUser].home;
    const homeOwners = Object.entries(users).sort((left, right) => right[1].home.length - left[1].home.length);
    for (const entry of [...entries].sort((left, right) => left.path.split('/').length - right.path.split('/').length)) {
        const path = `/${entry.path.replace(/^\/+|\/+$/g, '')}`;
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        let parent = root;
        for (const part of parts) {
            parent = parent.children[part];
            if (parent?.type !== 'directory') throw new Error(`Invalid terminal manifest: ${path}`);
        }
        if (!name || Object.hasOwn(parent.children, name)) throw new Error(`Duplicate terminal path: ${path}`);
        const owner = homeOwners.find(([, user]) => path === user.home || path.startsWith(`${user.home}/`))?.[0] || adminUser;
        const admin = path === adminHome || path.startsWith(`${adminHome}/`) || (path.startsWith('/etc/') && path !== '/etc/passwd');
        const privateHome = Object.entries(users).some(([user, account]) => user !== defaultUser && account.home === path);
        const url = `${baseUrl}${parts.concat(name).map(encodeURIComponent).join('/')}`;
        const type = entry.directory ? 'directory' : isBrowserProgram(path) ? 'executable'
            : name.endsWith('.url') ? 'link' : 'file';
        parent.children[name] = entry.directory ? { ...directory({}), owner, admin, private: privateHome }
            : { type, owner, admin, url, ...(type === 'executable' ? { module: url } : {}) };
    }
    for (const [name, account] of Object.entries(users)) {
        const parts = account.home.split('/').filter(Boolean);
        let node = root;
        for (const part of parts) node = node?.children?.[part];
        if (node?.type !== 'directory') throw new Error(`Missing home directory for ${name}: ${account.home}`);
    }

    function resolve(input, cwd = homePath, userHome = homePath) {
        const requested = normalizePath(input, cwd, userHome);
        let node = root;
        const names = [];
        for (const part of requested.split('/').filter(Boolean)) {
            if (node.type !== 'directory') return { path: requested, node: null };
            if (!Object.hasOwn(node.children, part)) return { path: requested, node: null };
            names.push(part);
            node = node.children[part];
        }
        return { path: `/${names.join('/')}`, node };
    }

    function complete(input, cwd, allowedTypes, userHome = homePath) {
        const slash = input.lastIndexOf('/');
        const base = slash < 0 ? '' : input.slice(0, slash + 1);
        const prefix = slash < 0 ? input : input.slice(slash + 1);
        const parent = resolve(base || '.', cwd, userHome).node;
        if (parent?.type !== 'directory') return [];
        return Object.entries(parent.children)
            .filter(([name, entry]) => name.startsWith(prefix)
                && (prefix.startsWith('.') || !name.startsWith('.'))
                && (!allowedTypes || allowedTypes.includes(entry.type)))
            .map(([name, entry]) => base + name + (entry.type === 'directory' ? '/' : ''));
    }

    function parentOf(path) {
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        const parent = resolve(`/${parts.join('/')}`).node;
        return { parent, name };
    }

    function put(path, node) {
        const { parent, name } = parentOf(path);
        if (parent?.type !== 'directory' || !name) throw new Error(`No such directory: ${path}`);
        parent.children[name] = node;
    }

    function remove(path) {
        const { parent, name } = parentOf(path);
        if (parent?.type !== 'directory' || !Object.hasOwn(parent.children, name)) throw new Error(`No such file: ${path}`);
        delete parent.children[name];
    }

    return { root, resolve, complete, put, remove, homePath, users, defaultUser, adminUser };
}
