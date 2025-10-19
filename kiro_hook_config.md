## Kiro Agent Hook 配置: Chronos项目质量保障

### Hook描述 (自然语言)

当位于`vibecoding/`项目下的任何Python后端文件（`backend/**/*.py`）或React前端文件（`frontend/src/**/*.tsx`）被保存时，自动触发以下质量保障流程：

1.  **代码格式化**: 立即使用项目约定的格式化工具（Python使用Black，TypeScript/React使用Prettier）对当前保存的文件进行格式化，确保代码风格统一。
2.  **代码规范检查 (Linting)**: 格式化之后，立刻运行相应的代码规范检查工具（Python使用Ruff，TypeScript/React使用ESLint），检查并报告任何潜在的语法错误、风格问题或不合理的代码逻辑。
3.  **单元测试骨架生成 (后端)**: 检查刚刚保存的Python文件中，是否存在新增的、尚未被`backend/tests/`目录下对应测试文件覆盖的函数。如果存在，请为这些新函数自动生成基础的Pytest单元测试样板代码（包含导入、测试类/函数定义和`pass`占位符），以提醒并帮助开发者快速补充单元测试。
