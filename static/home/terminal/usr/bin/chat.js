const DEFAULT_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B';
export const PROVIDERS = {
    siliconflow: { url: DEFAULT_API_URL, model: DEFAULT_MODEL },
    openai: { url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-5.6-sol' },
    deepseek: { url: 'https://api.deepseek.com/chat/completions', model: 'deepseek-flash' },
};

const CONFIG = {
    CHAT_API_KEY: { site: 'chatApiKey', defaultValue: '' },
    CHAT_API_URL: { site: 'chatApiUrl', defaultValue: DEFAULT_API_URL },
    CHAT_MODEL: { site: 'chatModel', defaultValue: DEFAULT_MODEL },
};

export function resolveChatConfig(runtime, name) {
    const config = CONFIG[name];
    if (!config) throw new Error(`chat: Unknown configuration: ${name}`);
    const candidates = [
        ['export', runtime?.exported?.[name]],
        ['set', runtime?.getSetting?.(name)],
        ['hugo.yaml', runtime?.[config.site]],
        ['program default', config.defaultValue],
    ];
    const [source, value] = candidates.find(([, candidate]) => candidate) || ['unconfigured', ''];
    return { source, value };
}

export async function run({ argv = [], stdin = '', runtime, write, signal } = {}) {
    const prompt = argv.join(' ').trim() || stdin.trim();
    if (!prompt) throw new Error('chat: Enter a question');
    const apiKey = resolveChatConfig(runtime, 'CHAT_API_KEY').value;
    const apiUrl = resolveChatConfig(runtime, 'CHAT_API_URL').value;
    const model = resolveChatConfig(runtime, 'CHAT_MODEL').value;
    if (!apiKey) throw new Error('chat: Set CHAT_API_KEY with export or set, or configure chatApiKey in hugo.yaml');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` };

    let response;
    try {
        response = await fetch(apiUrl, {
            method: 'POST', headers, signal,
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: 'Be a concise terminal AI assistant.' },
                    { role: 'user', content: prompt },
                ],
                max_tokens: 300,
                stream: true,
            }),
        });
    } catch { throw new Error('chat: Could not connect to the service'); }
    if (!response.ok) {
        let detail = '';
        try {
            const body = await response.json();
            detail = typeof body?.message === 'string' ? body.message.slice(0, 200) : '';
        } catch { /* Some providers return non-JSON errors. */ }
        const hint = response.status === 402 ? 'Check the provider account balance or credits'
            : response.status === 401 ? 'Check the API key' : '';
        throw new Error(`chat: Service unavailable (HTTP ${response.status})${detail ? `: ${detail}` : hint ? `: ${hint}` : ''}`);
    }
    if (!response.body) throw new Error('chat: Service returned no response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let finished = false;
    const parseEvent = line => {
        if (signal?.aborted) return;
        if (!line.startsWith('data:')) return;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') { finished = true; return; }
        if (!payload) return;
        try {
            const content = JSON.parse(payload).choices?.[0]?.delta?.content;
            if (typeof content === 'string' && content) {
                fullContent += content;
                write?.(content);
            }
        } catch { /* Ignore malformed stream events; keep valid text. */ }
    };
    try {
        while (!finished) {
            const { done, value } = await reader.read();
            if (signal?.aborted) break;
            buffer += decoder.decode(value, { stream: !done });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) parseEvent(line.trimEnd());
            if (done) break;
        }
        if (buffer) parseEvent(buffer.trimEnd());
    } catch { throw new Error('chat: Response interrupted'); }
    if (finished && reader.cancel) await reader.cancel().catch(() => {});
    if (signal?.aborted) return '';
    if (!fullContent) throw new Error('chat: Empty response');
    try { runtime.speak?.(fullContent); } catch { /* Speech is optional. */ }
    if (write) { write('\n'); return ''; }
    return fullContent + '\n';
}
