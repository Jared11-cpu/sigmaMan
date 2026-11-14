# RUN & STUDY LOG · 运动 · 学习 · 自律 · 多人竞技

全功能、高可靠的综合自律打卡工程。支持「运动晨跑·专注学习·每日自律·4 人竞技 PK」双轨八大核心页面。具备**在线真实后端（Node 24 + SQLite 真持久化）**与**离线优雅降级（双击即用 + 本地存储）**自适应双模式，并交付阿里云生产部署配置。

交付根目录：`D:\running`。

---

## 快速开始

### 方式一：在线真实后端模式（推荐 · 支持数据落库与多人实时同步）
1. 双击运行 **`启动后端.cmd`**（或在命令行执行 `npm start`）；
2. 服务将在本机 `http://localhost:3000` 启动，自动初始化 SQLite 数据库；
3. 打开浏览器访问：
   - 主界面：[http://localhost:3000/index.html](http://localhost:3000/index.html)
   - 品牌宣传动效：[http://localhost:3000/film.html](http://localhost:3000/film.html)
   - 健康检查接口：[http://localhost:3000/api/health](http://localhost:3000/api/health)

### 方式二：纯离线单机模式（无服务依赖 · 优雅降级）
- 双击 **`打开网页.cmd`**，通过 `file://` 协议直接在 Chrome / Edge 中打开体验；
- 双击 **`播放动效.cmd`**，观看约 30.5 秒的实时品牌动效；
- 数据保存在当前浏览器本地存储中，零网络、零外部数据库依赖。

---

## 八大核心功能页面

1. **01 首页 (Home)**
   - 400M 跑道全员就位、四维学习雷达图（支持轴标签/节点全域命中聚焦）、双轨 5 步打卡 CTA、今日状态与定时滚动自律语录。
2. **02 进度 (Progress)**
   - 今日/本周/本月双轨仪表盘、全员跑量横条对比、30 天多人累计竞技曲线与双轨线性表交互联动。
3. **03 运动 (Plan)**
   - 月跑量目标加减设置、每周跑步日排程切换、明早跑步快捷开闭、30 天累积跑量数据点 crosshair 查询。
4. **04 学习 (Study)**
   - 月度学习目标分解管理、快捷 `+0.5h/+1.0h` 极速打卡、内置番茄钟倒计时（专注完成自动记入目标与历史档案）。
5. **05 排名 (Ranking)**
   - 今天/本周/本月/总榜四大周期；综合积分、按公里、按学习、按天数、按人气多维度排序；支持点赞互动并实时影响总积分与排行榜。
6. **06 成就 (Achievements)**
   - 18 枚双轨成就徽章（晨跑轨与研读轨），3D 翻面动效、进度条指示与动态点亮解锁逻辑。
7. **07 记录 (Records)**
   - 运动/学习双模式切换、5 种统计分析图表、分页与记录卡片切换、真实打卡照片预览、配速与专注度展示、删除记录。
8. **08 自律 (Discipline)**
   - 4 人伙伴名单管理与共同打卡、每日自律习惯矩阵勾选、28 天三合一自律热力格（早起/跑步/学习/作息全景）、明日行动清单备忘。

---

## 技术架构与后端设计

- **运行环境**：Node.js v24 + SQLite（基于 Node 24 原生 `node:sqlite` `DatabaseSync`，零外部数据库依赖，已开启 WAL 高性能模式）。
- **RESTful API**：
  - `GET /api/health`：服务健康检查、运行时间与表记录统计。
  - `GET /api/state`：按房间拉取前后端一致的全量状态数据结构。
  - `GET /api/events`：SSE (Server-Sent Events) 实时长连接，多标签页/多端操作毫秒级同步。
  - `POST /api/records/sport` & `DELETE /api/records/sport/:id`：运动打卡与自动完成行动自律项（`hb-3`）。
  - `POST /api/records/study` & `DELETE /api/records/study/:id`：学习打卡、番茄钟入库与目标小时数联动。
  - `POST /api/records/:kind/:id/like`：点赞持久化与计数影响排行。
  - `POST /api/uploads`：真实打卡照片上传，存入本地并返回访问 URL。
  - `PATCH /api/plans`：运动月目标、跑步日、学习月目标、学习日排程持久化。
  - `PUT /api/habit-logs`：每日每成员习惯勾选状态持久化。
  - `POST /api/study-targets` & `DELETE /api/study-targets/:id`：学习目标管理。
  - `POST /api/habits` & `DELETE /api/habits/:id`：自律习惯项管理。
  - `POST /api/members` & `DELETE /api/members/:name`：添加/移除伙伴。
  - `POST /api/rename`：重命名用户并级联更新历史记录归属。
  - `GET /api/export` & `POST /api/import`：完整 JSON 数据备份导出与云端数据迁移导入。
  - `DELETE /api/records`：安全清空打卡记录并保留目标与习惯。

---

## 阿里云生产部署

工程根目录已交付完整的生产上线配置：
- **`DEPLOY_ALIYUN.md`**：详细的阿里云部署实操手册（含 ECS 安全组端口开放、Node 24 / PM2 或 Docker 部署、Nginx 反向代理、HTTPS SSL 与定期备份）。
- **`Dockerfile` & `docker-compose.yml`**：标准轻量容器化部署定义。
- **`nginx.conf.example`**：包含静态文件缓存、SSE 长连接透传、`/api/` 代理与图片上传限制的 Nginx 配置文件。

---

## 交付文件清单

| 文件 / 目录 | 说明 |
|---|---|
| `index.html` / `style.css` / `desktop.css` / `app.js` | 运动·学习·自律 8 页面主交互工程 |
| `film.html` / `film.css` / `film.js` | 30.5 秒综合自律品牌动效 |
| `server/` | Node 24 + SQLite 轻量高可靠后端服务 |
| `server/data/running.sqlite` | SQLite 真持久化数据库文件（含 WAL 模式） |
| `server/uploads/` | 打卡照片存储目录 |
| `启动后端.cmd` | Windows 本地一键启动后端服务 |
| `打开网页.cmd` / `播放动效.cmd` | 离线双击启动脚本 |
| `Dockerfile` / `docker-compose.yml` | 阿里云容器化上线配置 |
| `nginx.conf.example` | 阿里云 Nginx 生产反向代理配置 |
| `DEPLOY_ALIYUN.md` | 阿里云完整部署指南与灾备手册 |
| `server-verification.json` | 本地真实运行与功能闭环验证报告 |

## GitHub Pages
https://Jared11-cpu.github.io/sigmaMan/

Pages 使用浏览器本地存储；多人实时同步需另行部署 Node.js 后端。

