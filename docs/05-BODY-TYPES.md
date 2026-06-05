# 體類 (Body Types)

> All bodies are nodes in the visual flow editor

## Node Representation

```
┌─────────────────────┐
│   [Icon] 體 Name    │
├─────────────────────┤
│  Properties...      │
├─────────────────────┤
│  ○ Input Port      │
│  ○ Output Port     │
└─────────────────────┘
```

## Node Categories

### 1. 計劃體 (Plan Node)

```
┌─────────────────────┐
│   📋 計劃體         │
├─────────────────────┤
│  Plan body          │
├─────────────────────┤
│  ○ input  ○ output │
└─────────────────────┘
```

### 2. 中心類 (Central Node) ⭐

> Primary processing node - handles input/output
> **TITLE and CONTENT are the main targets for modifications**

```
┌─────────────────────┐
│   ⭐ 中心類         │
├─────────────────────┤
│  TITLE              │◄─── Modification targets
│  CONTENT            │◄─── (修改體 suggestions)
├─────────────────────┤
│  CENTERAL_TEMPLATE  │
│   - TITLE           │
│   - ISMAIN          │
│  PROMPT_TEMPLATE    │
│   - ROLE            │
│   - DESCRIPTION     │
├─────────────────────┤
│  ○ input  ○ output │
└─────────────────────┘
```

### 3. 增值類 (Value-Added Nodes)

#### 建議體 (Suggestion Node)
```
┌─────────────────────┐
│   💡 建議體         │
├─────────────────────┤
│  PROMPT_TEMPLATE    │
│  ITEM_TEMPLATE      │
│   - \<SUGGESTION\>   │
├─────────────────────┤
│  ○ input  ○ output │
└─────────────────────┘
```

#### 修改體 (Correction Node) 🔑
```
┌─────────────────────────────────────────────────────────────────┐
│   🔧 修改體 (Correction Node)                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ SUGGESTIONS TO MAIN (CENTERAL_TEMPLATE):                │   │
│  │                                                          │   │
│  │  TITLE:     [Suggested Title]                           │   │
│  │  CONTENT:   [Suggested Content]                         │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  PROMPT_TEMPLATE                                                │
│  ITEM_TEMPLATE \<SUGGESTION\>                                   │
│  PLAN_TEMPLATE \<CORRECTION\>                                   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ○ input  ○ suggestion_output  ○ approved_output               │
└─────────────────────────────────────────────────────────────────┘
```

### 4. 規範類 (Standard Nodes)

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

## Correction Flow

> How suggestions reach the user for approval

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  修改體      │────►│  CENTERAL    │────►│  User        │
│  (Generate)  │     │  TEMPLATE    │     │  Decision    │
└──────────────┘     └──────────────┘     └──────────────┘
      │                                            │
      │  Suggestion                               │ Approve / Reject
      │  (TITLE + CONTENT)                       │
      ▼                                            ▼
┌──────────────┐                           ┌──────────────┐
│  User Prompt │                           │  Apply /     │
│  Review?     │                           │  Discard     │
└──────────────┘                           └──────────────┘
```

## User Approval Step

After 修改體 generates suggestions:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Modification Review                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   修改體 suggests changes to:                                    │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  TITLE:                                                  │   │
│   │  Current:  "Original Title"                              │   │
│   │  Suggested: "New Suggested Title"  ◄── Highlighted      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  CONTENT:                                               │   │
│   │  Current:  "Original Content..."                       │   │
│   │  Suggested: "New Suggested Content..."  ◄── Highlighted│   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌──────────────────┐      ┌──────────────────┐               │
│   │   ✅ APPROVE     │      │   ❌ REJECT      │               │
│   │   (Apply)        │      │   (Discard)      │               │
│   └──────────────────┘      └──────────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Action | Result |
|--------|--------|
| **Approve** | Apply suggestion to MAIN (CENTERAL_TEMPLATE) |
| **Reject** | Discard suggestion, keep current MAIN values |

## Template Editing

- **Admin**: Double-click node in GUI to edit properties
- **All templates editable**: PROMPT_TEMPLATE, ITEM_TEMPLATE, JUDGE_TEMPLATE, etc.

## Memory & Export System

| Type | Download | Load to App |
|------|----------|-------------|
| **Summary** | ✅ | ✅ |
| **Snapshot** | ✅ | ✅ |
| **Chat History** | ✅ | ✅ |
