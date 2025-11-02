# Chronos v2.0 - 配置文件说明

**创建日期**: 2025-11-02

---

## 📦 package.json - 项目配置中心

### 作用
`package.json` 是 Node.js 项目的核心配置文件，定义了项目的所有信息。

### 主要功能

#### 1. 项目基本信息
```json
{
  "name": "chronos-v2",           // 项目名称
  "version": "2.0.0",             // 版本号
  "description": "...",           // 项目描述
  "author": "Chronos Team",       // 作者
  "license": "MIT"                // 开源协议
}
```

#### 2. 依赖管理
```json
{
  "dependencies": {
    "react": "^18.2.0",           // 生产环境依赖
    "express": "^4.18.2"
  },
  "devDependencies": {
    "typescript": "^5.3.3",       // 开发环境依赖
    "vite": "^5.0.8"
  }
}
```

**作用**：
- 记录项目需要哪些第三方库
- 运行 `npm install` 时自动安装这些库
- 确保团队成员使用相同版本的依赖

#### 3. 脚本命令
```json
{
  "scripts": {
    "dev": "vite",                // npm run dev 启动开发服务器
    "build": "tsc && vite build", // npm run build 构建项目
    "test": "vitest run"          // npm run test 运行测试
  }
}
```

**作用**：
- 定义快捷命令
- 统一团队的开发流程
- 简化复杂的命令行操作

#### 4. 环境要求
```json
{
  "engines": {
    "node": ">=18.0.0",           // 要求 Node.js 18 或更高
    "npm": ">=9.0.0"              // 要求 npm 9 或更高
  }
}
```

### 为什么需要它？
- ✅ 管理项目依赖（不用手动下载库）
- ✅ 定义开发命令（统一团队工作流）
- ✅ 记录项目信息（方便发布和分享）
- ✅ 版本控制（确保环境一致）

---

## ⚙️ config/ 目录下的配置文件

### 1. tsconfig.json - TypeScript 配置

**作用**：告诉 TypeScript 编译器如何编译代码

```json
{
  "compilerOptions": {
    "target": "ES2020",           // 编译到 ES2020 标准
    "module": "ESNext",           // 使用最新的模块系统
    "strict": true,               // 启用严格类型检查
    "jsx": "react-jsx",           // 支持 React JSX
    "outDir": "./dist"            // 编译输出目录
  }
}
```

**为什么需要它？**
- ✅ TypeScript 需要知道如何编译 `.ts` 文件
- ✅ 配置类型检查规则（严格模式）
- ✅ 指定编译目标（浏览器版本）
- ✅ 配置模块解析规则

**实际效果**：
```typescript
// 没有 tsconfig.json：TypeScript 不知道如何处理这个文件
// 有 tsconfig.json：TypeScript 知道这是 React 代码，正确编译
const App = () => <div>Hello</div>
```

---

### 2. tsconfig.server.json - 服务端 TypeScript 配置

**作用**：专门为 Node.js 后端配置 TypeScript

```json
{
  "extends": "./tsconfig.json",  // 继承基础配置
  "compilerOptions": {
    "module": "CommonJS",         // Node.js 使用 CommonJS
    "outDir": "./dist/server"     // 输出到 dist/server
  },
  "include": ["src/server/**/*"]  // 只编译 server 目录
}
```

**为什么需要单独配置？**
- ✅ 前端和后端的模块系统不同
- ✅ 前端用 ESM（import/export），后端用 CommonJS（require）
- ✅ 分开编译，避免冲突

---

### 3. vite.config.ts - Vite 构建工具配置

**作用**：配置前端开发服务器和构建工具

```typescript
export default defineConfig({
  plugins: [react()],             // 使用 React 插件
  server: {
    port: 5173,                   // 开发服务器端口
    proxy: {                      // 代理 API 请求
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist/client'         // 构建输出目录
  }
})
```

**为什么需要它？**
- ✅ 启动开发服务器（热更新）
- ✅ 处理 React、TypeScript、CSS
- ✅ 代理 API 请求（避免跨域）
- ✅ 优化生产构建（压缩、分包）

**实际效果**：
- 运行 `npm run dev` → Vite 读取这个配置 → 启动开发服务器
- 修改代码 → Vite 自动刷新浏览器
- 运行 `npm run build` → Vite 打包优化代码

---

### 4. vitest.config.ts - 测试工具配置

**作用**：配置测试框架

```typescript
export default defineConfig({
  test: {
    globals: true,                // 全局测试函数
    environment: 'jsdom',         // 模拟浏览器环境
    coverage: {
      reporter: ['text', 'html'], // 覆盖率报告格式
      threshold: {
        lines: 80                 // 要求 80% 代码覆盖率
      }
    }
  }
})
```

**为什么需要它？**
- ✅ 配置测试环境（浏览器 or Node.js）
- ✅ 设置覆盖率要求
- ✅ 配置测试报告格式

**实际效果**：
- 运行 `npm run test` → Vitest 读取配置 → 运行测试
- 生成覆盖率报告 → 检查是否达到 80%

---

### 5. .eslintrc.json - 代码检查规则

**作用**：检查代码质量和风格

```json
{
  "extends": [
    "eslint:recommended",         // 使用推荐规则
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  "rules": {
    "no-console": "warn",         // 警告使用 console.log
    "no-unused-vars": "error"     // 禁止未使用的变量
  }
}
```

**为什么需要它？**
- ✅ 统一代码风格
- ✅ 发现潜在错误
- ✅ 强制最佳实践

**实际效果**：
```typescript
// 这段代码会报错
const unused = 123;  // ❌ ESLint: 未使用的变量
console.log('test'); // ⚠️ ESLint: 不要使用 console.log

// 修改后
const used = 123;
logger.info('test'); // ✅ 使用 logger 代替 console
```

---

### 6. .prettierrc - 代码格式化规则

**作用**：自动格式化代码

```json
{
  "semi": true,                   // 使用分号
  "singleQuote": true,            // 使用单引号
  "tabWidth": 2,                  // 缩进 2 空格
  "trailingComma": "es5"          // 尾随逗号
}
```

**为什么需要它？**
- ✅ 自动格式化代码
- ✅ 统一团队代码风格
- ✅ 避免格式争论

**实际效果**：
```typescript
// 格式化前（混乱）
const obj={name:"test",age:20}

// 格式化后（整洁）
const obj = {
  name: 'test',
  age: 20,
};
```

---

### 7. electron-builder.yml - Electron 打包配置

**作用**：配置桌面应用打包

```yaml
appId: com.chronos.app
productName: Chronos
directories:
  output: dist
mac:
  target: dmg                     # macOS 打包成 .dmg
win:
  target: nsis                    # Windows 打包成 .exe
```

**为什么需要它？**
- ✅ 配置应用信息（名称、图标）
- ✅ 指定打包格式（dmg、exe）
- ✅ 配置自动更新

**实际效果**：
- 运行 `npm run build:electron`
- electron-builder 读取配置
- 生成 `Chronos-1.0.0.dmg`（macOS）
- 生成 `Chronos-Setup-1.0.0.exe`（Windows）

---

## 🔄 配置文件之间的关系

```
package.json (项目中心)
    ↓
    ├─→ tsconfig.json (TypeScript 编译)
    │       ↓
    │       └─→ tsconfig.server.json (后端编译)
    │
    ├─→ vite.config.ts (前端开发和构建)
    │       ↓
    │       └─→ 使用 tsconfig.json
    │
    ├─→ vitest.config.ts (测试)
    │       ↓
    │       └─→ 使用 tsconfig.json
    │
    ├─→ .eslintrc.json (代码检查)
    │       ↓
    │       └─→ 检查 TypeScript 代码
    │
    ├─→ .prettierrc (代码格式化)
    │
    └─→ electron-builder.yml (桌面应用打包)
```

---

## 🎯 实际工作流程

### 开发流程
```bash
# 1. 安装依赖
npm install
# → 读取 package.json 的 dependencies
# → 下载所有需要的库到 node_modules/

# 2. 启动开发
npm run dev
# → 读取 package.json 的 scripts.dev
# → 执行 vite --config config/vite.config.ts
# → Vite 读取 vite.config.ts
# → 启动开发服务器在 http://localhost:5173

# 3. 编写代码
# → TypeScript 读取 tsconfig.json
# → 提供类型检查和自动补全
# → ESLint 读取 .eslintrc.json
# → 实时检查代码问题
# → Prettier 读取 .prettierrc
# → 保存时自动格式化

# 4. 运行测试
npm run test
# → 读取 package.json 的 scripts.test
# → 执行 vitest --config config/vitest.config.ts
# → Vitest 读取 vitest.config.ts
# → 运行所有测试

# 5. 构建项目
npm run build
# → 前端：Vite 打包（使用 vite.config.ts）
# → 后端：TypeScript 编译（使用 tsconfig.server.json）
# → 生成 dist/ 目录

# 6. 打包桌面应用
npm run build:electron
# → electron-builder 读取 electron-builder.yml
# → 打包成 .dmg 和 .exe
```

---

## 💡 为什么要这样组织？

### 问题：如果没有这些配置文件会怎样？

❌ **没有 package.json**
- 不知道需要安装哪些依赖
- 每个人手动下载库，版本不一致
- 没有统一的命令，每个人用不同的方式启动项目

❌ **没有 tsconfig.json**
- TypeScript 不知道如何编译
- 没有类型检查
- 代码质量无法保证

❌ **没有 vite.config.ts**
- 无法启动开发服务器
- 无法热更新
- 无法优化构建

❌ **没有 .eslintrc.json**
- 代码风格混乱
- 容易出现低级错误
- 团队协作困难

### 解决方案：统一配置

✅ **有了这些配置文件**
- 一个命令安装所有依赖：`npm install`
- 一个命令启动开发：`npm run dev`
- 一个命令运行测试：`npm run test`
- 一个命令构建项目：`npm run build`
- 代码风格自动统一
- 类型检查自动进行
- 团队协作顺畅

---

## 📚 总结

### package.json
- **角色**：项目的"身份证"和"指挥中心"
- **作用**：管理依赖、定义命令、记录信息
- **必要性**：⭐⭐⭐⭐⭐（绝对必需）

### config/ 目录
- **角色**：各种工具的"使用说明书"
- **作用**：告诉工具如何工作
- **必要性**：⭐⭐⭐⭐⭐（绝对必需）

### 为什么放在 config/ 目录？
- ✅ 根目录整洁
- ✅ 配置文件集中管理
- ✅ 易于查找和维护
- ✅ 符合最佳实践

---

## 🔗 相关文档

- [项目总文档](CLAUDE.md)
- [依赖说明](DEPENDENCIES.md)
- [项目状态](PROJECT_STATUS.md)

---

**文档版本**: 1.0  
**创建日期**: 2025-11-02  
**作者**: Kiro AI Assistant
