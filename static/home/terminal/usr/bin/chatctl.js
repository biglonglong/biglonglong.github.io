import { PROVIDERS, resolveChatConfig } from './chat.js';

const NAMES = { key: 'CHAT_API_KEY', url: 'CHAT_API_URL', model: 'CHAT_MODEL' };

export function complete({ partial, words }) {
    const choices = words.length === 2 ? ['providers', 'status', 'use', 'clear']
        : words[1] === 'use' ? Object.keys(PROVIDERS)
            : words[1] === 'clear' ? Object.keys(NAMES) : [];
    return choices.filter(value => value.startsWith(partial));
}

function status(runtime) {
    const key = resolveChatConfig(runtime, NAMES.key);
    const url = resolveChatConfig(runtime, NAMES.url);
    const model = resolveChatConfig(runtime, NAMES.model);
    const provider = Object.entries(PROVIDERS).find(([, preset]) => preset.url === url.value && preset.model === model.value)?.[0] || 'custom';
    return `Provider: ${provider}\nCHAT_API_KEY: ${key.value ? 'configured' : 'not configured'} (${key.source})\nCHAT_API_URL: ${url.value} (${url.source})\nCHAT_MODEL: ${model.value} (${model.source})\n`;
}

export function run({ argv = [], runtime } = {}) {
    if (argv.length === 0 || (argv.length === 1 && argv[0] === 'providers')) {
        return `Available providers: ${Object.keys(PROVIDERS).join(', ')}\n`;
    }
    if (argv[0] === 'status' && argv.length === 1) return status(runtime);
    if (argv[0] === 'clear' && argv.length === 2) {
        const setting = NAMES[argv[1].toLowerCase()] || Object.values(NAMES).find(name => name === argv[1].toUpperCase());
        if (!setting) throw new Error('chatctl: Use chatctl clear <key|url|model>');
        if (!runtime?.removeSetting) throw new Error('chatctl: Local storage is unavailable');
        runtime.removeSetting(setting);
        return `chatctl: Cleared local ${setting}.\n`;
    }
    const name = argv[1]?.toLowerCase();
    const provider = PROVIDERS[name];
    if (argv[0] !== 'use' || argv.length !== 2 || !provider) {
        throw new Error(`chatctl: Use chatctl status, chatctl clear <key|url|model>, or chatctl use <${Object.keys(PROVIDERS).join('|')}>`);
    }
    if (!runtime?.setSetting) throw new Error('chatctl: Local storage is unavailable');
    runtime.setSetting('CHAT_API_URL', provider.url);
    runtime.setSetting('CHAT_MODEL', provider.model);
    for (const [setting, value] of [[NAMES.url, provider.url], [NAMES.model, provider.model]]) {
        if (runtime.exported) delete runtime.exported[setting];
        if (runtime.env) runtime.env[setting] = value;
    }
    return `chatctl: ${name} selected (${provider.model}). Set CHAT_API_KEY for this provider.\n`;
}
