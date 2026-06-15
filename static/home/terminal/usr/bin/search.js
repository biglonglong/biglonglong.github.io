let indexPromise;
let indexUrl;

export async function run({ argv = [], stdin = '', runtime, signal } = {}) {
    const query = argv.join(' ').trim() || stdin.trim();
    if (!query) throw new Error('search: Enter a keyword');
    if (indexUrl !== runtime.indexUrl) {
        indexUrl = runtime.indexUrl;
        indexPromise = fetch(indexUrl, { signal }).then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        }).then(data => new Fuse(data, { threshold: 0.4, keys: ['title', 'content'] }));
    }
    let index;
    try { index = await indexPromise; }
    catch { indexPromise = undefined; indexUrl = undefined; return signal?.aborted ? '' : 'Search index is unavailable. Try again shortly.\n'; }
    if (signal?.aborted) return '';
    const results = index.search(query);
    if (!results.length) return `No results for '${query}'.\n`;
    const items = results.slice(0, 3).map(({ item }) =>
        `${item.title}\t${item.permalink}\n${(item.content || '').slice(0, 100).replace(/\s+/g, ' ')}...`).join('\n\n');
    return `Found ${results.length} result(s) for '${query}':\n\n${items}\n`;
}
