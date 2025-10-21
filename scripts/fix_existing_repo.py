#!/usr/bin/env python3
"""
修复已有仓库的.gitignore问题
为已经初始化的仓库添加系统文件忽略功能
"""

import json
import sys
from pathlib import Path

# 添加backend路径
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from services.git_wrapper import GitWrapper


def fix_repository(repo_path):
    """修复仓库"""
    print(f"\n{'=' * 60}")
    print(f"  修复仓库: {repo_path}")
    print(f"{'=' * 60}\n")

    repo_path = Path(repo_path).expanduser().resolve()

    if not repo_path.exists():
        print(f"❌ 路径不存在: {repo_path}")
        return False

    git_dir = repo_path / ".git"
    if not git_dir.exists():
        print("❌ 不是Git仓库")
        return False

    wrapper = GitWrapper(str(repo_path))

    # 步骤1: 更新.chronos配置
    print("步骤1: 更新.chronos配置")
    chronos_path = repo_path / ".chronos"

    if chronos_path.exists():
        with open(chronos_path, "r") as f:
            config = json.load(f)

        # 添加gitignore配置
        if "settings" not in config:
            config["settings"] = {}

        config["settings"]["gitignore"] = {
            "auto_create": True,
            "smart_merge": True,  # 使用智能合并模式
            "enabled_categories": ["macos", "windows", "linux", "ide"],
            "custom_rules": [],
        }

        with open(chronos_path, "w", encoding="utf-8") as f:
            json.dump(config, f, ensure_ascii=False, indent=2)

        print("  ✅ .chronos配置已更新")
    else:
        print("  ⚠️  .chronos文件不存在，跳过")

    # 步骤2: 创建或更新.gitignore
    print("\n步骤2: 创建或更新.gitignore")
    try:
        result = wrapper._create_or_update_gitignore(smart_merge=True)
        print(f"  结果: {result['message']}")

        if result.get("created"):
            print(f"  ✅ 创建了新的.gitignore文件")
        elif result.get("updated"):
            print(f"  ✅ 更新了现有.gitignore文件")
            print(f"  添加了{len(result.get('rules_added', []))}条规则")

    except Exception as e:
        print(f"  ❌ 失败: {e}")
        return False

    # 步骤3: 清理已追踪的系统文件
    print("\n步骤3: 清理已追踪的系统文件")
    try:
        cleaned_files = wrapper._cleanup_tracked_system_files()

        if cleaned_files:
            print(f"  ✅ 清理了{len(cleaned_files)}个系统文件:")
            for f in cleaned_files:
                print(f"    - {f}")
        else:
            print(f"  ✅ 没有需要清理的系统文件")

    except Exception as e:
        print(f"  ❌ 失败: {e}")

    # 步骤4: 验证结果
    print("\n步骤4: 验证结果")
    try:
        status = wrapper.get_status()
        system_files_in_status = [
            change["file"]
            for change in status["changes"]
            if GitWrapper._is_system_file(change["file"])
        ]

        if system_files_in_status:
            print(f"  ⚠️  仍有{len(system_files_in_status)}个系统文件在状态中:")
            for f in system_files_in_status:
                print(f"    - {f}")
        else:
            print(f"  ✅ 系统文件已被正确过滤")

        # 检查是否有变更需要提交
        if not status["is_clean"]:
            print(f"\n  💡 提示: 有{len(status['changes'])}个文件变更")
            print(f"     建议创建快照保存.gitignore的更改")

    except Exception as e:
        print(f"  ❌ 验证失败: {e}")

    print(f"\n{'=' * 60}")
    print(f"  修复完成！")
    print(f"{'=' * 60}\n")

    return True


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python3 fix_existing_repo.py <仓库路径>")
        print("示例: python3 fix_existing_repo.py ~/Desktop/test-project")
        print("\n这个脚本会:")
        print("  1. 更新.chronos配置")
        print("  2. 创建或更新.gitignore文件")
        print("  3. 清理已追踪的系统文件")
        sys.exit(1)

    success = fix_repository(sys.argv[1])
    sys.exit(0 if success else 1)
