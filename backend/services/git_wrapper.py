"""
Git命令封装服务
提供对Git CLI命令的封装和输出解析
"""

import json
import os
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional


# 自定义异常类
class GitError(Exception):
    """Git操作错误基类"""

    pass


class RepositoryNotFoundError(GitError):
    """仓库不存在错误"""

    pass


class InvalidPathError(GitError):
    """无效路径错误"""

    pass


class MergeConflictError(GitError):
    """合并冲突错误"""

    def __init__(self, conflicts: List[str]):
        self.conflicts = conflicts
        super().__init__(f"合并冲突: {len(conflicts)}个文件")


class GitWrapper:
    """Git命令封装类"""

    # Git状态码映射
    STATUS_MAP = {
        "A": "added",
        "M": "modified",
        "D": "deleted",
        "??": "added",
        "R": "renamed",
    }

    def __init__(self, repo_path: str):
        """
        初始化GitWrapper

        Args:
            repo_path: 仓库路径（绝对路径）
        """
        self.repo_path = Path(repo_path).resolve()

    def _run_git_command(
        self, args: List[str], check: bool = True, capture_output: bool = True
    ) -> subprocess.CompletedProcess:
        """
        执行Git命令的通用方法

        Args:
            args: Git命令参数列表（不包含'git'）
            check: 是否检查返回码，如果为True且命令失败则抛出异常
            capture_output: 是否捕获输出

        Returns:
            subprocess.CompletedProcess对象

        Raises:
            GitError: Git命令执行失败
        """
        try:
            result = subprocess.run(
                ["git"] + args,
                cwd=str(self.repo_path),
                capture_output=capture_output,
                text=True,
                check=False,
            )

            if check and result.returncode != 0:
                error_msg = result.stderr.strip() if result.stderr else "未知错误"
                raise GitError(f"Git命令执行失败: {error_msg}")

            return result

        except FileNotFoundError as e:
            raise GitError("Git未安装或不在系统PATH中") from e
        except Exception as e:
            if isinstance(e, GitError):
                raise
            raise GitError(f"执行Git命令时发生错误: {str(e)}") from e

    def init_repository(self) -> Dict[str, Any]:
        """
        初始化Git仓库

        Returns:
            包含操作结果的字典

        Raises:
            InvalidPathError: 路径不存在或不可访问
            GitError: Git初始化失败
        """
        # 验证路径存在性和可访问性
        if not self.repo_path.exists():
            raise InvalidPathError(f"路径不存在: {self.repo_path}")

        if not os.access(self.repo_path, os.R_OK | os.W_OK):
            raise InvalidPathError(f"路径不可访问或无读写权限: {self.repo_path}")

        # 检查是否已经是Git仓库
        git_dir = self.repo_path / ".git"
        if git_dir.exists() and git_dir.is_dir():
            return {
                "success": True,
                "message": "该文件夹已经是时光库",
                "already_initialized": True,
            }

        # 执行git init
        self._run_git_command(["init"])

        # 创建.chronos配置文件
        chronos_config = {
            "version": "1.0",
            "created_at": datetime.now().isoformat(),
            "user": {
                "name": self._get_git_config("user.name") or "Chronos用户",
                "email": self._get_git_config("user.email") or "user@chronos.local",
            },
            "settings": {"auto_stage": True, "default_branch": "main"},
        }

        chronos_file = self.repo_path / ".chronos"
        with open(chronos_file, "w", encoding="utf-8") as f:
            json.dump(chronos_config, f, ensure_ascii=False, indent=2)

        return {
            "success": True,
            "message": "时光库初始化成功",
            "already_initialized": False,
        }

    def _get_git_config(self, key: str) -> Optional[str]:
        """
        获取Git配置值

        Args:
            key: 配置键名

        Returns:
            配置值，如果不存在则返回None
        """
        try:
            result = self._run_git_command(["config", "--get", key], check=False)
            if result.returncode == 0:
                return result.stdout.strip()
            return None
        except Exception:
            return None

    def get_status(self) -> Dict[str, Any]:
        """
        获取仓库状态

        Returns:
            包含当前分支和文件变更列表的字典

        Raises:
            RepositoryNotFoundError: 不是Git仓库
            GitError: 获取状态失败
        """
        self._verify_repository()

        # 获取当前分支
        current_branch = self.get_current_branch()

        # 执行git status --porcelain
        result = self._run_git_command(["status", "--porcelain"])

        # 解析输出
        changes = []
        for line in result.stdout.strip().split("\n"):
            if not line:
                continue

            # Git status --porcelain格式: XY filename
            # X表示暂存区状态，Y表示工作区状态
            status_code = line[:2].strip()
            filename = line[3:].strip()

            # 标准化状态
            status = self._normalize_status(status_code)

            changes.append({"status": status, "file": filename})

        return {
            "branch": current_branch,
            "changes": changes,
            "is_clean": len(changes) == 0,
        }

    def get_current_branch(self) -> str:
        """
        获取当前分支名称

        Returns:
            当前分支名称

        Raises:
            RepositoryNotFoundError: 不是Git仓库
            GitError: 获取分支失败
        """
        self._verify_repository()

        result = self._run_git_command(["branch", "--show-current"])
        branch = result.stdout.strip()

        # 如果没有分支（新仓库），返回默认值
        if not branch:
            return "main"

        return branch

    def _normalize_status(self, status_code: str) -> str:
        """
        标准化Git状态码

        Args:
            status_code: Git状态码（如'M', 'A', '??'等）

        Returns:
            标准化的状态字符串
        """
        # 处理常见状态码
        if status_code in self.STATUS_MAP:
            return self.STATUS_MAP[status_code]

        # 处理组合状态码（如'MM', 'AM'等）
        if len(status_code) == 2:
            # 优先使用第一个字符（暂存区状态）
            first_char = status_code[0]
            if first_char in ["A", "M", "D", "R"]:
                return self.STATUS_MAP.get(first_char, "modified")
            # 如果第一个字符是空格，使用第二个字符（工作区状态）
            second_char = status_code[1]
            if second_char in ["M", "D"]:
                return self.STATUS_MAP.get(second_char, "modified")

        # 默认返回modified
        return "modified"

    def _verify_repository(self):
        """
        验证当前路径是否为Git仓库

        Raises:
            RepositoryNotFoundError: 不是Git仓库
        """
        git_dir = self.repo_path / ".git"
        if not git_dir.exists():
            raise RepositoryNotFoundError(f"不是Git仓库: {self.repo_path}")

    def create_commit(
        self, message: str, files: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        创建快照（提交）

        Args:
            message: 提交信息
            files: 要添加的文件列表，如果为None则添加所有变更

        Returns:
            包含提交信息的字典

        Raises:
            RepositoryNotFoundError: 不是Git仓库
            GitError: 提交失败
            ValueError: 提交信息为空
        """
        self._verify_repository()

        # 验证commit message非空
        if not message or not message.strip():
            raise ValueError("快照描述不能为空")

        message = message.strip()

        # 添加文件到暂存区
        if files is None:
            # 添加所有变更
            self._run_git_command(["add", "-A"])
        else:
            # 选择性添加文件
            if not files:
                raise ValueError("未指定要添加的文件")
            for file in files:
                self._run_git_command(["add", file])

        # 检查是否有内容可提交
        status_result = self._run_git_command(["status", "--porcelain"], check=False)
        if not status_result.stdout.strip():
            return {"success": False, "message": "没有变更需要创建快照"}

        # 执行提交
        self._run_git_command(["commit", "-m", message])

        # 获取最新提交的信息
        commit_info = self._get_latest_commit()

        return {"success": True, "message": "快照创建成功", "commit": commit_info}

    def _get_latest_commit(self) -> Dict[str, str]:
        """
        获取最新提交的信息

        Returns:
            包含提交信息的字典
        """
        result = self._run_git_command(
            ["log", "-1", "--pretty=format:%H|%an|%ae|%at|%s"]
        )

        if not result.stdout.strip():
            return {}

        parts = result.stdout.strip().split("|")
        if len(parts) < 5:
            return {}

        return {
            "id": parts[0],
            "author": parts[1],
            "email": parts[2],
            "timestamp": parts[3],
            "message": parts[4],
        }

    def get_log(
        self, limit: Optional[int] = None, branch: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        获取提交历史记录

        Args:
            limit: 限制返回的提交数量，None表示返回所有
            branch: 指定分支，None表示当前分支

        Returns:
            提交历史列表，每个元素包含id, message, author, email, date等信息

        Raises:
            RepositoryNotFoundError: 不是Git仓库
            GitError: 获取历史失败
        """
        self._verify_repository()

        # 构建git log命令
        args = ["log", "--pretty=format:%H|%an|%ae|%at|%s|%P"]

        if limit:
            args.append(f"-{limit}")

        if branch:
            args.append(branch)

        result = self._run_git_command(args, check=False)

        # 如果没有提交历史，返回空列表
        if result.returncode != 0 or not result.stdout.strip():
            return []

        # 解析输出
        commits = []
        for line in result.stdout.strip().split("\n"):
            if not line:
                continue

            parts = line.split("|")
            if len(parts) < 5:
                continue

            commit_id = parts[0]
            author = parts[1]
            email = parts[2]
            timestamp = parts[3]
            message = parts[4]
            parents = parts[5].split() if len(parts) > 5 and parts[5] else []

            # 转换时间戳为可读格式
            try:
                dt = datetime.fromtimestamp(int(timestamp))
                date_str = dt.strftime("%Y-%m-%d %H:%M:%S")
            except (ValueError, OSError):
                date_str = timestamp

            commits.append(
                {
                    "id": commit_id,
                    "short_id": commit_id[:7],
                    "message": message,
                    "author": author,
                    "email": email,
                    "timestamp": timestamp,
                    "date": date_str,
                    "parents": parents,
                    "is_merge": len(parents) > 1,
                }
            )

        return commits

    def checkout_commit(self, commit_id: str) -> Dict[str, Any]:
        """
        回滚到指定提交

        Args:
            commit_id: 提交ID（完整或短ID）

        Returns:
            包含操作结果的字典

        Raises:
            RepositoryNotFoundError: 不是Git仓库
            GitError: 回滚失败
            ValueError: commit_id无效
        """
        self._verify_repository()

        if not commit_id or not commit_id.strip():
            raise ValueError("提交ID不能为空")

        commit_id = commit_id.strip()

        # 验证commit_id有效性
        if not self._is_valid_commit(commit_id):
            raise ValueError(f"无效的提交ID: {commit_id}")

        # 检查是否有未提交的变更
        status = self.get_status()
        if not status["is_clean"]:
            return {
                "success": False,
                "message": "有未保存的变更，请先创建快照或放弃变更",
                "has_changes": True,
            }

        # 执行checkout
        try:
            self._run_git_command(["checkout", commit_id])

            return {
                "success": True,
                "message": f"已回滚到快照 {commit_id[:7]}",
                "commit_id": commit_id,
            }
        except GitError as e:
            return {"success": False, "message": f"回滚失败: {str(e)}", "error": str(e)}

    def _is_valid_commit(self, commit_id: str) -> bool:
        """
        验证提交ID是否有效

        Args:
            commit_id: 提交ID

        Returns:
            True如果有效，否则False
        """
        try:
            result = self._run_git_command(["cat-file", "-t", commit_id], check=False)
            return result.returncode == 0 and result.stdout.strip() == "commit"
        except Exception:
            return False

    def get_branches(self) -> Dict[str, Any]:
        """
        获取所有分支列表

        Returns:
            包含分支列表和当前分支的字典

        Raises:
            RepositoryNotFoundError: 不是Git仓库
            GitError: 获取分支失败
        """
        self._verify_repository()

        result = self._run_git_command(["branch", "-a"])

        branches = []
        current_branch = None

        for line in result.stdout.strip().split("\n"):
            if not line:
                continue

            # 当前分支以*开头
            is_current = line.startswith("*")
            branch_name = line.strip().lstrip("* ").strip()

            # 跳过远程分支和HEAD指针
            if branch_name.startswith("remotes/") or "->" in branch_name:
                continue

            branches.append({"name": branch_name, "is_current": is_current})

            if is_current:
                current_branch = branch_name

        return {"branches": branches, "current": current_branch}

    def create_branch(self, branch_name: str) -> Dict[str, Any]:
        """
        创建新分支

        Args:
            branch_name: 分支名称

        Returns:
            包含操作结果的字典

        Raises:
            RepositoryNotFoundError: 不是Git仓库
            GitError: 创建分支失败
            ValueError: 分支名称无效
        """
        self._verify_repository()

        if not branch_name or not branch_name.strip():
            raise ValueError("分支名称不能为空")

        branch_name = branch_name.strip()

        # 验证分支名称格式
        if not self._is_valid_branch_name(branch_name):
            raise ValueError(f"无效的分支名称: {branch_name}")

        # 检查分支是否已存在
        branches = self.get_branches()
        if any(b["name"] == branch_name for b in branches["branches"]):
            return {"success": False, "message": f"分支 '{branch_name}' 已存在"}

        # 创建分支
        self._run_git_command(["branch", branch_name])

        return {
            "success": True,
            "message": f"分支 '{branch_name}' 创建成功",
            "branch": branch_name,
        }

    def switch_branch(self, branch_name: str) -> Dict[str, Any]:
        """
        切换到指定分支

        Args:
            branch_name: 分支名称

        Returns:
            包含操作结果的字典

        Raises:
            RepositoryNotFoundError: 不是Git仓库
            GitError: 切换分支失败
        """
        self._verify_repository()

        if not branch_name or not branch_name.strip():
            raise ValueError("分支名称不能为空")

        branch_name = branch_name.strip()

        # 检查是否有未提交的变更
        status = self.get_status()
        if not status["is_clean"]:
            return {
                "success": False,
                "message": "有未保存的变更，请先创建快照或放弃变更",
                "has_changes": True,
            }

        # 切换分支
        try:
            self._run_git_command(["checkout", branch_name])

            return {
                "success": True,
                "message": f"已切换到分支 '{branch_name}'",
                "branch": branch_name,
            }
        except GitError as e:
            return {
                "success": False,
                "message": f"切换分支失败: {str(e)}",
                "error": str(e),
            }

    def merge_branch(
        self, source_branch: str, target_branch: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        合并分支

        Args:
            source_branch: 源分支（要合并的分支）
            target_branch: 目标分支（合并到的分支），None表示当前分支

        Returns:
            包含操作结果的字典

        Raises:
            RepositoryNotFoundError: 不是Git仓库
            GitError: 合并失败
            MergeConflictError: 合并冲突
        """
        self._verify_repository()

        if not source_branch or not source_branch.strip():
            raise ValueError("源分支名称不能为空")

        source_branch = source_branch.strip()

        # 如果指定了目标分支，先切换到目标分支
        if target_branch:
            switch_result = self.switch_branch(target_branch)
            if not switch_result["success"]:
                return switch_result

        current_branch = self.get_current_branch()

        # 执行合并
        result = self._run_git_command(
            ["merge", source_branch, "--no-edit"], check=False
        )

        # 检查是否有冲突
        if result.returncode != 0:
            # 检查冲突文件
            conflicts = self._get_conflict_files()

            if conflicts:
                # 中止合并
                self._run_git_command(["merge", "--abort"], check=False)

                raise MergeConflictError(conflicts)
            else:
                return {
                    "success": False,
                    "message": f"合并失败: {result.stderr}",
                    "error": result.stderr,
                }

        return {
            "success": True,
            "message": f"已将分支 '{source_branch}' 合并到 '{current_branch}'",
            "source": source_branch,
            "target": current_branch,
        }

    def _is_valid_branch_name(self, branch_name: str) -> bool:
        """
        验证分支名称是否有效

        Args:
            branch_name: 分支名称

        Returns:
            True如果有效，否则False
        """
        # Git分支名称规则：
        # - 不能包含空格
        # - 不能以.开头或结尾
        # - 不能包含..
        # - 不能包含特殊字符如~^:?*[

        if not branch_name:
            return False

        invalid_chars = [" ", "~", "^", ":", "?", "*", "[", "\\"]
        if any(char in branch_name for char in invalid_chars):
            return False

        if branch_name.startswith(".") or branch_name.endswith("."):
            return False

        if ".." in branch_name:
            return False

        return True

    def _get_conflict_files(self) -> List[str]:
        """
        获取冲突文件列表

        Returns:
            冲突文件路径列表
        """
        try:
            result = self._run_git_command(
                ["diff", "--name-only", "--diff-filter=U"], check=False
            )

            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip().split("\n")

            return []
        except Exception:
            return []
