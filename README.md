# biglonglong.github.io
*龙犊&amp;小栈  SOURCE&amp;STATIC @&lt;domain&gt;*


## Start
```bash
# git、node.js installed
npm install  
```


## Writing
```bash
hexo new draft <DraftName>
hexo server --draft
hexo publish <DraftName>
```


## Update
1. 推送源码 -> Github/source
```bash
git add .
git commit -m "..."
git push
```
2. 推送页面 -> Github/master
```bash
hexo clean
hexo generate -d
```


## Todo List
- [ ] tab focus exchange name
- [ ] custom aside
- [ ] icon repo\music\sitemap\comment system\friend links\
- [ ] tag plugins
- [ ] blog design
- [ ] demain settings
- [ ] picture bed server dealing with source_post