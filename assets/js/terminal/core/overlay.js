function openDatabase() {
    return new Promise((resolve, reject) => {
        if (!globalThis.indexedDB) return reject(new Error('IndexedDB unavailable'));
        const request = indexedDB.open('biglonglong-terminal', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('files', { keyPath: 'path' });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function transaction(db, mode, action) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('files', mode);
        const result = action(tx.objectStore('files'));
        tx.oncomplete = () => resolve(result?.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

export async function createOverlay(fileSystem) {
    const basePaths = new Set();
    function collect(node, path = '/') {
        basePaths.add(path);
        if (node.type === 'directory') Object.entries(node.children).forEach(([name, child]) =>
            collect(child, path === '/' ? `/${name}` : `${path}/${name}`));
    }
    collect(fileSystem.root);

    let db = null;
    let records = [];
    try {
        db = await openDatabase();
        records = await transaction(db, 'readonly', store => store.getAll()) || [];
        records.sort((a, b) => a.path.split('/').length - b.path.split('/').length);
        for (const record of records) {
            try {
                if (record.action === 'delete') fileSystem.remove(record.path);
                else fileSystem.put(record.path, record.node.type === 'directory'
                    ? { ...record.node, children: {} } : record.node);
            } catch { /* An obsolete descendant of a removed parent is ignored. */ }
        }
    } catch {
        db?.close();
        db = null; // Private browsing can disable IndexedDB; changes stay in memory.
    }

    async function put(path, node) {
        fileSystem.put(path, node);
        if (!db) return;
        const persisted = node.type === 'directory' ? { ...node, children: {} } : node;
        await transaction(db, 'readwrite', store => store.put({ path, action: 'put', node: persisted }));
    }

    async function putMany(items) {
        if (db) await transaction(db, 'readwrite', store => {
            for (const { path, node } of items) store.put({ path, action: 'put', node });
        });
        for (const { path, node } of items) fileSystem.put(path, node);
    }

    async function remove(path) {
        fileSystem.remove(path);
        if (!db) return;
        await transaction(db, 'readwrite', store => {
            const range = IDBKeyRange.bound(path, `${path}\uffff`);
            store.openCursor(range).onsuccess = event => {
                const cursor = event.target.result;
                if (!cursor) return;
                if (cursor.key === path || cursor.key.startsWith(`${path}/`)) cursor.delete();
                cursor.continue();
            };
            if (basePaths.has(path)) store.put({ path, action: 'delete' });
        });
    }

    async function reset() {
        if (db) await transaction(db, 'readwrite', store => store.clear());
    }

    return { put, putMany, remove, reset, persistent: Boolean(db) };
}

export async function readOverlayContent(path) {
    let db;
    try {
        db = await openDatabase();
        const record = await transaction(db, 'readonly', store => store.get(path));
        return record?.action === 'put' ? record.node?.content ?? null : null;
    } catch {
        return null;
    } finally {
        db?.close();
    }
}
