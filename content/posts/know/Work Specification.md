---
draft: false

title: "Work Specification"
description: "代码规范、README规范、Git Msg规范、装机必备"
date: 2024-04-13
author: ["biglonglong"]

tags: ["summary", "specification", "cpp"]
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

## 系统初始化

### Windows

| 磁盘分区        | 用途               |
| --------------- | ------------------ |
| `D:\`           | 应用程序           |
| `E:\`           | 数据缓存、临时文件 |
| USB flash drive | 便携资料           |

- [Google Chrome](https://www.google.com/chrome/)：log in、setting
  - Extensions：划词翻译、OneTab、Tab Copy、GitZip for github
  - BookMark：AIs([ChatGPT](https://chatgpt.com/)、[Claude](https://claude.ai/new)、[Microsoft Copilot](https://copilot.microsoft.com/)、[DeepSeek](https://chat.deepseek.com/)、[文心一言](https://yiyan.baidu.com/))、[GitHub](https://github.com/)、[龙犊&小窝🪹~](https://biglonglong.github.io/home/)、[LeetCode](https://leetcode.cn/)、[小林coding](https://xiaolincoding.com/)

- [VS Code](https://code.visualstudio.com/)：log in、save on focusChange
  - Extensions：Remote SSH、Python、Jupyter、C/C++（Format on Save、mingw-w64）、CMake Tools、Black Formatter、GitHub Copilot、Markdown All in One、Open in External App、Partial Diff、Vscode-Icons

- [Typora](https://github.com/shuhongfan/TyporaCrack)：[Pandoc](https://pandoc.org/installing.html)、perferance
- [Clash](https://github.com/clashdownload/Clash?tab=readme-ov-file)：profiles
- [Git for Windows](https://git-scm.com/downloads/win)：SSH key、alias config
- [WSL + Ubuntu](https://learn.microsoft.com/zh-cn/windows/wsl/install)
- [Anaconda](https://www.anaconda.com/download)
- [Node.js + npm](https://nodejs.org/en)
- [Office Tool Plus](https://otp.landian.vip/zh-cn/#google_vignette)
- [BaiduNetwork](https://pan.baidu.com/download#win)
- [Wechat](https://weixin.qq.com/)

### Linux (Ubuntu)

```bash
# install vim
sudo apt install vim

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
sudo apt install fcitx5 fcitx5-config-qt fcitx5-chinese-addons

# read English and write Chinese
export LANG=en_US
xdg-user-dirs-gtk-update
sudo apt install language-pack-zh-hans

# install VScode ....
```



## 代码规范

> [ClangFormat](https://clang.llvm.org/docs/ClangFormat.html)

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



## Commit Msg

> [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
>
> 校验提交格式：[commitlint](https://commitlint.js.org/)
>
> 自动生成changelog：[README | semantic-release](https://semantic-release.gitbook.io/semantic-release)

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



## README

### Overview

这是一份规范文档，如果采用别人的仓库，就以该仓库规范为准，否则可以采用该规范，具体依情况而定。

This repository describes some guidelines, [simple introduction]

- [TOC](#TOC)

### Requirements and Features

### Directory Structure

### Installation and Usage

#### Prerequisites

#### Steps

#### Run

### Guide

#### Abstract

[introduction] [Input] [Output]

![diagram]()

#### Works

##### Function/Class/Inovation

[introduction]

```
// ...
```

- [input]
- [[output]
- [function]

#### Results

#### More

本仓库包括源代码和详细文档，您可以通过阅读 [detail]() 了解算法的详细设计、原理和实验。

### Bug or Experience

### FAQ

### TODO List

### References

### Contributing

### License

### About the Author



## 博文

### 前言

### 正文标题1

### 正文标题2

### …
