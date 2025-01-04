---
draft: false

title: "Work Specification"
description: "开发配置及其规范"
date: 2025-04-13
author: ["biglonglong"]

tags: ["skills", "specification"]
summary: ""

math: false
weight:
cover:
    image: ""
    caption: ""
    alt: ""
    relative: false
    hidden: true

showToc: true
TocOpen: true
comments: true
---



## System Init

### Windows

| 磁盘分区          | 用途               |
| ----------------- | ------------------ |
| `D:\`             | 应用程序           |
| `E:\`             | 数据缓存、临时文件 |
| `USB flash drive` | 便携资料           |

- [ ] [Clash](https://github.com/clashdownload/Clash?tab=readme-ov-file)：profiles

- [ ] [Google Chrome](https://www.google.com/chrome/)：default browser、log in、turn on Sync（Extensions、BookMark）、search engine setting

- [ ] [VS Code](https://code.visualstudio.com/)：log in、Backup and Sync Settings

- [ ] [Typora](https://github.com/shuhongfan/TyporaCrack)：[Pandoc](https://pandoc.org/installing.html)、perferance

- [ ] [Git for Windows](https://git-scm.com/downloads/win)：SSH key、alias config（autocrlf）

  ```
  [core]
  	safecrlf = true
  	autocrlf = true
  
  [alias]
  	st = status
      br = branch
      co = checkout
      pl = pull --rebase
      cm = commit
      last = log -1 HEAD
      hist = log --pretty=format:\"%C(yellow)%h %C(blue)%ad %C(reset)%s %C(green)[%cn] %C(red)%d\" --decorate --date=short
      latest = for-each-ref --sort=-committerdate --format='%(committerdate:short) %(refname:short) [%(committername)]'
      type = cat-file -t
      dump = cat-file -p
  ```
  
- [ ] [WSL + Ubuntu](https://learn.microsoft.com/zh-cn/windows/wsl/install)

- [ ] [Anaconda](https://www.anaconda.com/download)

- [ ] [hugo](https://github.com/gohugoio/hugo)

- [ ] [Office Tool Plus](https://otp.landian.vip/zh-cn/#google_vignette)

- [ ] [BaiduNetwork](https://pan.baidu.com/download#win)

- [ ] [QQ](https://im.qq.com/index/) for transmission

- [ ] [ToDesk](https://www.todesk.com/)

### Linux (Ubuntu)

| **挂载点**  | **分区大小** | **文件系统** | **用途**               | **备注**                                                    |
| :---------- | :----------- | :----------- | :--------------------- | :---------------------------------------------------------- |
| `/boot/efi` | SSD 512MB    | FAT32        | UEFI启动分区           | 必需分区，所有操作系统共享（双系统时注意不要格式化）        |
| `/`         | SSD 100GB    | ext4         | 系统核心文件           | 系统程序、库文件等。建议最低50GB，开发/游戏用户可增至150GB  |
| `/home`     | SSD 剩余     | ext4         | 用户配置文件、桌面数据 | 用户文档、软件配置、.config等。SSD加速日常操作              |
| 未分配      | SSD 可选     | -            | 预留未来扩展           | 可保留10-20GB，后续用于扩容或临时快照                       |
| `/mnt/data` | HDD 全部     | ext4/NTFS    | 大文件存储             | 电影、下载、游戏库、备份等。NTFS格式可兼容Windows双系统访问 |
| swap分区    | HDD 可选     | swap         | 内存交换空间           | 内存≥16GB时可省略；≤8GB建议分配8-16GB                       |

```bash
# show hidden files
crtl + H

# install vim
sudo apt install vim

# vim Tab
vim /etc/vim/vimrc
# set tabstop=4

# gedit Tab
# adjust settings

# update install source
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak
sudo vim /etc/apt/sources.list
# # 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
# deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal main restricted universe multiverse
# # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal main restricted universe multiverse
# deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-updates main restricted universe multiverse
# # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-updates main restricted universe multiverse
# deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-backports main restricted universe multiverse
# # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-backports main restricted universe multiverse
# deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-security main restricted universe multiverse
# # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-security main restricted universe multiverse

# # 预发布软件源，不建议启用
# # deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-proposed main restricted universe multiverse
# # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-proposed main restricted universe multiverse

# update apt 
sudo apt update && sudo apt upgrade -y

# set root
sudo passwd root
123456

# install gdb, gcc, g++, make, libc6-dev, dpkg-dev
sudo apt install -y build-essential openssh-server git \
net-tools curl zip unzip

# install pip-tools
sudo apt install -y python3-pip python3-venv

# git config
git config --global user.name "<your name>"
git config --global user.email "<your email>"

# install input method
sudo apt remove --purge fcitx
sudo apt autoremove
sudo apt install fcitx5 fcitx5-configtool fcitx5-chinese-addons
fcitx5-configtool

# config input method
vim ~/.profile
# export GTK_IM_MODULE=fcitx
# export QT_IM_MODULE=fcitx
# export XMODIFIERS=@im=fcitx
# # fcitx5 &

# auto-start fcitx5
sudo apt install gnome-tweaks

# install VScode ....

# proxy
vim ~/.bashrc
PROXY_SERVER="http://your_proxy_server_ip:port"
export http_proxy="$PROXY_SERVER"
export HTTP_PROXY="$http_proxy"
export https_proxy="$PROXY_SERVER"
export HTTPS_PROXY="$https_proxy"
# export all_proxy="socks5://your_proxy_server_ip:port"
# export ALL_PROXY="$all_proxy"
# export no_proxy="localhost,127.0.0.1,::1,.local"
# export NO_PROXY="$no_proxy"
source ~/.bashrc
```



## [ClangFormat](https://clang.llvm.org/docs/ClangFormat.html)

- 命名

  - 变量/对象：小写字母，下划线命名法

  - 常量：大写字母，下划线命名法

  - 函数：小驼峰命名法

  - 类/结构体：大驼峰命名法

  - 类成员变量：小写字母，下划线命名法，`_`结尾

  - 命名空间：小写字母，下划线命名法

  - 文件：类文件同类名，其余文件小写字母，下划线命名法

  - 单行注释：小写英文正文描述（单独起行以说明下面一段代码逻辑；代码末尾以解释该行代码）

  - 多行注释：小写英文正文描述（模块/函数说明）

    ```cpp
    /**
     * @brief <func description>
     * @param a <param1 description>
     * @param b <param2 description>
     * ...
     * @return <return description>
     */
    ```

- 代码

  ```yaml
  ---
  BasedOnStyle: LLVM  # Base style to inherit from (e.g., LLVM, Google, Mozilla, WebKit)
  Language: Cpp  # Applies to C++ (can be set to C, Java, JavaScript, etc.)
  
  # Alignment
  AlignAfterOpenBracket: Align      # Align parameters after open bracket
  AlignEscapedNewlines: Right       # Align escaped newlines to the right
  AlignOperands: true               # Align binary operators
  AlignTrailingComments: true       # Align comments that follow code
  
  # Access modifiers (public/private/protected) indentation in classes
  AccessModifierOffset: -4
  
  # Braces and breaking
  BreakBeforeBraces: Attach         # Place braces on new lines (e.g., Allman, Attach)
  AlwaysBreakBeforeMultilineStrings: false
  AlwaysBreakTemplateDeclarations: Yes
  BreakBeforeBinaryOperators: None  # Place binary operators after line breaks
  BreakBeforeTernaryOperators: true
  BreakConstructorInitializers: BeforeColon
  BreakInheritanceList: BeforeColon
  BreakStringLiterals: true         # Allow breaking long string literals
  
  # Short constructs
  AllowShortBlocksOnASingleLine: true
  AllowShortCaseLabelsOnASingleLine: false
  AllowShortFunctionsOnASingleLine: Inline
  AllowShortIfStatementsOnASingleLine: true
  AllowShortLoopsOnASingleLine: true
  
  # Indentation
  IndentCaseLabels: true
  IndentWidth: 4
  TabWidth: 4
  UseTab: Never                    # Can be: Never, ForIndentation, Always
  ConstructorInitializerIndentWidth: 4
  ContinuationIndentWidth: 4
  
  # Column limits
  ColumnLimit: 100                # Max line length
  PenaltyBreakAssignment: 2
  PenaltyBreakBeforeFirstCallParameter: 19
  PenaltyBreakComment: 300
  PenaltyBreakFirstLessLess: 120
  PenaltyBreakString: 1000
  PenaltyExcessCharacter: 1000000
  
  # Includes
  IncludeBlocks: Preserve         # Can be: Preserve, Merge, Regroup
  IncludeCategories:
    - Regex:           '^<.*\.h>'
      Priority:        1
      SortPriority:    0
      CaseSensitive:   false
    - Regex:           '^".*\.h"'
      Priority:        2
      SortPriority:    0
      CaseSensitive:   false
  SortIncludes: true              # Sort #includes
  IncludeIsMainRegex: '(Test)?$'
  
  # Spaces
  SpaceAfterCStyleCast: true
  SpaceAfterTemplateKeyword: true
  SpaceBeforeAssignmentOperators: true
  SpaceBeforeCpp11BracedList: false
  SpaceBeforeCtorInitializerColon: true
  SpaceBeforeInheritanceColon: true
  SpaceBeforeParens: ControlStatements # Can be: Never, ControlStatements, Always
  SpaceInEmptyBlock: false
  
  # Comment formatting
  CommentPragmas: '^ IWYU pragma:'   # Regex to match comment pragmas
  FixNamespaceComments: true         # Add comments for closing namespaces
  ReflowComments: false              # Disable automatic wrapping of long comments
  
  # C++11 and beyond
  AllowAllParametersOfDeclarationOnNextLine: false
  Cpp11BracedListStyle: true
  Standard: Latest                  # Set language standard (e.g., Cpp11, Cpp17, Latest)
  
  # Namespaces
  NamespaceIndentation: All         # Indent contents of namespaces
  CompactNamespaces: false
  
  # Macros and preprocessor
  MacroBlockBegin: ''
  MacroBlockEnd: ''
  IndentPPDirectives: AfterHash     # Options: None, AfterHash, BeforeHash
  
  # Sorting
  SortUsingDeclarations: true       # Sort 'using' declarations
  
  # Experimental
  DerivePointerAlignment: false
  PointerAlignment: Right            # Can be Left, Right, Middle
  KeepEmptyLinesAtTheStartOfBlocks: true
  
  # Misc
  EmptyLineAfterAccessModifier: Never
  EmptyLineBeforeAccessModifier: Never
  ...
  
  ```



## [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

```bash
<type>[(optional scope)][!]: <description>

[optional body]

[optional footer(s)]
```

- type：本次Commit的类型

  | 类型       | 含义                           |
  | ---------- | ------------------------------ |
  | !          | 重大变更（breaking change）    |
  | `feat`     | 新功能（Features）             |
  | `fix`      | 修复 Bug（Bug Fixes）          |
  | `docs`     | 仅文档修改（Documentation）    |
  | `style`    | 不影响代码运行的格式修改       |
  | `refactor` | 重构，不添加新功能或修复 Bug   |
  | `perf`     | 性能优化（Performance）        |
  | `test`     | 添加或修改测试                 |
  | `chore`    | 构建流程、工具或依赖等杂项更新 |
  | `build`    | 构建系统或外部依赖相关的改动   |
  | `ci`       | CI/CD 配置                     |
  | `revert`   | 回滚历史提交                   |

- scope：本次更改影响的模块、功能、文件夹等

- description：祈使句简明扼要本次Commit，不需要大写或句号结尾，开头可以以`[<module>] `说明具体修改模块

- body：解释本次Commit更多细节

- footer：关联 issue、标记 breaking change

> 校验提交格式：[commitlint](https://commitlint.js.org/)
>
> 自动生成changelog：[README | semantic-release](https://semantic-release.gitbook.io/semantic-release)

