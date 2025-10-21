"""
仓库操作API端点
"""

from fastapi import APIRouter, HTTPException

from models.schemas import (
    ApiResponse,
    BranchesResponse,
    BranchInfo,
    CheckoutCommitRequest,
    CommitInfo,
    CreateBranchRequest,
    CreateCommitRequest,
    FileChange,
    InitRepositoryRequest,
    MergeBranchRequest,
    RepositoryStatus,
    SwitchBranchRequest,
)
from services.git_wrapper import (
    GitError,
    GitWrapper,
    InvalidPathError,
    MergeConflictError,
    RepositoryNotFoundError,
)

router = APIRouter(prefix="/repository", tags=["repository"])


@router.post("/init", response_model=ApiResponse)
async def init_repository(request: InitRepositoryRequest):
    """
    初始化Git仓库

    创建新的Git仓库并生成.chronos配置文件
    """
    try:
        wrapper = GitWrapper(request.path)
        result = wrapper.init_repository()

        return ApiResponse(
            success=result["success"],
            message=result["message"],
            data={"already_initialized": result.get("already_initialized", False)},
        )
    except InvalidPathError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except GitError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"未知错误: {str(e)}")


@router.get("/status", response_model=ApiResponse)
async def get_status(path: str):
    """
    获取仓库状态

    返回当前分支和文件变更列表
    """
    try:
        wrapper = GitWrapper(path)
        status = wrapper.get_status()

        # 转换为Pydantic模型
        changes = [FileChange(**change) for change in status["changes"]]
        status_data = RepositoryStatus(
            branch=status["branch"], changes=changes, is_clean=status["is_clean"]
        )

        return ApiResponse(
            success=True, message="获取状态成功", data=status_data.model_dump()
        )
    except RepositoryNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except GitError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"未知错误: {str(e)}")


@router.post("/commit", response_model=ApiResponse)
async def create_commit(request: CreateCommitRequest):
    """
    创建快照（提交）

    将变更保存为新的提交
    """
    try:
        wrapper = GitWrapper(request.path)
        result = wrapper.create_commit(request.message, request.files)

        if not result["success"]:
            return ApiResponse(success=False, message=result["message"])

        # 转换提交信息
        commit_data = None
        if "commit" in result and result["commit"]:
            commit_data = CommitInfo(**result["commit"]).model_dump()

        return ApiResponse(
            success=True, message=result["message"], data={"commit": commit_data}
        )
    except RepositoryNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except GitError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"未知错误: {str(e)}")


@router.get("/log", response_model=ApiResponse)
async def get_log(path: str, limit: int = None, branch: str = None):
    """
    获取提交历史

    返回提交历史记录列表
    """
    try:
        wrapper = GitWrapper(path)
        commits = wrapper.get_log(limit=limit, branch=branch)

        # 转换为Pydantic模型
        commits_data = [CommitInfo(**commit).model_dump() for commit in commits]

        return ApiResponse(
            success=True,
            message=f"获取到{len(commits_data)}条提交记录",
            data={"logs": commits_data},
        )
    except RepositoryNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except GitError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"未知错误: {str(e)}")


@router.post("/checkout", response_model=ApiResponse)
async def checkout_commit(request: CheckoutCommitRequest):
    """
    回滚到指定提交

    将工作区恢复到指定提交的状态
    """
    try:
        wrapper = GitWrapper(request.path)
        result = wrapper.checkout_commit(request.commit_id)

        return ApiResponse(
            success=result["success"],
            message=result["message"],
            data={
                "commit_id": result.get("commit_id"),
                "has_changes": result.get("has_changes", False),
            },
        )
    except RepositoryNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except GitError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"未知错误: {str(e)}")


@router.get("/branches", response_model=ApiResponse)
async def get_branches(path: str):
    """
    获取分支列表

    返回所有分支和当前分支
    """
    try:
        wrapper = GitWrapper(path)
        result = wrapper.get_branches()

        # 转换为Pydantic模型
        branches = [BranchInfo(**branch) for branch in result["branches"]]
        branches_data = BranchesResponse(branches=branches, current=result["current"])

        return ApiResponse(
            success=True, message="获取分支列表成功", data=branches_data.model_dump()
        )
    except RepositoryNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except GitError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"未知错误: {str(e)}")


@router.post("/branch", response_model=ApiResponse)
async def create_branch(request: CreateBranchRequest):
    """
    创建新分支

    在当前提交创建新分支
    """
    try:
        wrapper = GitWrapper(request.path)
        result = wrapper.create_branch(request.branch_name)

        return ApiResponse(
            success=result["success"],
            message=result["message"],
            data={"branch": result.get("branch")},
        )
    except RepositoryNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except GitError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"未知错误: {str(e)}")


@router.post("/switch", response_model=ApiResponse)
async def switch_branch(request: SwitchBranchRequest):
    """
    切换分支

    切换到指定分支
    """
    try:
        wrapper = GitWrapper(request.path)
        result = wrapper.switch_branch(request.branch_name)

        return ApiResponse(
            success=result["success"],
            message=result["message"],
            data={
                "branch": result.get("branch"),
                "has_changes": result.get("has_changes", False),
            },
        )
    except RepositoryNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except GitError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"未知错误: {str(e)}")


@router.post("/merge", response_model=ApiResponse)
async def merge_branch(request: MergeBranchRequest):
    """
    合并分支

    将源分支合并到目标分支
    """
    try:
        wrapper = GitWrapper(request.path)
        result = wrapper.merge_branch(request.source_branch, request.target_branch)

        return ApiResponse(
            success=result["success"],
            message=result["message"],
            data={"source": result.get("source"), "target": result.get("target")},
        )
    except RepositoryNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except MergeConflictError as e:
        raise HTTPException(
            status_code=409, detail={"message": str(e), "conflicts": e.conflicts}
        )
    except GitError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"未知错误: {str(e)}")
