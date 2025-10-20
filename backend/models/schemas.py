"""
Pydantic数据模型
定义API请求和响应的数据结构
"""

from typing import Any, List, Optional

from pydantic import BaseModel, Field


# 统一响应格式
class ApiResponse(BaseModel):
    """API统一响应格式"""

    success: bool = Field(..., description="操作是否成功")
    message: Optional[str] = Field(None, description="响应消息")
    data: Optional[Any] = Field(None, description="响应数据")
    error: Optional[str] = Field(None, description="错误信息")


# 仓库操作相关模型
class InitRepositoryRequest(BaseModel):
    """初始化仓库请求"""

    path: str = Field(..., description="仓库路径（绝对路径）")


class GetStatusRequest(BaseModel):
    """获取状态请求"""

    path: str = Field(..., description="仓库路径")


class FileChange(BaseModel):
    """文件变更信息"""

    status: str = Field(..., description="文件状态（added/modified/deleted）")
    file: str = Field(..., description="文件路径")


class RepositoryStatus(BaseModel):
    """仓库状态"""

    branch: str = Field(..., description="当前分支")
    changes: List[FileChange] = Field(..., description="变更文件列表")
    is_clean: bool = Field(..., description="工作区是否干净")


# 快照操作相关模型
class CreateCommitRequest(BaseModel):
    """创建提交请求"""

    path: str = Field(..., description="仓库路径")
    message: str = Field(..., description="提交消息", min_length=1)
    files: Optional[List[str]] = Field(
        None, description="要添加的文件列表，None表示全部"
    )


class CommitInfo(BaseModel):
    """提交信息"""

    id: str = Field(..., description="提交ID")
    short_id: Optional[str] = Field(None, description="短提交ID")
    message: str = Field(..., description="提交消息")
    author: str = Field(..., description="作者")
    email: Optional[str] = Field(None, description="作者邮箱")
    timestamp: Optional[str] = Field(None, description="时间戳")
    date: Optional[str] = Field(None, description="提交日期")
    parents: Optional[List[str]] = Field(None, description="父提交列表")
    is_merge: Optional[bool] = Field(None, description="是否为合并提交")


class GetLogRequest(BaseModel):
    """获取历史请求"""

    path: str = Field(..., description="仓库路径")
    limit: Optional[int] = Field(None, description="限制返回数量", ge=1)
    branch: Optional[str] = Field(None, description="指定分支")


class CheckoutCommitRequest(BaseModel):
    """回滚提交请求"""

    path: str = Field(..., description="仓库路径")
    commit_id: str = Field(..., description="提交ID", min_length=1)


# 分支操作相关模型
class GetBranchesRequest(BaseModel):
    """获取分支列表请求"""

    path: str = Field(..., description="仓库路径")


class BranchInfo(BaseModel):
    """分支信息"""

    name: str = Field(..., description="分支名称")
    is_current: bool = Field(..., description="是否为当前分支")


class BranchesResponse(BaseModel):
    """分支列表响应"""

    branches: List[BranchInfo] = Field(..., description="分支列表")
    current: Optional[str] = Field(None, description="当前分支名称")


class CreateBranchRequest(BaseModel):
    """创建分支请求"""

    path: str = Field(..., description="仓库路径")
    branch_name: str = Field(..., description="分支名称", min_length=1)


class SwitchBranchRequest(BaseModel):
    """切换分支请求"""

    path: str = Field(..., description="仓库路径")
    branch_name: str = Field(..., description="分支名称", min_length=1)


class MergeBranchRequest(BaseModel):
    """合并分支请求"""

    path: str = Field(..., description="仓库路径")
    source_branch: str = Field(..., description="源分支（要合并的分支）", min_length=1)
    target_branch: Optional[str] = Field(
        None, description="目标分支（合并到的分支），None表示当前分支"
    )
