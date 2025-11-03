# Chronos v2.0 - 源代码目录结构

## 📁 目录说明

```
src/
├── server/              # Node.js 后端（本地模式）
│   ├── index.ts        # 服务器入口
│   ├── routes/         # API 路由
│   ├── services/       # 业务服务层
│   ├── middleware/     # Express 中间件
│   └── utils/          # 工具函数
│
├── client/             # React 前端
│   ├── index.html      # HTML 入口
│   └── src/
│       ├── main.tsx    # React 入口
│       ├── App.tsx     # 主应用组件
│       ├── pages/      # 页面组件
│       ├── components/ # UI 组件
│       ├── hooks/      # 自定义 Hooks
│       ├── stores/     # 状态管理 (Zustand)
│       ├── services/   # 前端服务
│       ├── utils/      # 工具函数
│       └── assets/     # 静态资源
│
├── electron/           # Electron 桌面应用
│   ├── main.ts        # 主进程
│   └── preload.ts     # Preload 脚本
│
└── shared/            # 前后端共享代码
    ├── types/         # TypeScript 类型定义
    ├── constants/     # 常量
    └── utils/         # 工具函数
```

## 🎯 开发指南

### 后端开发
- 所有 API 路由放在 `server/routes/`
- 业务逻辑放在 `server/services/`
- 使用 `shared/types/` 中的类型定义

### 前端开发
- 页面组件放在 `client/src/pages/`
- 可复用组件放在 `client/src/components/`
- 状态管理使用 Zustand，store 放在 `client/src/stores/`

### 共享代码
- 前后端共享的类型定义放在 `shared/types/`
- 共享的常量放在 `shared/constants/`
- 共享的工具函数放在 `shared/utils/`

## 📝 命名规范

- 组件文件：PascalCase (例如：`UserProfile.tsx`)
- 工具文件：kebab-case (例如：`file-utils.ts`)
- 类型文件：kebab-case (例如：`repository-types.ts`)
