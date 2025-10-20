#!/bin/bash
# Chronos代码质量检查脚本

echo "🔍 运行代码质量检查..."
echo ""

ERRORS=0

# Backend检查
echo "📦 检查 Backend 代码..."
cd backend

if [ ! -d "venv" ]; then
    echo "❌ 错误：Backend虚拟环境不存在"
    exit 1
fi

source venv/bin/activate

echo "  → 运行 Black (格式化检查)..."
if black --check api/ models/ services/ tests/ main.py; then
    echo "  ✅ Black 检查通过"
else
    echo "  ❌ Black 检查失败"
    ERRORS=$((ERRORS + 1))
fi

echo "  → 运行 Ruff (代码检查)..."
if ruff check api/ models/ services/ tests/ main.py; then
    echo "  ✅ Ruff 检查通过"
else
    echo "  ❌ Ruff 检查失败"
    ERRORS=$((ERRORS + 1))
fi

echo "  → 运行 Pytest (单元测试)..."
if python -m pytest tests/ -v; then
    echo "  ✅ Pytest 测试通过"
else
    echo "  ❌ Pytest 测试失败"
    ERRORS=$((ERRORS + 1))
fi

deactivate
cd ..
echo ""

# Frontend检查
echo "🎨 检查 Frontend 代码..."
cd frontend

echo "  → 运行 Prettier (格式化检查)..."
if npm run format -- --check; then
    echo "  ✅ Prettier 检查通过"
else
    echo "  ❌ Prettier 检查失败"
    ERRORS=$((ERRORS + 1))
fi

echo "  → 运行 ESLint (代码检查)..."
if npm run lint; then
    echo "  ✅ ESLint 检查通过"
else
    echo "  ❌ ESLint 检查失败"
    ERRORS=$((ERRORS + 1))
fi

echo "  → 运行 TypeScript (类型检查)..."
if npx tsc --noEmit; then
    echo "  ✅ TypeScript 检查通过"
else
    echo "  ❌ TypeScript 检查失败"
    ERRORS=$((ERRORS + 1))
fi

echo "  → 运行 Vitest (单元测试)..."
if npm test; then
    echo "  ✅ Vitest 测试通过"
else
    echo "  ❌ Vitest 测试失败"
    ERRORS=$((ERRORS + 1))
fi

cd ..
echo ""

# 总结
if [ $ERRORS -eq 0 ]; then
    echo "🎉 所有检查通过！"
    exit 0
else
    echo "❌ 发现 $ERRORS 个错误"
    exit 1
fi
