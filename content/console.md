---
showToc: false
hidemeta: true
ShowBreadCrumbs: false
---

<div id="terminal-container">
    <div class="terminal-header">
        <div class="buttons">
            <span class="close"></span>
            <span class="minimize"></span>
            <span class="maximize"></span>
        </div>
        <div class="title" id="terminal-title">guest@localhost: ~ (zsh)</div>
    </div>
    <div class="terminal-window" id="terminal-window" onclick="document.getElementById('cmd-input').focus()">
        <div id="output"></div>
        <div class="input-line">
            <span class="prompt-arrow">➜</span> 
            <span class="prompt-dir">~</span>
            <input type="text" id="cmd-input" autocomplete="off" spellcheck="false" autofocus />
        </div>
    </div>
</div>

<style>
    /* Basic Layout */
    #terminal-container {
        width: 100%;
        max-width: 800px;
        margin: 20px auto;
        /* Updated Font Stack for better terminal look */
        font-family: 'Fira Code', 'Cascadia Code', 'Consolas', 'Monaco', 'Courier New', monospace;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        border-radius: 8px;
        overflow: hidden;
        background: #1e1e1e;
    }

    /* Top Title Bar */
    .terminal-header {
        background: #2d2d2d;
        padding: 10px 15px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #333;
    }

    .buttons span {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
    }

    .close {
        background: #ff5f56;
    }

    .minimize {
        background: #ffbd2e;
    }

    .maximize {
        background: #27c93f;
    }

    .title {
        flex: 1;
        text-align: center;
        color: #999;
        font-size: 14px;
        margin-left: -60px;
        /* Visual centering correction */
    }

    /* Terminal Content Area */
    .terminal-window {
        background: #1e1e1e;
        /* VS Code style dark background */
        color: #f0f0f0;
        padding: 20px;
        height: 480px;
        /* Fixed height, or min-height */
        overflow-y: auto;
        font-size: 16px;
        line-height: 1.6;
        cursor: text;
    }

    /* Input Box Style */
    .input-line {
        display: flex;
        align-items: center;
    }

    .prompt-arrow { 
        color: #27c93f;
        font-weight: bold;
        margin-right: 10px;
    }
    .prompt-dir {
        color: #00d3d6;
        font-weight: bold;
        margin-right: 10px;
    }

    #cmd-input {
        background: transparent;
        border: none;
        color: #f0f0f0;
        font-family: inherit;
        font-size: inherit;
        flex: 1;
        outline: none;
        caret-color: #babbbd;
    }

    /* Specific Output Styles */
    .command-output {
        margin-bottom: 20px;
    }

    .front-output {
        color: #BBBBBB;
        font-size: 12px;
        margin-bottom: 12px;
        line-height: 1.5;
        font-family: inherit;
        padding: 8px 0;
        border-bottom: 1px solid #2d2d2d;
    }

    .info-key {
        color: #569cd6;
        font-weight: bold;
    }

    .info-val {
        color: #ce9178;
    }

    .link {
        color: #4ec9b0;
        text-decoration: underline;
        cursor: pointer;
    }
    .link:visited  {
        color: #d7ba7d; 
    }

</style>

<script src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js"></script>

<script>
    let fuse;

    updateInfo().then(data => {
        const titleElement = document.getElementById('terminal-title');
        titleElement.textContent = `${data.user || 'guest'}@${data.ip || 'localhost'}: ~ (zsh)`;

        const output = document.getElementById('output');
        function addFrontOutput(html) {
            const div = document.createElement('div');
            div.className = 'front-output';
            div.innerHTML = html;
            output.appendChild(div);
        }

        let WELCOME_MSG = "Last login on ttys001 at " + new Date().toString().split(' GMT')[0] + ` from ${data.org || 'Blue Planet'}`;
        if (data.latitude && data.longitude) {
            WELCOME_MSG += ` (${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)})`;
        }

        addFrontOutput(WELCOME_MSG);
        addFrontOutput("Welcome to my interactive terminal! Type 'help' to see available commands.");
    });

    async function updateInfo() {
        data = {
            ip: null,
            user: `${navigator.platform}.${navigator.userAgentData?.brands?.[0]?.brand}`,
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
        const output = document.getElementById('output');
        const terminalWindow = document.getElementById('terminal-window');
        initSearchIndex();

        // --- 1. Define data and commands here ---
        const data = {
            list: `
                <span style="color:#4daafc; font-weight:bold;">Projects/</span>&nbsp;&nbsp;
                <span style="color:#4daafc; font-weight:bold;">Blogs/</span>&nbsp;&nbsp;
                <span>README.md</span>&nbsp;&nbsp;
                <span>contact.txt</span>&nbsp;&nbsp;
                <span>skills.json</span>`,
            listall: `
                <span style="color:#5a5a5a;font-weight:bold;">.config/</span>&nbsp;&nbsp;
                <span style="color:#5a5a5a;">.zshrc</span>&nbsp;&nbsp;
                <span style="color:#4daafc; font-weight:bold;">Projects/</span>&nbsp;&nbsp;
                <span style="color:#4daafc; font-weight:bold;">Blogs/</span>&nbsp;&nbsp;
                <span>README.md</span>&nbsp;&nbsp;
                <span>contact.txt</span>&nbsp;&nbsp;
                <span>skills.json</span>`,

            bio: `<div>
                Hello! I'm <span style="color:#00A3CC; font-weight:bold;">biglonglong</span>.<br>A curious Developer who specializes in converting coffee to code.
                </div>`,
            contact: `<div>
                    Email: <a href="mailto:1522262926@qq.com" target="_blank" class="link">1522262926@qq.com</a><br>
                    GitHub: <a href="https://github.com/biglonglong" target="_blank" class="link">github.com/biglonglong</a>
                </div>`,
            skills: `<div class='info-val'>
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
                <span class="info-key">bash &lt;exe&gt;</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Down or exe program (such as bash easter_egg)</span><br>
                <span class="info-key">whoami</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Display user info</span><br>
                <span class="info-key">fortune</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Display a random quote</span><br>
                <span class="info-key">search &lt;keys&gt;</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Search content</span><br>
                <span class="info-key">chat &lt;prompt&gt;</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Chat with AI</span><br>
                <span class="info-key">clear</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Clear the screen</span><br>
                <span class="info-key">help</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Show this help message</span><br>
                <span class="info-key">sudo</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#BBBBBB;">Try it and see what happens</span><br><br>
                <span style="color:#797979;">Tip: Commands are case-insensitive, arguments are auto-trimmed</span>
            `,

            redirectMap: {
                "posts": '/home/posts',
                "projects": 'https://github.com/biglonglong?tab=repositories'
            },
            binMap: {
                "easter_egg": "../easter_egg.exe",
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

                askAIAndPrint(args);
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
            if (e.key !== 'Enter') return;
            const rawCmd = this.value;

            // 1. Show the command that was just entered
            const cmdLine =  document.createElement('div');
            cmdLine.className = 'input-line'; 
            cmdLine.innerHTML = `
                <span class="prompt-arrow">➜</span> 
                <span class="prompt-dir">~</span> 
                <span>${rawCmd}</span>`;
            output.appendChild(cmdLine);

            // 2. Process the command
            const [cmdName, args] = parseCommand(rawCmd);
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

            // 3. Reset input box and scroll to bottom
            this.value = '';
            scrollToBottom();
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
                    <a href="${result.item.url}" class="link">${result.item.title}</a><br>
                    <span style="color:#BBBBBB;">${result.item.content.substring(0, 100)}...</span>
                </div>`;
            });
            return resultHTML;
        }

        async function askAIAndPrint(prompt) {
            printOutput(`<span style="color:#00FF00;">🤖 thinking...<br></span>`);

            try {
                const response  = await fetch('https://api.moonshot.cn/v1/chat/completions', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer sk-LXuyNYVUoDw64ksqIg8dd7NETJ3eOnPeolzqjyxJPAfGqVAG`
                    },
                    body: JSON.stringify({ 
                        model: "kimi-k2-turbo-preview",
                        messages: [
                            { role: 'system', content: 'You are a terminal chatbot'},
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
</script>
