#!/bin/bash
# Chronos项目设置脚本

echo "🔧 设置 Chronos 开发环境..."
echo ""

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到 Python 3，请先安装 Python 3.10+"
    exit 1
fi

echo "✅ Python 版本: $(python3 --version)"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"
echo ""

# 设置Backend
echo "📦 设置 Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "创建 Python 虚拟环境..."
    python3 -m venv venv
fi

echo "激活虚拟环境并安装依赖..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

echo "✅ Backend 设置完成"
cd ..
echo ""

# 设置Frontend
echo "🎨 设置 Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "安装 npm 依赖..."
    npm install
else
    echo "npm 依赖已存在，跳过安装"
fi

echo "✅ Frontend 设置完成"
cd ..
echo ""

# 完成
echo "🎉 设置完成！"
echo ""
echo "下一步："
echo "  1. 运行 ./start-dev.sh 启动开发环境"
echo "  2. 访问 http://localhost:5173 查看应用"
echo "  3. Backend API 地址: http://127.0.0.1:8765"
echo ""
