#!/bin/bash
# Chronos MVP - 环境验证脚本

echo "=========================================="
echo "Chronos MVP 环境验证"
echo "=========================================="
echo ""

# 检查 Python 版本
echo "1. 检查 Python 版本..."
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Python 3 未安装"
    exit 1
fi
echo "✅ Python 已安装"
echo ""

# 检查 Node.js 版本
echo "2. 检查 Node.js 版本..."
node --version
if [ $? -ne 0 ]; then
    echo "❌ Node.js 未安装"
    exit 1
fi
echo "✅ Node.js 已安装"
echo ""

# 检查后端虚拟环境
echo "3. 检查后端虚拟环境..."
if [ -d "backend/venv" ]; then
    echo "✅ 后端虚拟环境已创建"
else
    echo "❌ 后端虚拟环境未创建"
    exit 1
fi
echo ""

# 检查后端依赖
echo "4. 检查后端依赖..."
backend/venv/bin/python -c "import fastapi, uvicorn, pydantic" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ 后端依赖已安装"
else
    echo "❌ 后端依赖未安装"
    exit 1
fi
echo ""

# 检查前端依赖
echo "5. 检查前端依赖..."
if [ -d "frontend/node_modules" ]; then
    echo "✅ 前端依赖已安装"
else
    echo "❌ 前端依赖未安装"
    exit 1
fi
echo ""

# 运行后端测试
echo "6. 运行后端测试..."
backend/venv/bin/pytest backend/tests/ -v --tb=short
if [ $? -eq 0 ]; then
    echo "✅ 后端测试通过"
else
    echo "❌ 后端测试失败"
    exit 1
fi
echo ""

# 运行前端测试
echo "7. 运行前端测试..."
cd frontend && npm run test && cd ..
if [ $? -eq 0 ]; then
    echo "✅ 前端测试通过"
else
    echo "❌ 前端测试失败"
    exit 1
fi
echo ""

# 检查代码格式
echo "8. 检查后端代码格式..."
backend/venv/bin/black backend/ --check
if [ $? -eq 0 ]; then
    echo "✅ 后端代码格式正确"
else
    echo "⚠️  后端代码需要格式化（运行: backend/venv/bin/black backend/）"
fi
echo ""

echo "9. 检查后端代码规范..."
backend/venv/bin/ruff check backend/
if [ $? -eq 0 ]; then
    echo "✅ 后端代码规范检查通过"
else
    echo "⚠️  后端代码有规范问题（运行: backend/venv/bin/ruff check backend/ --fix）"
fi
echo ""

echo "=========================================="
echo "✅ 环境验证完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 启动后端: ./backend/start.sh"
echo "2. 启动前端: ./frontend/start.sh"
echo "3. 访问应用: http://localhost:5173"
echo ""
