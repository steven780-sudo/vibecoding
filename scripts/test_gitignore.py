#!/usr/bin/env python3
"""
测试.gitignore功能的脚本
验证系统文件自动忽略功能是否正常工作
"""

import json
import os
import shutil
import sys
import tempfile
from pathlib import Path

# 添加backend路径到sys.path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from services.git_wrapper import GitWrapper


def print_section(title):
    """打印分节标题"""
    print(f"\n{'=' * 60}")
    print(f"  {title}")
    print(f"{'=' * 60}\n")


def test_gitignore_creation():
    """测试1: .gitignore文件创建"""
    print_section("测试1: .gitignore文件创建")

    with tempfile.TemporaryDirectory() as tmpdir:
        print(f"📁 测试目录: {tmpdir}")

        # 创建一些测试文件
        test_files = {
            "normal.txt": "普通文件",
            "README.md": "# 项目说明",
            ".DS_Store": "系统文件",
            "Thumbs.db": "Windows系统文件",
        }

        for filename, content in test_files.items():
            filepath = Path(tmpdir) / filename
            with open(filepath, "w") as f:
                f.write(content)
            print(f"  ✓ 创建文件: {filename}")

        # 初始化仓库
        print("\n🔧 初始化时光库...")
        wrapper = GitWrapper(tmpdir)
        result = wrapper.init_repository()

        print(f"  初始化结果: {result['success']}")
        print(f"  消息: {result['message']}")

        # 检查.gitignore是否创建
        gitignore_path = Path(tmpdir) / ".gitignore"
        if gitignore_path.exists():
            print(f"\n✅ .gitignore文件已创建")
            with open(gitignore_path, "r") as f:
                content = f.read()
            print(f"\n.gitignore内容预览:")
            print("-" * 40)
            print(content[:500])
            if len(content) > 500:
                print("...")
            print("-" * 40)

            # 检查是否包含关键规则
            if ".DS_Store" in content:
                print("✅ 包含.DS_Store规则")
            else:
                print("❌ 缺少.DS_Store规则")

            if "Thumbs.db" in content:
                print("✅ 包含Thumbs.db规则")
            else:
                print("❌ 缺少Thumbs.db规则")
        else:
            print("❌ .gitignore文件未创建")

        # 检查gitignore操作结果
        if "gitignore" in result:
            gitignore_result = result["gitignore"]
            print(f"\n📊 .gitignore操作结果:")
            print(f"  - 创建: {gitignore_result.get('created', False)}")
            print(f"  - 更新: {gitignore_result.get('updated', False)}")
            print(f"  - 添加规则数: {len(gitignore_result.get('rules_added', []))}")

        # 检查清理的文件
        if "cleaned_files" in result:
            cleaned = result["cleaned_files"]
            print(f"\n🧹 清理的系统文件: {len(cleaned)}个")
            for f in cleaned:
                print(f"  - {f}")

        return result


def test_system_file_detection():
    """测试2: 系统文件检测"""
    print_section("测试2: 系统文件检测")

    test_cases = [
        (".DS_Store", True, "macOS系统文件"),
        ("Thumbs.db", True, "Windows系统文件"),
        (".vscode/settings.json", True, "IDE配置文件"),
        ("normal.txt", False, "普通文件"),
        ("README.md", False, "普通文件"),
        ("test.swp", True, "Vim临时文件"),
        ("desktop.ini", True, "Windows系统文件"),
    ]

    print("测试文件检测:")
    passed = 0
    failed = 0

    for filename, expected, description in test_cases:
        result = GitWrapper._is_system_file(filename)
        status = "✅" if result == expected else "❌"
        if result == expected:
            passed += 1
        else:
            failed += 1
        print(f"  {status} {filename:30} -> {result:5} (期望: {expected:5}) - {description}")

    print(f"\n📊 测试结果: {passed}个通过, {failed}个失败")
    return failed == 0


def test_git_status_filtering():
    """测试3: Git状态过滤（关键测试）"""
    print_section("测试3: Git状态过滤")

    with tempfile.TemporaryDirectory() as tmpdir:
        print(f"📁 测试目录: {tmpdir}")

        # 初始化仓库
        wrapper = GitWrapper(tmpdir)
        result = wrapper.init_repository()
        print(f"✓ 仓库初始化完成")

        # 创建测试文件
        test_files = {
            "normal1.txt": "普通文件1",
            "normal2.txt": "普通文件2",
            ".DS_Store": "macOS系统文件",
            "Thumbs.db": "Windows系统文件",
        }

        for filename, content in test_files.items():
            filepath = Path(tmpdir) / filename
            with open(filepath, "w") as f:
                f.write(content)
            print(f"  ✓ 创建: {filename}")

        # 获取状态
        print("\n🔍 获取Git状态...")
        status = wrapper.get_status()

        print(f"\n当前分支: {status['branch']}")
        print(f"是否干净: {status['is_clean']}")
        print(f"变更文件数: {len(status['changes'])}")

        print("\n📋 文件变更列表:")
        system_files_shown = []
        normal_files_shown = []

        for change in status["changes"]:
            filename = change["file"]
            is_system = GitWrapper._is_system_file(filename)
            marker = "🔴" if is_system else "🟢"
            print(f"  {marker} {filename} ({change['status']})")

            if is_system:
                system_files_shown.append(filename)
            else:
                normal_files_shown.append(filename)

        # 验证结果
        print("\n📊 验证结果:")
        if system_files_shown:
            print(f"❌ 系统文件仍然显示: {system_files_shown}")
            print("   问题: .gitignore规则未生效")
        else:
            print(f"✅ 系统文件已被正确过滤")

        if normal_files_shown:
            print(f"✅ 普通文件正常显示: {normal_files_shown}")
        else:
            print(f"⚠️  没有普通文件显示")

        return len(system_files_shown) == 0


def test_gitignore_content():
    """测试4: .gitignore内容验证"""
    print_section("测试4: .gitignore内容验证")

    with tempfile.TemporaryDirectory() as tmpdir:
        wrapper = GitWrapper(tmpdir)
        wrapper.init_repository()

        gitignore_path = Path(tmpdir) / ".gitignore"

        if not gitignore_path.exists():
            print("❌ .gitignore文件不存在")
            return False

        with open(gitignore_path, "r") as f:
            content = f.read()

        # 检查必需的规则
        required_rules = [
            ".DS_Store",
            "Thumbs.db",
            ".vscode/",
            ".idea/",
        ]

        print("检查必需规则:")
        all_present = True
        for rule in required_rules:
            if rule in content:
                print(f"  ✅ {rule}")
            else:
                print(f"  ❌ {rule} (缺失)")
                all_present = False

        return all_present


def test_chronos_config():
    """测试5: .chronos配置验证"""
    print_section("测试5: .chronos配置验证")

    with tempfile.TemporaryDirectory() as tmpdir:
        wrapper = GitWrapper(tmpdir)
        wrapper.init_repository()

        chronos_path = Path(tmpdir) / ".chronos"

        if not chronos_path.exists():
            print("❌ .chronos文件不存在")
            return False

        with open(chronos_path, "r") as f:
            config = json.load(f)

        print("📋 .chronos配置内容:")
        print(json.dumps(config, indent=2, ensure_ascii=False))

        # 检查gitignore配置
        if "settings" in config and "gitignore" in config["settings"]:
            gitignore_config = config["settings"]["gitignore"]
            print("\n✅ gitignore配置存在:")
            print(f"  - auto_create: {gitignore_config.get('auto_create')}")
            print(f"  - smart_merge: {gitignore_config.get('smart_merge')}")
            print(f"  - enabled_categories: {gitignore_config.get('enabled_categories')}")
            return True
        else:
            print("\n❌ gitignore配置缺失")
            return False


def main():
    """运行所有测试"""
    print("\n" + "=" * 60)
    print("  Chronos v1.1 系统文件自动忽略功能测试")
    print("=" * 60)

    results = {}

    # 运行测试
    try:
        results["test1"] = test_gitignore_creation()
        results["test2"] = test_system_file_detection()
        results["test3"] = test_git_status_filtering()
        results["test4"] = test_gitignore_content()
        results["test5"] = test_chronos_config()
    except Exception as e:
        print(f"\n❌ 测试过程中发生错误: {e}")
        import traceback

        traceback.print_exc()
        return 1

    # 总结
    print_section("测试总结")

    test_names = {
        "test1": ".gitignore文件创建",
        "test2": "系统文件检测",
        "test3": "Git状态过滤",
        "test4": ".gitignore内容验证",
        "test5": ".chronos配置验证",
    }

    passed = 0
    failed = 0

    for test_id, test_name in test_names.items():
        if test_id in results:
            if results[test_id]:
                print(f"✅ {test_name}")
                passed += 1
            else:
                print(f"❌ {test_name}")
                failed += 1

    print(f"\n📊 总计: {passed}个通过, {failed}个失败")

    if failed == 0:
        print("\n🎉 所有测试通过！")
        return 0
    else:
        print(f"\n⚠️  有{failed}个测试失败，需要修复")
        return 1


if __name__ == "__main__":
    sys.exit(main())
