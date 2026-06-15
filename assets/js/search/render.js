export function setSearchStatus(status, state, message) {
    status.dataset.state = state;
    status.textContent = message;
}

function createResult(item, query) {
    const li = document.createElement('li');
    const header = document.createElement('header');
    header.className = 'entry-header';
    const title = String(item.title || '');
    const position = title.toLowerCase().indexOf(query.toLowerCase());
    if (position >= 0) {
        const mark = document.createElement('mark');
        mark.className = 'search-highlight';
        mark.textContent = title.slice(position, position + query.length);
        header.append(title.slice(0, position), mark, title.slice(position + query.length), ' »');
    } else {
        header.textContent = title + ' »';
    }
    const link = document.createElement('a');
    link.href = item.permalink;
    link.setAttribute('aria-label', title);
    li.append(header, link);
    return li;
}

export function renderSearchResults({ query, matches, results, status }) {
    const fragment = document.createDocumentFragment();
    for (const { item } of matches) fragment.append(createResult(item, query));
    results.replaceChildren(fragment);
    setSearchStatus(status, matches.length ? 'results' : 'empty', matches.length
        ? `找到 ${matches.length} 篇相关内容`
        : `未找到「${query}」的相关内容。试试更短的关键词。`);
}
