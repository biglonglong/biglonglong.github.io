export function run({ argv = [], stdin = '', runtime } = {}) {
    const name = argv[0] || stdin.trim();
    if (!name) throw new Error('which: Missing command');
    if (runtime.builtins().includes(name)) return `shell builtin: ${name}\n`;
    const { node, path } = runtime.resolveProgram(name);
    if (node?.type === 'executable') return `${path}\n`;
    throw new Error(`which: ${name} not found`);
}

export function complete({ partial, commands, programs }) {
    return [...commands, ...programs].filter(name => name.startsWith(partial));
}
