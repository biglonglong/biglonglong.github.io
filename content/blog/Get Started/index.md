---
# general config
title: Get Started
subtitle: "the first post for test"
date: 2024-11-25

# card specific config
summary: the sumary can't cut automatically, so it need written by self.
cardimage: Get-Started_card.jpg
authors:
  - biglonglong: biglonglong.jpg

# post specific config
featureimage: Get-Started_feature.jpg
caption: featureimage caption, Let's Start!
toc: true
---

## Custom
- Hugo will use this file when building your site instead of the equivialent theme file in `./layouts/_default/*`.
- Add any custom CSS to `./assets/css/custom.css`; Add any custom JS to `./assets/css/custom.js`.
- `./archetypes` is a template library for blog.
- maybe we can say something in `./cotent/_index.md`.



## Inline Images

{{< figArray subfolder="images" figCaption="A nice figure caption :wave:" numCols=2 >}}



## Update

The theme version used to build the site is defined in go.mod file.

The best practice is to update to released and tested versions. To update to a specific version execute the following command in a terminal/commandline (at the root path of your site repo):

```bash
hugo mod get github.com/chrede88/qubt@vX.Y.Z
```

Replace X,Y & Z with the corresponding version numbers. You can find the releases here. Please check if any breaking changes are listed under the release you want to update to, before proceeding.

