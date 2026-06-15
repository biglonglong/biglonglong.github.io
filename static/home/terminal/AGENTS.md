# Terminal 约定

- 终端逻辑在 `assets/js/terminal/`。修改行为后运行 `node --experimental-default-type=module --test scripts/terminal.test.mjs`；修改静态文件或模板后运行 `hugo`。
- `usr/bin/` 的 JS 程序自行实现行为并导出 `run({ argv, stdin, runtime, write })`；`runtime` 只注入配置、会话信息和浏览器能力，`write` 用于纯文本流式输出。新增文件由 Hugo 自动发现。
- 文本命令返回 `{ stdout, stderr, code }`；仅 HTML 或界面命令声明 `presentation: true`。固定规则和 `help.js` 的说明由人工维护，改动相关行为时同步更新，不要复制配置中的演示密码。
- `bash` 逐行复用执行器并限制嵌套；启动时执行当前用户主目录的 `.bashrc`。`export` 仅影响会话；`set` 用 `terminal:set:` 前缀写入 `localStorage` 并在启动时恢复；`.bashrc` 文件修改存 IndexedDB；`usr/bin/theme.js` 保存主题到 `localStorage`。
- `resetfs` 清空 IndexedDB 终端文件及 `localStorage` 中的 `terminal:set:`、`terminalTheme`，保留网站主题和导航位置。
- `chat` 的参数始终是提问内容；`chatctl use <provider>` 将预设 URL 和模型存入 `set`，`chatctl status` 显示各项有效值和来源但隐藏 Key，`chatctl clear <key|url|model>` 只清除本地 `set` 值。`CHAT_API_KEY` 按 `export`、`set`、`hugo.yaml` 顺序取值，URL 和模型还可回退到 `usr/bin/chat.js` 的预设值。不要把真实 Key 写入帮助文本或测试输出。
- 运行中的命令由 `ui/input.js` 用 `AbortController` 取消；执行器向程序传递 `signal`，发起网络请求的程序应将其传给 `fetch`，取消后停止输出。
- `vim` 是界面命令，编辑器位于 `ui/editor.js`；读写必须复用文件命令的权限检查、`readFile` 和 `writeText`，保存内容继续交由 IndexedDB overlay 管理。
- Tab 补全由 `ui/completion.js` 识别当前引号、操作符和重定向位置；命令或程序的候选由各自的 `complete` 提供，新增命令时保持引号及带空格路径可用。

