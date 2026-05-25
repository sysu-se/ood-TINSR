# Agentic Development Harness

## 项目：AI Sudoku

## 角色定位
- **AI Coding Agent**：负责执行具体开发任务
- **人类开发者（Harness/审核者）**：负责需求澄清、验收结果、控制方向

## Agent 行为约束
1. 遵循 PLAN.md 中的开发计划
2. 每个任务完成后报告结果
3. 遇到问题及时汇报，不擅自决定重大变更
4. 代码必须可运行、可测试

## 开发目标
为 Sudoku 游戏添加 AI 能力，包括但不限于：
- AI Hint（智能提示）
- AI Explain（解题思路解释）
- AI Tutor（教学模式）
- AI Solve（辅助解题）

## 技术约束
- 继续使用现有 Svelte + TailwindCSS + Svelte stores 架构
- AI 能力作为独立模块，不破坏现有对象设计
- 使用前端集成的 AI API（如 Gemini API、Cohere 等）

## 验收标准
- AI 功能必须可用
- 现有测试必须通过
- UI 交互流畅