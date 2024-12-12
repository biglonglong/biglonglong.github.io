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
  - [ ] home页有点单调，导入一些有趣的html结构
    - [ ] 加入comment
    - [ ] menu: series、archive时间轴
    - [ ] 移植标签页面到posts
    - [ ] 404美化
    - [ ] nav填充
  - [ ] post更新
- setting
  - [ ] 域名配置
