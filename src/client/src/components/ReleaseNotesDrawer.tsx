/**
 * Chronos v2.0 - Release Notes Drawer
 * 
 * 软件更新说明抽屉
 */

import React from 'react'
import { Drawer, Timeline, Typography, Divider } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

interface ReleaseNotesDrawerProps {
  visible: boolean
  onClose: () => void
}

export const ReleaseNotesDrawer: React.FC<ReleaseNotesDrawerProps> = ({
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
        {/* v2.0.0 */}
        <Timeline.Item color="green">
          <Title level={5}>v2.0.0 (2025-11-02)</Title>
          <Paragraph>
            <Text strong>核心功能：</Text>
            <ul style={{ marginTop: 8, fontSize: '13px' }}>
              <li>✅ 完全重写 - 使用 React 18 + TypeScript 5</li>
              <li>✅ 三种运行模式 - 本地 Web / 云端 Web / 桌面应用</li>
              <li>✅ 最近使用记录 - 快速访问常用仓库</li>
              <li>✅ 历史记录展开详情 - 查看完整提交信息</li>
              <li>✅ 使用说明和更新记录 - 新增帮助按钮</li>
            </ul>
          </Paragraph>
          <Paragraph>
            <Text strong>用户友好文案：</Text>
            <ul style={{ marginTop: 8, fontSize: '13px' }}>
              <li>使用 Git 技术术语（快照、分支、回滚）</li>
              <li>保持专业性和准确性</li>
              <li>清晰的操作提示</li>
            </ul>
          </Paragraph>
          <Paragraph>
            <Text strong>界面优化：</Text>
            <ul style={{ marginTop: 8, fontSize: '13px' }}>
              <li>✅ 优化布局比例，压缩组件间距</li>
              <li>✅ Git ID显示优化（添加图标）</li>
              <li>✅ 版权信息显示</li>
            </ul>
          </Paragraph>
          <Paragraph>
            <Text strong>技术改进：</Text>
            <ul style={{ marginTop: 8, fontSize: '13px' }}>
              <li>✅ 使用 isomorphic-git - 纯 JavaScript 实现</li>
              <li>✅ SQLite 数据库 - 持久化存储</li>
              <li>✅ 完整的类型系统 - TypeScript 严格模式</li>
              <li>✅ 测试覆盖 - Vitest + Playwright</li>
            </ul>
          </Paragraph>
        </Timeline.Item>

        {/* v1.2.0 */}
        <Timeline.Item color="blue">
          <Title level={5}>v1.2.0 (2025-10-22)</Title>
          <Paragraph>
            <Text strong>核心功能：</Text>
            <ul style={{ marginTop: 8 }}>
              <li>✅ 可视化文件夹选择 - 类似Finder的友好交互</li>
              <li>✅ 文件树状展示 - 完整显示多层文件夹结构</li>
              <li>✅ 使用说明和更新记录 - 新增帮助按钮</li>
              <li>✅ 返回首页功能 - 快速切换时光机文件夹</li>
              <li>✅ 历史记录智能校验 - 自动检测无效路径</li>
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
            </ul>
          </Paragraph>
          <Paragraph>
            <Text strong>技术架构：</Text>
            <ul style={{ marginTop: 8 }}>
              <li>前端：React 18 + TypeScript + Ant Design</li>
              <li>后端：Node.js + Express</li>
              <li>桌面：Electron</li>
              <li>核心：isomorphic-git</li>
            </ul>
          </Paragraph>
        </Timeline.Item>
      </Timeline>

      <Divider />

      <Paragraph type="secondary" style={{ fontSize: '12px' }}>
        <FileTextOutlined /> Chronos - 文件时光机，让文件版本管理变得简单
      </Paragraph>
    </Drawer>
  )
}
