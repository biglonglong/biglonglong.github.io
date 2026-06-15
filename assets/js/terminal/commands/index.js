import { createFileCommands } from './files.js';
import { createUseradd } from './useradd.js';
import { executeProgram } from '../core/programs.js';
import { result } from '../core/result.js';
import { createTextCommands } from './text.js';
import { escapeHtml } from '../ui/view.js';
import { helpTopics, renderHelp } from './help.js';
import { followLink, readFile, renderFile } from './file-operations.js';

const error = message => { throw new Error(message); };

export function createCommands({ fileSystem, overlay, shell, view, history, credentials = {}, settings, programRuntime }) {
    const { state } = shell;
    const pathMatches = (partial, types) => fileSystem.complete(partial, state.cwd, types, shell.home())
        .filter(candidate => shell.canAccess(shell.resolve(candidate).path));
    const resolve = path => shell.resolve(path);
    const refreshUser = () => { view.setUser(state.user); view.setPrompt(shell.promptPath()); };

    const { commands: fileCommands, writeText, textInput, writable } = createFileCommands({ fileSystem, overlay, shell, pathMatches, settings });

    const commands = {
        vim: {
            presentation: true,
            complete: partial => pathMatches(partial),
            async run(args, { argv, signal }) {
                if (argv.length !== 1) return error('vim: Use vim <file>');
                const { node, path } = writable(argv[0], 'vim');
                if (node && !['file', 'link'].includes(node.type)) return error(`vim: Not a text file: ${argv[0]}`);
                const content = node ? await readFile(node) : '';
                if (signal?.aborted) return null;
                await view.editFile({ path, content, save: text => writeText(path, text), signal });
                return null;
            },
        },
        ls: {
            complete: partial => partial.startsWith('-') ? ['-a', '-l', '-la'] : pathMatches(partial),
            run(args, context = {}) {
                const tokens = context.argv || args.trim().split(/\s+/).filter(Boolean);
                const options = tokens.filter(token => token.startsWith('-') && token !== '-');
                if (options.some(option => !/^-[al]+$/.test(option))) return error('ls: Unknown option');
                const paths = tokens.filter(token => !token.startsWith('-'));
                if (paths.length > 1) return error('ls: Too many paths');
                const target = paths[0] || '.';
                const { node, path } = resolve(target);
                if (!node) return error(`ls: No such file or directory: ${target}`);
                if (!shell.canAccess(path)) return error(`ls: Permission denied: ${target}`);
                if (node.type !== 'directory') return result(target + '\n');
                const showHidden = options.some(option => option.includes('a'));
                const long = options.some(option => option.includes('l'));
                const entries = Object.entries(node.children)
                    .filter(([name]) => showHidden || !name.startsWith('.'))
                    .sort(([left], [right]) => left.localeCompare(right));
                if (long) return result(entries.map(([name, entry]) => {
                    const permissions = entry.type === 'directory'
                        ? (entry.admin || entry.private ? 'drwx------' : entry.source === 'local' ? 'drwxr-xr-x' : 'dr-xr-xr-x')
                        : entry.type === 'executable' ? '-r-xr-xr-x'
                            : entry.admin || entry.private || entry.source === 'local' ? '-rw-------' : '-r--r--r--';
                    return `${permissions}  ${entry.owner || (entry.admin ? fileSystem.adminUser : fileSystem.defaultUser)}  ${name}${entry.type === 'directory' ? '/' : ''}`;
                }).join('\n') + (entries.length ? '\n' : ''));
                return result(entries.map(([name]) => name).join('\n') + (entries.length ? '\n' : ''));
            },
        },
        file: {
            complete: partial => pathMatches(partial),
            run(args) {
                const target = args.trim();
                if (!target) return error('file: Missing path');
                const { node, path } = resolve(target);
                if (!node) return error(`file: No such file or directory: ${target}`);
                if (!shell.canAccess(path)) return error(`file: Permission denied: ${target}`);
                const kind = node.type === 'directory' ? 'directory'
                    : node.type === 'link' ? 'URL shortcut'
                        : node.type === 'executable' ? (node.download ? 'native executable' : 'browser executable')
                            : path.endsWith('.json') ? 'JSON document' : path.endsWith('.md') ? 'Markdown document' : 'text file';
                return result(`${path}: ${kind}\n`);
            },
        },
        cd: {
            complete: partial => [...pathMatches(partial, ['directory']), ...(partial === '-' ? ['-'] : [])],
            run(args) {
                const target = args.trim();
                const previous = state.previousCwd;
                const resolved = resolve(target === '-' ? previous : target || '~');
                if (resolved.node && !shell.canAccess(resolved.path)) return error(`cd: Permission denied: ${target}`);
                if (!shell.changeDirectory(target)) return error(`cd: No such directory: ${target}`);
                refreshUser();
                return result(target === '-' ? previous + '\n' : '');
            },
        },
        pwd: { run: () => result(state.cwd + '\n') },
        tree: {
            complete: partial => partial.startsWith('-') ? ['-a'] : pathMatches(partial, ['directory']),
            run(args, context = {}) {
                const tokens = context.argv || args.trim().split(/\s+/).filter(Boolean);
                if (tokens.some(token => token.startsWith('-') && token !== '-a')) return error('tree: Unknown option');
                const target = tokens.find(token => token !== '-a') || '.';
                const { node, path } = resolve(target);
                if (node?.type !== 'directory') return error(`tree: No such directory: ${target}`);
                if (!shell.canAccess(path)) return error(`tree: Permission denied: ${target}`);
                const showHidden = tokens.includes('-a');
                const lines = [path];
                function walk(directory, prefix = '') {
                    const entries = Object.entries(directory.children).filter(([name]) => showHidden || !name.startsWith('.'));
                    entries.forEach(([name, child], index) => {
                        const last = index === entries.length - 1;
                        lines.push(`${prefix}${last ? '└── ' : '├── '}${name}${child.type === 'directory' ? '/' : ''}`);
                        if (child.type === 'directory' && (state.isAdmin || (!child.admin && (!child.private || child.owner === state.user)))) {
                            walk(child, prefix + (last ? '    ' : '│   '));
                        }
                    });
                }
                walk(node);
                return result(lines.join('\n') + '\n');
            },
        },
        open: {
            presentation: true,
            complete: partial => pathMatches(partial),
            async run(args) {
                const target = args.trim() || '.';
                let { node, path } = resolve(target);
                if (node && !shell.canAccess(path)) return error(`open: Permission denied: ${target}`);
                if (node?.type === 'directory') node = Object.values(node.children).find(child => child.type === 'link');
                if (!node) return error(`open: No such file or shortcut: ${target}`);
                if (node.admin && !state.isAdmin) return error(`open: Permission denied: ${target}`);
                if (node.type === 'link') {
                    await followLink(node);
                    return `<span class='output-end'>Opening ${escapeHtml(target)}...</span>`;
                }
                if (node.type === 'file') return renderFile(target, await readFile(node));
                if (node.type === 'executable') return escapeHtml(await executeProgram(node, target.split('/').pop(), { runtime: programRuntime }));
                return error(`open: Is a directory: ${target}`);
            },
        },
        whoami: {
            run: () => result(state.user + '\n'),
        },
        id: {
            complete: partial => Object.keys(fileSystem.users).filter(user => user.startsWith(partial)),
            run(args) {
                const user = args.trim() || state.user;
                const account = fileSystem.users[user];
                return account ? result(`uid=${account.uid}(${user}) gid=${account.gid}(${user})\n`)
                    : error(`id: ${user}: no such user`);
            },
        },
        user: {
            run: () => result(state.user + '\n'),
        },
        history: {
            presentation: true,
            complete: partial => '-c'.startsWith(partial) ? ['-c'] : [],
            run(args) {
                if (args.trim() === '-c') {
                    history.length = 0;
                    return "<span class='st-success'>History cleared</span>";
                }
                if (args.trim()) return error(`history: Unknown option: ${args}`);
                return history.length ? history.map((command, index) => `<div><span class='list-number'>${String(index + 1).padStart(3)}</span><span class='list-value'>${escapeHtml(command)}</span></div>`).join('')
                    : "<span class='st-warning'>No commands in history</span>";
            },
        },
        bash: { complete: partial => pathMatches(partial, ['file']) },
        export: {
            run(args, { argv }) {
                if (!argv.length) return result(Object.entries(state.env).map(([key, value]) => `export ${key}=${value}`).join('\n') + (Object.keys(state.env).length ? '\n' : ''));
                for (const assignment of argv) {
                    const match = /^([A-Za-z_][A-Za-z0-9_]*)(?:=(.*))?$/.exec(assignment);
                    if (!match) return error(`export: Invalid assignment: ${assignment}`);
                    state.env[match[1]] = match[2] ?? state.env[match[1]] ?? '';
                    state.exported[match[1]] = state.env[match[1]];
                }
                return result();
            },
        },
        set: {
            run(args, { argv }) {
                if (!argv.length) {
                    const entries = Object.entries(settings.list()).sort(([a], [b]) => a.localeCompare(b));
                    return result(entries.map(([key, value]) => `${key}=${value}`).join('\n') + (entries.length ? '\n' : ''));
                }
                if (argv.length !== 1) return error('set: Use set NAME=value or set [NAME]');
                const assignment = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(argv[0]);
                if (assignment) {
                    settings.put(assignment[1], assignment[2]);
                    if (!Object.hasOwn(state.exported, assignment[1])) state.env[assignment[1]] = assignment[2];
                    return result();
                }
                if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(argv[0])) return error(`set: Invalid name: ${argv[0]}`);
                const value = settings.get(argv[0]);
                if (value === null) return error(`set: ${argv[0]} not found`);
                return result(`${argv[0]}=${value}\n`);
            },
        },
        clear: { presentation: true, run: () => { view.clear(); return null; } },
        sudo: {
            presentation: true,
            run(args) {
                if (state.isAdmin) return "<span class='st-warning'>Already root</span>";
                if (!args) return error('sudo: Missing demo password; run help sudo for the hint');
                if (args !== credentials.password) return error('sudo: Incorrect password');
                shell.switchUser(fileSystem.adminUser);
                refreshUser();
                return "<span class='st-success'>Switched to root (simulated)</span>";
            },
        },
        su: {
            presentation: true,
            complete: partial => Object.keys(fileSystem.users).filter(user => user.startsWith(partial)),
            run(args) {
                const user = args.trim();
                if (!Object.hasOwn(fileSystem.users, user)) return error(`su: Unknown user: ${user}`);
                if (!state.isAdmin && user !== fileSystem.defaultUser) return error('su: Permission denied; enter simulated root with sudo first');
                if (user === state.user) return error(`su: Already ${user}`);
                shell.switchUser(user);
                refreshUser();
                return null;
            },
        },
        exit: {
            presentation: true,
            run() {
                if (!shell.exitUser()) return "<span class='st-warning'>Already in the initial session</span>";
                refreshUser();
                return null;
            },
        },
        help: {
            presentation: true,
            complete: partial => helpTopics()
                .filter(name => name.startsWith(partial.toLowerCase())),
            run: args => renderHelp(args.trim(), credentials.password),
        },
    };

    const textCommands = createTextCommands(textInput);
    Object.assign(commands, fileCommands, textCommands, { useradd: createUseradd({ fileSystem, overlay, shell }) });
    for (const command of Object.values(textCommands)) command.complete = partial => pathMatches(partial, ['file', 'link']);
    return { commands, writeText, textInput };
}
