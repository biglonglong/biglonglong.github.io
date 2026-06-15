# Browser Terminal

浏览器中的模拟终端。默认用户为 `guest`，主目录为 `/home/guest`。
- 本地修改保存在当前浏览器，运行 `resetfs` 清除。
- 运行 `help sudo` 查看演示密码，再输入 `sudo <密码>` 体验模拟管理员会话。

| 类别          | 命令或操作                                                                                                     | 用途                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 浏览          | `pwd`、`cd [目录或 -]`、`ls [-al]`、`tree [-a]`、`file 路径`                                                   | 查看和切换目录，识别文件。                                                                |
| 读取          | `cat [文件 ...]`、`open 路径`                                                                                  | 显示文本；`open` 可打开网址、显示文件或运行浏览器程序。                                   |
| 修改          | `mkdir [-p]`、`touch`、`cp`、`mv`、`rm [-r]`、`rmdir`、`vim 文件`                                              | 创建、编辑、复制、移动和删除本地模拟文件；编辑器中按 `i` 输入、`Esc` 返回普通模式，再用 `:wq` 保存退出或 `:q!` 放弃。 |
| 文本          | `echo`、`printf`、`grep`、`head`、`tail`、`wc`、`sort`、`uniq`、`true`、`false`                                | 生成与处理文本；`echo` 中的 `{pwd}` 会替换为命令输出，`wc` 显示带表头的计数。             |
| 组合          | `\|`、`<`、`>`、`>>`、`&&`、`\|\|`、`;`                                                                        | 管道、文件重定向与按结果执行；错误不会写入输出文件。                                      |
| 会话          | `whoami`、`id`、`user`、`sudo`、`su`、`exit`、`useradd <用户名>`                                               | 查看或切换模拟身份；管理员可创建本地用户及其主目录文件。                                  |
| 程序          | `date`、`fortune`、`search`、`chat`、`chatctl`、`hello`、`which`、`theme dark\|light`                          | 查找和运行 `/usr/bin/*.js` 浏览器程序；也可输入完整文件名或路径。                         |
| 终端          | `history [-c]`、`clear`、`help [命令]`、`resetfs`                                                              | 查看历史、清屏、获取帮助，或清除终端本地文件与设置。                                      |
| 脚本          | `bash 文件`、`export NAME=value`、`set NAME=value`                                                             | 执行脚本；`export` 仅影响当前会话，`set` 保存变量到浏览器；启动时执行主目录的 `.bashrc`。 |
| 快捷键        | `Enter`、`Tab`、`↑/↓`、`Ctrl+C`、`Ctrl+L`、`Ctrl+U`、`Esc`                                                     | Enter 执行并滚到最新输出；`Ctrl+C` 中止运行中的请求或当前输入，其余用于补全、历史、清屏或清空输入。 |
| AI 配置与服务 | `CHAT_API_KEY`、`CHAT_API_URL`、`CHAT_MODEL`；`chatctl providers`、`chatctl status`、`chatctl use openai\|deepseek\|siliconflow`、`chatctl clear key\|url\|model` | `chat` 按 `export`、`set`、站点配置取值；查看当前服务和来源、切换服务或清除一项本地设置。状态只显示 Key 是否已配置。 |

e.g.

```sh
mkdir -p notes/drafts
echo "hello terminal" > notes/drafts/hello.txt
cat notes/drafts/hello.txt
printf '%s\n' banana apple banana | sort | uniq -c
```
