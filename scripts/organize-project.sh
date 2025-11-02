#!/bin/bash

# Chronos v2.0 - 项目文件整理脚本
# 用途：清理旧项目文件，整理目录结构

set -e

echo "🧹 开始整理项目文件..."

# 1. 创建必要的目录结构
echo "📁 创建目录结构..."
mkdir -p src/{server,client,electron,shared}
mkdir -p src/server/{routes,services,workers,utils}
mkdir -p src/client/src/{pages,components,hooks,stores,services,utils}
mkdir -p src/shared/{types,constants,utils}
mkdir -p tests/{unit,integration,e2e}
mkdir -p tests/unit/{server,client}
mkdir -p docs
mkdir -p scripts
mkdir -p database

# 2. 移动文档文件到 docs/
echo "📄 整理文档文件..."
if [ -f "REWRITE_SUMMARY.md" ]; then
  mv REWRITE_SUMMARY.md docs/
fi

# 3. 确保 CLAUDE.md 在 docs/ 目录
if [ -f "CLAUDE.md" ]; then
  cp CLAUDE.md docs/CLAUDE.md
  echo "✅ CLAUDE.md 已复制到 docs/"
fi

# 4. 清理旧项目文件（可选，需要用户确认）
echo ""
echo "⚠️  发现旧项目文件："
echo "   - project_old/"
echo "   - release/"
echo "   - .spec-workflow/"
echo "   - .claude/"
echo "   - .ruff_cache/"
echo ""
read -p "是否删除这些文件？(y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🗑️  删除旧项目文件..."
  rm -rf project_old/
  rm -rf release/
  rm -rf .spec-workflow/
  rm -rf .claude/
  rm -rf .ruff_cache/
  echo "✅ 旧文件已删除"
else
  echo "⏭️  跳过删除"
fi

# 5. 创建 README 文件
echo "📝 创建 README 文件..."
cat > README.md << 'EOF'
# Chronos v2.0 - 本地文件时光机

> 为非技术用户设计的图形化 Git 版本管理工具

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发环境
npm run dev

# 访问应用
# 前端: http://localhost:5173
# 后端: http://localhost:3000
```

## 文档

- [完整文档](docs/CLAUDE.md)
- [需求文档](.kiro/specs/chronos-v2/requirements.md)
- [设计文档](.kiro/specs/chronos-v2/design.md)
- [任务清单](.kiro/specs/chronos-v2/tasks.md)

## 许可证

MIT License
EOF

echo ""
echo "✅ 项目文件整理完成！"
echo ""
echo "📋 下一步："
echo "   1. 查看 docs/CLAUDE.md 了解项目详情"
echo "   2. 运行 npm install 安装依赖"
echo "   3. 运行 npm run dev 启动开发环境"
