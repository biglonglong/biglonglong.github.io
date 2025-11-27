let fuse;

updateInfo().then(data => {
    const titleElement = document.getElementById('terminal-title');
    titleElement.textContent = `${data.user}@${data.ip || 'localhost'}: ~ (zsh)`;

    const output = document.getElementById('history-output');
    function addFrontOutput(html) {
        const div = document.createElement('div');
        div.className = 'front-output';
        div.innerHTML = html;
        output.appendChild(div);
    }

    WELCOME_MSG = "Last login on ttys001 at " + new Date().toString().split(' GMT')[0] + ` from ${data.org || 'Blue Planet'}`;
    if (data.latitude && data.longitude) {
        WELCOME_MSG += ` (${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)})`;
    }

    addFrontOutput(WELCOME_MSG);
    addFrontOutput("Welcome to my interactive terminal! Type 'help' to see available commands.");
});

async function updateInfo() {
    data = {
        ip: null,
        user: `${navigator.platform || 'guest'}.${navigator.userAgentData?.brands?.[0]?.brand || ''}`,
        org: null,
        latitude: null,
        longitude: null,
    };

    try {
        const response = await fetch('https://ipapi.co/json/');
        res_json = await response.json();
        response.ok && Object.assign(data, res_json);
    } catch (error) {
        console.log('cannot fetch IP address', error);
    }
    return data;
}

(function () {
    const input = document.getElementById('cmd-input');
    const inputHeader = document.querySelector('.input-line');
    const output = document.getElementById('history-output');
    const terminalWindow = document.getElementById('terminal-window');
    initSearchIndex();

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
            <span class="info-key">fortune</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Display a random quote</span><br>
            <span class="info-key">search &lt;keys&gt;</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Search content</span><br>
            <span class="info-key">chat &lt;prompt&gt;</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Chat with AI</span><br>
            <span class="info-key">clear</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Clear the screen</span><br>
            <span class="info-key">help</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Show this help message</span><br>
            <span class="info-key">sudo</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Try it and see what happens</span><br>
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
        bash: (args) => {
            if (args === '') return `<span style="color:#ff5f56">bash: missing operand</span>`;

            const target = args.trim().toLowerCase();
            if (data.binMap[target]) {
                window.location.href = data.binMap[target];
                return `<div>Downloaded <span class=\"info-val\">${target}</span>! Manual run please.</div>`;
            }
            return `<span style="color:#ff5f56">bash: ${args}: command not found</span>`;
        },
        whoami: () => data.bio,
        fortune: () => {
            const randomIndex = Math.floor(Math.random() * data.quotes.length);
            return `<div style="padding: 5px; border-left: 3px solid #f99157; margin-left: 10px;">${data.quotes[randomIndex]}</div>`;
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
        clear: () => {
            // clear command handler, return null
            output.innerHTML = '';
            return;
        },
        help: () => data.help,

        sudo: () => 'Password: <span style="display:inline-block; margin-left:5px;">🔑</span><br><span style="color:#ff5f56">Sorry, try again.</span>',
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
            return;
        }

        // Enter
        if (e.key === 'Enter') {
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
            const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer sk-LXuyNYVUoDw64ksqIg8dd7NETJ3eOnPeolzqjyxJPAfGqVAG`
                },
                body: JSON.stringify({
                    model: "kimi-k2-turbo-preview",
                    messages: [
                        { role: 'system', content: 'Be a concise terminal AI assistant.' },
                        { role: 'user', content: prompt }
                    ],
                    stream: true,
                    max_tokens: 80,
                })
            });

            if (!response.ok || !response.body) {
                printOutput(`<span style="color:#ff5f56;">❌ Failed to connect to AI service.</span>`);
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
            console.error('AI request failed:', err);
            printOutput(`<span style="color:#ff5f56;">⚠️ AI error: ${err.message || 'Unknown'}</span>`);
        }
    };

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

    function printOutput(html) {
        const div = document.createElement('div');
        div.className = 'command-output';
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
