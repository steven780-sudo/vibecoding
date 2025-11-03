#!/bin/bash

# Chronos v2.0 - Development Start Script

echo "🚀 Starting Chronos v2.0 Development Environment..."
echo ""

# 创建数据库目录
mkdir -p database

# 启动开发服务器
echo "Starting servers..."
npm run dev
