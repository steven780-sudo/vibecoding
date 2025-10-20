#!/bin/bash
# Start Chronos Tauri Application

echo "=========================================="
echo "启动 Chronos 桌面应用"
echo "=========================================="
echo ""

# Check if backend binary exists
if [ ! -f "frontend/src-tauri/binaries/backend-aarch64-apple-darwin" ]; then
    echo "后端二进制文件不存在，正在构建..."
    bash backend/build_binary.sh
    if [ $? -ne 0 ]; then
        echo "❌ 后端构建失败"
        exit 1
    fi
fi

echo "启动 Tauri 开发服务器..."
cd frontend && npm run tauri:dev
