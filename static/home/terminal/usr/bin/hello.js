export async function run({ runtime, signal } = {}) {
    const [news, weather] = await Promise.allSettled([
        getNews(runtime.newsKey, signal),
        getWeather(runtime.position.latitude, runtime.position.longitude, runtime.weatherKey, signal),
    ]);
    if (signal?.aborted) return '';
    return formatGreeting(news.status === 'fulfilled' ? news.value : {},
        weather.status === 'fulfilled' ? weather.value : {}, runtime.position);
}

async function getNews(apiKey, signal) {
    if (!apiKey) return {};
    const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://gnews.io/api/v4/top-headlines?token=${apiKey}&lang=en&max=3`)}`;
    const response = await fetch(url, { signal });
    if (!response.ok) return {};
    const data = await response.json();
    const articles = (data.articles || []).filter(article => article.title && article.title !== '[Removed]');
    return articles[Math.floor(Math.random() * articles.length)] || {};
}

async function getWeather(lat, lon, apiKey, signal) {
    if (lat == null || lon == null || !apiKey) return {};
    const base = 'https://api.openweathermap.org/data/2.5/';
    const suffix = `?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const [current, forecast] = await Promise.allSettled([
        fetch(`${base}weather${suffix}`, { signal }), fetch(`${base}forecast${suffix}`, { signal }),
    ]);
    return {
        current: current.status === 'fulfilled' && current.value.ok ? await current.value.json() : undefined,
        next: forecast.status === 'fulfilled' && forecast.value.ok ? (await forecast.value.json()).list?.[0] : undefined,
    };
}

export function formatGreeting(news = {}, weather = {}, position = {}, now = new Date()) {
    const hour = now.getHours();
    const greeting = hour >= 5 && hour < 12 ? 'Good morning ☀️'
        : hour >= 12 && hour < 18 ? 'Good afternoon 🌤️'
            : hour >= 18 && hour < 22 ? 'Good evening 🌙'
                : 'Hello 🌌';
    const lines = [
        `${greeting}${position.city ? ` from ${position.city}` : ''}!`,
        `It's ${now.toLocaleString()}.`,
    ];

    const current = weather.current;
    const forecast = weather.next;
    const description = current?.weather?.[0]?.description;
    const conditions = [];
    if (description) conditions.push(`Weather: ${description}.`);
    if (Number.isFinite(current?.main?.feels_like)) conditions.push(`Feels like ${Math.round(current.main.feels_like)}°C.`);
    if (Number.isFinite(current?.wind?.speed)) conditions.push(`Wind: ${current.wind.speed} m/s.`);
    if (Number.isFinite(forecast?.pop)) conditions.push(`Rain chance: ${Math.round(forecast.pop * 100)}%.`);
    lines.push(conditions.length ? conditions.join(' ') : 'Weather is unavailable right now.');

    if (news.title && /^https?:\/\//i.test(news.url || '')) {
        lines.push(`News: ${news.title}\t${news.url}`);
        if (news.description) lines.push(news.description.slice(0, 500).replace(/\s+/g, ' '));
    }
    return lines.join('\n') + '\n';
}
