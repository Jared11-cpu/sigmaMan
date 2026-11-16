# RUN & STUDY LOG · 阿里云部署上线实战手册

本文档提供将 `D:\running` 全套打卡系统部署至阿里云 ECS 服务器（支持 Ubuntu 22.04 / 24.04、Alibaba Cloud Linux 3、CentOS 7/8/9）的完整实战指南。

---

## 一、前期准备：阿里云安全组端口配置

登录 [阿里云 ECS 管理控制台](https://ecs.console.aliyun.com/)：
1. 进入「实例与镜像」→「网络与安全组」→ 选择当前 ECS 所属安全组。
2. 点击「入方向」→「手动添加」，放行以下端口：
   - **80 / TCP**：HTTP 网站访问（通过 Nginx 接入）。
   - **443 / TCP**：HTTPS 加密访问（SSL 证书）。
   - **3000 / TCP**（可选）：直接访问 Node.js 后端服务或开发联调；若只通过 Nginx 反向代理，可不必对公网开放 3000。
   - **22 / TCP**：SSH 远程终端连接。

---

## 二、部署方式一：Node.js 24 + PM2 直接部署（推荐）

### 1. 安装 Node.js 24
在服务器终端执行：
```bash
# 以 Ubuntu / Debian 为例：
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装进程守护工具 PM2
sudo npm install -g pm2
```

### 2. 上传工程文件
将本机 `D:\running` 目录下的所有文件上传至服务器的 `/var/www/running`：
```bash
# 在本机通过 scp 上传（以公网 IP 为 123.56.78.90 为例）：
scp -r D:\running root@123.56.78.90:/var/www/running
```

### 3. 安装依赖与启动服务
在服务器执行：
```bash
cd /var/www/running/server
npm ci --only=production

# 复制环境变量配置
cp .env.example .env

# 使用 PM2 启动服务（名称：running-app）
pm2 start src/server.js --name "running-app"

# 查看运行状态与日志
pm2 status
pm2 logs running-app

# 设置开机自启
pm2 save
pm2 startup
```

---

## 三、部署方式二：Docker + Docker Compose 一键容器化部署

如果服务器已安装 Docker 和 Docker Compose：

### 1. 一键启动容器
```bash
cd /var/www/running
docker compose up -d --build
```

### 2. 验证运行状态
```bash
docker compose ps
docker compose logs -f
curl http://localhost:3000/api/health
```
数据文件与上传照片已通过数据卷挂载至宿主机的 `./server/data` 和 `./server/uploads`，容器重启或升级不丢数据。

---

## 四、配置 Nginx 反向代理与 HTTPS (SSL)

### 1. 应用 Nginx 配置文件
```bash
sudo cp /var/www/running/nginx.conf.example /etc/nginx/conf.d/running.conf
# 检查语法并重载
sudo nginx -t
sudo systemctl reload nginx
```

### 2. 一键配置 Let's Encrypt 免费 SSL 证书（HTTPS）
若已为域名解析至该服务器 IP：
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```
Certbot 将自动配置 HTTPS 证书、配置定期续期并将 HTTP 自动跳转到 HTTPS。

---

## 五、SQLite 数据备份与灾备恢复方案

系统采用 Node 24 原生 SQLite (`DatabaseSync`)，开启了高并发 WAL 模式。

### 1. 定期自动备份脚本
创建 `/var/www/running/backup.sh`：
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/running"
DATE=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

# 安全备份 SQLite 数据库
sqlite3 /var/www/running/server/data/running.sqlite ".backup '$BACKUP_DIR/running_$DATE.sqlite'"

# 打包上传图片
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C /var/www/running/server uploads

# 保留最近 30 天备份
find "$BACKUP_DIR" -type f -mtime +30 -delete
```
赋权并加入定时任务：
```bash
chmod +x /var/www/running/backup.sh
(crontab -l 2>/dev/null; echo "0 3 * * * /var/www/running/backup.sh") | crontab -
```

### 2. 旧浏览器数据一键迁上云端
在浏览器打开部署好的云端网页，进入右上角「☷ 设置」：
- 在「后端与云端连接」卡片中，点击「一键将当前本地数据迁移至后端」；
- 浏览器将自动将旧的本地存储记录全部安全写入云端 SQLite 数据库中。
