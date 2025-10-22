#!/bin/bash

echo "=== 构建后端二进制文件 ==="

# 保存当前目录
ORIGINAL_DIR=$(pwd)

# 进入后端目录（从src-tauri目录）
cd "$ORIGINAL_DIR/../../backend"

# 激活虚拟环境
source venv/bin/activate

# 使用PyInstaller打包
pyinstaller --onefile --name backend main.py

# 复制到Tauri binaries目录
cp dist/backend ../frontend/src-tauri/binaries/backend

# 赋予执行权限
chmod +x ../frontend/src-tauri/binaries/backend

echo "✅ 后端二进制文件构建完成"

# 返回原目录
cd "$ORIGINAL_DIR"
