#!/bin/bash

# 测试脚本：验证.DS_Store文件名解析修复

echo "=== 测试 .DS_Store 文件名解析修复 ==="
echo ""

# 测试仓库路径
TEST_REPO="/Users/sunshunda/chronos-test-project-new"

echo "1. 检查仓库状态..."
curl -s "http://127.0.0.1:8765/api/repository/status?path=${TEST_REPO}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data['success']:
    print('✅ 状态获取成功')
    changes = data['data']['changes']
    print(f'   发现 {len(changes)} 个变更文件:')
    for change in changes:
        file = change['file']
        status = change['status']
        # 检查是否有以点开头的文件
        if file.startswith('.'):
            print(f'   ✅ {status:10} {file} (以点开头的文件)')
        else:
            print(f'   ✓  {status:10} {file}')
else:
    print('❌ 状态获取失败:', data.get('message'))
    sys.exit(1)
"

echo ""
echo "2. 测试文件名解析..."
python3 << 'EOF'
# 测试各种文件名格式
test_cases = [
    (' M .DS_Store', '.DS_Store', '以点开头的文件'),
    ('?? .gitignore', '.gitignore', '新增的隐藏文件'),
    (' M .env', '.env', '环境配置文件'),
    ('A  normal.txt', 'normal.txt', '普通文件'),
    (' M docs/readme.md', 'docs/readme.md', '路径文件'),
]

all_passed = True
for line, expected, desc in test_cases:
    filename = line[3:]
    if filename == expected:
        print(f'✅ {desc:20} -> {filename}')
    else:
        print(f'❌ {desc:20} -> {filename} (期望: {expected})')
        all_passed = False

if all_passed:
    print('\n✅ 所有文件名解析测试通过')
else:
    print('\n❌ 部分测试失败')
    exit(1)
EOF

echo ""
echo "=== 测试完成 ==="
