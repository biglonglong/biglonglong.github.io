import * as params from '@params';
import { renderSearchResults, setSearchStatus } from './search/render.js';
import { bindSearchKeyboard } from './search/keyboard.js';

const input = document.getElementById('searchInput');
const results = document.getElementById('searchResults');
const box = document.getElementById('searchbox');
const status = document.getElementById('searchStatus');
const options = params.fuseOpts || {};
let fuse;
let composing = false;
let timer;
let failed = false;

function render() {
    if (composing) return;
    const query = input.value.trim();
    if (!query) {
        results.replaceChildren();
        setSearchStatus(status, 'idle', '');
    } else if (!fuse) {
        results.replaceChildren();
        setSearchStatus(status, failed ? 'error' : 'loading', failed
            ? '搜索暂时不可用，请刷新页面重试。'
            : '正在准备搜索，请稍候…');
    } else {
        renderSearchResults({ query, matches: fuse.search(query, { limit: options.limit }), results, status });
    }
}

function scheduleRender() {
    clearTimeout(timer);
    timer = setTimeout(render, 100);
}

function renderNow() {
    clearTimeout(timer);
    render();
}

input.addEventListener('input', scheduleRender);
input.addEventListener('compositionstart', () => { composing = true; });
input.addEventListener('compositionend', () => { composing = false; renderNow(); });
input.addEventListener('search', renderNow);
bindSearchKeyboard({ box, input, results, cancelPending: () => clearTimeout(timer) });

async function loadIndex() {
    try {
        const response = await fetch(params.indexURL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        fuse = new Fuse(await response.json(), {
            isCaseSensitive: options.iscasesensitive ?? false,
            includeScore: options.includescore ?? false,
            includeMatches: options.includematches ?? false,
            minMatchCharLength: options.minmatchcharlength ?? 1,
            shouldSort: options.shouldsort ?? true,
            findAllMatches: options.findallmatches ?? false,
            keys: options.keys ?? ['title', 'permalink', 'summary', 'content'],
            location: options.location ?? 0,
            threshold: options.threshold ?? 0.4,
            distance: options.distance ?? 100,
            ignoreLocation: options.ignorelocation ?? true
        });
    } catch (_) {
        failed = true;
    }
    render();
}

loadIndex();
