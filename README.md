# VIBE SCIENCE · 科普视频馆

独立的静态科学视频馆，收录黑洞与时间、竖直运动、弧度制。中文为主、英文辅助；720p H.264/AAC公开版，保留原始1080p工程及个人收藏版本。

## 网站与播放

`site/` 为无构建依赖的静态网页。视频使用原生HTML5 controls、playsinline和Safari原生全屏入口，支持章节跳转和浏览器本机进度保存；无广告和跟踪脚本。公开初始版本设置noindex，不主动推广。

## 媒体与部署

- MP4只保存在本仓库`public-v1` Release附件中，不提交到Git历史；仅公开经过审核、替换为原创配乐的720p版本。
- GitHub Pages工作流手动触发，下载三条白名单媒体并核对`media-sha256.txt`，打包到同源Pages站点。
- 使用GitHub官方checkout/configure-pages/upload-pages-artifact/deploy-pages动作，固定到已核实的提交。
- `work/`、`qa/`、音频中间文件、MP4及本地工程路径不纳入仓库。
- 音乐、图像、知识来源与版权联系入口见网站`sources.html`和`PUBLIC_MEDIA_LICENSES.md`。

此仓库独立于Voidfall和PRIVATE视频交付仓库，不修改两者配置或内容。
