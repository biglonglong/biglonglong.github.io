# Terminal 约定

- 终端逻辑在 `assets/js/terminal/`。修改行为后运行 `node --experimental-default-type=module --test scripts/terminal.test.mjs`；修改静态文件或模板后运行 `hugo`。
- `usr/bin/` 的 JS 程序自行实现行为并导出 `run({ argv, stdin, runtime, write })`；`runtime` 只注入配置、会话信息和浏览器能力，`write` 用于纯文本流式输出。新增文件由 Hugo 自动发现。
- 文本命令返回 `{ stdout, stderr, code }`；仅 HTML 或界面命令声明 `presentation: true`。固定规则和 `help.js` 的说明由人工维护，改动相关行为时同步更新，不要复制配置中的演示密码。

