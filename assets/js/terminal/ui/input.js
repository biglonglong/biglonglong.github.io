import { escapeHtml, renderTerminalText } from './view.js';
import { parseLine } from '../core/parser.js';
import { programNames, resolveProgram } from '../core/programs.js';
import { completionContext, quoteCompletion } from './completion.js';

function safeEcho(raw) {
    return containsPassword(raw) ? '[simulated login command hidden]' : raw;
}

function containsPassword(raw) {
    try { return parseLine(raw).some(job => job.pipeline.some(stage => stage.argv[0] === 'sudo')); }
    catch { return /\bsudo\b/.test(raw); }
}

export function bindTerminalInput({ inputElement, commands, history, view, fileSystem, shell, executor }) {
    let historyIndex = -1;
    let pendingInput = '';
    let activeController;

    const cancelRunning = event => {
        if (!activeController || event.key.toLowerCase() !== 'c' || !event.ctrlKey) return;
        event.preventDefault();
        activeController.abort();
        activeController = undefined;
        view.printOutput("<pre class='terminal-file st-error'>^C</pre>");
        view.scrollToBottom();
    };

    inputElement.addEventListener('keydown', event => {
        if (event.isComposing) return;

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (!history.length) return;
            event.preventDefault();
            if (historyIndex === -1) pendingInput = containsPassword(inputElement.value) ? '' : inputElement.value;
            historyIndex = event.key === 'ArrowUp'
                ? (historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1))
                : (historyIndex < history.length - 1 ? historyIndex + 1 : -1);
            inputElement.value = historyIndex === -1 ? pendingInput : history[historyIndex];
            inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
            return;
        }
        historyIndex = -1;

        if (event.ctrlKey && event.key.toLowerCase() === 'l') {
            event.preventDefault();
            commands.clear.run();
        } else if (event.ctrlKey && event.key.toLowerCase() === 'u') {
            event.preventDefault();
            inputElement.value = '';
        } else if (event.key === 'Escape') {
            inputElement.value = '';
        } else if (event.ctrlKey && event.key.toLowerCase() === 'c') {
            if (inputElement.selectionStart !== inputElement.selectionEnd) return;
            event.preventDefault();
            view.showCommandLine(safeEcho(inputElement.value), "<span class='st-error'> ^C</span>");
            inputElement.value = '';
            view.scrollToBottom();
        } else if (event.key === 'Tab') {
            event.preventDefault();
            completeInput();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            executeInput();
        }
    });

    async function completeInput() {
        const raw = inputElement.value;
        const cursor = inputElement.selectionStart ?? raw.length;
        const context = completionContext(raw.slice(0, cursor));
        const { value: partial, words, command, commandPosition, redirect } = context;
        const pathCandidates = types => fileSystem.complete(partial, shell.state.cwd, types, shell.home())
            .filter(candidate => shell.canAccess(shell.resolve(candidate).path));
        let candidates = commandPosition ? (partial.includes('/') ? pathCandidates(['executable', 'directory'])
            : [...Object.keys(commands), ...programNames(fileSystem)])
            : redirect ? pathCandidates()
                : (commands[command]?.complete?.(partial, words) || []);
        if (!commandPosition && !redirect && !commands[command]) {
            const { node } = resolveProgram(fileSystem, shell, command);
            if (node?.type === 'executable') {
                try {
                    const program = await import(node.module);
                    candidates = program.complete?.({ partial, words, commands: Object.keys(commands), programs: programNames(fileSystem) }) || [];
                } catch { /* Completion is optional for browser programs. */ }
            }
        }
        const matches = [...new Set(candidates.filter(candidate => candidate.startsWith(partial)))];
        const replace = candidate => {
            const complete = matches.length === 1 && !candidate.endsWith('/');
            const suffix = raw.slice(cursor);
            const closed = complete && context.quote && !suffix.startsWith(context.quote);
            inputElement.value = raw.slice(0, context.start) + quoteCompletion(candidate, context.quote, closed) + suffix;
            const position = inputElement.value.length - suffix.length;
            inputElement.setSelectionRange?.(position, position);
        };
        if (matches.length === 1) {
            replace(matches[0]);
            return;
        }
        if (matches.length < 2) return;

        const prefix = matches.reduce((common, word) => {
            let index = 0;
            while (index < common.length && index < word.length && common[index] === word[index]) index++;
            return common.slice(0, index);
        }, matches[0]);
        if (prefix.length > partial.length) {
            replace(prefix);
        } else {
            view.showCommandLine(safeEcho(raw), '<span class="st-warning"> ^Tab</span>');
            view.printOutput(`<span class='output-begin'>Possible completions:</span><br>${matches.map(escapeHtml).join('&nbsp;&nbsp;')}`);
            view.scrollToBottom();
        }
    }

    async function executeInput() {
        const raw = inputElement.value;
        view.showCommandLine(safeEcho(raw));
        inputElement.value = '';
        view.scrollToBottom();
        if (!raw.trim()) return;
        const controller = new AbortController();
        activeController = controller;
        globalThis.document?.addEventListener('keydown', cancelRunning);
        inputElement.disabled = true;
        view.setInputVisible(false);

        try {
            if (!containsPassword(raw) && raw.trim() !== 'history -c') {
                history.push(raw.trim());
                if (history.length > 100) history.shift();
            }
            let streamedLine;
            await executor.execute(raw, output => {
                if (controller.signal.aborted) return;
                if (output.stream && output.stdout) {
                    streamedLine ||= view.printOutput("<pre class='terminal-file'></pre>");
                    streamedLine.querySelector('pre').textContent += output.stdout;
                } else if (output.stdout) view.printOutput(`<pre class='terminal-file'>${renderTerminalText(output.stdout)}</pre>`);
                if (output.stderr) view.printOutput(`<pre class='terminal-file st-error'>${escapeHtml(output.stderr)}</pre>`);
                if (output.html != null) view.printOutput(output.html);
                if (!output.stream) streamedLine = undefined;
                view.scrollToBottom();
            }, 0, controller.signal);
        } finally {
            globalThis.document?.removeEventListener('keydown', cancelRunning);
            if (activeController === controller) activeController = undefined;
            inputElement.disabled = false;
            view.setInputVisible(true);
            inputElement.focus();
            view.scrollToBottom();
        }
    }
}
