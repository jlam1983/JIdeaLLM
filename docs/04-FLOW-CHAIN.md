# 流水鏈 (Flow Chain)

> Visual node-based flow editor (ComfyUI / n8n style)

## Node Editor Canvas

```
┌────────────────────────────────────────────────────────────────────────┐
│  [Zoom] [Fit] [Export] [Import]                    Admin: Edit Flow     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│    ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐  │
│    │ 現象體   │──────│ 知識節點 │──────│ 評估體   │──────│ 綜合體   │  │
│    │ (Input)  │      │ (MCP)   │      │(Evaluate)│      │(Synth)  │  │
│    └──────────┘      └──────────┘      └──────────┘      └──────────┘  │
│         │                                                    │         │
│         │                 ┌──────────┐                      │         │
│         │                 │ 程序編寫 │                      │         │
│         │                 │(Program)│                      │         │
│         │                 └────┬─────┘                      │         │
│         │                      │                            │         │
│         └──────────────────────┼────────────────────────────┘         │
│                                │                             │         │
│                                │                 ┌──────────┐          │
│                                └─────────────────│  修改體   │──────────┤
│                                                  │(Correct) │          │
│                                                  └────┬─────┘          │
│                                                       │                │
│                                                       │ Suggestion     │
│                                                       ▼                │
│                                                ┌──────────┐            │
│                                                │  User    │ ◄──       │
│                                                │ Decision │            │
│                                                └────┬─────┘            │
│                                                     │ Approved         │
│                                                     ▼                  │
│                                              ┌──────────┐     ┌──────────┐│
│                                              │ 規範類   │     │  Output  ││
│                                              │(Standard)│     │          ││
│                                              └──────────┘     └──────────┘│
│                                                                         │
│    [+ Add Node]  [Delete Selected]  [Connect]  [Disconnect]            │
└────────────────────────────────────────────────────────────────────────┘
```

## Flow with Correction

```
現象體 ──► 知識節點 ──► 評估體 ──► 程序編寫 ──► 綜合體 ──► 規範類 ──► Output
              │                                                          ▲
              │                                                          │
              ▼                                                          │
         評估體 ◄──► 修改體 ◄──► 用戶決定                                  │
              │              │         │                                │
              │              │         ├─► 拒絕 ────────────────────────┘
              │              │         │
              │              │         └─► 批准 ──► 應用到 CENTERAL
              │              │                              │
              │              └────────────────────────────────┘
              │                         (Suggestion)
              ▼
         (MCP Data)
```

## Node Types

### 現象體 (Input Node)
```
┌─────────────────────┐
│   📥 現象體         │
├─────────────────────┤
│  ○ 環境             │
│  ○ 圈子             │
│  ○ 個人             │
├─────────────────────┤
│  ○ output          │
└─────────────────────┘
```

### 知識節點 (Knowledge Node) 📚
```
┌─────────────────────┐
│   📚 知識節點      │
├─────────────────────┤
│  MCP Source: [___] │
│  Raw Data: [____]   │
│  Converted: [___]  │
├─────────────────────┤
│  ○ mcp_input       │
│  ○ llm_output      │
└─────────────────────┘
```

### 評估體 (Evaluation Node)
```
┌─────────────────────┐
│   ⚖️ 評估體         │
├─────────────────────┤
│  ○ JUDGE_TEMPLATE   │
│    ├─ \<FACT\>       │
│    └─ \<VALUE\>      │
│  ○ VIEW_TEMPLATE    │
│    ├─ \<ECO\>        │
│    └─ \<FINANCIAL\>  │
├─────────────────────┤
│  ○ input  ○ output │
└─────────────────────┘
```

### 程序編寫 (Programming Node) 📜
```
┌───────────────────────────────────────┐
│   📜 程序編寫                          │
├───────────────────────────────────────┤
│                                       │
│  Language: [JS / Python] 🔒          │
│  (Locked after creation)               │
│                                       │
│  Code Template:                       │
│  ┌─────────────────────────────────┐ │
│  │ [Code Editor Area]             │ │
│  └─────────────────────────────────┘ │
│                                       │
│  Input: {{input1}} {{input2}}        │
│  Output: {{result}} {{output}}       │
│                                       │
├───────────────────────────────────────┤
│  ○ input  ○ code  ○ error          │
└───────────────────────────────────────┘
```

### 綜合體 (Synthesis Node)
```
┌─────────────────────┐
│   🔮 綜合體         │
├─────────────────────┤
│  Combines all       │
│  evaluations        │
├─────────────────────┤
│  ○ input  ○ output │
└─────────────────────┘
```

### 修改體 (Correction Node) 🔧
```
┌─────────────────────┐
│   🔧 修改體         │
├─────────────────────┤
│  Suggests to MAIN:  │
│  • TITLE            │
│  • CONTENT          │
├─────────────────────┤
│  ○ input            │
│  ○ suggestion       │
│  ○ approved         │
└─────────────────────┘
```

### 用戶決定 (User Decision)
```
┌─────────────────────┐
│   ❓ 用戶決定       │
├─────────────────────┤
│  Review suggestion  │
│  • Approve → Apply  │
│  • Reject → Discard │
├─────────────────────┤
│  ○ suggestion_input │
│  ○ approve_output  │
│  ○ reject_output   │
└─────────────────────┘
```

### 規範類 (Standard Node)
```
┌─────────────────────┐
│   📋 規範類         │
├─────────────────────┤
│  ○ 價值判斷體       │
│  ○ 控制體           │
│  ○ 檢察體           │
│  ○ 修正體           │
├─────────────────────┤
│  ○ input  ○ output │
└─────────────────────┘
```

## Admin Operations (CRUD)

| Action | How |
|--------|-----|
| **Add Node** | Click [+ Add Node] or drag from palette |
| **Connect** | Drag from output port to input port |
| **Edit Node** | Double-click node to open properties |
| **Delete** | Select node → [Delete] or press Del |
| **Disconnect** | Right-click wire → [Remove] |

## Correction Flow Details

1. **修改體** generates suggestions for MAIN (CENTERAL_TEMPLATE: TITLE, CONTENT)
2. **User Decision** node presents suggestions to user
3. **User chooses**:
   - **Approve** → Suggestion applied to MAIN, flow continues
   - **Reject** → Suggestion discarded, flow continues with original MAIN

## Queue Mechanism

All node outputs queue to shared LLM Worker (~4 concurrent threads)
