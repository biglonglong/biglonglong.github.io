export function parseUsers(passwd) {
    const users = {};
    for (const line of passwd.split(/\r?\n/)) {
        if (!line || line.startsWith('#')) continue;
        const [name, , uid, gid, , home, shell] = line.split(':');
        if (!name || !home || !Number.isInteger(Number(uid))) continue;
        users[name] = { uid: Number(uid), gid: Number(gid), home, shell };
    }
    if (!Object.values(users).some(user => user.uid === 0)) throw new Error('Terminal requires a UID 0 account in /etc/passwd');
    return users;
}

export function includeUserHomes(entries, users) {
    const paths = new Set(entries.map(entry => entry.path.replace(/^\/+|\/+$/g, '')));
    const result = [...entries];
    for (const account of Object.values(users)) {
        const parts = account.home.split('/').filter(Boolean);
        for (let index = 1; index <= parts.length; index++) {
            const path = parts.slice(0, index).join('/');
            if (!paths.has(path)) {
                result.push({ path, directory: true });
                paths.add(path);
            }
        }
    }
    return result;
}
