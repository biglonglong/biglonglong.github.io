import { parseLine } from './parser.js';
import { result } from './result.js';
import { executeProgram, resolveProgram } from './programs.js';

export function createExecutor({ commands, shell, fileSystem, writeText, textInput, programRuntime }) {
    async function expandEchoCommands(value, depth, signal) {
        const substitutions = [...value.matchAll(/\{([^{}]+)\}/g)];
        if (!substitutions.length) return value;
        if (depth >= 8) throw new Error('echo: Maximum substitution nesting reached');
        let expanded = '', offset = 0;
        for (const match of substitutions) {
            expanded += value.slice(offset, match.index);
            let stdout = '', stderr = '';
            const code = await execute(match[1], output => {
                stdout += output.stdout || '';
                stderr += output.stderr || '';
            }, depth + 1, signal);
            if (signal?.aborted) return expanded;
            if (code !== 0) throw new Error(`echo: ${stderr.trim() || `Command failed: ${match[1]}`}`);
            expanded += stdout.replace(/\r?\n+$/, '');
            offset = match.index + match[0].length;
        }
        return expanded + value.slice(offset);
    }

    async function execute(raw, emit = () => {}, depth = 0, signal) {
        let status = shell.state.status || 0;
        try {
            for (const job of parseLine(raw)) {
                if (signal?.aborted) break;
                if (job.condition === '&&' && status !== 0 || job.condition === '||' && status === 0) continue;
                let stdin;
                for (const [index, stage] of job.pipeline.entries()) {
                    if (signal?.aborted) break;
                    const [name, ...rawArgv] = stage.argv;
                    const argv = rawArgv.map(value => value.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g,
                        (_, braced, bare) => shell.state.env[braced || bare] ?? ''));
                    let output;
                    let destination;
                    try {
                        const command = Object.hasOwn(commands, name) ? commands[name] : null;
                        const streaming = job.pipeline.length > 1 || stage.redirects.length > 0;
                        if (command?.presentation && streaming) throw new Error(`${name}: Interactive command does not support streams`);
                        for (const redirect of stage.redirects) {
                            if (redirect.op === '<') stdin = await textInput(name, redirect.path, {});
                            else {
                                await writeText(redirect.path, '', redirect.op === '>>');
                                destination = redirect;
                            }
                        }
                        if (name === 'bash') {
                            if (depth >= 8) throw new Error('bash: Maximum script nesting reached');
                            if (argv.length !== 1) throw new Error('bash: Use bash <file>');
                            const script = await textInput('bash', argv[0], {});
                            let stdout = '', stderr = '', code = 0;
                            for (const line of script.split(/\r?\n/)) {
                                if (signal?.aborted) break;
                                if (!line.trim()) continue;
                                code = await execute(line, value => {
                                    stdout += value.stdout || '';
                                    stderr += value.stderr || '';
                                }, depth + 1, signal);
                            }
                            output = result(stdout, code, stderr);
                        } else if (command) {
                            if (name === 'echo') {
                                for (let i = 0; i < argv.length; i++) argv[i] = await expandEchoCommands(argv[i], depth, signal);
                            }
                            const value = await command.run(argv.join(' '), { argv, stdin, signal });
                            output = command.presentation ? { ...result(), html: value } : value || result();
                        } else {
                            const found = resolveProgram(fileSystem, shell, name);
                            if (found.node?.type !== 'executable') output = result('', 127, `${name}: command not found\n`);
                            else if (!shell.canAccess(found.path)) output = result('', 126, `${name}: Permission denied\n`);
                            else {
                                const write = streaming ? undefined : chunk => { if (!signal?.aborted) emit({ ...result(chunk), stream: true }); };
                                output = result(await executeProgram(found.node, name, { argv, stdin, runtime: programRuntime, write, signal }));
                            }
                        }
                        if (signal?.aborted) break;
                        if (destination) {
                            await writeText(destination.path, output.stdout, true);
                            output = { ...output, stdout: '' };
                        }
                    } catch (error) {
                        if (signal?.aborted) break;
                        output = result('', 1, `${error.message}\n`);
                    }
                    if (output.stderr) emit(result('', output.code, output.stderr));
                    if (index === job.pipeline.length - 1) emit({ ...output, stderr: '' });
                    stdin = output.stdout;
                    status = output.code;
                }
            }
        } catch (error) { if (!signal?.aborted) { status = 2; emit(result('', status, `${error.message}\n`)); } }
        if (signal?.aborted) status = 130;
        shell.state.status = status;
        return status;
    }
    return { execute };
}
