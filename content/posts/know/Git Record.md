---
draft: false

title: "Git Record"
description: "管理代码仓库时的 Git 命令集记录"
date: 2024-11-26
author: ["biglonglong"]

tags: ["summary", "tools", "git"]
summary: ""

math: false
weight: 401
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



## 前言

Git 是一个分布式版本控制系统，用于高效地管理代码版本历史和分支协作开发，主要概念有：

- 工作区（Working Directory）：你当前正在编辑的文件
- 暂存区（Staging Area）：你打算提交的文件
- 本地仓库（Local Repository）：本地的历史提交记录
- 远程仓库（Remote Repository）：如 GitHub、GitLab 上的共享仓库

开发者通常在本地频繁提交（`commit`），每次提交都会生成一个唯一的哈希值（SHA-1），确保代码历史不可篡改且可溯源。然后再推送（ `push`）到远程仓库，团队成员也可拉取（`pull`）最新代码，借助**分支机制**（`branch`）并行开发功能，再合并/变基（`merge`/`rebase`），保持主线整洁有序。

下面的示例操作，默认主分支`main`、工作分支`dev`、远程仓库`origin`。



## 项目发布

1. 初始化（`init`）本地仓库，默认主分支为 master ，建立与远程（`remote`）仓库的连接

   ```bash
   git init
   git branch -m master main							# 对齐远程主分支名称
   git remote add origin <remoteAdress>
   git remote set-url origin <remoteAdress>			# 修改远程仓库地址
   ```

2. 或者直接复制（`clone`）远程仓库，默认主分支为 main 

   ```bash
   git clone <remoteAdress>
   git submodule update --init --recursive   # 初始化和更新子模块
   ```

3. 检查仓库状态（`status`），对本地仓库内容进行暂存（`add`）并提交

   ```bash
   git status
   ...													# 项目开发
   git add .
   git commit -m "<changes>"
   ```

4. 将本地仓库更改推送到远程仓库，第一次需要建立upstream，之后直接推送即可

   ```bash
   git push -u origin main
   ```



## 分支开发

1. 检查远程和分支，获取（`fetch`）待开发主分支

   ```bash
   git remote 											# 检查远程仓库
   git remote show origin		  	 					# 检查远程仓库对应地址
   git remote -v										# 检查所有远程仓库及对应地址
   git branch											# 检查本地仓库所有分支
   git branch -a										# 检查所有分支
   git fetch main										# 获取远程待开发主分支
   git fetch --all										# 获取远程所有分支
   git submodule update --init --recursive			# 确保子模块同步
   ```

2. 切换（`checkout`）或创建工作分支，在工作分支上进行开发

   ```bash
   git checkout -b dev									# 创建并切换到工作分支
   git checkout dev									# 切换到工作分支
   ...											   		# 项目开发
   git add <files>
   git commit -m "<changes>"
   ```

3. 切换回主分支，拉取最新代码

   ```bash
   git checkout main									# 切换回主分支
   git pull origin main								# 拉取主分支最新代码 
   ```
   
4. 切换到工作分支去合并主分支最新代码

   ```bash
   git checkout dev									# 再次切换到工作分支
   git merge main										# 合并主分支到工作分支
   ```
   
5. 切换回主分支去合并工作分支，并推送到远程服务器

   ```bash
   git checkout main									# 再次切换回主分支
   git merge dev										# 合并工作分支到主分支
   git push origin main 								# 推送到远程
   ```

6. 删除多余的工作分支

   ```bash
   git checkout main
   git branch -D dev									# 删除本地工作分支
   git push origin --delete dev						# 删除远程工作分支
   ```



## 版本控制

### 提交历史（`log`）

- `git log <branchName>`：查看分支提交历史，默认查看当前分支提交历史
- `git tag <hashName> <hash>`：给版本哈希值取别名，默认给 HEAD 版本取别名
  - <hash>/<hashName>：对应每一次提交
  - <branchName>：对应分支上最新提交
  - HEAD：当前分支最新提交
  - HEAD~n：当前分支第n+1新提交
- `git checkout <hash>`：切换到<hash>版本

### 版本回退

- `git stash -u`|`git stash apply`&`git stash clear`：临时寄存或弹出工作区和暂存区的改动

- `git diff <hash1> <hash2> > output.txt`&`git apply output.txt`：重定向版本差异再应用

- `git clean -n`&`git clean -fd`：清理未跟踪文件

- `git restore <files>/git checkout .`：撤回工作区的修改，但不会影响未跟踪文件

- `git restore --staged <files>`：将暂存区内容撤回到工作区

- `git commit --amend`：此次暂存区预提交内容与上次提交内容合并为单个提交

- `git reset --<mode> <hash>`：移动HEAD到<hash>版本而回退，此时该分支本地和远程提交记录不一致，需要强制推送（`push -f`）覆盖

  | mode      | HEAD 回退 | 暂存区（Stage） | 工作区（file） |
  | --------- | --------- | --------------- | -------------- |
  | `--soft`  | ✅         | ✅保留           | ✅保留          |
  | `--mixed` | ✅         | ❌清除           | ✅保留          |
  | `--hard`  | ✅         | ❌清除           | ❌清除          |

  > 即使回退了，只要回退版本之后的提交没有被垃圾回收，则依然可以被`git reflog`查看或者`git reset --hard <hash>`找回

- `git revert <hash>`：创建一个新提交抵消<hash>版本而撤销，保持历史完整性，但合并时可能产生冲突，需要解决后`add`再`git revert --continue`

- `git cherry-pick <hash>`：应用某个特定提交到当前分支

- `git checkout --orphan fresh`：刷新仓库历史

- `git rebase -i <hash>`：从<hash>版本后开始修改提交历史，需要`git push --force-with-lease`

  - `pick (p)`：保留该提交，不做任何修改
  - `reword (r)`：修改提交信息
  - `edit (e)`：暂停 rebase 过程，允许修改提交内容和msg
  - `squash (s)`：将提交合并到前一个提交中
  - `fixup (f)`：类似 squash，但丢弃该提交的提交信息
  - `drop (d)`：完全删除该提交




## 子模块

Git 子模块允许在一个仓库中包含其他仓库作为子目录，常用于管理项目依赖：

```bash
# 克隆包含子模块的项目
git clone --recursive <url>						# 自动初始化所有子模块
git clone <url> && git submodule update --init --recursive	# 分步操作

# 初始化子模块（首次或新增后）
git submodule update --init --recursive			# 初始化并更新所有子模块
git submodule update --init <path>				# 初始化特定子模块

# 更新子模块（拉取主仓库更新后）
git submodule update --recursive				# 更新到指定版本
git submodule foreach git pull origin main		# 更新到最新版本

# 查看子模块状态
git submodule status							# 查看所有子模块状态
git submodule summary							# 查看子模块更改摘要

# 添加子模块
git submodule add <url> <path>					# 添加新子模块
git commit -m "Add submodule <name>"			# 提交子模块配置

# 删除子模块
git submodule deinit <path>						# 反初始化子模块
git rm <path>									# 删除子模块文件
rm -rf .git/modules/<path>						# 清理配置（可选）
```



## 冲突处理

### 代码冲突

当进行合并、变基、拉取和弹栈操作时，若不同分支的提交中，同一文件里的同一处代码不一致，就会产生代码冲突 conflict。

```bash
git status
# both modified: <files>
```

此时进入冲突文件中，手动解决冲突，重新`git add <files>`，然后

```bash
git commit -m "<changes>"
```

或者

```bash
git merge --continue
git rebase --continue
```

无法解决的冲突，可以中断

```bash
git merge --abort
git rebase --abort
```

### 版本冲突

- 本地分支与远程主线分支形成分叉提交；合并历史混乱

  ```bash
  # Your branch and 'origin/main' have diverged,
  git pull --rebase			# 以变基方式拉取并合并代码
  git push
  ```

- 相比远程分支，本地分支提交回退或重写历史

  ```bash
  # ! [rejected] main -> main (non-fast-forward)
  git push --force			# 覆盖远程历史
  ```

- 相比远程分支，本地分支落后很多新提交，且自己提交了部分

  ```bash
  git fetch					# 同步远程分支
  git merge origin/main
  git rebase origin/main		# 或者
  ```

- 不相关仓库分支合并

  ```bash
  # # Error：refusing to merge unrelated histories
  git pull origin main --allow-unrelated-histories	# 允许合并下拉
  ```



## 热知识

### CR/LF 换行符

现象：跨平台工作空间提交项目时，**Warning:LF will be replaced by CRLF**，再次clone后文件乱码

原因：换行符主要与CR回车`\r`、LF换行`\n`相关，在不同编辑器和不同平台下具有不同的表示：Linux使用LF换行，而Dos和Windows使用CR LF换行，在编辑器中体现为`Enter`键

- 方法一：更改`git config --[system|global|local]`

  ```bash
  # Windows devs: LF on commit, CRLF on checkout
  git config --global core.autocrlf true
  
  # Linux devs: LF on commit, no conversion on checkout
  git config --global core.autocrlf input
  ```
  
- 方法二：创建项目文件`.gitattributes`

  ```bash
  # Windows devs: LF on commit, CRLF on checkout for text
  * text=auto eol=crlf
  
  # Linux devs: LF on commit, no conversion on checkout for text
  * text=auto eol=lf
  ```

检查当前`git`工具换行符转换配置：

```bash
git config --[system|global|local] core.autocrlf
# If true:		LF <-> CRLF on commit or checkout
# If false:		No conversion
# If input:		CRLF -> LF on commit, no conversion on checkout
# If no output:	Uses Git default behavior (system-dependent)

git config --[system|global|local] core.safecrlf
# If true:		Reject commits with mixed line endings
# If warn:		Allow but warn about mixed line endings 
# If false:		Disable line ending checks
```

使用`vim`命令切换文件中的换行符：

```bash
# Check line ending type
:set ff?
# fileformat=dos    CRLF (Windows format)
# fileformat=unix   LF (Linux/Unix format)

# Change line ending type
:set ff=unix
# Convert to LF (Unix format)
:set ff=dos 
# Convert to CRLF (Windows format)
```

### Tab 制表符

现象：跨平台工作空间提交项目后，代码**层次不齐**

原因：制表符只与Tab制表`\t`有关，其显示宽度由编辑器或平台决定：一般Windows默认1个Tab=4个空格，而Linux里1个Tab=8个空格，同时编辑器（如VS Code、QQ等）支持**自动将Tab转换为若干空格**

- 方法：统一编辑器Tab长度为4个空格，确保代码在不同环境下显示一致且美观

  ```bash
  # vim
  vim /etc/vim/vimrc
  # set tabstop=4
  
  # gedit
  # adjust settings
  ```

### ignorecase 大小写

现象：git在 Windows 上管理仓库时，已有文件或文件夹名称**切换大小写**后提交，再次clone后无变化

原因： Windows 文件系统默认是**大小写不敏感**的，而 Git 依赖文件系统来检测文件变化，当只改变大小写时，Windows 文件系统认为这是同一个文件，Git 无法感知变化

- 方法一：通过 Git 命令强制重命名

  ```bash
  git mv OldFile TempName
  git mv TempName newFile
  ```

- 方法二：配置 Git 区分大小写

  ```bash
  # check current ignorecase
  git config core.ignorecase
  
  # set ignorecase true
  git config core.ignorecase false
  
  # clean the file|folder in cache and readd
  git rm [-r] --cached OldFile
  git add newFile
  ```


除此之外，对于大小写敏感的仓库文件|文件夹|分支|配置项|脚本等等，初次clone到 Windows 文件系统时会存在覆盖问题
