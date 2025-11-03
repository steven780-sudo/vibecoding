/**
 * Chronos v2.0 - Help Drawer
 * 
 * 使用说明抽屉
 */

import React from 'react'
import { Drawer, Typography, Space, Divider } from 'antd'
import {
  FolderOpenOutlined,
  SaveOutlined,
  ReloadOutlined,
  RollbackOutlined,
  BranchesOutlined,
  MergeCellsOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

interface HelpDrawerProps {
  visible: boolean
  onClose: () => void
}

export const HelpDrawer: React.FC<HelpDrawerProps> = ({ visible, onClose }) => {
  return (
    <Drawer
      title="使用说明"
      placement="right"
      width={500}
      open={visible}
      onClose={onClose}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 核心用法 */}
        <div>
          <Title level={5}>
            <InfoCircleOutlined /> 核心用法
          </Title>
          <Paragraph style={{ fontSize: '14px', lineHeight: '1.8' }}>
            1. 打开文件夹 → 2. 修改文件 → 3. 创建快照 → 4. 查看历史
          </Paragraph>
        </div>

        <Divider />

        {/* 功能按钮 */}
        <div>
          <Title level={5}>功能按钮</Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Space>
                <FolderOpenOutlined style={{ fontSize: 16, color: '#1890ff' }} />
                <Text strong>打开时光机文件夹</Text>
              </Space>
              <Paragraph type="secondary" style={{ marginLeft: 24, marginTop: 4 }}>
                选择要管理的文件夹
              </Paragraph>
            </div>

            <div>
              <Space>
                <SaveOutlined style={{ fontSize: 16, color: '#52c41a' }} />
                <Text strong>创建快照</Text>
              </Space>
              <Paragraph type="secondary" style={{ marginLeft: 24, marginTop: 4 }}>
                为当前文件状态创建快照点
              </Paragraph>
            </div>

            <div>
              <Space>
                <ReloadOutlined style={{ fontSize: 16, color: '#1890ff' }} />
                <Text strong>刷新</Text>
              </Space>
              <Paragraph type="secondary" style={{ marginLeft: 24, marginTop: 4 }}>
                更新文件状态
              </Paragraph>
            </div>

            <div>
              <Space>
                <RollbackOutlined style={{ fontSize: 16, color: '#faad14' }} />
                <Text strong>回滚</Text>
              </Space>
              <Paragraph type="secondary" style={{ marginLeft: 24, marginTop: 4 }}>
                回滚到历史快照点
              </Paragraph>
            </div>

            <div>
              <Space>
                <BranchesOutlined style={{ fontSize: 16, color: '#722ed1' }} />
                <Text strong>创建分支</Text>
              </Space>
              <Paragraph type="secondary" style={{ marginLeft: 24, marginTop: 4 }}>
                创建独立工作分支
              </Paragraph>
            </div>

            <div>
              <Space>
                <MergeCellsOutlined style={{ fontSize: 16, color: '#13c2c2' }} />
                <Text strong>合并分支</Text>
              </Space>
              <Paragraph type="secondary" style={{ marginLeft: 24, marginTop: 4 }}>
                合并分支到主分支
              </Paragraph>
            </div>
          </Space>
        </div>

        <Divider />

        {/* 需要帮助 */}
        <div>
          <Title level={5}>需要帮助？</Title>
          <Paragraph>
            <Text>联系开发者：</Text>
            <br />
            <Text copyable strong style={{ color: '#1890ff' }}>
              sunshunda@gmail.com
            </Text>
          </Paragraph>
        </div>
      </Space>
    </Drawer>
  )
}
