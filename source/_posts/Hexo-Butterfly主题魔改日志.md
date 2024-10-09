---
title: Hexo-Butterfly主题魔改日志
categories: 博客建设
tags:
  - Hexo
  - Butterfly
  - 主题魔改
abbrlink: 207a2f35
date: 2024-10-09 15:32:31
---

## 在开始之前…

本文基于`hexo 7.3.0` & `Butterfly 5.0.0`，记录`龙犊&小栈`主题源码魔改，以防`biglonglong`在日后的魔改中迷失。

魔改方案来自于各方大佬，`biglonglong`将主题目录`Butterfly`修改为`custom`，其他魔改源码也存在于各级目录下`custom`中。

在此之前，你至少完成了：

1. Hexo网站及Butterfly主题搭建、部署和配置；
2. 了解Hexo基本命令、自定义css和js的inject配置；
3. 博客网站风格的设想。

准备好了吗？让我们开始吧！



## loading加载动画

### 效果预览

`fullpage`与`pace`同时启用

![image-20241009162320628](img/image-20241009162320628.png)

### 配置

头像预加载`themes/custom/layout/includes/loading/fullpage-loading.pug`，修改如下；而进度条预加载`themes/custom/layout/includes/loading/pace.pug`，不用修改

```pug
#loading-box(onclick='document.getElementById("loading-box").classList.add("loaded")')
  .loading-bg
    div.loading-img
    .loading-image-dot
//- fullpage-avatar

script.
  (()=>{
    const $loadingBox = document.getElementById('loading-box')
    const $body = document.body
    const preloader = {
      endLoading: () => {
        $body.style.overflow = 'auto'
        $loadingBox.classList.add('loaded')
      },
      initLoading: () => {
        $body.style.overflow = ''
        $loadingBox.classList.remove('loaded')
      }
    }

    preloader.initLoading()
    window.addEventListener('load', preloader.endLoading)

    if (!{theme.pjax && theme.pjax.enable}) {
      btf.addGlobalFn('pjaxSend', preloader.initLoading, 'preloader_init')
      btf.addGlobalFn('pjaxComplete', preloader.endLoading, 'preloader_end')
    }
  })()
```

预加载启动器`themes/custom/layout/includes/loading/index.pug`，修改如下

```pug
if theme.preloader.enable
  if theme.preloader.source === 1
    include ./fullpage-loading.pug
  else if theme.preloader.source === 2
    include ./pace.pug
  else
    include ./fullpage-loading.pug
    include ./pace.pug
```

自定义进度条样式`source/css/custom/progress_bar.css`，创建如下

```css
.pace {
    -webkit-pointer-events: none;
    pointer-events: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    z-index: 2000;
    position: fixed;
    margin: auto;
    top: 10px;
    left: 0;
    right: 0;
    height: 8px;
    border-radius: 8px;
    width: 4rem;
    background: #eaecf2;
    border: 1px #e3e8f7;
    overflow: hidden;
}
  
.pace-inactive .pace-progress {
    opacity: 0;
    transition: 0.3s ease-in;
}
  
.pace .pace-progress {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    -ms-box-sizing: border-box;
    -o-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-transform: translate3d(0, 0, 0);
    -moz-transform: translate3d(0, 0, 0);
    -ms-transform: translate3d(0, 0, 0);
    -o-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    max-width: 200px;
    position: absolute;
    z-index: 2000;
    display: block;
    top: 0;
    right: 100%;
    height: 100%;
    width: 100%;
    background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
    animation: gradient 1.5s ease infinite;
    background-size: 200%;
}
  
.pace.pace-inactive {
    opacity: 0;
    transition: 0.3s;
    top: -8px;
}

@keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
}
```

自定义头像样式`source/css/custom/avatar.css`， 其中 `url` 即 loading图片地址`。

```css
.loading-img {
    background: url(/img/custom/avatar.png) no-repeat center center;
    background-size: cover;
}
```

预加载样式`themes/custom/source/css/_layout/loading.styl`，修改如下，注意在`themes/custom/source/css/var.styl`中替换颜色代码`$preloader-bg`值为自己的设计，其在全局`themes/custom/source/css/_global/index.styl`中有`--preloader-bg: $preloader-bg`，同时修改暗色模式`themes/custom/source/css/_mode/darkmode.styl`下颜色代码`--preloader-bg`值

```stylus
if hexo-config('preloader.enable')
  .loading-bg
    display: flex;
    width: 100%;
    height: 100%;
    position: fixed;
    background: var(--preloader-bg);
    z-index: 1001;
    opacity: 1;
    transition: .3s;

  #loading-box
    .loading-img
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin: auto;
      border: 4px solid #f0f0f2;
      animation-duration: .3s;
      animation-name: loadingAction;
      animation-iteration-count: infinite;
      animation-direction: alternate;
    .loading-image-dot
      width: 30px;
      height: 30px;
      background: #6bdf8f;
      position: absolute;
      border-radius: 50%;
      border: 6px solid #fff;
      top: 50%;
      left: 50%;
      transform: translate(18px, 24px);
    &.loaded
      .loading-bg
        opacity: 0;
        z-index: -1000;

  @keyframes loadingAction
    0% {
        opacity: 1;
    }

    100% {
        opacity: .4;
    }
```

最后修改`theme.preloader`选项，`source`设置见预加载启动器

```yaml
# Loading Animation
preloader:
  enable: true
  # source
  # 1. fullpage-loading
  # 2. pace (progress bar)
  # else all
  source: 3
  # pace theme (see https://codebyzach.github.io/pace/)
  pace_css_url: /css/custom/progress_bar.css
  # custom avatar
  avatar: 
```

