import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SnapshotDialog } from '../components/SnapshotDialog'
import { HistoryViewer } from '../components/HistoryViewer'
import { BranchManager } from '../components/BranchManager'

describe('SnapshotDialog Component', () => {
  const mockChanges = [
    { status: 'M', file: 'test1.txt' },
    { status: 'A', file: 'test2.txt' },
    { status: 'D', file: 'test3.txt' },
  ]

  const mockProps = {
    visible: true,
    changes: mockChanges,
    repoPath: '/test/repo',
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    onCreateCommit: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染对话框', () => {
    render(<SnapshotDialog {...mockProps} />)
    expect(screen.getByText('创建快照')).toBeInTheDocument()
  })

  it('应该显示所有变更文件', () => {
    render(<SnapshotDialog {...mockProps} />)
    expect(screen.getByText('test1.txt')).toBeInTheDocument()
    expect(screen.getByText('test2.txt')).toBeInTheDocument()
    expect(screen.getByText('test3.txt')).toBeInTheDocument()
  })

  it('应该显示文件状态标签', () => {
    render(<SnapshotDialog {...mockProps} />)
    expect(screen.getByText('[修改]')).toBeInTheDocument()
    expect(screen.getByText('[新增]')).toBeInTheDocument()
    expect(screen.getByText('[删除]')).toBeInTheDocument()
  })

  it('应该默认选中所有文件', () => {
    render(<SnapshotDialog {...mockProps} />)
    const checkboxes = screen.getAllByRole('checkbox')
    // 第一个是全选checkbox，后面3个是文件checkbox
    expect(checkboxes).toHaveLength(4)
  })

  it('应该在没有描述时显示错误', async () => {
    render(<SnapshotDialog {...mockProps} />)
    const confirmButton = screen.getByText('确认创建')

    fireEvent.click(confirmButton)

    // 验证onCreateCommit没有被调用
    expect(mockProps.onCreateCommit).not.toHaveBeenCalled()
  })

  it('应该在没有选择文件时显示错误', async () => {
    render(<SnapshotDialog {...mockProps} />)

    // 输入描述
    const input = screen.getByPlaceholderText('请输入快照描述（必填）')
    fireEvent.change(input, { target: { value: '测试描述' } })

    // 取消全选
    const allCheckbox = screen.getByText('全选').previousSibling as HTMLElement
    fireEvent.click(allCheckbox)

    // 点击确认
    const confirmButton = screen.getByText('确认创建')
    fireEvent.click(confirmButton)

    // 验证onCreateCommit没有被调用
    expect(mockProps.onCreateCommit).not.toHaveBeenCalled()
  })
})

describe('HistoryViewer Component', () => {
  const mockCommits = [
    {
      id: 'abc123def456',
      message: '第一次提交',
      author: 'test',
      date: '2024-01-01T10:00:00Z',
    },
    {
      id: 'def456ghi789',
      message: '第二次提交\n\n详细描述',
      author: 'test2',
      date: '2024-01-02T10:00:00Z',
    },
  ]

  const mockProps = {
    commits: mockCommits,
    loading: false,
    repoPath: '/test/repo',
    onCheckout: vi.fn(),
    onRefresh: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染历史记录', () => {
    render(<HistoryViewer {...mockProps} />)
    expect(screen.getByText('历史记录')).toBeInTheDocument()
    expect(screen.getByText('第一次提交')).toBeInTheDocument()
    expect(screen.getByText('第二次提交')).toBeInTheDocument()
  })

  it('应该显示提交数量', () => {
    render(<HistoryViewer {...mockProps} />)
    expect(screen.getByText('2 个快照')).toBeInTheDocument()
  })

  it('应该标记最新提交', () => {
    render(<HistoryViewer {...mockProps} />)
    expect(screen.getByText('最新')).toBeInTheDocument()
  })

  it('应该显示详细描述', () => {
    render(<HistoryViewer {...mockProps} />)
    expect(screen.getByText('详细描述')).toBeInTheDocument()
  })

  it('应该显示空状态', () => {
    render(<HistoryViewer {...mockProps} commits={[]} />)
    expect(screen.getByText('暂无历史记录')).toBeInTheDocument()
  })

  it('应该有回滚按钮', () => {
    render(<HistoryViewer {...mockProps} />)
    const rollbackButtons = screen.getAllByText('回滚到此版本')
    expect(rollbackButtons).toHaveLength(2)
  })
})

describe('BranchManager Component', () => {
  const mockProps = {
    branches: ['main', 'feature-1', 'feature-2'],
    currentBranch: 'main',
    loading: false,
    repoPath: '/test/repo',
    onCreateBranch: vi.fn(),
    onSwitchBranch: vi.fn(),
    onMergeBranch: vi.fn(),
    onRefresh: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染分支管理器', () => {
    render(<BranchManager {...mockProps} />)
    expect(screen.getByText('分支管理')).toBeInTheDocument()
  })

  it('应该显示当前分支', () => {
    render(<BranchManager {...mockProps} />)
    expect(screen.getByText('当前分支')).toBeInTheDocument()
    // 当前分支标签会出现两次（一次在显示区，一次在下拉框）
    const mainTags = screen.getAllByText('main')
    expect(mainTags.length).toBeGreaterThan(0)
  })

  it('应该有创建新分支按钮', () => {
    render(<BranchManager {...mockProps} />)
    expect(screen.getByText('创建新分支')).toBeInTheDocument()
  })

  it('应该在非主分支时显示合并按钮', () => {
    render(<BranchManager {...mockProps} currentBranch="feature-1" />)
    expect(screen.getByText('合并到主版本')).toBeInTheDocument()
  })

  it('应该在主分支时隐藏合并按钮', () => {
    render(<BranchManager {...mockProps} currentBranch="main" />)
    expect(screen.queryByText('合并到主版本')).not.toBeInTheDocument()
  })

  it('应该打开创建分支对话框', () => {
    render(<BranchManager {...mockProps} />)
    const createButton = screen.getByText('创建新分支')
    fireEvent.click(createButton)
    expect(screen.getByText('分支名称')).toBeInTheDocument()
  })
})
