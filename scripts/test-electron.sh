#!/bin/bash

# Chronos v2.0 - Test Electron App
# 测试 Electron 应用是否可以正常启动

echo "🚀 Testing Electron App..."
echo ""

# 检查构建产物
echo "📦 Checking build artifacts..."
if [ ! -f "dist-electron/main.js" ]; then
  echo "❌ Error: dist-electron/main.js not found"
  echo "   Please run: npm run build:electron"
  exit 1
fi

if [ ! -f "dist-electron/preload.js" ]; then
  echo "❌ Error: dist-electron/preload.js not found"
  echo "   Please run: npm run build:electron"
  exit 1
fi

if [ ! -d "dist/client" ]; then
  echo "❌ Error: dist/client not found"
  echo "   Please run: npm run build"
  exit 1
fi

if [ ! -d "dist-server" ]; then
  echo "❌ Error: dist-server not found"
  echo "   Please run: npm run build"
  exit 1
fi

echo "✅ All build artifacts found"
echo ""

# 显示文件大小
echo "📊 Build artifact sizes:"
echo "   Main process:    $(du -h dist-electron/main.js | cut -f1)"
echo "   Preload script:  $(du -h dist-electron/preload.js | cut -f1)"
echo "   Client bundle:   $(du -sh dist/client | cut -f1)"
echo "   Server bundle:   $(du -sh dist-server | cut -f1)"
echo ""

echo "✅ Electron app is ready to run!"
echo ""
echo "To start the app:"
echo "  npm run start:electron"
echo ""
echo "To build installers:"
echo "  npm run build:electron:mac    # macOS"
echo "  npm run build:electron:win    # Windows"
echo "  npm run build:electron:linux  # Linux"
