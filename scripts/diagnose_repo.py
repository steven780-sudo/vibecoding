#!/usr/bin/env python3
"""
诊断现有仓库的.gitignore问题
"""

import json
import sys
from pathlib import Path

# 添加backend路径
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from services.git_wrapper import GitWrapper


def diagnose_repository(repo_path):
    """诊断仓库"""
    print(f"\n{'=' * 60}")
    print(f"  诊断仓库: {repo_path}")
    print(f"{'=' * 60}\n")

    repo_path = Path(repo_path).expanduser().resolve()

    if not repo_path.exists():
        print(f"❌ 路径不存在: {repo_path}")
        return

    # 检查是否是Git仓库
    git_dir = repo_path / ".git"
    if not git_dir.exists():
        print("❌ 不是Git仓库（没有.git目录）")
        return

    print("✅ 是Git仓库")

    # 检查.gitignore
    gitignore_path = repo_path / ".gitignore"
    print(f"\n📄 .gitignore文件:")
    if gitignore_path.exists():
        print(f"  ✅ 存在")
        with open(gitignore_path, "r") as f:
            content = f.read()

        # 检查关键规则
        if ".DS_Store" in content:
            print(f"  ✅ 包含.DS_Store规则")
        else:
            print(f"  ❌ 缺少.DS_Store规则")

        print(f"\n  内容预览:")
        lines = content.split("\n")[:20]
        for line in lines:
            print(f"    {line}")
        if len(content.split("\n")) > 20:
            print("    ...")
    else:
        print(f"  ❌ 不存在")
        print(f"\n  💡 解决方案: 需要创建.gitignore文件")

    # 检查.chronos配置
    chronos_path = repo_path / ".chronos"
    print(f"\n📄 .chronos配置:")
    if chronos_path.exists():
        print(f"  ✅ 存在")
        with open(chronos_path, "r") as f:
            config = json.load(f)

        if "settings" in config and "gitignore" in config["settings"]:
            print(f"  ✅ 包含gitignore配置")
            gitignore_config = config["settings"]["gitignore"]
            print(f"    - auto_create: {gitignore_config.get('auto_create')}")
            print(f"    - enabled_categories: {gitignore_config.get('enabled_categories')}")
        else:
            print(f"  ❌ 缺少gitignore配置")
            print(f"\n  💡 解决方案: 需要更新.chronos配置")
    else:
        print(f"  ❌ 不存在")

    # 使用GitWrapper获取状态
    print(f"\n🔍 Git状态:")
    try:
        wrapper = GitWrapper(str(repo_path))
        status = wrapper.get_status()

        print(f"  当前分支: {status['branch']}")
        print(f"  变更文件数: {len(status['changes'])}")

        if status["changes"]:
            print(f"\n  📋 变更文件:")
            for change in status["changes"]:
                filename = change["file"]
                is_system = GitWrapper._is_system_file(filename)
                marker = "🔴" if is_system else "🟢"
                print(f"    {marker} {filename} ({change['status']})")

                if is_system:
                    print(f"       ⚠️  这是系统文件，不应该显示！")
    except Exception as e:
        print(f"  ❌ 获取状态失败: {e}")

    # 检查已追踪的系统文件
    print(f"\n🔍 检查已追踪的系统文件:")
    try:
        wrapper = GitWrapper(str(repo_path))
        tracked_files = wrapper.get_tracked_files()

        system_files = [f for f in tracked_files if GitWrapper._is_system_file(f)]

        if system_files:
            print(f"  ⚠️  发现{len(system_files)}个已追踪的系统文件:")
            for f in system_files:
                print(f"    - {f}")
            print(f"\n  💡 解决方案: 需要清理这些文件")
            print(f"     运行: git rm --cached <文件名>")
        else:
            print(f"  ✅ 没有已追踪的系统文件")
    except Exception as e:
        print(f"  ❌ 检查失败: {e}")

    # 提供修复建议
    print(f"\n{'=' * 60}")
    print(f"  修复建议")
    print(f"{'=' * 60}\n")

    if not gitignore_path.exists():
        print("1. 创建.gitignore文件:")
        print(f"   cd {repo_path}")
        print(f"   python3 -c \"from services.git_wrapper import GitWrapper; w=GitWrapper('{repo_path}'); w._create_or_update_gitignore()\"")

    if system_files:
        print("\n2. 清理已追踪的系统文件:")
        for f in system_files:
            print(f"   git rm --cached '{f}'")
        print(f"   # 然后创建快照保存更改")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python3 diagnose_repo.py <仓库路径>")
        print("示例: python3 diagnose_repo.py ~/Desktop/test-project")
        sys.exit(1)

    diagnose_repository(sys.argv[1])
