# 工具 (Tools)

> All tools are nodes in the visual flow editor

## Tool Nodes

### 1. 概念類 (Conceptual Tools)

```
┌─────────────────────┐
│   🔀 概念類         │
├─────────────────────┤
│  ○ 分解工           │
│  ○ 整合工           │
├─────────────────────┤
│  ○ input  ○ output │
└─────────────────────┘
```

### 2. 原理類 (Principle Tools)

```
┌─────────────────────┐
│   ⚙️ 原理類         │
├─────────────────────┤
│  ○ 第一原理工       │
│  ○ 次原理工         │
├─────────────────────┤
│  ○ input  ○ output │
└─────────────────────┘
```

### 3. 推理類 (Reasoning Tools)

```
┌─────────────────────┐
│   🧠 推理類         │
├─────────────────────┤
│  ○ 因果推斷工       │
│  ○ 邏輯推斷工       │
├─────────────────────┤
│  ○ input  ○ output │
└─────────────────────┘
```

### 4. 限制類 (Constraint Tools)

```
┌─────────────────────┐
│   🔒 限制類         │
├─────────────────────┤
│  ○ 一般限制工       │
│  ○ 要求指向工       │
│  ○ 輸出與格式限制工 │
├─────────────────────┤
│  ○ input  ○ output │
└─────────────────────┘
```

## Admin Operations

| Action | How |
|--------|-----|
| **Add Tool Node** | Drag from palette or [+ Add Node] |
| **Edit** | Double-click to edit properties |
| **Delete** | Select → Delete |
| **Connect** | Drag port to port |

## Usage in Flow

Tool nodes can be placed anywhere in the flow chain to process data between other nodes.
