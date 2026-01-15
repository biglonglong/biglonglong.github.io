---
draft: false

title: "Template Format"
description: "软件开发技术文档写作规范化模板"
date: 2026-01-04
author: ["biglonglong"]

tags: ["skills", "template"]
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



## README

### Overview

这是一份规范文档，如果采用他人仓库，就以其仓库规范为准，否则可以采用该规范，具体依情况而定。

This repository describes some guidelines, [simple introduction]

### Features

### Difficulties

### Logs

### Directory Structure

### Installation and Usage

#### Prerequisites

#### Installation

#### Usage

### Guide

### More

本仓库包括源代码和详细文档，您可以通过阅读 [Guide]() 了解算法的详细设计、原理和实验。

### FAQ

### TODO List

### References

### Pull Request

1. **Issue**：描述你要解决的问题或新增的功能（格式、变量名、逻辑…），确保与维护者达成共识；
2. **Fork & Clone & Commit & Push**：在自己账户下拉取仓库分支，克隆仓库到本地进行开发，请尽可能复现原代码和提交信息的风格；
3. **New Pull Request & Merge**：确认你的分支与上游 main 分支，回应审查意见直到代码合并；

如果以上步骤有任何问题，咨询仓库拥有者，或将你的改动交给他审查并提交。

1. **Issue**: Describe the problem you plan to solve or the new feature you want to add (including format, variable names, logic, etc.). Ensure you reach a consensus with the maintainers before proceeding.
2. **Fork & Clone & Commit & Push**: Fork the repository to your own account and clone it to your local machine for development. Please strive to replicate the style of the original code and commit messages.
3. **New Pull Request & Merge**: Create a new Pull Request, ensuring your branch is up to date with the upstream `main` branch. Respond to review comments until the code is approved and merged.

If you encounter any issues with the steps above, consult the repository owner or provide your changes to them for review and submission.

### Contributor

```html
<a href="https://github.com/<UserName>/<RepoName>/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=<UserName>/<RepoName>" />
</a>
```

### About the Author



## Guide

### Abstract

[introduction] [Input] [Output]

![diagram]()

### Results

### Works

#### Function/Class/Inovation

[introduction]

- [input]
- [[output]
- [function]

```
// ...
```



## Research

从领域内综述和硕博论文开始，掌握**各类方法核心思想及其优缺点**，梳理研究方向发展脉络，明确当下**SOTA方法**，今天要读的是：

> [Name - Author.etc](https://arxiv.org/abs/...)
>
> [Repo]: https://github.com/…
> [Hugging Face]: https://huggingface.co/…

### Introduction（yellow）

了解论文的 Abstract & Conclusion，明确论文解决的问题及其潜在工业应用价值，快速评估其创新性和实用性，确定是否有继续读下去的必要；

结合Introduction & Figures，确定论文核心思想；

### Base（orange）

查找相关资料，了解论文的主要假设，主要公式、基线方法；

### Approach（red）

论文核心方案的实现或创新点；

### Result（blue）

#### Scene

#### Evaluation

#### Effect

### Discussion（purple）

讨论与局限性

### Opinion（comment）

”文章内容、结构、方法为什么有效“的总结与改进

### Writing（green）

#### Structure

#### Phrase

### Code



## Blog

### 前言

### 正文标题1

### 正文标题2



## Development Process

### 需求评审

仔细阅读需求文档，确保与产品经理达成一致，避免后续争议。

### 功能拆解

将产品功能拆解为具体的技术实现模块，明确代码层面的改动点。

### 难点评估

识别技术难点、量化工作量，为进度汇报、晋升评优及面试积累素材。

### 架构设计

绘制或更新架构图，明确模块依赖关系，保证系统可维护性。

### 协议定义

设计前后端及模块间的通信协议，注重兼容性与可维护性。

### 数据结构与算法设计

选择合适的数据结构，优先使用成熟算法库（避免重复造轮子）。

### 容量预估

评估模块所需的磁盘、内存、带宽、CPU等资源，避免线上故障。

### 部署与容灾设计

设计分布式部署方案，保证容灾能力与弹性伸缩。

### 设计评审

组织团队评审设计方案，确保合理性且不影响其他模块。

### 编写代码

依据设计方案进行编码，此时主要体现为“体力劳动”。

### 自测

自行测试基本功能，构造数据验证逻辑是否正确。

### 联调

与其他模块或前端协同调试，需协调多方时间，可能反复进行。

### 提测

提交测试同学进行系统测试，根据反馈修改问题，直至通过。

### Code Review

团队评审代码质量，包括命名、接口设计、兼容性等，通过后方可合入。

### 合入主干

解决可能的代码冲突，合入后需进行全量测试，确保整体稳定。