# Programming Structure

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Standalone Server                             │
│                  (Backend + GUI bundled)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         GUI                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  1. Runtime  │  │ 2. Flow    │  │3. Template  │            │
│  │             │  │   Panel     │  │    CRUD     │            │
│  │  • Select   │  │             │  │             │            │
│  │    Flow     │  │  • Node     │  │  • CRUD     │            │
│  │  • Select   │  │    Editor   │  │    Template │            │
│  │    Case     │  │  • Connect  │  │    Nodes    │            │
│  │  • Chat     │  │  • CRUD     │  │             │            │
│  │    with LLM │  │    Flow     │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LLM Worker                                    │
│              (Concurrent ~4 Threads)                             │
│   ┌─────────────────────────────────────────────────┐   │
│   │              Request Queue                       │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## GUI Sections

### 1. Runtime (運行時)

> User selects flow and case, then chats with LLM

```
┌─────────────────────────────────────────────────────────────────┐
│                      Runtime Mode                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Flow: [▼ Select Flow ___________________________] [Load]      │
│                                                                  │
│  Case: [▼ Select Case ▼] [New] [Edit] [Delete]                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Case List:                                              │   │
│  │  ○ Case 1 - 2024-01-01                                │   │
│  │  ○ Case 2 - 2024-01-02                                │   │
│  │  ○ Case 3 - 2024-01-03                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Chat with LLM:                                         │   │
│  │                                                         │   │
│  │  [AI Response Area]                                    │   │
│  │                                                         │   │
│  │  [User Input Field]                           [Send]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Case Record CRUD

| Operation | Action |
|-----------|--------|
| **Create** | [New] → Enter case details → Save |
| **Read** | Select from case list |
| **Update** | [Edit] → Modify → Save |
| **Delete** | [Delete] → Confirm |

### 2. Flow Panel (流程面板)

> Admin/User constructs flow with node editor (ComfyUI/n8n style)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Flow Panel                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [+ New Flow] [Save] [Delete] [Export] [Import]                 │
│                                                                  │
│  Flow Name: [_______________________]                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Node Editor Canvas                     │   │
│  │                                                          │   │
│  │    ┌─────────┐      ┌─────────┐      ┌─────────┐        │   │
│  │    │  Node   │──────│  Node   │──────│  Node   │        │   │
│  │    └─────────┘      └─────────┘      └─────────┘        │   │
│  │       │                                                    │   │
│  │       └──────────────────┐                                 │   │
│  │                          ▼                                 │   │
│  │                      ┌─────────┐                          │   │
│  │                      │  Node   │                          │   │
│  │                      └─────────┘                          │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Node Palette:                                                   │
│  [現象體] [評估體] [知識節點] [程序編寫] [建議體] [修改體] [規範類] |
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Flow CRUD

| Operation | Action |
|-----------|--------|
| **Create** | [+ New Flow] → Name → Build nodes → Save |
| **Read** | Select flow from list → Load |
| **Update** | Modify nodes → Save |
| **Delete** | [Delete] → Confirm |

### 3. Template CRUD (模板管理)

> Manage all template nodes

```
┌─────────────────────────────────────────────────────────────────┐
│                    Template Management                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [+ New Template] [Save] [Delete] [Duplicate]                   │
│                                                                  │
│  Template List:                    Template Editor:              │
│  ┌─────────────────────┐         ┌─────────────────────────┐   │
│  │ ▼ CENTERAL_TEMPLATE │         │ Name: [_______________] │   │
│  │   PROMPT_TEMPLATE   │         │                         │   │
│  │   ITEM_TEMPLATE     │         │ Properties:             │   │
│  │   JUDGE_TEMPLATE    │         │ • Field 1: [_________] │   │
│  │   VIEW_TEMPLATE     │         │ • Field 2: [_________] │   │
│  │   PLAN_TEMPLATE     │         │ • Field 3: [_________] │   │
│  │   CUSTOM_TEMPLATE   │         │                         │   │
│  └─────────────────────┘         └─────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Template CRUD

| Operation | Action |
|-----------|--------|
| **Create** | [+ New Template] → Select type → Fill properties → Save |
| **Read** | Click template in list |
| **Update** | Edit properties → Save |
| **Delete** | [Delete] → Confirm |
| **Duplicate** | [Duplicate] → New copy with "-copy" suffix |

## Node Types

| Category | Nodes |
|----------|-------|
| **Input** | 現象體 (Environment, Circle, Personal) |
| **Knowledge** | 知識節點 (MCP connection) |
| **Evaluation** | 評估體 (JUDGE, VIEW templates) |
| **Central** | 中心類 (MAIN target for modifications) |
| **Programming** | 程序編寫節點 (JS / Python, locked at creation) |
| **Value-Added** | 建議體, 修改體 |
| **Standard** | 價值判斷體, 控制體, 檢察體, 修正體 |
| **Tools** | 概念類, 原理類, 推理類, 限制類 |

## User Roles

| Role | Access |
|------|--------|
| **Admin** | Flow Panel + Template CRUD + Runtime |
| **User** | Runtime only (select flow, manage cases) |

## Output & Persistence

| Type | Description |
|------|-------------|
| **Summary** | Condensed conversation |
| **Snapshot** | Point-in-time state |
| **Chat History** | Full record |

- Download as file
- Load back to app

## Core Concepts

- **Standalone Server**: Backend + GUI bundled
- **LLM Worker**: ~4 concurrent threads
- **Node Editor**: ComfyUI/n8n style flow builder
- **Centeral (MAIN)**: Primary target for modifications
- **Correction Flow**: Suggestion → User approval → Apply/Discard

## Main Categories

1. [Progress](./02-PROGRESS.md) - Flow execution steps
2. [Template](./03-TEMPLATE.md) - Node templates
3. [Flow Chain](./04-FLOW-CHAIN.md) - Visual flow system
4. [Body Types](./05-BODY-TYPES.md) - 體類 nodes
5. [Tools](./06-TOOLS.md) - Tool nodes
6. [Knowledge](./07-KNOWLEDGE.md) - MCP connection
7. [Runtime](./08-RUNTIME.md) - Runtime mode (flow selection, case CRUD, chat)
8. [Flow Panel](./09-FLOW-PANEL.md) - Node editor (flow CRUD)
9. [Template CRUD](./10-TEMPLATE-CRUD.md) - Template management
10. [Programming Node](./11-PROGRAMMING-NODE.md) - Code generation (JS/Python)
