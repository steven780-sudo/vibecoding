#!/bin/bash

# Chronos 开发服务停止脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${RED}========================================${NC}"
echo -e "${RED}  停止 Chronos 开发服务${NC}"
echo -e "${RED}========================================${NC}\n"

# 停止后端服务（端口8765）
echo -e "${YELLOW}正在停止后端服务...${NC}"
BACKEND_PID=$(lsof -ti:8765)
if [ -n "$BACKEND_PID" ]; then
    kill -9 $BACKEND_PID 2>/dev/null
    echo -e "${GREEN}✓${NC} 后端服务已停止 (PID: $BACKEND_PID)"
else
    echo -e "${YELLOW}⚠${NC}  后端服务未运行"
fi

# 停止前端服务（端口5173）
echo -e "\n${YELLOW}正在停止前端服务...${NC}"
FRONTEND_PID=$(lsof -ti:5173)
if [ -n "$FRONTEND_PID" ]; then
    kill -9 $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✓${NC} 前端服务已停止 (PID: $FRONTEND_PID)"
else
    echo -e "${YELLOW}⚠${NC}  前端服务未运行"
fi

# 清理可能残留的Python进程
echo -e "\n${YELLOW}清理残留进程...${NC}"
pkill -f "uvicorn main:app" 2>/dev/null && echo -e "${GREEN}✓${NC} 清理了uvicorn进程" || echo -e "${YELLOW}⚠${NC}  没有残留的uvicorn进程"

# 清理可能残留的npm进程
pkill -f "vite" 2>/dev/null && echo -e "${GREEN}✓${NC} 清理了vite进程" || echo -e "${YELLOW}⚠${NC}  没有残留的vite进程"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  所有服务已停止${NC}"
echo -e "${GREEN}========================================${NC}\n"
