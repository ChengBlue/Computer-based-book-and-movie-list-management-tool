#!/bin/bash
# 书单/影单管理工具 - 一键启动 (Linux/Mac版)

echo "========================================"
echo "  书单/影单管理工具 - 一键启动"
echo "========================================"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 启动后端
echo "[1/2] 启动后端服务器..."
cd "$SCRIPT_DIR/backend"
python run.py &
BACKEND_PID=$!

sleep 2

# 启动前端
echo "[2/2] 启动前端服务器..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo " 启动完成！"
echo " 后端: http://localhost:8000"
echo " 前端: http://localhost:3000"
echo " API文档: http://localhost:8000/docs"
echo "========================================"
echo ""
echo "按 Ctrl+C 停止服务"

# 捕获 Ctrl+C 信号，停止所有进程
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# 等待
wait
