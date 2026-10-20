# VIBE SCIENCE · 科普视频馆

独立的静态科学视频馆，收录黑洞与时间、竖直运动、弧度制。中文为主、英文辅助；720p H.264/AAC公开版，保留原始1080p工程及个人收藏版本。

## 网站与播放

`docs/` 为可直接发布的静态网页，`site/` 保留首版源文件。视频使用原生HTML5 controls、playsinline和Safari原生全屏入口，支持章节跳转和浏览器本机进度保存；无广告和跟踪脚本。公开初始版本设置noindex，不主动推广。

## 媒体与部署

- MP4只保存在本仓库`public-v1` Release附件中，不提交到Git历史；仅公开经过审核、替换为原创配乐的720p版本。
- GitHub Pages 发布源选择 **Deploy from a branch → main → /docs → Save**。
- 不上传自定义 `.github/workflows` 文件，不申请额外 workflow 权限。GitHub 自身仍会执行托管的 Pages 构建与部署。
- 网页直接引用 `public-v1` Release 的三条已审核附件；公开 CDN 支持 HTTP Range。附件大小及 SHA-256 记录于 `media-sha256.txt` 和 `docs/media/manifest.json`。
- `work/`、`qa/`、音频中间文件、MP4及本地工程路径不纳入仓库。
- 音乐、图像、知识来源与版权联系入口见网站`sources.html`和`PUBLIC_MEDIA_LICENSES.md`。

此仓库独立于Voidfall和PRIVATE视频交付仓库，不修改两者配置或内容。
