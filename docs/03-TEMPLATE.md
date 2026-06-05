# Templates

## Template Nodes

> All templates are editable nodes in the GUI

### Template Node Structure

```
┌─────────────────────────────┐
│   📝 TEMPLATE_NAME          │
├─────────────────────────────┤
│  Property 1: [___________]  │
│  Property 2: [___________]  │
│  Property 3: [___________]  │
├─────────────────────────────┤
│  ○ input        ○ output   │
└─────────────────────────────┘
```

## Node Types

### 1. CENTERAL_TEMPLATE ⭐

> Primary node - all functions center around this
> **TARGET of modification suggestions (TITLE, CONTENT)**

```
┌─────────────────────────────────────────────────────────────┐
│   ⭐ CENTERAL_TEMPLATE (MAIN)                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TITLE:     [________________________________]              │
│  CONTENT:   [________________________________]              │
│                                                              │
│  ISMAIN:    ☑️ (All functions center around this)           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  ○ input        ○ output                                  │
└─────────────────────────────────────────────────────────────┘
```

### 2. PROMPT_TEMPLATE

```
┌─────────────────────────────┐
│   💬 PROMPT_TEMPLATE        │
├─────────────────────────────┤
│  ROLE: [________________]   │
│  DESCRIPTION: [___________] │
│  SYS_PROMPT: [____________] │
│  USER_PROMPT: [___________] │
├─────────────────────────────┤
│  ○ input        ○ output   │
└─────────────────────────────┘
```

### 3. ITEM_TEMPLATE \<TARGET\>

TARGET = SNAPSHOT, SUMMARY, SUGGESTION

```
┌─────────────────────────────┐
│   📋 ITEM_TEMPLATE          │
├─────────────────────────────┤
│  TARGET: [SNAPSHOT ▼]      │
│  VERSION: [_____________]  │
│  CONTENT: [_______________]│
├─────────────────────────────┤
│  ○ input        ○ output   │
└─────────────────────────────┘
```

### 4. JUDGE_TEMPLATE \<TARGET\>

TARGET = VALUE, FACT

```
┌─────────────────────────────┐
│   ⚖️ JUDGE_TEMPLATE         │
├─────────────────────────────┤
│  TARGET: [VALUE ▼]         │
│  JUDGE_BASE: [____________] │
│  BASE_CONTENT: [___________]│
│  BASE_METHOD: [____________]│
├─────────────────────────────┤
│  ○ input        ○ output   │
└─────────────────────────────┘
```

### 5. VIEW_TEMPLATE \<TARGET\>

TARGET = ECO, FINANCIAL, IT, .....

```
┌─────────────────────────────┐
│   👁️ VIEW_TEMPLATE          │
├─────────────────────────────┤
│  TARGET: [ECO ▼]           │
│  JUDGE_BASE: [____________] │
│  BASE_CONTENT: [___________]│
│  BASE_METHOD: [____________]│
├─────────────────────────────┤
│  ○ input        ○ output   │
└─────────────────────────────┘
```

### 6. PLAN_TEMPLATE \<TARGET\>

TARGET = CORRECTION

```
┌─────────────────────────────┐
│   📋 PLAN_TEMPLATE          │
├─────────────────────────────┤
│  TARGET: [CORRECTION ▼]    │
│  PLAN: [________________]   │
│  LIST_CONTENT: [___________]│
├─────────────────────────────┤
│  ○ input        ○ output   │
└─────────────────────────────┘
```

### 7. CUSTOM_TEMPLATE

```
┌─────────────────────────────┐
│   ✏️ CUSTOM_TEMPLATE       │
├─────────────────────────────┤
│  "Plan by user"             │
│  (Freely editable)          │
├─────────────────────────────┤
│  ○ input        ○ output   │
└─────────────────────────────┘
```

## Correction Flow

> How 修改體 suggestions target CENTERAL_TEMPLATE

```
┌─────────────────────────────────────────────────────────────────┐
│                      Correction Flow                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   修改體 (Correction Node)                                        │
│   ├── ITEM_TEMPLATE \<SUGGESTION\>                               │
│   │       └── Suggests new values for:                          │
│   │                                                              │
│   │   ┌─────────────────────────────────────────────────────┐   │
│   │   │  SUGGESTS TO: CENTERAL_TEMPLATE (MAIN)              │   │
│   │   │                                                      │   │
│   │   │  • TITLE:     "Suggested New Title"                 │   │
│   │   │  • CONTENT:   "Suggested New Content"               │   │
│   │   │                                                      │   │
│   │   └─────────────────────────────────────────────────────┘   │
│   │                                                              │
│   └── PLAN_TEMPLATE \<CORRECTION\>                               │
│           └── Provides correction method                         │
│                                                                  │
│   ↓ User Decision                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Current: "Original Title"  →  Suggested: "New Title"   │   │
│   │  [✅ Approve]  [❌ Reject]                                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   If Approve → CENTERAL_TEMPLATE updated with new TITLE/CONTENT  │
│   If Reject  → Original values preserved                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Admin Editing

- **Double-click** any template node to edit properties
- Changes apply immediately to flow
- Templates can be duplicated, deleted, connected

## Memory System

Template outputs can be:
1. **Store** → Saved to memory
2. **Summary** → Condensed version
3. **Select** → User chooses for chat memory
