let fuse;
let user_data = `${navigator.userAgentData?.platform || 'guest'}.${navigator.userAgentData?.brands?.[0]?.brand || ''}`;

async function getPosition() {
    position_data = {};
    try {
        const response = await fetch('https://ipapi.co/json/');
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
    try {
        const response = await fetch(`https://gnews.io/api/v4/top-headlines?token=${gnewsApiKey}&lang=en&max=3`);
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
    try {
        const [curResponse, nextResponse] = await Promise.allSettled([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openweatherApiKey}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openweatherApiKey}&units=metric`)
        ]);
        if (curResponse.status === 'fulfilled' && curResponse.value.ok) {
            const cur_json = await curResponse.value.json();
            weather_data.current = cur_json;
        }
        if (nextResponse.status === 'fulfilled' && nextResponse.value.ok) {
            const next_json = await nextResponse.value.json();
            weather_data.next = next_json.list?.[1];
        }
    } catch (error) {
        console.log('cannot fetch weather', error);
    }
    return weather_data;
}

(function () {
    getPosition().then(position_data => {
        const titleElement = document.getElementById('terminal-title');
        titleElement.textContent = `${user_data}@${position_data.ip || 'localhost'}: ~ (zsh)`;

        WELCOME_MSG = "Last login on ttys001 at " + new Date().toString().split(' GMT')[0] + ` via ${position_data.org || 'Internet'}`;
        if (position_data.latitude && position_data.longitude) {
            WELCOME_MSG += ` (${position_data.latitude.toFixed(4)}, ${position_data.longitude.toFixed(4)})`;
        }
        printOutput(WELCOME_MSG, 'front-output');
        printOutput("Welcome to my interactive terminal! Type 'help' to see available commands.", 'front-output');
    });

    const input = document.getElementById('cmd-input');
    const inputHeader = document.querySelector('.input-line');
    const output = document.getElementById('history-output');
    const terminalWindow = document.getElementById('terminal-window');
    initSearchIndex();

    let isAdmin = false;
    let commandHistory = [];
    const MAX_HISTORY = 100;
    let historyIndex = -1;

    // --- 1. Define data and commands here ---
    const data = {
        list: `
            <span style="color:#4daafc; font-weight:bold;">Projects/</span>&nbsp;&nbsp;
            <span style="color:#4daafc; font-weight:bold;">Blogs/</span>&nbsp;&nbsp;
            <span>README.md</span>&nbsp;&nbsp;
            <span>contact.txt</span>&nbsp;&nbsp;
            <span>skills.json</span>
            `,
        listall: `
            <span style="color:#5a5a5a;font-weight:bold;">.config/</span>&nbsp;&nbsp;
            <span style="color:#5a5a5a;">.zshrc</span>&nbsp;&nbsp;
            <span style="color:#4A7B5A;">surprise.exe</span>&nbsp;&nbsp;
            <span style="color:#4daafc; font-weight:bold;">Projects/</span>&nbsp;&nbsp;
            <span style="color:#4daafc; font-weight:bold;">Blogs/</span>&nbsp;&nbsp;
            <span>README.md</span>&nbsp;&nbsp;
            <span>contact.txt</span>&nbsp;&nbsp;
            <span>skills.json</span>
            `,

        bio: `
            <div>
            Hello! I'm <span style="color:#00A3CC; font-weight:bold;">biglonglong</span>.<br>A curious Developer who specializes in converting coffee to code.
            </div>
            `,
        contact: `
            <div>
            Email: <a href="mailto:1522262926@qq.com" target="_blank" class="terminal-link">1522262926@qq.com</a><br>
            GitHub: <a href="https://github.com/biglonglong" target="_blank" class="terminal-link">github.com/biglonglong</a>
            </div>
            `,
        skills: `
            <div class='info-val'>
            const stack = {<br>
            &nbsp;&nbsp;algorithms: {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;llm: ["Prompt", "RAG", "Tools", "Fine-tuning", "RL"],<br>
            &nbsp;&nbsp;&nbsp;&nbsp;ad: ["Decision", "Planning", "Mining"]<br>
            &nbsp;&nbsp;},<br>
            &nbsp;&nbsp;tools: ["ROS", "PyTorch", "TensorFlow", "Docker", "Git"]<br>
            };
            </div>`,
        help: ` 
            <span style="color: #797979; font-style: italic;"># List of available commands</span><br>
            <span class='info-key'>COMMAND</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#DDDDDD;">DESCRIPTION</span><br>
            <hr style="border-top: 1px solid #333; margin: 5px 0;"><br>
            <span class="info-key">ls (-a)</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">List directory contents (including hidden)</span><br>
            <span class="info-key">cat &lt;file&gt;</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Display file contents</span><br>
            <span class="info-key">cd &lt;dir&gt;</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Change directory</span><br>
            <span class="info-key">bash &lt;exe&gt;</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Down or exe program (such as \`bash surprise.exe\`)</span><br>
            <span class="info-key">whoami</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Display user info</span><br>
            <span class="info-key">hello</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Say \`hello\`</span><br>
            <span class="info-key">fortune</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Display a random quote</span><br>
            <span class="info-key">search &lt;keys&gt;</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Search content</span><br>
            <span class="info-key">chat &lt;prompt&gt;</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Chat with AI</span><br>
            <span class="info-key">clear</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Clear the screen</span><br>
            <span class="info-key">help</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Show this help message</span><br>
            <span class="info-key">sudo &lt;pwd&gt;</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Get admin rights</span><br>
            <span class="info-key">history</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Show command history</span><br>
            <span style="color:#797979; font-size: 15px;">:... and other hidden features</span><br><br>
            <span style="color:#797979;">Tip: Commands are case-insensitive, arguments are auto-trimmed</span><br>
            <hr style="border-top: 1px solid #333; margin: 5px 0;">
            `,

        redirectMap: {
            "posts": '/home/posts',
            "projects": 'https://github.com/biglonglong?tab=repositories'
        },
        binMap: {
            "surprise.exe": "../surprise.exe",
        },
        quotes: [
            "There are only 10 types of people in this world: those who understand binary and those who don't.",
            "Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live.",
            "If debugging is the process of removing software bugs, then programming must be the process of putting them in.",
            "The best thing about a boolean is that even if you are wrong, you are only off by a bit.",
            "A good programmer is someone who always looks both ways before crossing a one-way street.",
            "The most important tool for a programmer is a rubber duck."
        ]
    };

    const commands = {
        ls: (args) => {
            if (args === '' || args === '.') return data.list;

            const target = args.trim().toLowerCase();
            if (target === '-a') return data.listall;
            return `<span style="color:#ff5f56">ls: cannot access '${args}': No such file or directory</span>`;
        },
        cat: (args) => {
            if (args === '') return `<span style="color:#ff5f56">cat: missing operand</span>`;

            const target = args.trim().toLowerCase();
            if (target === 'readme.md') return data.bio;
            if (target === 'contact.txt') return data.contact;
            if (target === "skills.json") return data.skills;
            return `<span style="color:#ff5f56">cat: ${args}: No such file or directory</span>`;
        },
        cd: (args) => {
            if (args === '') return `<span style="color:#ff5f56">cd: missing operand</span>`;

            const target = args.trim().toLowerCase();
            if (data.redirectMap[target]) {
                window.location.href = data.redirectMap[target];
                return `<span style="color:#BBBBBB;">Redirecting...</span>`;
            }
            return `<span style="color:#ff5f56">cd: no such directory: ${target}</span>`;
        },
        whoami: () => data.bio,
        fortune: () => {
            const randomIndex = Math.floor(Math.random() * data.quotes.length);
            return `<div style="padding: 5px; border-left: 3px solid #f99157; margin-left: 10px;">${data.quotes[randomIndex]}</div>`;
        },

        sudo: (args) => {
            if (args === '') {
                return `<span style="color:#ff5f56;">Password required</span>`;
            }
            if (isAdmin) {
                return `<span style="color:#FFA500;">Already in admin mode</span>`;
            }

            if (args !== password) {
                return `<span style="color:#ff5f56;">Incorrect password</span>`;
            }
            isAdmin = true;
            return `<span style="color:#4CAF50;">Admin mode enabled</span>`;
        },
        bash: (args) => {
            if (args === '') return `<span style="color:#ff5f56">bash: missing operand</span>`;

            const target = args.trim().toLowerCase();
            if (data.binMap[target]) {
                window.location.href = data.binMap[target];
                return `<div>Downloaded <span class=\"info-val\">${target}</span>! Manual run please.</div>`;
            }
            return `<span style="color:#ff5f56">bash: ${args}: command not found</span>`;
        },
        history: () => {
            if (commandHistory.length === 0) {
                return "<span style=\"color:#BBBBBB;\">No commands in history.</span>";
            }

            let html = '';
            commandHistory.forEach((cmd, index) => {
                html += `<div><span style="color:#797979;">${(index + 1).toString().padStart(3)}&nbsp;&nbsp;</span>${escapeHtml(cmd)}</div>`;
            });
            return html;
        },
        search: (args) => {
            if (args === '') {
                return `<span style="color:#f99157;">💡 Usage:</span> <code>search &lt;keyword&gt;</code> — e.g., <code>search path planning</code>`;
            }
            if (!fuse) {
                return `<span style="color:#ff5f56;">Search index is still loading. Please try again shortly.</span>`;
            }
            return searchIndex(args);
        },
        chat: (args) => {
            // async command handler, return null
            if (args === '') {
                return `<span style="color:#f99157;">💡 Usage:</span> <code>chat &lt;your question&gt;</code> — e.g., <code>chat What is reinforcement learning?</code>`;
            }

            const statusDiv = document.createElement('div');
            statusDiv.className = '.input-line';
            statusDiv.innerHTML = '<span style="color:#797979; font-style: italic; border-left: 2px solid #4A7B5A; padding-left: 8px;">🤖 Thinking...</span>';
            statusDiv.style.opacity = '0.7';
            output.appendChild(statusDiv);

            inputHeader.style.display = 'none';
            askAIAndPrint(args).finally(() => {
                inputHeader.style.display = 'flex';
                statusDiv.remove();
                input.focus();
            });
            return;
        },
        hello: () => {
            Promise.allSettled([
                getNews(),
                getWeather(position_data.latitude, position_data.longitude)
            ]).then((results) => {
                const [newsResult, weatherResult] = results;
                const news_data = newsResult.status === 'fulfilled' ? newsResult.value : {};
                const weather_data = weatherResult.status === 'fulfilled' ? weatherResult.value : {};

                const content = sayHello(news_data, weather_data);
                printOutput(content);

                if (newsResult.status === 'rejected') {
                    console.warn('News fetch failed:', newsResult.reason);
                }
                if (weatherResult.status === 'rejected') {
                    console.warn('Weather fetch failed:', weatherResult.reason);
                }
            }).catch(err => {
                printOutput(`<span style="color:#ff5f56;">Unexpected error: ${err.message}</span>`);
            });

            return;
        },

        clear: () => {
            output.innerHTML = '';
            return;
        },
        help: () => data.help,
    };

    // --- 2. Core Logic ---
    input.addEventListener('keydown', function (e) {
        // Ctrl + C
        if (e.ctrlKey && e.key === 'c') {
            const hasInputSelection = this.selectionStart !== this.selectionEnd;
            if (hasInputSelection) return;

            e.preventDefault();
            showCommandLine(this.value + '<span style="color:#ff5f56"> ^C</span>');
            this.value = '';
            scrollToBottom();
        }

        else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (commandHistory.length === 0) return;

            const isUp = e.key === 'ArrowUp';
            if (historyIndex === -1) {
                this.dataset.currentInput = this.value;
            }

            if (isUp) {
                historyIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
            } else {
                historyIndex = (historyIndex >= 0 && historyIndex < commandHistory.length - 1) ? historyIndex + 1 : -1;
            }
            console.log(`${historyIndex}`)
            this.value = historyIndex === -1 ? (this.dataset.currentInput || '') : commandHistory[historyIndex];
            this.setSelectionRange(this.value.length, this.value.length);
        }

        // Enter
        else if (e.key === 'Enter') {
            // Show the command that was just entered
            showCommandLine(this.value);
            // Process the command
            const [cmdName, args] = parseCommand(this.value);
            if (cmdName) {
                const handler = commands[cmdName];
                if (typeof handler === 'function') {
                    try {
                        const result = handler(args);
                        if (result !== null && result !== undefined) {
                            printOutput(result);

                            commandHistory.push(`${cmdName} ${args || ''}`);
                            if (commandHistory.length > MAX_HISTORY) {
                                commandHistory.shift();
                            }
                        }
                    } catch (err) {
                        printOutput(`<span style="color:#ff5f56">Error executing command: ${err.message}</span>`);
                    }
                } else {
                    printOutput(`<span style="color:#ff5f56">command not found: ${cmdName}</span>. Try 'help'.`);
                }
            }
            // Reset input box and scroll to bottom
            this.value = '';
            scrollToBottom();
        }
    });

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

    function searchIndex(query) {
        const results = fuse.search(query);
        if (results.length === 0) {
            return `<span style="color:#ff5f56;">No results found for "${query}".</span>`;
        }
        let resultHTML = `<span style="color:#00FF00;">Found ${results.length} result(s) for "${query}":</span><br><br>`;
        results.slice(0, 5).forEach(result => {
            resultHTML += `<div style="margin-bottom:10px;">
                    <a href="${result.item.permalink}" class="terminal-link">${result.item.title}</a><br>
                    <span style="color:#BBBBBB;">${result.item.content.substring(0, 100)}...</span>
                </div>`;
        });
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
                printOutput(`<span style="color:#ff5f56;">⚠️ Worker Failed (${response.status}): ${errorText}</span>`);
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullContent = '';
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
                                const lastOutput = document.querySelector('.command-output:last-child');
                                if (lastOutput) {
                                    lastOutput.appendChild(span);
                                } else {
                                    printOutput(content);
                                }
                                scrollToBottom();
                            }
                        } catch (e) {
                            console.warn('Parse error in SSE:', line, e);
                        }
                    }
                }
            }
            printOutput('');

        } catch (err) {
            printOutput(`<span style="color:#ff5f56;">❌ Chat Error: ${err.message}</span>`);
        }
    };

    function sayHello(news_data, weather_data) {
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        const now = new Date();
        // const year = now.getFullYear();
        // const month = now.getMonth();
        // const day = now.getDate();
        const weekday = now.getDay();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        let greeting = "Hello👋!";
        if (hours >= 5 && hours < 12) {
            greeting = "Good morning☀️!";
        } else if (hours >= 12 && hours < 18) {
            greeting = "Good afternoon🌤️!";
        } else if (hours >= 18 && hours < 22) {
            greeting = "Good evening🌙!";
        } else if (hours >= 22 && hours < 24) {
            greeting = "Good night🌠!";
        } else {
            greeting = "Still up? Good... uh... quiet time🌌!";
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
            weatherDiff = ` The weather may change to ${nextDesc} soon.`;
        } else {
            weatherDiff = 'The weather is expected to remain stable in the coming period.';
        }

        const lastPartList = [
            "Have a fantastic day! 🌟",
            "A wonderful day is just beginning!🌟",
            "Wishing you a productive and joyful day ahead! 🌈",
        ];

        const currentFrom = position_data.city ? ` from 🌆${position_data.city}` : '';
        const currentTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
        const currentWeather = (weather_data.current && weather_data.next)
            ? `The weather is ${weather_data.current.weather[0].description} today, 
                with a current feels-like temperature of ${Math.round(weather_data.current.main.feels_like)}°C 
                and a forecast high of ${Math.round(weather_data.current.main.temp_max)}°C, low of ${Math.round(weather_data.current.main.temp_min)}°C.
                ${windLevel}<br>
                ${weatherDiff} ${rainLevel}`
            : '';
        const topNews = news_data.title
            ? `<span>By the way, here's a top news update for you:</span><br>
                <hr style="border: 0; border-top: 1px solid #444; margin: 12px 0;">
                <a href="${news_data.url}" target="_blank" class="terminal-link">${news_data.title}</a><br>
                <span style="color:#BBBBBB; font-size:0.9em;">${news_data.description.substring(0, 500) || ''}</span>
                <hr style="border: 0; border-top: 1px solid #444; margin: 8px 0 12px 0;">`
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
        return content;
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

    function showCommandLine(command, promptArrow = '➜', promptDir = '~') {
        const cmdLine = document.createElement('div');
        cmdLine.className = 'input-line';
        cmdLine.innerHTML = `
            <span class="prompt-arrow">${promptArrow}</span>
            <span class="prompt-dir">${promptDir}</span>
            <span>${command}</span>
        `;
        output.appendChild(cmdLine);
    }

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

    function printOutput(html, className = 'command-output') {
        const div = document.createElement('div');
        div.className = className;
        div.innerHTML = html;
        output.appendChild(div);
    }

    function scrollToBottom() {
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
    }

    // Auto focus on load
    window.onload = function () {
        input.focus();
    };
})();
