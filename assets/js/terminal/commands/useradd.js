import { readFile } from './file-operations.js';

export function createUseradd({ fileSystem, overlay, shell }) {
    return {
        presentation: true,
        async run(_, { argv }) {
            if (!shell.state.isAdmin) throw new Error('useradd: Permission denied');
            if (argv.length !== 1 || !/^[a-z_][a-z0-9_-]*$/.test(argv[0])) {
                throw new Error('useradd: Expected one lowercase username (letters, digits, _ or -)');
            }
            const name = argv[0];
            if (Object.hasOwn(fileSystem.users, name)) throw new Error(`useradd: User exists: ${name}`);

            const passwdNode = fileSystem.resolve('/etc/passwd').node;
            if (passwdNode?.type !== 'file') throw new Error('useradd: Missing /etc/passwd');
            const homeParent = fileSystem.users[fileSystem.defaultUser].home.replace(/\/[^/]+$/, '') || '/';
            const parent = fileSystem.resolve(homeParent).node;
            if (parent?.type !== 'directory') throw new Error(`useradd: Missing home parent: ${homeParent}`);
            const home = `${homeParent === '/' ? '' : homeParent}/${name}`;
            if (fileSystem.resolve(home).node) throw new Error(`useradd: Home already exists: ${home}`);

            const uid = Math.max(999, ...Object.values(fileSystem.users).map(user => user.uid)) + 1;
            const account = { uid, gid: uid, home, shell: '/bin/sh' };
            const original = await readFile(passwdNode);
            const passwd = `${original.replace(/\s*$/, '\n')}${name}:x:${uid}:${uid}:${name}:${home}:${account.shell}\n`;
            const localFile = content => ({ type: 'file', source: 'local', owner: name, content });
            await overlay.putMany([
                { path: home, node: { type: 'directory', source: 'local', owner: name, private: true, children: {} } },
                { path: `${home}/summary.md`, node: localFile(`# ${name}\n\nWelcome to your browser terminal home. Run \`cat profile.json\` to view your profile.\n`) },
                { path: `${home}/profile.json`, node: localFile(`${JSON.stringify({ user: name, role: 'member', home }, null, 2)}\n`) },
                { path: `${home}/.bashrc`, node: localFile('# Commands here run when the terminal opens.\n') },
                { path: '/etc/passwd', node: { type: 'file', source: 'local', owner: fileSystem.adminUser, public: true, content: passwd } },
            ]);
            fileSystem.users[name] = account;
            return null;
        },
    };
}
