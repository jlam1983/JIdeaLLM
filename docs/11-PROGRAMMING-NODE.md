# Programming Node (程序編寫節點)

> Code generation node with language selection (JS/Python) - locked at creation

## Node Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    📜 Programming Node                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Language: [JS]  ← Locked after creation                         │
│           [Python]                                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Code Template:                                           │   │
│  │                                                          │   │
│  │ [                                        ]                │   │
│  │ [         Code Editor Area                ]              │   │
│  │ [         (Monaco / CodeMirror)            ]              │   │
│  │ [                                        ]                │   │
│  │ [                                        ]                │   │
│  │ [                                        ]                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Input Variables:                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  {{input1}}  {{input2}}  {{variable}}                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Output:                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  {{result}}  {{output}}                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ○ input  ○ code_output  ○ error_output                         │
└─────────────────────────────────────────────────────────────────┘
```

## Language Selection

### Creation Time

```
┌─────────────────────────────────────────────────────────────────┐
│                    New Programming Node                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Node Name: [________________________________]                   │
│                                                                  │
│  Language:  ┌──────────────────────────────┐                   │
│             │  ○ JavaScript (Node.js)       │  ◄── Select ONE  │
│             │  ○ Python (3.x)              │                   │
│             └──────────────────────────────┘                   │
│                                                                  │
│  ⚠️  Language cannot be changed after creation!                │
│                                                                  │
│                    [Cancel]              [Create]               │
└─────────────────────────────────────────────────────────────────┘
```

### After Creation

```
┌─────────────────────────────────────────────────────────────────┐
│                    📜 Programming Node                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Language: [Python]  🔒 (Locked - cannot change)               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Language | Lock Status | Change Allowed |
|----------|-------------|----------------|
| JavaScript | 🔒 Locked | No |
| Python | 🔒 Locked | No |

## Code Template CRUD

> All operations via app buttons - immediate execution

### Create (新增代碼模板)

1. Click [+ New Code] in programming node
2. Select language
3. Write code in editor
4. Click [Save]

```
┌─────────────────────────────────────────────────────────────────┐
│                    New Code Template                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Template Name: [________________________________]               │
│                                                                  │
│  Language: [Python] 🔒                                          │
│                                                                  │
│  Code:                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ def process(data):                                      │   │
│  │     # Your code here                                    │   │
│  │     result = data * 2                                   │   │
│  │     return result                                       │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Input Params: [data]                                           │
│  Output: [result]                                              │
│                                                                  │
│                    [Cancel]              [Save]                 │
└─────────────────────────────────────────────────────────────────┘
```

### Read (讀取代碼模板)

1. Click template in list
2. Code loads in editor (read-only or editable based on permissions)
3. View input/output mappings

### Update (更新代碼模板)

1. Click [Edit Code]
2. Modify code
3. Click [Save] immediately

```
┌─────────────────────────────────────────────────────────────────┐
│                    Edit Code Template                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Template: [my-template __________________________] [Load]      │
│                                                                  │
│  Language: [Python] 🔒                                          │
│                                                                  │
│  Code:                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ # Edit code here                                       │   │
│  │                                                          │   │
│  │ [Code Editor - Monaco / CodeMirror]                    │   │
│  │                                                          │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [Test Run]  [Save]  [Cancel]                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Delete (刪除代碼模板)

1. Select template
2. Click [Delete]
3. Confirm in dialog

```
┌─────────────────────────────────────────────────────────────────┐
│                    Confirm Delete                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Delete template "data-transformer"?                            │
│                                                                  │
│                    [Cancel]              [Delete]               │
└─────────────────────────────────────────────────────────────────┘
```

## Code Operations Buttons

| Button | Action |
|--------|--------|
| **[New Code]** | Create new code template |
| **[Edit Code]** | Edit selected template |
| **[Delete]** | Delete selected template |
| **[Duplicate]** | Copy template |
| **[Test Run]** | Execute with test input |
| **[Save]** | Save changes immediately |
| **[Export]** | Export as .js / .py file |
| **[Import]** | Import from file |

## Code Editor Features

- **Syntax highlighting** (JS/Python)
- **Auto-complete** for language keywords
- **Variable highlighting** ({{variable}} markers)
- **Error detection** in real-time
- **Line numbers**
- **Code folding**

## Variable System

### Input Variables

```
{{input_name}}  →  Passed from previous node or user
```

### Output Variables

```
{{output_name}}  →  Passed to next node
```

## Example Templates

### JavaScript Example

```javascript
// Transform data
function transform(input) {
    const result = {
        processed: true,
        value: input.data * input.multiplier,
        timestamp: Date.now()
    };
    return result;
}

// Call with: {{input}}
```

### Python Example

```python
# Transform data
def transform(data, multiplier):
    result = {
        'processed': True,
        'value': data * multiplier,
        'timestamp': datetime.now().isoformat()
    }
    return result

# Call with: {{input}}, {{multiplier}}
```

## Programming Node in Flow

```
┌────────────┐    ┌────────────────────┐    ┌────────────┐
│ 現象體     │───►│ 📜 Programming    │───►│ 綜合體     │
│ (Input)   │    │ Node (Python)     │    │ (Output)  │
└────────────┘    └────────────────────┘    └────────────┘
```

## Node Properties

| Property | Description |
|----------|-------------|
| Node ID | Auto-generated unique ID |
| Node Name | User-defined name |
| Language | JS / Python - **locked after creation** |
| Code Template | The actual code |
| Input Variables | List of {{input}} variables |
| Output Variables | List of {{output}} variables |
| Created Date | Auto-recorded |
| Modified Date | Auto-updated |
