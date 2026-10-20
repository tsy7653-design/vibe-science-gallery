# VIBE SCIENCE · 科普视频馆

独立的静态科学视频馆，收录黑洞与时间、竖直运动、弧度制。中文为主、英文辅助；720p H.264/AAC公开版，保留原始1080p工程及个人收藏版本。

## 网站与播放

`docs/` 为可直接发布的静态网页，`site/` 保留首版源文件。视频使用原生HTML5 controls、playsinline和Safari原生全屏入口，支持章节跳转和浏览器本机进度保存；无广告和跟踪脚本。公开初始版本设置noindex，不主动推广。

## 媒体与部署

- 三部720p公开视频均由 `docs/videos/` 同源直接播放，H.264/AAC、yuv420p、faststart；不经过 Release 下载跳转。黑洞首轮同源方案已通过用户真实 iPhone Safari 测试；本次优化后的文件及另外两部仍须区分浏览器技术检查和用户真机验收。
- GitHub Pages 发布源选择 **Deploy from a branch → main → /docs → Save**。
- 不上传自定义 `.github/workflows` 文件，不申请额外 workflow 权限。GitHub 自身仍会执行托管的 Pages 构建与部署。
- 当前文件名为 `videos/*-720p-web-v2.mp4`，大小、码率及 SHA-256 见 `docs/media/manifest.json`。旧版 `public-v1` Release 和首轮黑洞文件保留；根目录 `media-sha256.txt` 继续记录旧 Release 附件。
- 首页不为 video 指定 src，preload=none；用户点击才加载所选影片，关闭时暂停并移除源。加载期间显示封面和克制的进度标记，首帧呈现后退出；保留原生控制、进度定位、全屏与本机进度恢复。
- 播放器“播放信息”记录 loadedmetadata、canplay、实际首帧和错误码，仅保留当前页面内存，不发送遥测。首帧优先使用 requestVideoFrameCallback；旧浏览器用 loadeddata 估计并明确标记。
- `work/`、`qa/`、音频中间文件、MP4及本地工程路径不纳入仓库。
- 音乐、图像、知识来源与版权联系入口见网站`sources.html`和`PUBLIC_MEDIA_LICENSES.md`。

此仓库独立于Voidfall和PRIVATE视频交付仓库，不修改两者配置或内容。
