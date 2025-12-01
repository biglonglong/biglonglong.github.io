
async function getPosition() {
    position_data = {};
    const apiUrl = 'https://ipapi.co/json/';
    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            position_json = await response.json();
            position_data = position_json;
        }
    } catch (error) {
        console.log('cannot fetch position', error);
    }
    return position_data;
}

async function getNews() {
    news_data = {};
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const apiUrl = encodeURIComponent(`https://gnews.io/api/v4/top-headlines?token=${gnewsApiKey}&lang=en&max=3`);
    try {
        const response = await fetch(proxyUrl + apiUrl);
        if (response.ok) {
            const news_json = await response.json();
            const availableNews = news_json.articles.filter(article => article.title && article.title !== '[Removed]');
            if (availableNews.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableNews.length);
                news_data = availableNews[randomIndex];
            }
        }
    } catch (error) {
        console.log('cannot fetch news', error);
    }
    return news_data;
}

async function getWeather(lat, lon) {
    if (!lat || !lon) return {};

    weather_data = {};
    const curApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openweatherApiKey}&units=metric`;
    const nextApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openweatherApiKey}&units=metric`;
    try {
        const [curResponse, nextResponse] = await Promise.allSettled([fetch(curApiUrl), fetch(nextApiUrl)]);
        if (curResponse.status === 'fulfilled' && curResponse.value.ok) {
            const cur_json = await curResponse.value.json();
            weather_data.current = cur_json;
        }
        if (nextResponse.status === 'fulfilled' && nextResponse.value.ok) {
            const next_json = await nextResponse.value.json();
            weather_data.next = next_json.list?.[0];
        }
    } catch (error) {
        console.log('cannot fetch weather', error);
    }
    return weather_data;
}

class simpleTTS {
    constructor() {
        this.queue = [];
        this.synth = window.speechSynthesis;
        this.isPlaying = false;
    }

    speak(text, force = false) {
        if (!text || !this.synth) return;
        if (force) {
            this.clear();
        }

        this.queue.push(text);
        this._process();
    }

    _process() {
        if (this.isPlaying || this.queue.length === 0) return;

        this.isPlaying = true;
        const text = this.queue.shift();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.6;
        utterance.pitch = 0.8;
        utterance.volume = 0.6;

        utterance.onend = () => {
            this.isPlaying = false;
            this._process();
        };
        utterance.onerror = () => {
            this.isPlaying = false;
            this._process();
        };

        this.synth.speak(utterance);
    }

    clear() {
        this.queue = [];
        this.synth.cancel();
        this.isPlaying = false;
    }
}

(function () {
    /* --- Initial Setup --- */
    let isAdmin = false;
    let commandHistory = [];
    const MAX_HISTORY = 100;
    let historyIndex = -1;
    let terminalConfig = {
        theme: 'dark',
        alias: {
            'whoami': 'cat contact.txt',
        }
    };

    initTheme();
    getPosition().then(position_data => {
        const titleElement = document.getElementById('terminal-title');
        titleElement.textContent = `${navigator.userAgentData?.platform || 'guest'}.${navigator.userAgentData?.brands?.[0]?.brand || ''}
            @${position_data.ip || 'localhost'}: ~ (zsh)`;

        WELCOME_MSG = `Last login on ttys001 at ${new Date().toString().split(' GMT')[0]} via ${position_data.org || 'Internet'}`;
        if (position_data.latitude && position_data.longitude) {
            WELCOME_MSG += ` (${position_data.latitude.toFixed(4)}, ${position_data.longitude.toFixed(4)})`;
        }
        WELCOME_MSG += '<br>Welcome to my interactive terminal! Type `help` to see available commands.';
        printOutput(WELCOME_MSG, 'output-pre');
    });

    let fuse;
    initSearchIndex();
    let tts = new simpleTTS();

    const terminalWindow = document.getElementById('terminal-window');
    const inputLine = document.querySelector('.input-line');
    const inputElement = document.getElementById('cmd-input');
    const outputElement = document.getElementById('history-output');

    /* --- Data and Commands --- */
    const data = {
        help: ` 
            <span class='output-begin'># List of available commands:</span><br>
            <span class='table-key'>COMMAND</span> <span class='table-key'>DESCRIPTION</span><br>
            <hr class='divider-level-two'>
                <span class='table-val'>ls (-a)</span>
                <span class='table-val-another'>List directory contents (including hidden)</span><br>
                <span class='table-val'>cat &lt;file&gt;</span>
                <span class='table-val-another'>Display file contents</span><br>
                <span class='table-val'>cd &lt;dir&gt;</span>
                <span class='table-val-another'>Change directory</span><br>
                <span class='table-val'>bash &lt;exe&gt;</span>
                <span class='table-val-another'>Down or exe program (such as \`bash surprise.exe\`)</span><br>
                <span class='table-val'>whoami</span>
                <span class='table-val-another'>Display user info</span><br>
                <span class='table-val'>hello</span>
                <span class='table-val-another'>Say \`hello\`</span><br>
                <span class='table-val'>fortune</span>
                <span class='table-val-another'>Display a random quote</span><br>
                <span class='table-val'>search &lt;keys&gt;</span>
                <span class='table-val-another'>Search content</span><br>
                <span class='table-val'>chat &lt;prompt&gt;</span>
                <span class='table-val-another'>Chat with AI</span><br>
                <span class='table-val'>clear</span>
                <span class='table-val-another'>Clear the screen</span><br>
                <span class='table-val'>help</span>
                <span class='table-val-another'>Show this help message</span><br>
                <span class='table-val'>sudo &lt;pwd&gt;</span>
                <span class='table-val-another'>Get admin rights</span><br>
                <span class='table-val'>history</span>
                <span class='table-val-another'>Show command history</span><br>
                <span class='table-val'>set &lt;key&gt; &lt;value&gt;</span>
                <span class='table-val-another'>Set configuration values</span><br>
                <span class='info-tail'>:... </span>
            <hr class='divider-level-two'>
            <span class='output-end'>Tip: Commands are case-insensitive, arguments are auto-trimmed</span><br>
            `,

        list: `
            <span class='file-dir'>Projects/</span>&nbsp;&nbsp;
            <span class='file-dir'>Blogs/</span>&nbsp;&nbsp;
            <span>README.md</span>&nbsp;&nbsp;
            <span>contact.txt</span>&nbsp;&nbsp;
            <span>skills.json</span>
            `,
        listall: `
            <span class='file-hidden'>.zshrc</span>&nbsp;&nbsp;
            <span class='file-sh'>surprise.exe</span>&nbsp;&nbsp;
            <span class='file-dir'>Projects/</span>&nbsp;&nbsp;
            <span class='file-dir'>Blogs/</span>&nbsp;&nbsp;
            <span>README.md</span>&nbsp;&nbsp;
            <span>contact.txt</span>&nbsp;&nbsp;
            <span>skills.json</span>
            `,

        bio: `
            <div>
                Hello! I'm <span class='info-key'>biglonglong</span>.<br>A curious Developer who specializes in converting coffee to code.
            </div>
            `,
        contact: `
            <div>
                Email: <a href='mailto:1522262926@qq.com' target='_blank' class='terminal-link'>1522262926@qq.com</a><br>
                GitHub: <a href='https://github.com/biglonglong' target='_blank' class='terminal-link'>github.com/biglonglong</a>
            </div>
            `,
        skills: `
            ${formatJson({
            algorithms: {
                llm: ['Prompt', 'RAG', 'Tools', 'Fine-tuning', 'RL'],
                ad: ['Decision', 'Planning', 'Mining']
            },
            tools: ['ROS', 'PyTorch', 'TensorFlow', 'Docker', 'Git']
        }, 'const stack = ')}
            </div>
            `,

        redirectMap: {
            'blogs/': '/home/posts',
            'projects/': 'https://github.com/biglonglong?tab=repositories'
        },
        binMap: {
            'surprise.exe': '../surprise.exe',
        },
        quotes: [
            "There are only 10 types of people in this world: those who understand binary and those who don't.",
            'Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live.',
            'If debugging is the process of removing software bugs, then programming must be the process of putting them in.',
            'The best thing about a boolean is that even if you are wrong, you are only off by a bit.',
            'A good programmer is someone who always looks both ways before crossing a one-way street.',
            'The most important tool for a programmer is a rubber duck.'
        ]
    };

    const commands = {
        ls: (args) => {
            if (args === '' || args === '.') return data.list;

            const target = args.trim().toLowerCase();
            if (target === '-a') return data.listall;
            return `<span class='st-error'>ls: Cannot Access '${args}'</span>`;
        },
        cat: (args) => {
            if (args === '') return `<span class='st-error'>cat: Missing Operand</span>`;

            const target = args.trim().toLowerCase();
            if (target === 'readme.md') return data.bio;
            if (target === 'contact.txt') return data.contact;
            if (target === 'skills.json') return data.skills;
            if (target === '.zshrc') {
                if (isAdmin) return formatJson(terminalConfig);
                return `<span class='st-warning'>cat: Permission Denied: '${args}'</span>`;
            }
            return `<span class='st-error'>cat: No Such File: '${args}'</span>`;
        },
        cd: (args) => {
            if (args === '') return `<span class='st-error'>cd: Missing Operand</span>`;

            const target = args.trim().toLowerCase();
            if (data.redirectMap[target]) {
                window.location.href = data.redirectMap[target];
                return `<span class='output-end'>Redirecting...</span>`;
            }
            return `<span class='st-error'>cd: No Such Directory: '${args}'</span>`;
        },
        whoami: () => data.bio,
        fortune: () => {
            const randomIndex = Math.floor(Math.random() * data.quotes.length);
            return `<div class='quote-block'>${data.quotes[randomIndex]}</div>`;
        },

        sudo: (args) => {
            if (args === '') return `<span class='st-error'>sudo: Missing Operand</span>`;

            if (args !== password) return `<span class='st-error'>Incorrect Password</span>`;
            if (isAdmin) return `<span class='st-warning'>Already in Admin Mode</span>`;
            isAdmin = true;
            return `<span class='st-success'>Admin Mode Enabled</span>`;
        },
        bash: (args) => {
            if (args === '') return `<span class='st-error'>bash: Missing Operand</span>`;

            const target = args.trim().toLowerCase();
            if (data.binMap[target]) {
                window.location.href = data.binMap[target];
                return `<span class='st-warning'>Downloading <span class='info-key'>${args}</span>! Manual Run Please</span>`;
            }
            return `<span class='st-error'>bash: No Such Sh: ${args}</span>`;
        },
        history: () => {
            if (commandHistory.length === 0) return "<span class='st-warning'>No Commands in History</span>";

            let html = '';
            commandHistory.forEach((cmd, index) => {
                html += `<div>
                    <span class='list-number'>${(index + 1).toString().padStart(3)}</span>
                    &nbsp;&nbsp;
                    <span class='list-value'>${escapeHtml(cmd)}</span>
                </div>`;
            });
            return html;
        },
        set: (args) => {
            const parts = args.trim().split(' ');
            if (parts.length < 2) return `<span class='st-error'>set: Missing Operands</span>`;

            const key = parts[0].toLowerCase();
            const value = parts.slice(1).join(' ').toLowerCase();

            if (key === 'theme') {
                if (value !== 'dark' && value !== 'light') {
                    return `<span class='st-error'>set: Invalid Value for 'theme'. Use 'dark' or 'light'.</span>`;
                }
                setTheme(value);
                return `<span class='st-success'>Theme set to '${value}'</span>`;
            }
            return `<span class='st-error'>set: Unknown Configuration Key: '${key}'</span>`;
        },

        search: (args) => {
            if (args === '') return `<span class='st-info'>💡 Usage:</span> <code>search &lt;keyword&gt;</code> — e.g., <code>search path planning</code>`;
            if (!fuse) return `<span class='st-error'>Search index Load Failed, Refresh Please</span>`;
            return searchIndex(args);
        },
        chat: (args) => {
            if (args === '') return `<span class='st-info'>💡 Usage:</span> <code>chat &lt;question&gt;</code> — e.g., <code>chat What is reinforcement learning?</code>`;

            printOutput('🤖 Thinking...', 'output-begin');
            inputLine.style.display = 'none';
            askAIAndPrint(args).finally(() => {
                inputLine.style.display = 'flex';
                scrollToBottom();
                inputElement.focus();
            });
            return;
        },
        hello: () => {
            printOutput("🥹!!! I'm biglonglong?long？", 'output-begin');
            inputLine.style.display = 'none';
            Promise.allSettled([
                getNews(),
                getWeather(position_data.latitude, position_data.longitude)
            ])
                .then((results) => {
                    const [newsResult, weatherResult] = results;
                    const news_data = newsResult.status === 'fulfilled' ? newsResult.value : {};
                    const weather_data = weatherResult.status === 'fulfilled' ? weatherResult.value : {};
                    sayHello(news_data, weather_data);
                    inputLine.style.display = 'flex';
                    scrollToBottom();
                    inputElement.focus();
                });
            return;
        },

        clear: () => {
            outputElement.innerHTML = '';
            return;
        },
        help: () => data.help,
    };

    const tabNames = [
        ...Object.keys(commands),
        ...Object.keys(terminalConfig),
        '.zshrc',
        'README.md',
        'contact.txt',
        'skills.json',
        'Projects/',
        'Blogs/',
        'surprise.exe',
        'light',
        'dark'
    ];

    /* --- Core Logic --- */
    inputElement.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (commandHistory.length === 0) return;
            e.preventDefault();

            if (historyIndex === -1) {
                this.dataset.currentInput = this.value;
            }

            if (e.key === 'ArrowUp') {
                historyIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
            } else {
                historyIndex = (historyIndex >= 0 && historyIndex < commandHistory.length - 1) ? historyIndex + 1 : -1;
            }
            this.value = historyIndex === -1 ? (this.dataset.currentInput || '') : commandHistory[historyIndex];
            this.setSelectionRange(this.value.length, this.value.length);
        } else historyIndex = -1;

        if (e.ctrlKey && e.key === 'c') {
            const hasInputSelection = this.selectionStart !== this.selectionEnd;
            if (hasInputSelection) return;
            e.preventDefault();

            showCommandLine(this.value + "<span class='st-error'> ^C</span>");
            this.value = '';
            scrollToBottom();
        }

        else if (e.key === 'Tab') {
            e.preventDefault();

            const currentInput = this.value;
            const words = currentInput.split(' ');
            const lastWord = words[words.length - 1];
            if (lastWord === '') return;

            const matches = tabNames.filter(item =>
                item.toLowerCase().startsWith(lastWord.toLowerCase())
            );
            if (matches.length === 1) {
                words[words.length - 1] = matches[0];
                this.value = words.join(' ');
            } else if (matches.length > 1) {
                let commonPrefix = matches.reduce((prefix, word) => {
                    let i = 0;
                    while (i < prefix.length && i < word.length && prefix[i].toLowerCase() === word[i].toLowerCase()) {
                        i++;
                    }
                    return prefix.slice(0, i);
                }, matches[0]);

                if (commonPrefix.length > lastWord.length) {
                    words[words.length - 1] = commonPrefix;
                    this.value = words.join(' ');
                } else {
                    showCommandLine(currentInput + '<span class="st-warning"> ^Tab</span>');
                    printOutput(`<span class='output-begin'>Possible completions:</span><br> ${matches.map(name => escapeHtml(name)).join('&nbsp;&nbsp;')}`);
                    scrollToBottom();
                }
            }
        }

        else if (e.key === 'Enter') {
            showCommandLine(this.value);
            const [cmdName, args] = parseCommand(this.value);
            if (cmdName) {
                const handler = commands[cmdName];
                if (typeof handler === 'function') {
                    try {
                        const result = handler(args);
                        if (result !== null && result !== undefined) {
                            printOutput(result);
                        }
                        commandHistory.push(`${cmdName} ${args || ''}`);
                        if (commandHistory.length > MAX_HISTORY) {
                            commandHistory.shift();
                        }
                    } catch (err) {
                        printOutput(`<span class='st-error'>Error Executing Command: ${err.message}</span>`);
                    }
                } else {
                    printOutput(`<span class='st-error'>Command Not Found: ${cmdName}</span>. Try \`help\`.`);
                }
            }

            this.value = '';
            scrollToBottom();
        }
    });

    function printOutput(html, className = 'command-output') {
        const div = document.createElement('div');
        div.className = className;
        div.innerHTML = html;
        outputElement.appendChild(div);
        return div;
    }

    function showCommandLine(command_html, promptArrow = '➜', promptDir = '~') {
        const cmdLine = document.createElement('div');
        cmdLine.className = 'input-line';
        cmdLine.innerHTML = `
            <span class='prompt-arrow'>${promptArrow}</span>
            <span class='prompt-dir'>${promptDir}</span>
            <span>${command_html}</span>
        `;
        outputElement.appendChild(cmdLine);
    }

    function formatJson(jsonObj, prefix = '') {
        return `<div class='info-json'>${prefix}${JSON.stringify(jsonObj, null, 4)
            .replace(/ /g, '&nbsp;')
            .replace(/\n/g, '<br>')}</div>`;
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function initSearchIndex() {
        return fetch('../index.json')
            .then(r => r.json())
            .then(data => {
                fuse = new Fuse(data, {
                    threshold: 0.4,
                    keys: ['title', 'content']
                });
            });
    }

    function scrollToBottom() {
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
    }

    window.onload = function () {
        inputElement.focus();
    };

    function parseCommand(raw) {
        const trimmed = raw.trim();
        if (!trimmed) return [null, ''];

        const firstSpace = trimmed.indexOf(' ');
        if (firstSpace === -1) {
            return [trimmed.toLowerCase(), ''];
        } else {
            return [trimmed.slice(0, firstSpace).toLowerCase(), trimmed.slice(firstSpace + 1)];
        }
    }

    function searchIndex(query) {
        const results = fuse.search(query);
        if (results.length === 0) return `<span class='st-warning'>No results Found for '${query}'.</span>`;

        let resultHTML = `<span class='st-highlight'>Found ${results.length} result(s) for '${query}':</span><br><br>`;
        results.slice(0, 3).forEach(result => {
            resultHTML += `<div style='margin-bottom:10px;'>
                    <a href='${result.item.permalink}' class='terminal-link'>${result.item.title}</a><br>
                    <span class='info-extract'>${result.item.content.substring(0, 100)}...</span>
                </div>`;
        });
        resultHTML += `<span class='info-tail'>:... </span>`;
        return resultHTML;
    }

    async function askAIAndPrint(prompt) {
        try {
            const { fetchUrl, fetchModel, fetchMethod, fetchHeader } = isAdmin
                ? {
                    fetchUrl: 'https://console-chat.biglonglong.workers.dev/v1/chat/completions',
                    fetchModel: 'qwen-flash',
                    fetchMethod: 'POST',
                    fetchHeader: {
                        'Content-Type': 'application/json',
                    },
                }
                : {
                    fetchUrl: 'https://api.siliconflow.cn/v1/chat/completions',
                    fetchModel: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
                    fetchMethod: 'POST',
                    fetchHeader: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${siliconApiKey}`,
                    },
                };

            const fetchBody = JSON.stringify({
                model: fetchModel,
                messages: [
                    { role: 'system', content: 'Be a concise terminal AI assistant.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 80,
                stream: true,
            })

            const response = await fetch(fetchUrl, {
                method: fetchMethod,
                headers: fetchHeader,
                body: fetchBody
            });

            if (!response.ok) {
                const errorText = await response.text();
                printOutput(`<span class='st-error'>❌ Worker Failed (${response.status}): ${errorText}</span>`);
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullContent = '';
            let chatDiv = printOutput('');
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const content = data.choices[0]?.delta?.content || '';
                            if (content) {
                                fullContent += content;
                                const span = document.createElement('span');
                                span.textContent = content;
                                chatDiv.appendChild(span);
                                scrollToBottom();
                            }
                        } catch (e) {
                            console.warn('Parse error in SSE:', line, e);
                        }
                    }
                }
            }
            tts.speak(fullContent, true);

        } catch (err) {
            printOutput(`<span class='st-error'>❌ Chat Error: ${err.message}</span>`);
        }
    };

    function sayHello(news_data, weather_data) {
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const now = new Date();
        // const year = now.getFullYear();
        // const month = now.getMonth();
        // const day = now.getDate();
        const weekday = now.getDay();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        let greeting = 'Hello👋!';
        if (hours >= 5 && hours < 12) {
            greeting = 'Good morning☀️!';
        } else if (hours >= 12 && hours < 18) {
            greeting = 'Good afternoon🌤️!';
        } else if (hours >= 18 && hours < 22) {
            greeting = 'Good evening🌙!';
        } else if (hours >= 22 && hours < 24) {
            greeting = 'Good night🌠!';
        } else {
            greeting = 'Still up? Good... uh... quiet time🌌!';
        }

        let windLevel = '';
        const windSpeed = weather_data.current?.wind?.speed;
        if (windSpeed !== undefined) {
            if (windSpeed < 1) windLevel = 'Air Calm.';
            else if (windSpeed < 5) windLevel = 'Light Breeze.';
            else if (windSpeed < 11) windLevel = 'Gentle Breeze.';
            else if (windSpeed < 19) windLevel = 'Moderate Breeze.';
            else if (windSpeed < 28) windLevel = 'Fresh Breeze.';
            else windLevel = 'Strong Wind!';
        }

        let rainLevel = '';
        const rainPop = weather_data.next?.pop;
        if (rainPop !== undefined) {
            if (rainPop < 0.2) rainLevel = 'No rain expected for heading outdoors!';
            else if (rainPop < 0.5) rainLevel = 'Light chance of rain, consider taking an umbrella.';
            else if (rainPop < 0.8) rainLevel = 'Moderate chance of rain, better to carry an umbrella.';
            else rainLevel = 'High chance of rain, definitely take an umbrella!';
        }

        let weatherDiff = '';
        const currentDesc = weather_data.current?.weather?.[0]?.description;
        const nextDesc = weather_data.next?.weather?.[0]?.description;
        if (currentDesc && nextDesc && currentDesc !== nextDesc) {
            weatherDiff = ` The weather may change to <span class="info-key">${nextDesc}</span> soon.`;
        } else {
            weatherDiff = 'The weather is expected to remain stable in the coming period.';
        }

        const lastPartList = [
            'Have a fantastic day! 🌟',
            'A wonderful day is just beginning!🌟',
            'Wishing you a productive and joyful day ahead! 🌈',
        ];

        const currentFrom = position_data.city ? ` from 🌆${position_data.city}` : '';
        const currentTime = `<span class="info-key">${hours}:${minutes.toString().padStart(2, '0')}</span>`;
        const currentWeather = (weather_data.current && weather_data.next)
            ? `The weather is <span class="info-key">${weather_data.current.weather[0].description}</span> today, 
                with a current feels-like temperature of <span class="info-key">${Math.round(weather_data.current.main.feels_like)}°C</span>,
                a forecast high of <span class="info-key">${Math.round(weather_data.current.main.temp_max)}°C</span> 
                and a low of <span class="info-key">${Math.round(weather_data.current.main.temp_min)}°C</span>.
                <span class="info-key">${windLevel}</span><br>
                ${weatherDiff} <span class="st-highlight">${rainLevel}</span>`
            : '';
        const topNews = news_data.title
            ? `<span>By the way, here's a top news update for you:</span><br>
                <hr class='divider-level-three'>
                <a href='${news_data.url}' target='_blank' class='terminal-link'>${news_data.title}</a><br>
                <span class='info-extract'>${news_data.description.substring(0, 500) || ''}</span>
                <hr class='divider-level-three'>`
            : '';

        const lastPart = lastPartList[Math.floor(Math.random() * lastPartList.length)];

        const content =
            `<div>
                <span>${greeting} my friend${currentFrom}.</span><br>
                <span>It's ${currentTime} on ${weekdays[weekday]}.</span><br>
                <span>${currentWeather}</span><br>
                <div>${topNews}</div>
                <span>${lastPart}</span>
            </div>`;
        printOutput(content);
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('terminalTheme') || 'dark';
        setTheme(savedTheme);
    }

    function setTheme(theme) {
        const containerElement = document.getElementById('terminal-container');
        if (theme === 'light') {
            containerElement.classList.add('terminal-light');
        } else {
            containerElement.classList.remove('terminal-light');
        }
        terminalConfig.theme = theme;
        localStorage.setItem('terminalTheme', theme);
    }
})();
