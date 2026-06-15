import { result } from '../core/result.js';

export function createTextCommands(read) {
    const lines = text => text.match(/[^\n]*\n|[^\n]+$/g) || [];
    const input = async (name, argv, context) => {
        if (!argv.length) return context.stdin ?? '';
        return (await Promise.all(argv.map(path => path === '-' ? context.stdin ?? '' : read(name, path, context)))).join('');
    };
    const command = run => ({ run: (_, context) => run(context.argv, context) });
    const slice = (name, last) => command(async (argv, ctx) => {
        argv = [...argv];
        let count = 10;
        if (argv[0] === '-n') {
            argv.shift(); const value = argv.shift();
            if (!/^\d+$/.test(value || '')) throw new Error(`${name}: Invalid line count`);
            count = Number(value);
        }
        const all = lines(await input(name, argv, ctx));
        return result((count === 0 ? [] : last ? all.slice(-count) : all.slice(0, count)).join(''));
    });
    return {
        echo: command(argv => {
            const noNewline = argv[0] === '-n';
            return result((noNewline ? argv.slice(1) : argv).join(' ') + (noNewline ? '' : '\n'));
        }),
        printf: command(argv => {
            const [format = '', ...values] = argv;
            if (/%(?![%s])/.test(format)) throw new Error('printf: Only %s and %% are supported');
            const consumesValues = (format.match(/%%|%s/g) || []).includes('%s');
            let index = 0, text = '';
            do {
                text += format.replace(/\\([ntr\\])|%([%s])/g, (_, escape, spec) => escape
                    ? ({ n: '\n', t: '\t', r: '\r', '\\': '\\' })[escape]
                    : spec === '%' ? '%' : values[index++] ?? '');
            } while (index < values.length && consumesValues);
            return result(text);
        }),
        cat: command(async (argv, ctx) => result(await input('cat', argv, ctx))),
        head: slice('head', false), tail: slice('tail', true),
        grep: command(async (argv, ctx) => {
            argv = [...argv]; let insensitive = false, invert = false, numbered = false;
            while (argv[0]?.startsWith('-') && argv[0] !== '-') {
                const option = argv.shift();
                if (option === '--') break;
                if (!/^-[ivn]+$/.test(option)) throw new Error(`grep: Unknown option: ${option}`);
                insensitive ||= option.includes('i'); invert ||= option.includes('v'); numbered ||= option.includes('n');
            }
            let pattern = argv.shift();
            if (pattern === undefined) throw new Error('grep: Missing pattern');
            if (insensitive) pattern = pattern.toLowerCase();
            const matches = lines(await input('grep', argv, ctx)).flatMap((line, i) => {
                const text = line.replace(/\r?\n$/, '');
                const match = (insensitive ? text.toLowerCase() : text).includes(pattern);
                return match !== invert ? [`${numbered ? `${i + 1}:` : ''}${text}\n`] : [];
            });
            return result(matches.join(''), matches.length ? 0 : 1);
        }),
        wc: command(async (argv, ctx) => {
            argv = [...argv]; let flags = '';
            while (/^-/.test(argv[0] || '') && argv[0] !== '-') {
                const option = argv.shift();
                if (option === '--') break;
                if (!/^-[lwmc]+$/.test(option)) throw new Error(`wc: Unknown option: ${option}`);
                flags += option.slice(1);
            }
            const columns = [...new Set(flags || 'lwc')];
            const labels = { l: 'Lines', w: 'Words', m: 'Characters', c: 'Bytes' };
            const count = text => ({
                l: (text.match(/\n/g) || []).length,
                w: text.trim() ? text.trim().split(/\s+/).length : 0,
                m: [...text].length,
                c: new TextEncoder().encode(text).length,
            });
            const sources = argv.length ? argv : [null];
            const rows = await Promise.all(sources.map(async path => ({
                name: path,
                counts: count(await input('wc', path === null ? [] : [path], ctx)),
            })));
            if (rows.length > 1) {
                rows.push({ name: 'total', counts: Object.fromEntries(columns.map(flag => [flag,
                    rows.reduce((sum, row) => sum + row.counts[flag], 0)])) });
            }
            const widths = columns.map(flag => Math.max(labels[flag].length, ...rows.map(row => String(row.counts[flag]).length)));
            const format = (values, name) => values.map((value, i) => String(value).padStart(widths[i])).join('  ') + (name === null ? '' : `  ${name}`);
            return result([
                format(columns.map(flag => labels[flag]), argv.length ? 'File' : null),
                ...rows.map(row => format(columns.map(flag => row.counts[flag]), row.name)),
            ].join('\n') + '\n');
        }),
        sort: command(async (argv, ctx) => {
            const options = argv.filter(arg => /^-[rnu]+$/.test(arg)).join('');
            const files = argv.filter(arg => !/^-[rnu]+$/.test(arg));
            let values = lines(await input('sort', files, ctx)).map(line => line.replace(/\r?\n$/, ''));
            values.sort((a, b) => options.includes('n') ? (parseFloat(a) || 0) - (parseFloat(b) || 0) : a < b ? -1 : a > b ? 1 : 0);
            if (options.includes('r')) values.reverse();
            if (options.includes('u')) values = [...new Set(values)];
            return result(values.map(line => line + '\n').join(''));
        }),
        uniq: command(async (argv, ctx) => {
            const count = argv[0] === '-c';
            const groups = [];
            for (const line of lines(await input('uniq', count ? argv.slice(1) : argv, ctx))) {
                const value = line.replace(/\r?\n$/, '');
                if (groups.at(-1)?.value === value) groups.at(-1).count++;
                else groups.push({ value, count: 1 });
            }
            return result(groups.map(group => `${count ? `${group.count} ` : ''}${group.value}\n`).join(''));
        }),
        true: command(() => result()),
        false: command(() => result('', 1)),
    };
}
