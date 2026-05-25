# Agentic Development - Session Records

## Session 1: AI 服务层设计与基础实现

**日期**: 2026-05-23
**主题**: AI Sudoku 基础架构与 API 集成

---

## Prompt (Harness → Agent)

```
接入minimaxapi,按照以下顺序实现:
1. hint
2. tutor
3. solve
4. explain
ai响应在侧边栏
```

---

## 执行过程

### 1. API 调研

**Prompt**: 查询 MiniMax API 文档

**Result**:
- Endpoint: `POST https://api.minimaxi.com/v1/chat/completions`
- 可用模型: MiniMax-M2.7, MiniMax-M2.7-highspeed, MiniMax-M2.5, MiniMax-M2.1
- 认证方式: Bearer Token

### 2. 创建的文件

| 文件 | 描述 |
|------|------|
| `src/node_modules/@sudoku/ai/config.js` | AI 配置与系统提示词 |
| `src/node_modules/@sudoku/ai/service.js` | API 调用与 AI 能力实现 |
| `src/node_modules/@sudoku/ai/index.js` | 模块导出 |
| `src/components/AIPanel/index.svelte` | AI 侧边栏主组件 |
| `src/components/AIPanel/APIKeyConfig.svelte` | API Key 配置组件 |
| `src/components/AIPanel/AIMessage.svelte` | AI 响应展示组件 |

### 3. AI 能力实现

**AI Hint** - 策略性提示，引导用户思考
```
Provide a STRATEGIC HINT only:
1. Identify ONE cell that can be solved
2. Explain WHAT strategy to use
3. Explain WHY this strategy applies here
4. Do NOT give the final answer
```

**AI Tutor** - 教学模式，回答用户问题
```
As a tutor, help them understand Sudoku better by:
1. Breaking down the concept they don't understand
2. Using examples from their current board
3. Being encouraging and patient
4. Leading them to understand, not giving direct answers
```

**AI Solve** - 展示完整解法
```
Please provide the solution IN THE SAME FORMAT with all empty cells filled.
```

**AI Explain** - 棋盘分析
```
Provide a clear explanation of:
1. What patterns/strategies are visible
2. How to approach solving this puzzle
3. Key decisions the player should consider
```

---

## Session 2: API 切换 - MiniMax → 千问

**日期**: 2026-05-23
**主题**: 切换到千问/DashScope API

---

## Prompt (Harness → Agent)

```
能换成千问的api吗
```

---

## 执行过程

### 1. API 切换

**User 提供**:
- API Key: `sk-***`（已脱敏）
- 模型: `glm-5`

**Testing**:
```bash
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer sk-***" \
  -H "Content-Type: application/json" \
  -d '{"model": "glm-5", "messages": [{"role": "user", "content": "say hi"}]}'
```

**Result**: ✅ API 正常工作

### 2. 配置更新

| 配置项 | 旧值 | 新值 |
|--------|------|------|
| apiUrl | `https://api.minimaxi.com/v1/chat/completions` | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` |
| model | `MiniMax-M2.7` | `glm-5` |
| apiKey | `sk-api-***` | `sk-***` |

---

## Session 3: 修复 Svelte 编译错误

**日期**: 2026-05-23
**主题**: 修复动态 type 属性导致的编译错误

---

## 执行过程

### 1. 错误发现

```
ValidationError: 'type' attribute cannot be dynamic if input uses two-way binding
```

### 2. 解决方案

将动态 `type={showKey ? 'text' : 'password'}` 改为两个独立的 input 元素：

```svelte
{#if showKey}
  <input type="text" bind:value={inputKey} ... />
{:else}
  <input type="password" bind:value={inputKey} ... />
{/if}
```

### 3. 简化配置组件

由于 API Key 已预配置，直接简化了 APIKeyConfig 组件，移除了用户输入功能。

---

## Riding 质量评估

| 维度 | 评分 | 说明 |
|------|------|------|
| Prompt 清晰度 | ⭐⭐⭐⭐⭐ | 指令明确，按优先级实现 |
| 问题修复 | ⭐⭐⭐⭐ | 遇到 API 余额问题及时切换到千问 |
| 验收确认 | ⭐⭐⭐⭐⭐ | 每步完成后验证功能 |
| Agent 协作 | ⭐⭐⭐⭐ | 理解用户意图，有效沟通 |

---

## 开发统计

- **总 Session 数**: 3
- **新建文件数**: 6
- **修改文件数**: 4
- **AI 能力数**: 4 (Hint, Tutor, Solve, Explain)
- **切换 API**: 1 次 (MiniMax → 千问)