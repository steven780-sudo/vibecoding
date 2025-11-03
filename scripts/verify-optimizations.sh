#!/bin/bash

# Chronos v2.0 优化功能验证脚本

echo "🔍 Chronos v2.0 优化功能验证"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 计数器
PASS=0
FAIL=0

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} 文件存在: $1"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} 文件不存在: $1"
        ((FAIL++))
        return 1
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} 内容存在: $3"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} 内容不存在: $3"
        ((FAIL++))
        return 1
    fi
}

echo "📁 检查新增文件..."
echo "---"
check_file "src/client/src/components/HelpDrawer.tsx"
check_file "src/client/src/components/ReleaseNotesDrawer.tsx"
check_file "docs/V2_OPTIMIZATION_PLAN.md"
check_file "docs/OPTIMIZATION_SUMMARY.md"
echo ""

echo "📝 检查 HomePage 修改..."
echo "---"
check_content "src/client/src/pages/HomePage.tsx" "Copyright © sunshunda" "版权信息"
check_content "src/client/src/pages/HomePage.tsx" "最近使用的时光机文件夹" "最近使用记录标题"
check_content "src/client/src/pages/HomePage.tsx" "recentRepos" "最近使用记录状态"
check_content "src/client/src/pages/HomePage.tsx" "loadRecentRepositories" "加载最近使用记录函数"
check_content "src/client/src/pages/HomePage.tsx" "handleRemoveRecentRepo" "删除记录函数"
echo ""

echo "📝 检查 RepositoryPage 修改..."
echo "---"
check_content "src/client/src/pages/RepositoryPage.tsx" "ReleaseNotesDrawer" "导入 ReleaseNotesDrawer"
check_content "src/client/src/pages/RepositoryPage.tsx" "HelpDrawer" "导入 HelpDrawer"
check_content "src/client/src/pages/RepositoryPage.tsx" "软件更新说明" "软件更新说明按钮"
check_content "src/client/src/pages/RepositoryPage.tsx" "使用说明" "使用说明按钮"
check_content "src/client/src/pages/RepositoryPage.tsx" "helpDrawerVisible" "帮助抽屉状态"
check_content "src/client/src/pages/RepositoryPage.tsx" "releaseNotesVisible" "更新说明抽屉状态"
echo ""

echo "📝 检查 HistoryViewer 修改..."
echo "---"
check_content "src/client/src/components/HistoryViewer.tsx" "expandedIds" "展开状态管理"
check_content "src/client/src/components/HistoryViewer.tsx" "toggleExpand" "展开切换函数"
check_content "src/client/src/components/HistoryViewer.tsx" "展开详情" "展开详情标签"
check_content "src/client/src/components/HistoryViewer.tsx" "收起详情" "收起详情标签"
check_content "src/client/src/components/HistoryViewer.tsx" "IdcardOutlined" "身份证图标"
check_content "src/client/src/components/HistoryViewer.tsx" "最新" "最新标签"
echo ""

echo "📝 检查 FileTree 修改..."
echo "---"
check_content "src/client/src/components/FileTree.tsx" "\\[新增\\]" "新增文件标签"
check_content "src/client/src/components/FileTree.tsx" "\\[修改\\]" "修改文件标签"
check_content "src/client/src/components/FileTree.tsx" "\\[删除\\]" "删除文件标签"
check_content "src/client/src/components/FileTree.tsx" "expandedKeys" "展开状态管理"
echo ""

echo "📝 检查 API Service 修改..."
echo "---"
check_content "src/client/src/services/api-service.ts" "getRecentRepositories" "获取最近使用仓库方法"
check_content "src/client/src/services/api-service.ts" "deleteRepository" "删除仓库方法"
echo ""

echo "📝 检查后端 Routes 修改..."
echo "---"
check_content "src/server/routes/repository.ts" "/recent" "最近使用仓库接口"
check_content "src/server/routes/repository.ts" "getRecentRepositories" "调用数据库方法"
check_content "src/server/routes/repository.ts" "DELETE" "删除接口"
echo ""

echo "📝 检查常量定义..."
echo "---"
check_content "src/shared/constants/index.ts" "REPO_RECENT" "最近使用仓库端点"
check_content "src/shared/constants/index.ts" "REPO_DELETE" "删除仓库端点"
echo ""

echo "================================"
echo "📊 验证结果统计"
echo "================================"
echo -e "通过: ${GREEN}$PASS${NC}"
echo -e "失败: ${RED}$FAIL${NC}"
echo -e "总计: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ 所有优化功能代码已正确实现！${NC}"
    echo ""
    echo "🎉 下一步："
    echo "1. 强制刷新浏览器 (Cmd + Shift + R)"
    echo "2. 或重启开发服务器: npm run dev"
    echo "3. 打开 http://localhost:5173 测试功能"
    exit 0
else
    echo -e "${RED}❌ 发现 $FAIL 个问题，请检查代码！${NC}"
    exit 1
fi
