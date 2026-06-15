export function run({ argv = [], runtime } = {}) {
    const value = argv[0]?.toLowerCase();
    if (argv.length !== 1 || !runtime.setTheme(value)) {
        throw new Error('theme: Use theme dark or theme light');
    }
    return `Theme set to ${value}\n`;
}

export function complete({ partial }) {
    return ['dark', 'light'].filter(value => value.startsWith(partial));
}
