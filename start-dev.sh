#!/bin/bash
# Chronos开发环境启动脚本

echo "🚀 启动 Chronos 开发环境..."
echo ""

# 检查是否在项目根目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 启动Backend
echo "📦 启动 Backend 服务器..."
cd backend
if [ ! -d "venv" ]; then
    echo "❌ 错误：Backend虚拟环境不存在，请先运行 setup.sh"
    exit 1
fi

# 在后台启动Backend
./venv/bin/uvicorn main:app --host 127.0.0.1 --port 8765 --reload &
BACKEND_PID=$!
echo "✅ Backend 已启动 (PID: $BACKEND_PID) - http://127.0.0.1:8765"
cd ..

# 等待Backend启动
echo "⏳ 等待 Backend 启动..."
sleep 3

# 启动Frontend
echo "🎨 启动 Frontend 开发服务器..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "❌ 错误：Frontend依赖未安装，请先运行 npm install"
    exit 1
fi

# 在前台启动Frontend（这样可以看到日志）
npm run dev

# 当Frontend停止时，也停止Backend
echo ""
echo "🛑 停止 Backend 服务器..."
kill $BACKEND_PID 2>/dev/null
echo "✅ 开发环境已关闭"
