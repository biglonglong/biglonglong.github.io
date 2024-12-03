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
hugo server
```


## Writing

```bash
hugo new blog/{post_title}/index.md
# open blog/{"post_title"}/index.md in typora
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

  - [ ] 载入一些其他的结构，可能需要重新code源代码了
  - [ ] 载入blog：blogmeta、xhs、BaiduNetWork、PhonePhoto
  - [ ] 更多的icon，也意味着经营更多的平台，例如小红书、抖音等
  - [ ] resume.pdf
  - [ ] tags category
- [ ] menu item：日记
- setting

  - [ ] 域名配置

  - [ ] 图床配置

  - [ ] 标签固定：abbrlink
  - [ ] 本地化：go.mod -> hugo mod vendor
