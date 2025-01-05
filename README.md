# biglonglong.github.io

*龙犊&amp;小窝@&lt;domain&gt;*

## Install

```bash
# git、nodejs、go、hugo-extended installed
git --version
node --version
go version
hugo version
```


## Usage

```bash
hugo server --buildDrafts
```


## Writing

```bash
hugo new content/{post_title}.md
# open  content/{post_title}.md in typora
```


## Update

```bash
git add .
git commit -m "..."
git push origin main
# go to github.com run workflow
# search for https://biglonglong.github.io
```

## Todo List
- theme
    - domain：域名配置
    - comment：评论系统
    - menu：series、archive时间轴
    - 404 redirect：404页面重定向到未知address
    - tags transplant：tags移植到posts page
    - wiki config：检查PaperMod的wiki
- content
    - about：补充about menu内容
    - Drafts：
        - know - AI alchemical Tips
        - know - Math Base