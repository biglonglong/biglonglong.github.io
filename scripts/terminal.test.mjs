import test from 'node:test';
import assert from 'node:assert/strict';
import { createFileSystem } from '../assets/js/terminal/core/filesystem.js';
import { createShell } from '../assets/js/terminal/core/shell.js';
import { createCommands } from '../assets/js/terminal/commands/index.js';
import { createExecutor } from '../assets/js/terminal/core/executor.js';
import { parseLine } from '../assets/js/terminal/core/parser.js';
import { renderHelp } from '../assets/js/terminal/commands/help.js';
import { includeUserHomes, parseUsers } from '../assets/js/terminal/core/users.js';
import { createUseradd } from '../assets/js/terminal/commands/useradd.js';
import { bindTerminalInput } from '../assets/js/terminal/ui/input.js';
import { completionContext, quoteCompletion } from '../assets/js/terminal/ui/completion.js';
import { createTerminalView, renderTerminalText } from '../assets/js/terminal/ui/view.js';
import { editTerminalFile } from '../assets/js/terminal/ui/editor.js';
import { run as runChat } from '../static/home/terminal/usr/bin/chat.js';
import { run as runChatctl } from '../static/home/terminal/usr/bin/chatctl.js';
import { formatGreeting } from '../static/home/terminal/usr/bin/hello.js';
import { resolveProgram } from '../assets/js/terminal/core/programs.js';
import { createTerminalSettings } from '../assets/js/terminal/etc/config.js';

function memoryStorage() {
    const values = new Map();
    return {
        get length() { return values.size; },
        key: index => [...values.keys()][index] ?? null,
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, String(value)),
        removeItem: key => values.delete(key),
    };
}

function terminal(programRuntime = {}, settings = createTerminalSettings(memoryStorage())) {
    const users = { guest: { home: '/home/guest', uid: 1000, gid: 1000 }, root: { home: '/root', uid: 0, gid: 0 } };
    const entries = ['home', 'home/guest', 'root', 'usr', 'usr/bin'].map(path => ({ path, directory: true }));
    const fs = createFileSystem(entries, users);
    fs.put('/usr/bin/which.js', { type: 'executable', owner: 'root',
        module: new URL('../static/home/terminal/usr/bin/which.js', import.meta.url).href });
    fs.put('/usr/bin/theme.js', { type: 'executable', owner: 'root',
        module: new URL('../static/home/terminal/usr/bin/theme.js', import.meta.url).href });
    const shell = createShell(fs);
    Object.assign(shell.state.env, settings.list());
    const overlay = { put: async (path, node) => fs.put(path, node), remove: async path => fs.remove(path), reset: async () => {} };
    const noop = () => {};
    const themeChanges = [];
    programRuntime.setTheme = value => { themeChanges.push(value); return ['dark', 'light'].includes(value); };
    const api = createCommands({ fileSystem: fs, shell, overlay, history: [], credentials: {},
        view: { setUser: noop, setPrompt: noop }, settings, programRuntime });
    programRuntime.builtins = () => Object.keys(api.commands);
    programRuntime.resolveProgram = name => resolveProgram(fs, shell, name);
    Object.defineProperty(programRuntime, 'env', { get: () => shell.state.env });
    Object.defineProperty(programRuntime, 'exported', { get: () => shell.state.exported });
    programRuntime.getSetting = name => settings.get(name);
    const executor = createExecutor({ ...api, fileSystem: fs, shell, programRuntime });
    const run = async raw => {
        let stdout = '', stderr = '';
        const code = await executor.execute(raw, output => { stdout += output.stdout; stderr += output.stderr; });
        return { stdout, stderr, code };
    };
    return { run, fs, shell, commands: api.commands, themeChanges };
}

test('website features run as /usr/bin programs with text pipes and redirects', async () => {
    const originalFetch = globalThis.fetch;
    const originalFuse = globalThis.Fuse;
    const runtime = {
        indexUrl: '/index.json', chatApiKey: 'test-key',
        chatApiUrl: 'https://example.com/chat/completions', chatModel: 'example-model',
        position: {},
    };
    globalThis.Fuse = class {
        constructor(data) { this.data = data; }
        search(query) { return this.data.filter(item => item.title.includes(query)).map(item => ({ item })); }
    };
    globalThis.fetch = async url => url === '/index.json'
        ? { ok: true, json: async () => [{ title: 'moon', permalink: 'https://example.com/moon/', content: 'lunar' }] }
        : { ok: true, body: { getReader: () => ({
            read: async () => ({ done: true, value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Answer: moon"}}]}\n') }),
        }) } };
    try {
    const { run, fs, commands } = terminal(runtime);
    for (const name of ['search', 'chat', 'hello']) {
        fs.put(`/usr/bin/${name}.js`, { type: 'executable', owner: 'root',
            module: new URL(`../static/home/terminal/usr/bin/${name}.js`, import.meta.url).href });
        assert.equal(Object.hasOwn(commands, name), false);
        assert.equal((await run(`which ${name}`)).stdout.trim(), `/usr/bin/${name}.js`);
    }
    assert.equal(Object.hasOwn(commands, 'which'), false);
    assert.equal(Object.hasOwn(commands, 'theme'), false);
    assert.equal((await run('which theme')).stdout, '/usr/bin/theme.js\n');
    assert.equal((await run('which which')).stdout, '/usr/bin/which.js\n');
    assert.equal((await run('which ls')).stdout, 'shell builtin: ls\n');
    assert.equal((await run('echo search | which')).stdout, '/usr/bin/search.js\n');
    assert.match((await run('which missing')).stderr, /which: missing not found/);
    assert.match((await run('search moon | grep Found')).stdout, /Found 1 result/);
    assert.match((await run('echo moon | search')).stdout, /moon\thttps:\/\/example\.com\/moon\//);
    assert.equal((await run('chat moon')).stdout, 'Answer: moon\n');
    assert.equal((await run('chat moon > answer')).stdout, '');
    assert.equal(fs.resolve('/home/guest/answer').node.content, 'Answer: moon\n');
    assert.match((await run('hello')).stdout, /Weather is unavailable/);
    } finally {
        globalThis.fetch = originalFetch;
        globalThis.Fuse = originalFuse;
    }
});

test('bash runs file commands in order and export expands session variables', async () => {
    const { run, fs, themeChanges } = terminal();
    fs.put('/home/guest/start.sh', { type: 'file', owner: 'guest', source: 'local',
        content: 'export NAME=moon\necho $NAME\necho done\n' });
    assert.equal((await run('bash start.sh')).stdout, 'moon\ndone\n');
    assert.equal((await run('echo ${NAME}')).stdout, 'moon\n');
    assert.equal((await run('export')).stdout, 'export NAME=moon\n');
    assert.match((await run('set theme dark')).stderr, /Use set NAME=value/);
    assert.equal((await run('theme light')).stdout, 'Theme set to light\n');
    assert.deepEqual(themeChanges, ['light']);
    assert.match((await run('theme invalid')).stderr, /theme: Use theme dark or theme light/);
    fs.put('/usr/bin/showenv.js', { type: 'executable',
        module: 'data:text/javascript,export function run({runtime}) { return runtime.env.NAME + "\\n"; }' });
    assert.equal((await run('showenv')).stdout, 'moon\n');
    fs.put('/home/guest/loop.sh', { type: 'file', owner: 'guest', source: 'local', content: 'bash loop.sh\n' });
    assert.match((await run('bash loop.sh')).stderr, /Maximum script nesting reached/);
});

test('set persists namespaced variables across terminal sessions', async () => {
    const storage = memoryStorage();
    const first = terminal({}, createTerminalSettings(storage));
    assert.equal((await first.run('set PLACE="far side"')).code, 0);
    assert.equal((await first.run('echo ${PLACE}')).stdout, 'far side\n');
    assert.equal((await first.run('set PLACE')).stdout, 'PLACE=far side\n');
    assert.equal(storage.getItem('terminal:set:PLACE'), 'far side');

    const second = terminal({}, createTerminalSettings(storage));
    assert.equal((await second.run('echo $PLACE')).stdout, 'far side\n');
    assert.equal((await second.run('set')).stdout, 'PLACE=far side\n');
    await second.run('export PLACE=temporary');
    assert.equal((await second.run('echo $PLACE')).stdout, 'temporary\n');
    assert.equal(storage.getItem('terminal:set:PLACE'), 'far side');
    assert.match((await second.run('set 1INVALID=x')).stderr, /Invalid name|Use set NAME=value/);
});

test('chat resolves generic key, URL and model from export, set, then Hugo', async () => {
    const originalFetch = globalThis.fetch;
    const requests = [];
    const stored = { CHAT_API_KEY: 'set-key', CHAT_API_URL: 'https://set.example/chat', CHAT_MODEL: 'set-model' };
    const runtime = {
        exported: { CHAT_API_KEY: 'export-key', CHAT_API_URL: 'https://export.example/chat', CHAT_MODEL: 'export-model' },
        getSetting: name => stored[name] ?? null,
        chatApiKey: 'yaml-key', chatApiUrl: 'https://yaml.example/chat', chatModel: 'yaml-model',
    };
    globalThis.fetch = async (url, options) => {
        requests.push({ url, authorization: options.headers.Authorization, model: JSON.parse(options.body).model,
            prompt: JSON.parse(options.body).messages[1].content });
        let sent = false;
        return { ok: true, body: { getReader: () => ({
            read: async () => sent ? { done: true } : (sent = true,
                { done: false, value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"ok"}}]}\n\n') }),
        }) } };
    };
    try {
        await runChat({ argv: ['providers'], runtime });
        runtime.exported = {};
        await runChat({ argv: ['hi'], runtime });
        runtime.getSetting = () => null;
        await runChat({ argv: ['hi'], runtime });
        runtime.chatApiUrl = '';
        runtime.chatModel = '';
        await runChat({ argv: ['hi'], runtime });
        assert.deepEqual(requests, [
            { url: 'https://export.example/chat', authorization: 'Bearer export-key', model: 'export-model', prompt: 'providers' },
            { url: 'https://set.example/chat', authorization: 'Bearer set-key', model: 'set-model', prompt: 'hi' },
            { url: 'https://yaml.example/chat', authorization: 'Bearer yaml-key', model: 'yaml-model', prompt: 'hi' },
            { url: 'https://api.siliconflow.cn/v1/chat/completions', authorization: 'Bearer yaml-key', model: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B', prompt: 'hi' },
        ]);
    } finally { globalThis.fetch = originalFetch; }
});

test('chatctl provider shortcut saves URL and model together', async () => {
    const storage = memoryStorage();
    const settings = createTerminalSettings(storage);
    const runtime = { exported: { CHAT_API_URL: 'old', CHAT_MODEL: 'old' }, setSetting: settings.put };
    assert.match(runChatctl({ argv: ['providers'], runtime }), /openai, deepseek/);
    assert.match(runChatctl({ argv: ['use', 'openai'], runtime }), /gpt-5\.6-sol/);
    assert.equal(settings.get('CHAT_API_URL'), 'https://api.openai.com/v1/chat/completions');
    assert.equal(settings.get('CHAT_MODEL'), 'gpt-5.6-sol');
    assert.equal(runtime.exported.CHAT_API_URL, undefined);
    runChatctl({ argv: ['use', 'deepseek'], runtime });
    assert.equal(settings.get('CHAT_API_URL'), 'https://api.deepseek.com/chat/completions');
    assert.equal(settings.get('CHAT_MODEL'), 'deepseek-flash');
    assert.throws(() => runChatctl({ argv: ['use', 'unknown'], runtime }), /chatctl use </);
});

test('chatctl status reports effective sources without revealing keys and clear removes only local settings', () => {
    const settings = createTerminalSettings(memoryStorage());
    const runtime = {
        exported: { CHAT_API_KEY: 'export-secret' },
        getSetting: settings.get, setSetting: settings.put, removeSetting: settings.remove,
        chatApiKey: 'site-secret', chatApiUrl: 'https://site.example/chat', chatModel: 'site-model',
    };
    settings.put('CHAT_API_KEY', 'local-secret');
    runChatctl({ argv: ['use', 'openai'], runtime });
    let output = runChatctl({ argv: ['status'], runtime });
    assert.match(output, /Provider: openai/);
    assert.match(output, /CHAT_API_KEY: configured \(export\)/);
    assert.match(output, /CHAT_API_URL: https:\/\/api\.openai\.com\/v1\/chat\/completions \(set\)/);
    assert.match(output, /CHAT_MODEL: gpt-5\.6-sol \(set\)/);
    for (const secret of ['export-secret', 'local-secret', 'site-secret']) assert.ok(!output.includes(secret));
    assert.equal(runChatctl({ argv: ['clear', 'url'], runtime }), 'chatctl: Cleared local CHAT_API_URL.\n');
    assert.equal(settings.get('CHAT_API_URL'), null);
    output = runChatctl({ argv: ['status'], runtime });
    assert.match(output, /Provider: custom/);
    assert.match(output, /CHAT_API_URL: https:\/\/site\.example\/chat \(hugo\.yaml\)/);
    runChatctl({ argv: ['clear', 'key'], runtime });
    assert.equal(settings.get('CHAT_API_KEY'), null);
    assert.match(runChatctl({ argv: ['status'], runtime }), /CHAT_API_KEY: configured \(export\)/);
    delete runtime.exported.CHAT_API_KEY;
    assert.match(runChatctl({ argv: ['status'], runtime }), /CHAT_API_KEY: configured \(hugo\.yaml\)/);
    runtime.chatApiKey = '';
    assert.match(runChatctl({ argv: ['status'], runtime }), /CHAT_API_KEY: not configured \(unconfigured\)/);
    assert.throws(() => runChatctl({ argv: ['clear', 'invalid'], runtime }), /clear <key\|url\|model>/);
});

test('chatctl use replaces exported URL and model in the shell environment', () => {
    const settings = createTerminalSettings(memoryStorage());
    const runtime = { exported: { CHAT_API_URL: 'old-url', CHAT_MODEL: 'old-model' },
        env: { CHAT_API_URL: 'old-url', CHAT_MODEL: 'old-model' }, setSetting: settings.put };
    runChatctl({ argv: ['use', 'openai'], runtime });
    assert.equal(runtime.env.CHAT_API_URL, settings.get('CHAT_API_URL'));
    assert.equal(runtime.env.CHAT_MODEL, settings.get('CHAT_MODEL'));
    assert.equal(runtime.exported.CHAT_API_URL, undefined);
    assert.equal(runtime.exported.CHAT_MODEL, undefined);
});

test('set reports unavailable localStorage without stopping the terminal', async () => {
    const settings = createTerminalSettings({
        get length() { throw new Error('blocked'); },
        getItem() { throw new Error('blocked'); },
        setItem() { throw new Error('blocked'); },
    });
    const { run } = terminal({}, settings);
    assert.equal((await run('echo ready')).stdout, 'ready\n');
    assert.match((await run('set NAME=value')).stderr, /Local storage is unavailable/);
});

test('resetfs clears terminal localStorage without removing website preferences', async () => {
    const storage = memoryStorage();
    storage.setItem('terminalTheme', 'light');
    storage.setItem('pref-theme', 'dark');
    storage.setItem('menu-scroll-position', '25');
    const { run } = terminal({}, createTerminalSettings(storage));
    await run('set NAME=value');
    const originalWindow = globalThis.window;
    let reloaded = false;
    globalThis.window = { location: { reload: () => { reloaded = true; } } };
    try {
        assert.equal((await run('resetfs')).code, 0);
    } finally { globalThis.window = originalWindow; }
    assert.equal(reloaded, true);
    assert.equal(storage.getItem('terminal:set:NAME'), null);
    assert.equal(storage.getItem('terminalTheme'), null);
    assert.equal(storage.getItem('pref-theme'), 'dark');
    assert.equal(storage.getItem('menu-scroll-position'), '25');
});

test('echo substitutes the output of commands in braces', async () => {
    const { run } = terminal();
    assert.equal((await run('echo "{pwd} is a secret here."')).stdout, '/home/guest is a secret here.\n');
    assert.equal((await run('echo "Result: {echo hello}"')).stdout, 'Result: hello\n');
    assert.match((await run('echo {missing}')).stderr, /echo: missing: command not found/);
});

test('terminal text renderer links titles without changing stored text or trusting HTML', () => {
    const titleLink = renderTerminalText('ROS2 Demo\thttps://example.com/ros2-demo/');
    assert.match(titleLink, />ROS2 Demo<\/a>/);
    assert.doesNotMatch(titleLink, />https:\/\//);
    const newsText = formatGreeting({ title: 'Moon <news>', url: 'https://example.com/news?a=1&b=2', description: 'Story' });
    assert.match(newsText, /News: Moon <news>\thttps:\/\/example\.com\/news\?a=1&b=2/);
    const newsHtml = renderTerminalText(newsText);
    assert.match(newsHtml, /href='https:\/\/example\.com\/news\?a=1&amp;b=2'[^>]*>News: Moon &lt;news&gt;<\/a>/);
    assert.doesNotMatch(newsHtml, />https:\/\/example\.com\/news/);
    const html = renderTerminalText('Result https://example.com/post?a=1&b=2\n<script>alert(1)</script>\njavascript:alert(1)\n');
    assert.match(html, /^Result <a /);
    assert.match(html, /href='https:\/\/example\.com\/post\?a=1&amp;b=2'/);
    assert.match(html, /class='terminal-link'/);
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.doesNotMatch(html, /href='javascript:/);
});

test('quotes, empty arguments, escaped operators and comments', () => {
    assert.deepEqual(parseLine(`echo '' "a | b" c\\ d # comment`)[0].pipeline[0].argv, ['echo', '', 'a | b', 'c d']);
    assert.equal(parseLine(' # comment').length, 0);
    for (const bad of ['echo |', 'echo &&', 'echo >', 'echo "', 'echo \\', '| echo', 'echo & echo']) {
        assert.throws(() => parseLine(bad), undefined, bad);
    }
});

test('pipeline preserves newlines, whitespace and HTML as literal text', async () => {
    const { run } = terminal();
    assert.deepEqual(await run(`printf '%s\n' '<b>&</b>' '  x  ' | cat`), { stdout: '<b>&</b>\n  x  \n', stderr: '', code: 0 });
    assert.equal((await run('echo hello | wc -l')).stdout.trim().split(/\s+/).join(' '), 'Lines 1');
    assert.equal((await run('echo -n hello | wc -l')).stdout.trim().split(/\s+/).join(' '), 'Lines 0');
});

test('user replaces users in the command registry and help', async () => {
    const { run } = terminal();
    assert.equal((await run('user')).stdout, 'guest\n');
    assert.equal((await run('users')).code, 127);
    assert.match(renderHelp('user'), /Show the active virtual user/);
});

test('Enter scrolls to the latest terminal line immediately, including an empty command', async () => {
    let onKeydown;
    const calls = [];
    const inputElement = {
        value: '',
        addEventListener: (_, handler) => { onKeydown = handler; },
        focus: () => {},
    };
    const view = {
        showCommandLine: () => calls.push('line'),
        scrollToBottom: () => calls.push('scroll'),
        printOutput: () => calls.push('output'),
        setInputVisible: visible => calls.push(visible ? 'show-input' : 'hide-input'),
    };
    bindTerminalInput({ inputElement, commands: {}, history: [], view,
        executor: { execute: async (_, emit) => emit({ stdout: 'done\n' }) } });
    const enter = { key: 'Enter', preventDefault: () => calls.push('prevent') };

    onKeydown(enter);
    assert.deepEqual(calls, ['prevent', 'line', 'scroll']);

    calls.length = 0;
    inputElement.value = 'echo done';
    onKeydown(enter);
    assert.deepEqual(calls.slice(0, 4), ['prevent', 'line', 'scroll', 'hide-input']);
    await new Promise(resolve => setImmediate(resolve));
    assert.ok(calls.indexOf('output') > calls.indexOf('scroll'));
    assert.equal(calls.at(-1), 'scroll');
    assert.ok(calls.indexOf('show-input') > calls.indexOf('output'));
});

test('terminal prompt shows fetched IP and falls back to localhost', () => {
    const directory = { textContent: '~' };
    const promptUser = { textContent: '' };
    const arrow = { textContent: '$' };
    const container = { dataset: { adminUser: 'root' }, classList: { toggle: () => {} } };
    const inputLine = { querySelector: selector => ({ '.prompt-dir': directory, '.prompt-user': promptUser,
        '.prompt-arrow': arrow })[selector] };
    const terminalWindow = { closest: () => container };
    const title = { textContent: '' };
    const view = createTerminalView(terminalWindow, {}, inputLine, title);
    view.setUser('guest');
    view.setHost('203.0.113.42');
    assert.equal(promptUser.textContent, 'guest@203.0.113.42:');
    assert.equal(title.textContent, 'guest@203.0.113.42: ~');
    view.setUser('root');
    assert.equal(promptUser.textContent, 'root@203.0.113.42:');
    view.setHost(undefined);
    assert.equal(promptUser.textContent, 'root@localhost:');
});

test('completion identifies commands after operators, quoted paths, and redirection targets', () => {
    assert.deepEqual(completionContext('echo hi | ca').commandPosition, true);
    assert.deepEqual(completionContext('true && ca').commandPosition, true);
    assert.deepEqual(completionContext('cat "my no').value, 'my no');
    assert.equal(completionContext('cat "my no').quote, '"');
    assert.equal(completionContext('cat my\\ no').value, 'my no');
    assert.equal(completionContext('cat > my').redirect, true);
    assert.equal(quoteCompletion('my note.txt', null), 'my\\ note.txt');
    assert.equal(quoteCompletion('my note.txt', '"', true), '"my note.txt"');
});

test('Tab completes quoted paths and commands after pipes', async () => {
    let keydown;
    const input = { value: 'cat "my n', selectionStart: undefined,
        addEventListener: (_, handler) => { keydown = handler; }, setSelectionRange: () => {} };
    const { fs, shell, commands } = terminal();
    fs.put('/home/guest/my note.txt', { type: 'file', owner: 'guest' });
    const view = { showCommandLine: () => {}, printOutput: () => {}, scrollToBottom: () => {} };
    bindTerminalInput({ inputElement: input, commands, history: [], view, fileSystem: fs, shell });
    keydown({ key: 'Tab', preventDefault: () => {} });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(input.value, 'cat "my note.txt"');
    input.value = 'echo hi | ca';
    keydown({ key: 'Tab', preventDefault: () => {} });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(input.value, 'echo hi | cat');
    input.value = 'cat > my\\ n';
    keydown({ key: 'Tab', preventDefault: () => {} });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(input.value, 'cat > my\\ note.txt');
});

test('vim editor saves text, rejects dirty quit, and discards on forced quit', async () => {
    const originalDocument = globalThis.document;
    const elements = [];
    globalThis.document = { createElement: tag => {
        const handlers = {};
        const element = { tag, value: '', hidden: false, readOnly: false, textContent: '',
            append: (...children) => { element.children = children; },
            addEventListener: (name, handler) => { handlers[name] = handler; },
            setAttribute: () => {}, focus: () => {}, remove: () => { element.removed = true; }, handlers };
        elements.push(element);
        return element;
    } };
    const terminalWindow = { appendChild: () => {}, scrollHeight: 10 };
    const writes = [];
    const key = value => ({ key: value, preventDefault: () => {} });
    try {
        const editing = editTerminalFile(terminalWindow, { path: '/home/guest/note.txt', content: 'old',
            save: async value => { writes.push(value); } });
        const [, textarea, status, command] = elements;
        textarea.handlers.keydown(key('i'));
        assert.equal(textarea.readOnly, false);
        textarea.value = 'new\ntext';
        textarea.handlers.input();
        textarea.handlers.keydown(key('Escape'));
        assert.equal(textarea.readOnly, true);
        textarea.handlers.keydown(key(':'));
        command.value = ':q';
        await command.handlers.keydown(key('Enter'));
        assert.match(status.textContent, /No write/);
        textarea.handlers.keydown(key(':'));
        command.value = ':wq';
        await command.handlers.keydown(key('Enter'));
        await editing;
        assert.deepEqual(writes, ['new\ntext']);

        const discarded = editTerminalFile(terminalWindow, { path: '/home/guest/note.txt', content: 'old',
            save: async value => { writes.push(value); } });
        const secondText = elements.at(-3), secondCommand = elements.at(-1);
        secondText.handlers.keydown(key('i'));
        secondText.value = 'discard me';
        secondText.handlers.keydown(key('Escape'));
        secondText.handlers.keydown(key(':'));
        secondCommand.value = ':q!';
        await secondCommand.handlers.keydown(key('Enter'));
        await discarded;
        assert.deepEqual(writes, ['new\ntext']);
    } finally { globalThis.document = originalDocument; }
});

test('vim uses terminal file permissions and persists edits through the overlay', async () => {
    const users = { guest: { home: '/home/guest', uid: 1000, gid: 1000 }, root: { home: '/root', uid: 0, gid: 0 } };
    const fs = createFileSystem(['home', 'home/guest', 'root'].map(path => ({ path, directory: true })), users);
    const shell = createShell(fs);
    const saved = [];
    const overlay = { put: async (path, node) => { saved.push(path); fs.put(path, node); } };
    let opened = 0;
    const view = { editFile: async ({ path, content, save }) => {
        opened++;
        assert.equal(path, '/home/guest/note.txt');
        assert.equal(content, opened === 1 ? '' : 'first');
        await save(opened === 1 ? 'first' : 'second');
    } };
    const settings = createTerminalSettings(memoryStorage());
    const api = createCommands({ fileSystem: fs, shell, overlay, history: [], view, settings });
    const executor = createExecutor({ ...api, fileSystem: fs, shell });
    assert.equal(await executor.execute('vim note.txt'), 0);
    assert.equal(await executor.execute('vim note.txt'), 0);
    assert.deepEqual(saved, ['/home/guest/note.txt', '/home/guest/note.txt']);
    assert.equal(fs.resolve('/home/guest/note.txt').node.content, 'second');
    let stderr = '';
    assert.equal(await executor.execute('vim /root/secret.txt', output => { stderr += output.stderr; }), 1);
    assert.match(stderr, /Permission denied/);
    assert.equal(opened, 2);
});

test('async program keeps the next prompt hidden until output finishes', async () => {
    let onKeydown;
    let finish;
    const calls = [];
    const inputElement = {
        value: 'hello', disabled: false,
        addEventListener: (_, handler) => { onKeydown = handler; },
        focus: () => calls.push('focus'),
    };
    const view = {
        showCommandLine: () => calls.push('line'),
        scrollToBottom: () => {},
        printOutput: () => calls.push('output'),
        setInputVisible: visible => calls.push(visible ? 'show-input' : 'hide-input'),
    };
    bindTerminalInput({ inputElement, commands: {}, history: [], view,
        executor: { execute: async (_, emit) => {
            await new Promise(resolve => { finish = resolve; });
            emit({ stdout: 'hello\n', stderr: '' });
        } } });

    onKeydown({ key: 'Enter', preventDefault: () => {} });
    assert.equal(inputElement.disabled, true);
    assert.deepEqual(calls, ['line', 'hide-input']);

    finish();
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(calls, ['line', 'hide-input', 'output', 'show-input', 'focus']);
    assert.equal(inputElement.disabled, false);
});

test('Ctrl+C aborts a running chat request and prevents late output', async () => {
    const originalDocument = globalThis.document;
    const originalFetch = globalThis.fetch;
    let inputKeydown, documentKeydown, aborted = false;
    const calls = [];
    const inputElement = { value: 'chat hello', disabled: false,
        addEventListener: (_, handler) => { inputKeydown = handler; }, focus: () => calls.push('focus') };
    const view = { showCommandLine: () => calls.push('line'), scrollToBottom: () => {},
        printOutput: html => { calls.push(html); return { querySelector: () => ({ textContent: '' }) }; },
        setInputVisible: visible => calls.push(visible ? 'show-input' : 'hide-input') };
    globalThis.document = { addEventListener: (_, handler) => { documentKeydown = handler; }, removeEventListener: () => {} };
    globalThis.fetch = (_, { signal }) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => { aborted = true; reject(new DOMException('Aborted', 'AbortError')); });
    });
    try {
        const runtime = { chatApiKey: 'test-key' };
        const { fs, shell, commands } = terminal(runtime);
        fs.put('/usr/bin/chat.js', { type: 'executable', owner: 'root',
            module: new URL('../static/home/terminal/usr/bin/chat.js', import.meta.url).href });
        const executor = createExecutor({ commands, shell, fileSystem: fs, programRuntime: runtime });
        bindTerminalInput({ inputElement, commands, history: [], view, fileSystem: fs, shell, executor });
        inputKeydown({ key: 'Enter', preventDefault: () => {} });
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(inputElement.disabled, true);
        documentKeydown({ key: 'c', ctrlKey: true, preventDefault: () => {} });
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(aborted, true);
        assert.equal(inputElement.disabled, false);
        assert.equal(shell.state.status, 130);
        assert.equal(calls.filter(value => String(value).includes('^C')).length, 1);
        assert.ok(!calls.some(value => String(value).includes('Could not connect')));
    } finally { globalThis.document = originalDocument; globalThis.fetch = originalFetch; }
});

test('chat returns plain text from fragmented streamed data and reports failures', async () => {
    const originalFetch = globalThis.fetch;
    const encoder = new TextEncoder();
    const received = [];
    const options = { chatApiKey: 'test-key', chatApiUrl: 'https://example.com/chat', chatModel: 'test-model' };
    try {
        const chunks = ['data: {"choices":[{"delta":{"content":"Hel', 'lo"}}]}\n\n', 'data: [DONE]\n'];
        globalThis.fetch = async () => ({ ok: true, body: { getReader: () => ({
            read: async () => chunks.length ? { done: false, value: encoder.encode(chunks.shift()) } : { done: true },
        }) } });
        assert.equal(await runChat({ argv: ['question'], runtime: options, write: chunk => received.push(chunk) }), '');
        assert.deepEqual(received, ['Hello', '\n']);

        globalThis.fetch = async () => ({ ok: true, body: { getReader: () => ({ read: async () => ({ done: true }) }) } });
        await assert.rejects(runChat({ argv: ['question'], runtime: options }), /empty response/i);

        globalThis.fetch = async () => ({ ok: false, status: 503 });
        await assert.rejects(runChat({ argv: ['question'], runtime: options }), /HTTP 503/);

        globalThis.fetch = async () => ({ ok: false, status: 402,
            json: async () => ({ message: 'Insufficient balance' }) });
        await assert.rejects(runChat({ argv: ['question'], runtime: options }), /HTTP 402\): Insufficient balance/);

        globalThis.fetch = async () => ({ ok: false, status: 401,
            json: async () => { throw new Error('Not JSON'); } });
        await assert.rejects(runChat({ argv: ['question'], runtime: options }), /HTTP 401\): Check the API key/);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('hello returns safe plain text when weather and news are partial or unavailable', () => {
    assert.match(formatGreeting(), /Weather is unavailable/);
    const output = formatGreeting({}, { current: { weather: [], main: {} }, next: { pop: 0.7 } },
        { city: '<script>' });
    assert.match(output, /<script>/);
    assert.match(output, /Rain chance: 70%/);
    assert.doesNotMatch(output, /undefined|NaN/);
});

test('redirections support quoted paths, append, input, and arguments after the target', async () => {
    const { run } = terminal();
    assert.equal((await run(`echo > 'a b' first; echo second >> 'a b'; cat < 'a b'`)).stdout, 'first\nsecond\n');
    assert.equal((await run(`cat 'a b' > 'a b'; wc -c 'a b'`)).stdout.trim().split(/\s+/).join(' '), 'Bytes File 0 a b');
});

test('conditional chains use exit status, including grep no-match and missing commands', async () => {
    const { run, shell } = terminal();
    assert.equal((await run('false && echo no || echo yes; true || echo no')).stdout, 'yes\n');
    assert.equal((await run('echo abc | grep z || echo missing')).stdout, 'missing\n');
    assert.equal((await run('nonexistent')).code, 127);
    assert.equal(shell.state.status, 127);
    assert.equal((await run('echo |')).code, 2);
});

test('stderr bypasses pipelines and output redirection; final stage controls status', async () => {
    const { run, fs } = terminal();
    const output = await run('cat absent | wc -l');
    assert.equal(output.stdout.trim().split(/\s+/).join(' '), 'Lines 0');
    assert.match(output.stderr, /cat:/);
    assert.equal(output.code, 0);
    const redirected = await run('cat absent > errors');
    assert.match(redirected.stderr, /cat:/);
    assert.equal(fs.resolve('errors').node.content, '');
});

test('redirection failures prevent command execution', async () => {
    const { run, shell } = terminal();
    const output = await run('cd / > /root/denied');
    assert.notEqual(output.code, 0);
    assert.equal(shell.state.cwd, '/home/guest');
});

test('head and tail preserve final-newline and zero-line semantics', async () => {
    const { run } = terminal();
    assert.equal((await run(`printf 'a\nb\n' | head -n 1`)).stdout, 'a\n');
    assert.equal((await run(`printf 'a\nb' | tail -n 1`)).stdout, 'b');
    assert.equal((await run(`printf 'a\nb\n' | tail -n 0`)).stdout, '');
    assert.notEqual((await run('head -n')).code, 0);
});

test('sort, uniq, grep options and Unicode counts', async () => {
    const { run } = terminal();
    assert.equal((await run(`printf 'b\na\nb\n' | sort | uniq -c`)).stdout, '1 a\n2 b\n');
    assert.equal((await run(`printf 'A\nb\n' | grep -in a`)).stdout, '1:A\n');
    assert.equal((await run(`printf '中' | wc -mc`)).stdout.trim().split(/\s+/).join(' '), 'Characters Bytes 1 3');
    assert.equal((await run(`printf 'a\nb\n' > first; printf '中' > second; wc -lwc first second`)).stdout.trim().split(/\s+/).join(' '),
        'Lines Words Bytes File 2 2 4 first 0 1 3 second 2 3 7 total');
});

test('mkdir -p, multi-file touch, copy/move into a directory, and rmdir', async () => {
    const { run, fs } = terminal();
    assert.equal((await run(`mkdir -p 'a b/sub'; touch 'one two' three; cp 'one two' 'a b'; mv three 'a b'`)).code, 0);
    assert.ok(fs.resolve('a b/one two').node);
    assert.ok(fs.resolve('a b/three').node);
    assert.equal(fs.resolve('three').node, null);
    assert.notEqual((await run(`rmdir 'a b'`)).code, 0);
    assert.equal((await run(`rmdir 'a b/sub'`)).code, 0);
    assert.notEqual((await run(`cp 'one two' 'one two'`)).code, 0);
});

test('ls produces separate lines in pipes; empty directory produces no placeholder', async () => {
    const { run } = terminal();
    await run('mkdir empty; touch a b');
    assert.equal((await run('ls empty | wc -l')).stdout.trim().split(/\s+/).join(' '), 'Lines 0');
    assert.equal((await run('ls | wc -l')).stdout.trim().split(/\s+/).join(' '), 'Lines 3');
});

test('browser programs use the same text protocol and receive argv/stdin', async () => {
    const { run, fs } = terminal();
    fs.put('/usr/bin/demo.js', { type: 'executable', module: 'data:text/javascript,export function run({argv,stdin}) { return argv.join(":") + stdin; }' });
    assert.equal((await run('echo input | demo a b')).stdout, 'a:binput\n');
    assert.equal((await run('which demo')).stdout, '/usr/bin/demo.js\n');
    fs.put('/usr/bin/native.exe', { type: 'executable', download: '/native.exe' });
    assert.match((await run('native.exe')).stderr, /Cannot execute a non-JavaScript file/);
});

test('interactive commands reject streams before mutating files', async () => {
    const { run, fs } = terminal();
    assert.notEqual((await run('help > output')).code, 0);
    assert.equal(fs.resolve('output').node, null);
});

test('account roles and home paths follow user data', () => {
    const users = { visitor: { home: '/home/visitor', uid: 1000, gid: 1000 }, maintainer: { home: '/vault', uid: 0, gid: 0 } };
    const paths = ['home', 'home/visitor', 'vault', 'etc', 'usr', 'usr/bin'];
    const fs = createFileSystem(paths.map(path => ({ path, directory: true })), users, '/files/', 'visitor');
    const shell = createShell(fs);
    assert.equal(shell.state.user, 'visitor');
    assert.equal(shell.state.cwd, '/home/visitor');
    assert.equal(fs.adminUser, 'maintainer');
    assert.equal(fs.resolve('/vault').node.owner, 'maintainer');
    assert.equal(shell.canAccess('/vault'), false);
    shell.switchUser('maintainer');
    assert.equal(shell.state.isAdmin, true);
    assert.equal(shell.canAccess('/vault'), true);
});

test('only JavaScript modules in the program directory become executables', () => {
    const users = { guest: { home: '/home/guest', uid: 1000 }, root: { home: '/root', uid: 0 } };
    const entries = ['home', 'home/guest', 'root', 'usr', 'usr/bin'].map(path => ({ path, directory: true }));
    entries.push({ path: 'usr/bin/tool.js' }, { path: 'usr/bin/native.exe' }, { path: 'home/guest/tool.js' });
    const fs = createFileSystem(entries, users);
    assert.equal(fs.resolve('/usr/bin/tool.js').node.type, 'executable');
    assert.equal(fs.resolve('/usr/bin/native.exe').node.type, 'file');
    assert.equal(fs.resolve('/home/guest/tool.js').node.type, 'file');
});

test('static help documents commands, programs and the configured demo password', () => {
    const page = renderHelp();
    assert.match(page, /echo \[-n\]/);
    assert.match(page, /\/usr\/bin\/date\.js/);
    assert.match(renderHelp('sudo', 'example'), /Demo password: example/);
    assert.throws(() => renderHelp('unknown'), /Unknown command/);
});

test('useradd creates a persistent account and both standard home files', async () => {
    const original = 'root:x:0:0:root:/root:/bin/sh\nguest:x:1000:1000:Guest:/home/guest:/bin/sh\n';
    const users = parseUsers(original);
    const entries = ['root', 'home', 'home/guest', 'etc'].map(path => ({ path, directory: true }));
    entries.push({ path: 'etc/passwd' });
    const fs = createFileSystem(entries, users);
    fs.put('/etc/passwd', { type: 'file', source: 'local', owner: 'root', public: true, content: original });
    const shell = createShell(fs);
    const records = [];
    const overlay = { putMany: async items => {
        records.push(...items);
        for (const { path, node } of items) fs.put(path, node);
    } };
    const useradd = createUseradd({ fileSystem: fs, overlay, shell });
    await assert.rejects(useradd.run('', { argv: ['alice'] }), /Permission denied/);
    shell.switchUser('root');
    await useradd.run('alice', { argv: ['alice'] });
    assert.equal(fs.users.alice.home, '/home/alice');
    assert.equal(fs.resolve('/home/alice/summary.md').node.owner, 'alice');
    assert.deepEqual(JSON.parse(fs.resolve('/home/alice/profile.json').node.content),
        { user: 'alice', role: 'member', home: '/home/alice' });
    await assert.rejects(useradd.run('alice', { argv: ['alice'] }), /User exists/);
    shell.switchUser('guest');
    assert.equal(shell.canAccess('/home/alice/summary.md'), false);
    assert.equal(shell.canAccess('/etc/passwd'), true);

    const restoredUsers = parseUsers(fs.resolve('/etc/passwd').node.content);
    const restored = createFileSystem(includeUserHomes(entries, restoredUsers), restoredUsers);
    for (const { path, node } of records) restored.put(path, node);
    assert.equal(restored.resolve('/home/alice/summary.md').node.type, 'file');
    assert.equal(restored.resolve('/home/alice/profile.json').node.type, 'file');
    assert.equal(restored.resolve('/home/alice/.bashrc').node.type, 'file');
});
