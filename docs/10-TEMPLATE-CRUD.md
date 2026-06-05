# Template CRUD (模板管理)

> Create, read, update, delete all template nodes

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    Template Management                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [+ New Template] [Save] [Delete] [Duplicate] [Export]           │
│                                                                  │
│  ┌──────────────────────┐  ┌─────────────────────────────────┐   │
│  │ Template List        │  │ Template Editor                 │   │
│  │                      │  │                                 │   │
│  │ ▼ CENTERAL_TEMPLATE  │  │ Name: [____________________]   │   │
│  │   PROMPT_TEMPLATE    │  │                                 │   │
│  │   ITEM_TEMPLATE      │  │ Type: [▼ CENTERAL_TEMPLATE ▼]  │   │
│  │     ├─ SNAPSHOT      │  │                                 │   │
│  │     ├─ SUMMARY       │  │ Properties:                     │   │
│  │     └─ SUGGESTION    │  │ ┌───────────────────────────┐  │   │
│  │   JUDGE_TEMPLATE      │  │ │ TITLE: [_______________] │  │   │
│  │     ├─ VALUE         │  │ │ ISMAIN: [☑️]             │  │   │
│  │     └─ FACT          │  │ │                           │  │   │
│  │   VIEW_TEMPLATE      │  │ │ [Other properties...]     │  │   │
│  │     ├─ ECO           │  │ └───────────────────────────┘  │   │
│  │     └─ FINANCIAL     │  │                                 │   │
│  │   PLAN_TEMPLATE      │  │ ┌───────────────────────────┐  │   │
│  │   CUSTOM_TEMPLATE    │  │ │ Preview:                  │  │   │
│  │                      │  │ │ {                          │  │   │
│  │                      │  │ │   "title": "...",         │  │   │
│  │                      │  │ │   "ismain": true          │  │   │
│  │                      │  │ │ }                          │  │   │
│  │                      │  │ └───────────────────────────┘  │   │
│  └──────────────────────┘  └─────────────────────────────────┘   │
│                                                                  │
│  Search: [____________________] [🔍]                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Template Types

| Type | Description |
|------|-------------|
| **CENTERAL_TEMPLATE** | Primary node - MAIN target for modifications |
| **PROMPT_TEMPLATE** | Role, description, prompts |
| **ITEM_TEMPLATE** | SNAPSHOT, SUMMARY, SUGGESTION |
| **JUDGE_TEMPLATE** | VALUE, FACT judgment |
| **VIEW_TEMPLATE** | ECO, FINANCIAL, IT, etc. |
| **PLAN_TEMPLATE** | CORRECTION planning |
| **CUSTOM_TEMPLATE** | User-defined free form |

## Template CRUD

### Create (創建模板)

1. Click [+ New Template]
2. Select template type
3. Enter name and properties
4. Click [Save]

```
┌─────────────────────────────────────────────────────────────────┐
│                    New Template Dialog                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Template Name: [________________________________]               │
│                                                                  │
│  Template Type: [▼ Select Type _____________________▼]         │
│                                                                  │
│  Category: [▼ Select Category _________________]                │
│                                                                  │
│  Description:                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [_____________________________________________________] │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│                    [Cancel]              [Create]               │
└─────────────────────────────────────────────────────────────────┘
```

### Read (讀取模板)

1. Click template in list
2. Template loads in editor panel
3. View all properties and preview

### Update (更新模板)

1. Select template
2. Edit properties in editor
3. Changes auto-save OR click [Save]

```
┌─────────────────────────────────────────────────────────────────┐
│                    Edit Template Properties                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Name: [____________________]                                   │
│                                                                  │
│  Properties:                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ROLE: [___________________________________________]      │   │
│  │                                                         │   │
│  │ DESCRIPTION: [_______________________________________]  │   │
│  │                                                         │   │
│  │ SYS_PROMPT: [________________________________________]  │   │
│  │                                                         │   │
│  │ USER_PROMPT: [_______________________________________]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│                    [Cancel]              [Save Changes]         │
└─────────────────────────────────────────────────────────────────┘
```

### Delete (刪除模板)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Confirm Delete                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Are you sure you want to delete "My Custom Template"?          │
│  This action cannot be undone.                                  │
│                                                                  │
│  Note: This template may be used in existing flows.             │
│                                                                  │
│                    [Cancel]              [Delete]               │
└─────────────────────────────────────────────────────────────────┘
```

### Duplicate (複製模板)

1. Select template
2. Click [Duplicate]
3. New template created with "-copy" suffix
4. Edit name and modify as needed

## Template Editor Fields

### CENTERAL_TEMPLATE

| Field | Description |
|-------|-------------|
| TITLE | Template title |
| ISMAIN | Checkbox - all functions center around this |

### PROMPT_TEMPLATE

| Field | Description |
|-------|-------------|
| ROLE | AI role definition |
| DESCRIPTION | Brief description |
| SYS_PROMPT | System prompt content |
| USER_PROMPT | User prompt template |

### ITEM_TEMPLATE \<TARGET\>

| Field | Description |
|-------|-------------|
| TARGET | SNAPSHOT / SUMMARY / SUGGESTION |
| VERSION | Version number |
| CONTENT | Template content |

### JUDGE_TEMPLATE \<TARGET\>

| Field | Description |
|-------|-------------|
| TARGET | VALUE / FACT |
| JUDGE_BASE | Base for judgment |
| BASE_CONTENT | Content of judgment |
| BASE_METHOD | Method of judgment |

### VIEW_TEMPLATE \<TARGET\>

| Field | Description |
|-------|-------------|
| TARGET | ECO / FINANCIAL / IT / etc. |
| JUDGE_BASE | View judgment base |
| BASE_CONTENT | View content |
| BASE_METHOD | View method |

### PLAN_TEMPLATE \<TARGET\>

| Field | Description |
|-------|-------------|
| TARGET | CORRECTION |
| PLAN | Plan content |
| LIST_CONTENT | List of planned items |

### CUSTOM_TEMPLATE

| Field | Description |
|-------|-------------|
| CONTENT | Freely editable content |

## Search & Filter

| Feature | Description |
|---------|-------------|
| Search | Filter templates by name |
| Type Filter | Show only specific type |
| Category Filter | Filter by category |

## Import/Export

### Export

1. Select template(s)
2. Click [Export]
3. Choose format (JSON)
4. Save file

### Import

1. Click [Import]
2. Select template file
3. Template added to list

## Template Validation

Before saving, system validates:

- [ ] Name is unique
- [ ] Name is not empty
- [ ] Required fields are filled
- [ ] Template type is valid
- [ ] No circular dependencies (if applicable)
