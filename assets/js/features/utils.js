export function onIdle(callback) {
    if ('requestIdleCallback' in window) return window.requestIdleCallback(callback);
    return window.setTimeout(callback, 100);
}

export function frameThrottle(callback) {
    let pending = false;
    return () => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
            pending = false;
            callback();
        });
    };
}
