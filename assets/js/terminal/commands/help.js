import { escapeHtml } from '../ui/view.js';

// Deliberately maintained alongside the command implementations. See AGENTS.md.
const commandHelp = {
    ls: ['ls [-al] [path]', 'List files; -a includes hidden entries, -l shows details'],
    file: ['file <path>', 'Identify a file or directory'],
    cd: ['cd [dir|-]', 'Change directory; - returns to the previous directory'],
    pwd: ['pwd', 'Show the current directory'],
    tree: ['tree [-a] [path]', 'Show the directory tree'],
    open: ['open <path>', 'Open a URL or display a file'],
    whoami: ['whoami', 'Show the current virtual user'],
    id: ['id [user]', 'Show a virtual user ID and group ID'],
    user: ['user', 'Show the active virtual user'],
    history: ['history [-c]', 'Show or clear command history'],
    bash: ['bash <file>', 'Run a text script line by line'],
    export: ['export [NAME=value ...]', 'Set or list session variables; use .bashrc to restore them on startup'],
    set: ['set [NAME=value|NAME]', 'Save, list or read persistent terminal variables in localStorage'],
    clear: ['clear', 'Clear the screen'],
    sudo: ['sudo <password>', 'Enter a simulated administrator session'],
    useradd: ['useradd <name>', 'Create a simulated user, home, summary.md and profile.json (administrator only)'],
    su: ['su <user>', 'Switch virtual user'],
    exit: ['exit', 'Return to the previous virtual session'],
    help: ['help [command]', 'Show this help or one command'],
    mkdir: ['mkdir [-p] <dir ...>', 'Create directories'],
    touch: ['touch <file ...>', 'Create empty files'],
    vim: ['vim <file>', 'Edit a text file: i to insert, Esc for normal mode, :w save, :q quit, :wq save and quit, :q! discard'],
    rm: ['rm [-r] <path>', 'Remove a file or directory'],
    rmdir: ['rmdir <dir ...>', 'Remove empty directories'],
    resetfs: ['resetfs', 'Clear local file changes, terminal settings and theme, then reload'],
    cp: ['cp <source> <destination>', 'Copy a text or URL file'],
    mv: ['mv <source> <destination>', 'Move a text or URL file'],
    echo: ['echo [-n] [text ...]', 'Print text; {command} inserts command output'],
    printf: ['printf <format> [text ...]', 'Format text with %s and escapes'],
    cat: ['cat [file ...|-]', 'Concatenate files or standard input'],
    head: ['head [-n count] [file ...]', 'Show first lines'],
    tail: ['tail [-n count] [file ...]', 'Show last lines'],
    grep: ['grep [-ivn] <text> [file ...]', 'Match literal text'],
    wc: ['wc [-lwmc] [file ...]', 'Show labeled line, word, character and byte counts; list each file and a total'],
    sort: ['sort [-rnu] [file ...]', 'Sort lines'],
    uniq: ['uniq [-c] [file]', 'Remove adjacent duplicate lines'],
    true: ['true', 'Return exit status 0'],
    false: ['false', 'Return exit status 1'],
};

const programHelp = {
    date: ['date', 'Show the current date from /usr/bin/date.js'],
    fortune: ['fortune', 'Show a random quote from /usr/bin/fortune.js'],
    search: ['search <keyword>', 'Search site posts with /usr/bin/search.js'],
    chat: ['chat <question>', 'Ask an OpenAI-compatible API; all arguments are sent as the question'],
    chatctl: ['chatctl [providers|status] | chatctl use <siliconflow|openai|deepseek> | chatctl clear <key|url|model>', 'View effective chat settings and sources, switch provider, or clear a local setting; the key value stays hidden'],
    hello: ['hello', 'Show available weather and news with /usr/bin/hello.js'],
    which: ['which <command>', 'Find a built-in command or browser program with /usr/bin/which.js'],
    theme: ['theme <dark|light>', 'Save the terminal theme with /usr/bin/theme.js'],
};

const syntaxHelp = [
    ['"text" / \'text\'', 'Keep spaces or operators in one argument'],
    ['a | b', 'Pipe standard output into the next command'],
    ['a > file / a >> file', 'Write or append standard output'],
    ['a < file', 'Read standard input from a file'],
    ['a && b / a || b / a ; b', 'Run on success, failure, or unconditionally'],
];

const controlHelp = [
    ['Enter', 'Run a command and scroll to the latest output'], ['Tab', 'Complete command or path'],
    ['↑ / ↓', 'Browse history'], ['Ctrl+C', 'Cancel the running command or input line'],
    ['Ctrl+L', 'Clear screen'], ['Ctrl+U / Esc', 'Clear the input line'],
    ['Click terminal', 'Focus input'],
];

export const helpTopics = () => [...Object.keys(commandHelp), ...Object.keys(programHelp)];

function rows(entries) {
    return `<div class='terminal-help'>${entries.map(([usage, description]) => `
        <div class='terminal-help-row'><span>${escapeHtml(usage)}</span><span>${escapeHtml(description)}</span></div>`).join('')}</div>`;
}

export function renderHelp(name = '', demoPassword = '') {
    if (name) {
        const topic = name.endsWith('.js') ? name.slice(0, -3) : name;
        const entry = commandHelp[topic] || programHelp[topic];
        if (!entry) throw new Error(`help: Unknown command '${name}'`);
        const detail = topic === 'sudo' ? `${entry[1]}. Demo password: ${demoPassword || '(not configured)'}` : entry[1];
        return `<span class='st-highlight'>${escapeHtml(entry[0])}</span><br>${escapeHtml(detail)}`;
    }
    return `<span class='output-begin'>Commands</span>${rows(Object.values(commandHelp))}
        <span class='output-begin'>Programs</span>${rows(Object.values(programHelp))}
        <span class='output-begin'>Syntax</span>${rows(syntaxHelp)}
        <span class='output-begin'>Controls</span>${rows(controlHelp)}`;
}
