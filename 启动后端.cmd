@echo off
chcp 65001 >nul
cd /d "%~dp0"
title RUN & STUDY LOG 后端服务
echo ========================================================
echo   RUN & STUDY LOG · 本地服务启动中 (Node 24 + SQLite)
echo ========================================================
echo.
echo 正在检查 Node.js 环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node 24 或更高版本。
    pause
    exit /b 1
)

echo 正在启动后端服务与 SQLite 数据库...
set NODE_PATH=%~dp0server\node_modules
node server\src\server.js
pause
