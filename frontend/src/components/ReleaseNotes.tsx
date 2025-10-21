import React from 'react'
import { Drawer, Timeline, Typography, Divider } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

interface ReleaseNotesProps {
  visible: boolean
  onClose: () => void
}

/**
 * 软件更新说明组件
 */
export const ReleaseNotes: React.FC<ReleaseNotesProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Drawer
      title="软件更新说明"
      placement="right"
      width={500}
      open={visible}
      onClose={onClose}
    >
      <Timeline>
        {/* v1.2.0 */}
        <Timeline.Item color="green">
          <Title level={5}>v1.2.0 (2025-10-22)</Title>
          <Paragraph>
            <Text strong>核心功能：</Text>
            <ul style={{ marginTop: 8, fontSize: '13px' }}>
              <li>✅ 可视化文件夹选择 - 类似Finder的友好交互</li>
              <li>✅ 文件树状展示 - 完整显示多层文件夹结构，支持展开/折叠</li>
              <li>✅ 使用说明和更新记录 - 新增帮助按钮</li>
              <li>✅ 返回首页功能 - 快速切换时光机文件夹</li>
              <li>✅ 历史记录智能校验 - 自动检测无效路径</li>
            </ul>
          </Paragraph>
          <Paragraph>
            <Text strong>用户友好文案：</Text>
            <ul style={{ marginTop: 8, fontSize: '13px' }}>
              <li>仓库 → 时光机文件夹</li>
              <li>待提交的变更 → 有变动但未保存的文件</li>
              <li>快照 → 备份</li>
              <li>分支 → 副本（main代表主本）</li>
              <li>回滚 → 恢复</li>
            </ul>
          </Paragraph>
          <Paragraph>
            <Text strong>界面优化：</Text>
            <ul style={{ marginTop: 8, fontSize: '13px' }}>
              <li>✅ 优化布局比例，压缩组件间距</li>
              <li>✅ 文件夹路径显示优化</li>
              <li>✅ Git ID显示优化（添加图标）</li>
              <li>✅ 文件列表默认折叠</li>
            </ul>
          </Paragraph>
          <Paragraph>
            <Text strong>技术改进：</Text>
            <ul style={{ marginTop: 8, fontSize: '13px' }}>
              <li>✅ Git命令优化 - 使用-uall参数获取所有文件</li>
              <li>✅ 新增树状结构组件和工具函数</li>
            </ul>
          </Paragraph>
        </Timeline.Item>

        {/* v1.1.0 */}
        <Timeline.Item color="blue">
          <Title level={5}>v1.1.0 (2025-10-22)</Title>
          <Paragraph>
            <Text strong>用户体验优化：</Text>
            <ul style={{ marginTop: 8 }}>
              <li>✅ 系统文件自动忽略 - 自动过滤.DS_Store等系统文件</li>
              <li>✅ 最近使用列表 - 记住最近打开的10个文件夹</li>
              <li>✅ 智能文件夹打开 - 自动检测并初始化</li>
              <li>✅ 自动数据刷新 - 操作后自动更新界面</li>
              <li>✅ 友好错误提示 - 清晰的错误信息</li>
              <li>✅ Tauri桌面应用 - 原生桌面体验</li>
            </ul>
          </Paragraph>
        </Timeline.Item>

        {/* v1.0.0 */}
        <Timeline.Item>
          <Title level={5}>v1.0.0 (2025-10-21)</Title>
          <Paragraph>
            <Text strong>MVP版本 - 核心功能：</Text>
            <ul style={{ marginTop: 8 }}>
              <li>✅ 基础文件夹管理 - 初始化和打开</li>
              <li>✅ 备份创建和查看 - 保存文件状态</li>
              <li>✅ 历史记录和恢复 - 时光穿梭功能</li>
              <li>✅ 副本管理和合并 - 安全实验新想法</li>
              <li>✅ 性能优化 - 快速响应</li>
            </ul>
          </Paragraph>
          <Paragraph>
            <Text strong>技术架构：</Text>
            <ul style={{ marginTop: 8 }}>
              <li>前端：React 18 + TypeScript + Ant Design</li>
              <li>后端：Python + FastAPI</li>
              <li>桌面：Tauri 2.0</li>
              <li>核心：Git CLI封装</li>
            </ul>
          </Paragraph>
        </Timeline.Item>
      </Timeline>

      <Divider />

      <Paragraph type="secondary" style={{ fontSize: '12px' }}>
        <FileTextOutlined /> 完整更新日志请查看项目release文件夹
      </Paragraph>
    </Drawer>
  )
}
