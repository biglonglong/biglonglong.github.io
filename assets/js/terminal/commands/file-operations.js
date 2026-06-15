import { escapeHtml } from '../ui/view.js';

export async function readFile(node) {
    if (node.source === 'local') return node.content || '';
    const response = await fetch(node.url);
    if (!response.ok) throw new Error(`Cannot read file (HTTP ${response.status})`);
    return response.text();
}

export function renderFile(path, contents) {
    if (path.toLowerCase().endsWith('.json')) {
        try {
            return `<pre class='terminal-file'>${escapeHtml(JSON.stringify(JSON.parse(contents), null, 2))}</pre>`;
        } catch {
            throw new Error(`open: Invalid JSON: ${path}`);
        }
    }
    return `<pre class='terminal-file'>${escapeHtml(contents)}</pre>`;
}

export async function followLink(node) {
    const url = (await readFile(node)).trim();
    const resolved = new URL(url, window.location.href);
    if (!['http:', 'https:'].includes(resolved.protocol)) throw new Error('open: Unsupported URL');
    window.location.href = resolved.href;
}

