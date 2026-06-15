import { editTerminalFile } from './editor.js';

export function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

export function renderTerminalText(value) {
    return String(value).split('\n').map(line => {
        const linkedTitle = /^(.+)\t(https?:\/\/\S+)$/i.exec(line);
        if (!linkedTitle) return renderLinks(line);
        try {
            const url = new URL(linkedTitle[2]);
            return `<a class='terminal-link' href='${escapeHtml(url.href)}' target='_blank' rel='noopener noreferrer'>${escapeHtml(linkedTitle[1])}</a>`;
        } catch { return renderLinks(line); }
    }).join('\n');
}

function renderLinks(source) {
    const urls = /https?:\/\/[^\s<>"']+/gi;
    let html = '';
    let offset = 0;
    for (const match of source.matchAll(urls)) {
        html += escapeHtml(source.slice(offset, match.index));
        const raw = match[0];
        try {
            const url = new URL(raw);
            html += `<a class='terminal-link' href='${escapeHtml(url.href)}' target='_blank' rel='noopener noreferrer'>${escapeHtml(raw)}</a>`;
        } catch { html += escapeHtml(raw); }
        offset = match.index + raw.length;
    }
    return html + escapeHtml(source.slice(offset));
}

export function formatJson(value, label = '') {
    return `<div class="info-json">${escapeHtml(label)}${escapeHtml(JSON.stringify(value, null, 4)).replace(/ /g, '&nbsp;').replace(/\n/g, '<br>')}</div>`;
}

export function createTerminalView(terminalWindow, outputElement, inputLine, titleElement) {
    const prompt = inputLine.querySelector('.prompt-dir');
    const promptUser = inputLine.querySelector('.prompt-user');
    let host = 'localhost';
    let user = '';

    function updateIdentity() {
        const identity = `${user}@${host}`;
        promptUser.textContent = `${identity}:`;
        titleElement.textContent = `${identity}: ${prompt.textContent}`;
    }

    function setPrompt(path) {
        prompt.textContent = path;
        updateIdentity();
    }

    function setUser(name) {
        user = name;
        const isAdmin = name === terminalWindow.closest('#terminal-container').dataset.adminUser;
        inputLine.querySelector('.prompt-arrow').textContent = isAdmin ? '#' : '$';
        terminalWindow.closest('#terminal-container').classList.toggle('terminal-admin', isAdmin);
        updateIdentity();
    }

    function setHost(ip) {
        host = typeof ip === 'string' && /^(?:[0-9a-f:.]+)$/i.test(ip) ? ip : 'localhost';
        updateIdentity();
    }

    function printOutput(html, className = 'command-output') {
        const line = document.createElement('div');
        line.className = className;
        line.innerHTML = html;
        outputElement.appendChild(line);
        return line;
    }

    function showCommandLine(command, suffix = '') {
        const line = document.createElement('div');
        line.className = 'input-line';
        line.append(promptUser.cloneNode(true), prompt.cloneNode(true), inputLine.querySelector('.prompt-arrow').cloneNode(true));
        const text = document.createElement('span');
        text.textContent = command;
        line.appendChild(text);
        if (suffix) {
            const marker = document.createElement('span');
            marker.innerHTML = suffix;
            line.appendChild(marker);
        }
        outputElement.appendChild(line);
    }

    function scrollToBottom() {
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
    }

    function clear() {
        outputElement.replaceChildren();
    }

    function setInputVisible(visible) {
        inputLine.hidden = !visible;
    }

    return { printOutput, showCommandLine, scrollToBottom, setPrompt, setUser, setHost, setInputVisible, clear,
        editFile: options => editTerminalFile(terminalWindow, options) };
}
