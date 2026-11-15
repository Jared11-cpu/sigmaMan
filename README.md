# next_sigmaman (sigmaMan)

> RUN & STUDY LOG · 多人竞技、学习、自律与综合运动打卡平台（纯静态可部署版）
> GitHub Pages 专属发布分支/目录：适配 `/sigmaMan/` 任意子路径访问

## 🌟 在线体验 (GitHub Pages)

部署就绪后访问链接格式：
`https://jared11-cpu.github.io/sigmaMan/`

- **首页 / 打卡总览**: `https://jared11-cpu.github.io/sigmaMan/`
- **品牌动效 30s**: `https://jared11-cpu.github.io/sigmaMan/film.html`
- **像素进度条设计规范与演练**: `https://jared11-cpu.github.io/sigmaMan/pixel-progress-demo.html`

---

## 🚀 静态站点与 GitHub Pages 特性

1. **零后端依赖 (纯静态运行)**：
   - 包含完整的离线优先 (`localStorage`) 本地状态管理系统。
   - 自动检测后端连接。当部署于 GitHub Pages 时，无 Node.js / SQLite 环境下平滑切换至离线模式（Dual-Mode），所有打卡、习惯勾选、计时、复盘、名字修改均可完整在浏览器端正常运行并本地持久化。
2. **相对路径兼容**：
   - 全量 CSS、JavaScript、SVG 图标与静态演示资源均严格采用相对路径引用，天然支持 GitHub Pages 的二级子路径（如 `/sigmaMan/`）。
3. **已排除私有与服务端资源**：
   - 排除任何个人打卡隐私、真实用户照片、SQLite 数据库文件、环境变量与服务进程脚本。
   - 内置安全通用的示例数据（示例名字、通用学习分类、日常作息习惯）。
4. **单页应用 Fallback**：
   - 根目录下已内置 `.nojekyll` 阻止 Jekyll 过滤。
   - 附带 `404.html` 保障路径重载友好。

---

## 📁 目录文件清单

| 文件 | 描述 |
|---|---|
| `index.html` | 主应用入口，涵盖打卡、排行榜、成就、习惯、专注页面 |
| `app.js` | 核心前端应用脚本，包含像素火焰/闪电画笔、组件路由与离线存储逻辑 |
| `style.css` | 全局复古像素风格 UI 系统与色彩层级定义 |
| `desktop.css` | 宽屏响应式布局优化增强样式 |
| `pixel-progress.js` | 阶梯式流光像素进度条与环形能量组件引擎 |
| `pixel-progress.css` | 像素进度条与环形进度条组件样式 |
| `film.html` | 30 秒独立品牌动效播放页 |
| `film.js` | 品牌动效播放交互逻辑 |
| `film.css` | 品牌动效专属动画与电影字幕排版 |
| `logo.svg` | 站点 Logo 图标与 Favicon |
| `pixel-progress-demo.html` | 像素进度条独立展示与交互沙盒 |
| `preview.jpg` | 站点分享预览海报图 |
| `film-preview.jpg` | 动效分享预览封面图 |
| `.nojekyll` | GitHub Pages 静态绕过标志 |
| `404.html` | 静态路由容错跳转页 |

---

*生成于 2026-11-16 · 由 Kiwi 机器人准备静态发布快照*
