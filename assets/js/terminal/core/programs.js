export const PROGRAM_DIRECTORY = '/usr/bin';
export const isBrowserProgram = path => path.startsWith(`${PROGRAM_DIRECTORY}/`) && path.endsWith('.js');

export function programNames(fileSystem) {
    const directory = fileSystem.resolve(PROGRAM_DIRECTORY).node;
    return Object.entries(directory?.children || {}).flatMap(([name, node]) => {
        if (node.type !== 'executable') return [];
        return name.endsWith('.js') ? [name, name.slice(0, -3)] : [name];
    });
}

export function resolveProgram(fileSystem, shell, name) {
    const base = name.includes('/') ? shell.state.cwd : PROGRAM_DIRECTORY;
    const found = fileSystem.resolve(name, base, shell.home());
    // Extensionless names are aliases for the static browser modules in /usr/bin.
    return found.node || name.includes('/') ? found : fileSystem.resolve(`${name}.js`, base, shell.home());
}

export async function executeProgram(node, name, context = {}) {
    if (!node.module) throw new Error(`${name}: Cannot execute a non-JavaScript file`);
    const program = await import(node.module);
    if (typeof program.run !== 'function') throw new Error(`${name}: Missing run() export`);
    return String(await program.run(context) ?? '');
}
