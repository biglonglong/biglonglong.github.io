// Parse only the text before the cursor; incomplete quotes are valid while typing.
export function completionContext(raw) {
    const tokens = [];
    let value = '', start = 0, started = false, quote = null;
    const flush = end => {
        if (started) tokens.push({ value, start, end });
        value = ''; started = false;
    };
    for (let i = 0; i < raw.length; i++) {
        const char = raw[i];
        if (char === '\\' && quote !== "'" && i + 1 < raw.length) {
            if (!started) start = i;
            started = true;
            value += raw[++i];
        } else if (quote) {
            if (char === quote) quote = null;
            else value += char;
        } else if (char === '"' || char === "'") {
            if (!started) start = i;
            started = true; quote = char;
        } else if (/\s/.test(char)) {
            flush(i);
        } else if ('|&;<>'.includes(char)) {
            flush(i);
            const op = ['|', '&', '>'].includes(char) && raw[i + 1] === char ? char + raw[++i] : char;
            tokens.push({ op, end: i + 1 });
        } else {
            if (!started) start = i;
            started = true; value += char;
        }
    }
    const partial = started ? { value, start, quote } : { value: '', start: raw.length, quote: null };
    const commandTokens = [];
    for (const token of tokens) {
        if (['|', '||', '&&', ';'].includes(token.op)) commandTokens.length = 0;
        else commandTokens.push(token);
    }
    const redirect = ['<', '>', '>>'].includes(commandTokens.at(-1)?.op);
    const words = commandTokens.filter(token => !token.op).map(token => token.value);
    return { ...partial, words: [...words, partial.value], command: words[0], commandPosition: !words.length && !redirect, redirect };
}

export function quoteCompletion(value, quote, close = false) {
    if (quote === '"') return `"${value.replace(/[\\"$]/g, '\\$&')}${close ? '"' : ''}`;
    if (quote === "'") return `'${value.replace(/'/g, "'\\''")}${close ? "'" : ''}`;
    return value.replace(/[\s\\|&;<>'"$]/g, '\\$&');
}
