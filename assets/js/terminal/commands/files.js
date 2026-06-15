import { readFile } from './file-operations.js';

const error = message => { throw new Error(message); };

export function createFileCommands({ fileSystem, overlay, shell, pathMatches, settings }) {
    const { state } = shell;
    const resolve = path => shell.resolve(path);
    function writable(target, command) {
        const { node, path } = resolve(target);
        const parentPath = path.slice(0, path.lastIndexOf('/')) || '/';
        const parent = fileSystem.resolve(parentPath).node;
        if (parent?.type !== 'directory') throw new Error(`${command}: No such directory: ${parentPath}`);
        if (!shell.canAccess(parentPath) || !shell.canWrite(path)
            || (node && (!shell.canAccess(path) || (node.owner && node.owner !== state.user && !state.isAdmin)))) {
            throw new Error(`${command}: Permission denied: ${target}`);
        }
        return { node, path };
    }

    async function writeText(target, content, append = false) {
        const { node, path } = writable(target, append ? 'append' : 'write');
        if (node?.type === 'directory') throw new Error(`write: Is a directory: ${target}`);
        const previous = append && node ? await readFile(node) : '';
        await overlay.put(path, { type: path.endsWith('.url') ? 'link' : 'file', source: 'local', owner: node?.owner || state.user,
            admin: Boolean(node?.admin), private: Boolean(node?.private), content: previous + content });
    }

    async function textInput(command, target, context) {
        if (!target) {
            if (context.stdin !== undefined) return context.stdin;
            throw new Error(`${command}: Missing file or piped input`);
        }
        const { node, path } = resolve(target);
        if (!node || !['file', 'link'].includes(node.type)) throw new Error(`${command}: Not a file: ${target}`);
        if (!shell.canAccess(path)) throw new Error(`${command}: Permission denied: ${target}`);
        return readFile(node);
    }

    const commands = {
        mkdir: {
            complete: partial => pathMatches(partial, ['directory']),
            async run(args, { argv }) {
                const parents = argv[0] === '-p';
                const targets = parents ? argv.slice(1) : argv;
                if (!targets.length) return error('mkdir: Missing directory');
                for (const target of targets) {
                    const absolute = resolve(target).path;
                    const parts = absolute.split('/').filter(Boolean);
                    const paths = parents ? parts.map((_, i) => '/' + parts.slice(0, i + 1).join('/')) : [absolute];
                    for (const path of paths) {
                        const existing = resolve(path).node;
                        if (parents && existing?.type === 'directory' && shell.canAccess(path)) continue;
                        const { node } = writable(path, 'mkdir');
                        if (node) return error(`mkdir: File exists: ${path}`);
                        await overlay.put(path, { type: 'directory', source: 'local', owner: state.user, children: {} });
                    }
                }
                return null;
            },
        },
        touch: {
            complete: partial => pathMatches(partial),
            async run(args, { argv }) {
                if (!argv.length) return error('touch: Missing file');
                for (const target of argv) {
                    const { node } = writable(target, 'touch');
                    if (!node) await writeText(target, '');
                }
                return null;
            },
        },
        rm: {
            complete: partial => pathMatches(partial),
            async run(args, context = {}) {
                const words = context.argv || args.trim().split(/\s+/);
                const recursive = words.includes('-r');
                const paths = words.filter(word => word && word !== '-r');
                if (paths.length !== 1) return error('rm: Expected one path');
                const target = paths[0];
                const { node, path } = writable(target, 'rm');
                if (!node) return error(`rm: No such file: ${target}`);
                if (path === '/' || Object.values(fileSystem.users).some(user => user.home === path)
                    || state.cwd === path || state.cwd.startsWith(`${path}/`)) return error('rm: Cannot remove a home or working directory');
                if (node.type === 'directory' && !recursive) return error(`rm: Is a directory: ${target}; use -r`);
                await overlay.remove(path);
                return null;
            },
        },
        rmdir: {
            complete: partial => pathMatches(partial, ['directory']),
            async run(args, { argv }) {
                if (!argv.length) return error('rmdir: Missing directory');
                for (const target of argv) {
                    const { node, path } = writable(target, 'rmdir');
                    if (node?.type !== 'directory') return error(`rmdir: Not a directory: ${target}`);
                    if (Object.keys(node.children).length) return error(`rmdir: Directory not empty: ${target}`);
                    await commands.rm.run('', { argv: ['-r', path] });
                }
            },
        },
        resetfs: {
            presentation: true,
            async run(args) {
                if (args.trim()) return error('resetfs: No arguments expected');
                await overlay.reset();
                settings.clear();
                window.location.reload();
                return null;
            },
        },
        cp: {
            complete: partial => pathMatches(partial),
            async run(args, context = {}) {
                const [from, to, extra] = context.argv || args.trim().split(/\s+/);
                if (!from || !to || extra) return error('cp: Expected source and destination');
                const source = resolve(from);
                if (!source.node || !['file', 'link'].includes(source.node.type)) return error(`cp: Not a text file: ${from}`);
                if (!shell.canAccess(source.path)) return error(`cp: Permission denied: ${from}`);
                const destination = writable(resolve(to).node?.type === 'directory' ? `${to}/${source.path.split('/').pop()}` : to, 'cp');
                if (destination.node?.type === 'directory') return error(`cp: Is a directory: ${to}`);
                if (source.path === destination.path) return error('cp: Source and destination are the same file');
                await writeText(destination.path, await readFile(source.node));
                return null;
            },
        },
        mv: {
            complete: partial => pathMatches(partial),
            async run(args, context = {}) {
                const [from, to, extra] = context.argv || args.trim().split(/\s+/);
                if (!from || !to || extra) return error('mv: Expected source and destination');
                const source = writable(from, 'mv');
                if (!source.node || !['file', 'link'].includes(source.node.type)) return error(`mv: Not a text file: ${from}`);
                const destination = writable(resolve(to).node?.type === 'directory' ? `${to}/${source.path.split('/').pop()}` : to, 'mv');
                if (destination.node?.type === 'directory') return error(`mv: Is a directory: ${to}`);
                if (source.path === destination.path) return null;
                await writeText(destination.path, await readFile(source.node));
                await overlay.remove(source.path);
                return null;
            },
        },
    };
    return { commands, writeText, textInput, writable };
}
