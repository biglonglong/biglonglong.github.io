import { createExecutor } from './core/executor.js';
import { createFileSystem } from './core/filesystem.js';
import { includeUserHomes, parseUsers } from './core/users.js';
import { createOverlay, readOverlayContent } from './core/overlay.js';
import { createShell } from './core/shell.js';
import { createCommands } from './commands/index.js';
import { createTerminalConfig, createTerminalSettings } from './etc/config.js';
import { createTerminalView, escapeHtml } from './ui/view.js';
import { bindTerminalInput } from './ui/input.js';
import { getPosition } from './services/remote.js';
import { SimpleTTS } from './services/tts.js';
import { resolveProgram } from './core/programs.js';

const container = document.getElementById('terminal-container');
if (container) void (async () => {
    const terminalWindow = container.querySelector('#terminal-window');
    const inputLine = container.querySelector('.input-line');
    const inputElement = container.querySelector('#cmd-input');
    const outputElement = container.querySelector('#history-output');
    const titleElement = container.querySelector('#terminal-title');

    const view = createTerminalView(terminalWindow, outputElement, inputLine, titleElement);
    const theme = createTerminalConfig(container);
    const [manifestResponse, passwdResponse] = await Promise.all([
        fetch(container.dataset.manifestUrl), fetch(`${container.dataset.filesRoot}etc/passwd`),
    ]);
    if (!manifestResponse.ok || !passwdResponse.ok) throw new Error('Cannot load terminal file manifest or user list');
    const initialPasswd = await passwdResponse.text();
    const users = parseUsers(await readOverlayContent('/etc/passwd') || initialPasswd);
    const fileSystem = createFileSystem(includeUserHomes(await manifestResponse.json(), users), users,
        container.dataset.filesRoot, container.dataset.defaultUser);
    container.dataset.adminUser = fileSystem.adminUser;
    const overlay = await createOverlay(fileSystem);
    const shell = createShell(fileSystem);
    const settings = createTerminalSettings();
    Object.assign(shell.state.env, settings.list());
    const history = [];
    let position = {};
    const credentials = {
        password: container.dataset.password || '',
        chatApiKey: container.dataset.chatKey || '',
        chatApiUrl: container.dataset.chatApiUrl || '',
        chatModel: container.dataset.chatModel || '',
        newsKey: container.dataset.newsKey || '',
        weatherKey: container.dataset.weatherKey || '',
    };
    const tts = new SimpleTTS();
    const programRuntime = {
        builtins: () => Object.keys(commands),
        resolveProgram: name => resolveProgram(fileSystem, shell, name),
        indexUrl: container.dataset.indexUrl,
        chatApiKey: credentials.chatApiKey,
        chatApiUrl: credentials.chatApiUrl,
        chatModel: credentials.chatModel,
        newsKey: credentials.newsKey,
        weatherKey: credentials.weatherKey,
        get isAdmin() { return shell.state.isAdmin; },
        get env() { return shell.state.env; },
        get exported() { return shell.state.exported; },
        getSetting: name => settings.get(name),
        setSetting: (name, value) => settings.put(name, value),
        removeSetting: name => {
            const previous = settings.get(name);
            settings.remove(name);
            if (!Object.hasOwn(shell.state.exported, name) && shell.state.env[name] === previous) delete shell.state.env[name];
        },
        get position() { return position; },
        setTheme: theme.setTheme,
        speak: text => tts.speak(text, true),
    };
    const { commands, writeText, textInput } = createCommands({
        fileSystem, overlay, shell, view, history, credentials, settings,
        programRuntime,
    });

    view.setUser(shell.state.user);
    view.setPrompt(shell.promptPath());
    view.printOutput(`Last login: ${escapeHtml(new Date().toLocaleString())}<br>Type \`help\` for commands.`, 'output-pre');
    if (!overlay.persistent) view.printOutput('Local storage is unavailable; file changes will last only until this page closes.', 'output-pre');
    const executor = createExecutor({ commands, writeText, textInput, fileSystem, shell, programRuntime });
    const bashrc = shell.resolve('~/.bashrc');
    if (bashrc.node?.type === 'file' && shell.canAccess(bashrc.path)) {
        await executor.execute('bash ~/.bashrc', output => {
            if (output.stdout) view.printOutput(`<pre class='terminal-file'>${escapeHtml(output.stdout)}</pre>`);
            if (output.stderr) view.printOutput(`<pre class='terminal-file st-error'>${escapeHtml(output.stderr)}</pre>`);
        });
    }
    bindTerminalInput({ inputElement, commands, history, view, fileSystem, shell, executor });
    terminalWindow.addEventListener('click', event => {
        if (!event.target.closest('a, button, input')) inputElement.focus();
    });
    window.addEventListener('load', () => inputElement.focus());

    getPosition().then(data => { position = data; view.setHost(data.ip); });
})().catch(error => {
    container.querySelector('#history-output').textContent = `Terminal unavailable: ${error.message}`;
});
