---
date: '2024-12-11'
draft: true
lastmod: '2024-12-11'
title: 'Git Record'
tags: ["first"]
---



date: 2024-11-26
title: Git Record
subtitle: 管理 Github 仓库的 Git 命令集记录
summary: 管理仓库时的一份Git和GitHub的实用记录，涵盖从本地仓库初始化到远程仓库关联的基础操作，以及分支管理、版本回退、冲突解决等核心内容，同时提供查看历史记录、设置标签、跨平台换行符处理等技巧，帮助用户高效管理代码版本和协作开发。

## 在开始之前\.\.\.

本文基于 *git* & *Github*，记录仓库版本控制过程中的一些 *warning* 、 *Fatal* 及其 *Solution*，以防 *biglonglong* 在之后仓库管理过程中反复迷失。

在开始之前，你至少完成了以下基本配置：

1. git安装，设置本地机器标识；
2. Github注册，建立本地git与远程Github的 *ssh* 密钥连接；
3. property设置，方便git操作。

简单来说，git构建多分支版本树（v1.0 -> v1.1 -> … -> v1.9 -> <分支名> -> [HEAD]，其中HEAD仅指向当前工作分支），跟踪文件的更改，具体不再多赘述。

我希望你具有了对git和Github的基本认识后，再来看这篇文章，以作为你开发过程中的 *cheat sheet*。对于入门攻略，这里做一些推荐：

- [git - the simple guide - no deep shit!](https://rogerdudler.github.io/git-guide/)
- [Git Immersion](https://gitimmersion.com/)



## 项目发布

1. 在项目文件夹创建本地版本库，默认分支为master，对项目内容进行更新并提交

   ```bash
   git init
   git branch -m master main      	# 与远程分支对齐
   git status
   ...								# 项目开发
   vim README.md
   git add .
   git commit -m "<changes>"
   ```

2. 在远程Github建立远程裸仓库，默认分支为main，记录远程仓库地址，拉去远程仓库到本地

   ```bash
   git clone <address>
   ```

3. 本地仓库分支与远程保持一致，建立远程仓库origin连接

   ```bash
   git branch -m master main
   git remote add origin git@github.com:<author>/<project>.git
   ```

4. 建立分支的upstream（只在第一次需要这么做，之后直接push即可）

   ```bash
   git push -u origin main
   ```



## 分支开发

1. 检查仓库远程和分支

   ```bash
   git remote 											# 检查远程仓库名
   git remote show <name>		  	 		 			# 检查远程仓库<name>对应address
   git branch -a										# 检查仓库所有分支
   ```

2. 创建本地工作分支dev，在dev分支上进行开发

   ```bash
   git checkout -b dev									# 创建dev分支
   git checkout dev									# 切换到dev分支
   ...											   		# 项目开发
   git add .
   git commit -m "<changes>"
   ```

3. 切换到main分支，拉取最新代码

   ```bash
   git checkout main									# 切换回main分支
   git pull origin main								# 拉取远程main分支最新代码 
   
   # Error：refusing to merge unrelated histories      
   # git pull origin main --allow-unrelated-histories	    允许冲突下拉
   # vim ...												进入文件解决冲突并重新提交
   # git add .												
   # git commit -m "<conflicts>"
   # git push -u origin main								统一冲突
   ```

4. 切换到dev分支进行rebase/merge

   ```bash
   git checkout dev									# 再次切换到dev分支
   git merge main/git rebase main						# 合并main分支到dev分支
   
   # Error：contains work that you do not have
   # vim ...												进入文件解决冲突并重新提交 
   # git add .												
   # git commit -m "<conflicts>"
   # git rebase --continue| --skip | --abort				如果变基，变基合并继续|跳过|中断
   ```

5. 切换到main分支进行merge并提交到远程服务器

   ```bash
   git checkout main									# 再次切换回main分支
   git merge dev										# 合并dev分支到main分支
   git push origin main 								# 提交
   ```

6. 删除多余的dev分支

   ```bash
   git checkout main
   git branch -D dev									# 删除本地dev分支
   git push origin --delete dev						# 删除远程dev分支
   ```



## 历史回退

### 辅助工具

- git hist：查看版本历史，获取版本哈希

  ```bash
  git log --pretty=format:\"%C(yellow)%h %C(blue)%ad %C(reset)%s %C(green)[%cn] %C(red)%d\" --decorate --date=short
  git checkout <hash>						# 切换到<hash>版本查看内容
  git checkout <branch>					# 切换回<branch>分支最新版本
  ```

- git tag：给当前版本哈希值取别名

  ```bash
  git tag <hashname>
  ```

### 版本回退

- git reset：回退到之前某版本，且清除该版本后的版本记录

  ```bash
  # 回退前：v1.0 -> v1.1<hash> -> v1.2 -> v1.3 -> dev -> [HEAD]
  # 回退后：v1.0 -> v1.1 -> dev -> [HEAD]
  git reset --hard <hash>
  # 此时本地版本树与远程版本树不一致，需要强制
  git push -f
  ```

- git revert：单独撤销某版本的提交

  ```bash
  # 回退前：v1.0 -> v1.1<hash> -> v1.2 -> dev -> [HEAD]
  # 回退后：v1.0 -> v1.1 -> v1.2 -> -> v1.3(v1.0+v1.2) -> dev -> [HEAD]
  git revert -n <hash>
  # 这里可能出现冲突，此时要修改源文件并add+commit
  git push
  ```

### 暂存回退

- 暂存前（未git add）

  ```bash
  git checkout -- <file>
  ```

- 暂存后（未git commit）

  ```bash
  git reset HEAD <file>
  ```

- 已提交（git commit）

  ```bash
  # 参考版本回退
  ```



## 冷知识

### CRLF换行符

> 现象：跨平台工作空间commit项目时**Warning:LF will be replaced by CRLF**，再次clone后文件乱码
>
> 原因：换行主要与CR回车`\r`、LF换行`\n`相关，文件行尾的换行符在不同编辑器和不同平台下具有不同的表示：Linux和macOS使用LF换行，而Dos和Windows使用CR LF换行，在编辑器中体现为KEY `Enter`

- 更改`git config --global|system|local`

  ```bash
  # 单独开发的程序员：提交检出均不转换
  $ git config --global core.autocrlf false
  
  # 多人协作跨平台开发的window程序员：提交时转换为LF，检出时转换为CRLF
  $ git config --global core.autocrlf true
  
  # 多人协作跨平台开发的Linux程序员：提交时转换为LF，检出时不转换
  $ git config --global core.autocrlf input
  ```

- 创建项目文件 *.gitattributes* 设置 *eol=crlf* 或者 *eol=lf*