# Flow Panel (流程面板)

> Node-based flow editor (ComfyUI/n8n style) - construct and CRUD flows

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                      Flow Panel                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Flow List:                    Node Editor Canvas:               │
│  ┌─────────────────┐         ┌─────────────────────────────────┐│
│  │[▼] Flow 1       │         │                                  ││
│  │   Flow 2        │         │    ┌───────┐   ┌───────┐      ││
│  │   Flow 3        │         │    │ Node  │───►│ Node  │      ││
│  │                 │         │    └───────┘   └───────┘      ││
│  │[+ New Flow]     │         │        │             │        ││
│  └─────────────────┘         │        ▼             ▼        ││
│                              │    ┌───────┐   ┌───────┐      ││
│  Selected Flow:              │    │ Node  │   │ Node  │      ││
│  [Flow Name ___________]     │    └───────┘   └───────┘      ││
│                              │                                  ││
│  [Save] [Delete] [Export]   │                                  ││
│  [Import]                    │                                  ││
│                              └─────────────────────────────────┘│
│                                                                  │
│  Node Palette:                                                   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │現象體│ │知識  │ │評估體│ │程序  │ │建議體│ │修改體│ │規範類││
│  │     │ │節點  │ │     │ │編寫  │ │     │ │     │ │     ││
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Node Properties (when selected):                        │   │
│  │                                                          │   │
│  │  Title: [____________________]                          │   │
│  │  Type:  [▼ NODE TYPE      ▼]                           │   │
│  │  Properties...                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Flow CRUD

### Create (創建流程)

1. Click [+ New Flow]
2. Enter flow name
3. Drag nodes from palette to canvas
4. Connect nodes by dragging between ports
5. Configure each node's properties
6. Click [Save]

```
┌─────────────────────────────────────────────────────────────────┐
│                    New Flow Dialog                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Flow Name: [________________________________]                   │
│                                                                  │
│  Description:                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [_____________________________________________________] │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Category: [▼ Select Category ________________]                 │
│                                                                  │
│                    [Cancel]              [Create]               │
└─────────────────────────────────────────────────────────────────┘
```

### Read (讀取流程)

1. Select flow from list
2. Flow loads in canvas
3. All nodes and connections displayed
4. Click any node to view/edit properties

### Update (更新流程)

1. Load existing flow
2. Add/remove/reconnect nodes
3. Edit node properties
4. Click [Save]

### Delete (刪除流程)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Confirm Delete                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Are you sure you want to delete "My Custom Flow"?              │
│  This action cannot be undone.                                  │
│                                                                  │
│                    [Cancel]              [Delete]                 │
└─────────────────────────────────────────────────────────────────┘
```

## Node Editor Operations

### Add Node

| Method | Action |
|--------|--------|
| Drag | Drag from palette onto canvas |
| Double-click | Double-click palette item |
| Right-click | Right-click canvas → [Add Node] |

### Connect Nodes

1. Click output port of source node
2. Drag wire to input port of target node
3. Release to create connection

### Edit Node

1. Click node to select
2. Properties panel shows node details
3. Edit properties directly
4. Changes auto-save on blur

### Delete Node

| Method | Action |
|--------|--------|
| Keyboard | Select → Press Delete |
| Context Menu | Right-click → [Delete] |
| Toolbar | Select → [Delete] button |

### Disconnect

- Right-click on wire → [Remove]
- Or drag wire away from port

## Node Palette

| Category | Nodes | Icon |
|----------|-------|------|
| **Input** | 現象體 (Environment, Circle, Personal) | 📥 |
| **Knowledge** | 知識節點 (MCP connection) | 📚 |
| **Evaluation** | 評估體 (JUDGE, VIEW) | ⚖️ |
| **Central** | 中心類 (MAIN target) | ⭐ |
| **Programming** | 程序編寫節點 (JS/Python) | 📜 |
| **Value-Added** | 建議體, 修改體 | 💡🔧 |
| **Standard** | 規範類 | 📋 |
| **Tools** | 概念類, 原理類, 推理類, 限制類 | 🔀⚙️🧠🔒 |

## Canvas Features

| Feature | Description |
|---------|-------------|
| Zoom | Mouse wheel / pinch |
| Pan | Middle-click drag / two-finger drag |
| Multi-select | Shift+click or drag selection box |
| Copy/Paste | Ctrl+C / Ctrl+V |
| Undo/Redo | Ctrl+Z / Ctrl+Y |
| Grid Snap | Optional snap to grid |
| Auto-layout | [Auto-arrange] button |

## Import/Export

### Export Flow

1. Click [Export]
2. Choose format (JSON, etc.)
3. Save file

### Import Flow

1. Click [Import]
2. Select file
3. Flow added to list

## Flow Properties

| Property | Description |
|----------|-------------|
| Flow ID | Auto-generated unique ID |
| Flow Name | User-defined name |
| Description | Optional description |
| Category | For organization |
| Nodes | List of node configurations |
| Connections | List of wire connections |
| Created Date | Auto-recorded |
| Modified Date | Auto-updated |
