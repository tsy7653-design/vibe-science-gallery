# VIBE SCIENCE Studio — 静态审片数据 v1

部署继续使用现有 GitHub Pages `main /docs`。入口 `/studio/`，不需要安装、数据库、登录、API Key或GitHub Token。首页文件及正式播放器独立，不引用Studio脚本；Studio没有首页导航入口。

## 新增项目

1. 在 `data/` 新建一份JSON，以 `escape-gravity-r2.json` 为完整示例。保持 `schemaVersion: 1`，使用稳定项目 `id` 与独立 `version`。
2. 在 `data/catalog.json` 的 `projects` 增加 `{id,title,data}`。新项目可用 `?project=<id>` 直达；`defaultProject` 决定默认项目。
3. 内容字段：`narratives`、`timeline`、`resources`、`risks`、`sources`、`nextPreviews`、`referenceClips`、`previews`、`history`。可更改内容而不修改页面组件。
4. `stageIndex` 为0–4，对应资料调查、三种方案、动态样片、正式版审查、上架。状态不能比真实制作进度提前。
5. `heroResource` 指向一个已审查的 `resources[].id`。所有图片、海报、MP4路径均相对Studio根目录，必须同源并位于Studio下。

## 视频与版本

- 尚未制作动态样片时保留 `previews: []`，页面明确显示“尚无动态样片”。
- 资源实测录制与官方素材放 `referenceClips`，不能移到 `previews` 冒充本项目作品。
- 真实制作完成的样片加入 `previews`：`{id,title,version,src,poster,note,publicApproved:true}`。没有核实公开许可的文件不得上传，不能仅靠前端隐藏。
- H.264/AAC（无声样片可无AAC）、yuv420p、faststart，默认720p。视频默认无src，点按后才加载；不复用Release下载链接做在线播放源。
- 使用新文件名保存视频版本，保留旧版；不要覆盖旧MP4。增加 `history` 解释变化，更新项目 `version` 与 `updatedAt`。
- 修改数据后更新版本/缓存标记（HTML中的CSS/JS查询串、JS目录查询串）；不要只改文件而让手机长期显示旧内容。

## 审查意见

`localStorage`键为 `vibe-studio:review:v1:<project-id>:<version>`，不同项目/版本的意见分开。它不是后台数据库，不跨设备同步。复制函数在点击手势内直接调用Clipboard API，失败则显示可长按复制的完整文本。未选择时保持空值，不自动采用编导推荐。

复制反馈含项目、版本、选择、意见和当前审查链接；不会发送请求，也不构成后台渲染任务。没有服务器评论入口，不在浏览器存放凭据。

## 发布前核查

- 核实每个实际上传文件的公开权利、署名与改动说明；在 `credits.html` 及资源卡中更新，许可证原文放 `licenses/`。
- `assets/manifest.json`记录公开资源的字节与SHA-256；发布只允许预先审查的文件。
- 检查320/390px手机、横屏与桌面，无水平溢出；展开A/B/C、分镜与图片；验证本机草稿与复制回退。
- 视频检查HTTP Content-Type/Range及loadedmetadata、canplay、seeked、error事件；Chrome手机尺寸不能代替真实iPhone Safari验收。
- 对比正式首页/播放器/视频文件与发布前哈希，不改其他仓库或现有公开视频。

`noindex`减少搜索收录，**不提供访问权限控制**。此目录及仓库可公开读取；私密素材不得提交，即使没有首页入口。
