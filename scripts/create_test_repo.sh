#!/bin/bash

# 创建全新的测试仓库脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  创建Chronos测试仓库${NC}"
echo -e "${BLUE}========================================${NC}\n"

# 设置测试目录路径
TEST_DIR="$HOME/Desktop/chronos-test-new"

# 如果目录已存在，删除它
if [ -d "$TEST_DIR" ]; then
    echo -e "${YELLOW}⚠️  测试目录已存在，正在删除...${NC}"
    rm -rf "$TEST_DIR"
fi

# 创建测试目录
echo -e "${GREEN}✓${NC} 创建测试目录: $TEST_DIR"
mkdir -p "$TEST_DIR"

# 创建一些测试文件
echo -e "\n${BLUE}创建测试文件...${NC}"

echo "这是一个普通文本文件" > "$TEST_DIR/readme.txt"
echo -e "${GREEN}✓${NC} 创建: readme.txt"

echo "# 项目说明" > "$TEST_DIR/project.md"
echo -e "${GREEN}✓${NC} 创建: project.md"

mkdir -p "$TEST_DIR/docs"
echo "文档内容" > "$TEST_DIR/docs/guide.txt"
echo -e "${GREEN}✓${NC} 创建: docs/guide.txt"

# 创建系统文件（这些应该被自动忽略）
echo "macOS系统文件" > "$TEST_DIR/.DS_Store"
echo -e "${YELLOW}✓${NC} 创建: .DS_Store (系统文件)"

echo "Windows系统文件" > "$TEST_DIR/Thumbs.db"
echo -e "${YELLOW}✓${NC} 创建: Thumbs.db (系统文件)"

mkdir -p "$TEST_DIR/.vscode"
echo '{"setting": "value"}' > "$TEST_DIR/.vscode/settings.json"
echo -e "${YELLOW}✓${NC} 创建: .vscode/settings.json (IDE配置)"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  测试目录创建完成！${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "测试目录路径: ${BLUE}$TEST_DIR${NC}\n"

echo -e "文件列表:"
echo -e "${GREEN}普通文件:${NC}"
echo "  - readme.txt"
echo "  - project.md"
echo "  - docs/guide.txt"

echo -e "\n${YELLOW}系统文件 (应该被自动忽略):${NC}"
echo "  - .DS_Store"
echo "  - Thumbs.db"
echo "  - .vscode/settings.json"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  下一步操作${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo "1. 在Chronos界面中输入路径:"
echo -e "   ${BLUE}$TEST_DIR${NC}"
echo ""
echo "2. 点击 '初始化时光库'"
echo ""
echo "3. 点击 '刷新状态'"
echo ""
echo "4. 验证结果:"
echo -e "   ${GREEN}✓${NC} 应该只看到3个普通文件"
echo -e "   ${GREEN}✓${NC} 不应该看到.DS_Store"
echo -e "   ${GREEN}✓${NC} 不应该看到Thumbs.db"
echo -e "   ${GREEN}✓${NC} 不应该看到.vscode/"
echo -e "   ${GREEN}✓${NC} 不应该看到.gitignore"
echo -e "   ${GREEN}✓${NC} 不应该看到.chronos"

echo ""
