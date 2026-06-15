// Operators are tokens only outside quotes. No eval or browser DOM is involved.
export function parseLine(raw) {
    const tokens = [];
    let word = '', started = false, quote = null;
    const flush = () => {
        if (started) tokens.push({ word });
        word = ''; started = false;
    };
    for (let i = 0; i < raw.length; i++) {
        const c = raw[i];
        if (c === '\\' && quote !== "'") {
            if (i + 1 === raw.length) throw new Error('Trailing escape');
            const next = raw[++i];
            word += quote === '"' && !['"', '\\', '$', '`', '\n'].includes(next) ? `\\${next}` : next;
            started = true;
        } else if (quote) {
            if (c === quote) quote = null;
            else word += c;
        } else if (c === '"' || c === "'") {
            quote = c; started = true;
        } else if (c === '#' && !started) {
            break;
        } else if (/\s/.test(c)) flush();
        else if ('|&;<>'.includes(c)) {
            flush();
            let op = c;
            if (['|', '&', '>'].includes(c) && raw[i + 1] === c) { op += c; i++; }
            if (op === '&' || (c === '<' && raw[i + 1] === '<')) throw new Error('Background jobs and heredocs are not supported');
            tokens.push({ op });
        } else { word += c; started = true; }
    }
    if (quote) throw new Error('Unclosed quote');
    flush();
    const jobs = [];
    let command = { argv: [], redirects: [] }, pipeline = [], condition = ';';
    const finishCommand = () => {
        if (!command.argv.length) throw new Error('Missing command');
        pipeline.push(command); command = { argv: [], redirects: [] };
    };
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if ('word' in token) command.argv.push(token.word);
        else if (['<', '>', '>>'].includes(token.op)) {
            const target = tokens[++i];
            if (!target || !('word' in target) || !target.word) throw new Error('Missing redirection path');
            command.redirects.push({ op: token.op, path: target.word });
        } else {
            finishCommand();
            if (token.op !== '|') {
                jobs.push({ condition, pipeline }); pipeline = []; condition = token.op;
            }
        }
    }
    if (command.argv.length || command.redirects.length) finishCommand();
    else if (tokens.length && tokens.at(-1).op !== ';') throw new Error('Missing command');
    if (pipeline.length) jobs.push({ condition, pipeline });
    return jobs;
}
