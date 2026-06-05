# JIdeaLLM

**A visual node-based workflow editor for LLM interactions with memory, multi-provider support, and Windows integration.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-%3E=18.0-green.svg)

## Overview

JIdeaLLM is a standalone server application that provides a **visual node-based flow editor** (think ComfyUI / n8n style) for building LLM-powered workflows. It features a built-in GUI, memory management with RAG-like search, and supports multiple LLM providers including Ollama for local inference.

## Features

### 🎨 Visual Node-Based Editor
- Drag-and-drop node editor with ComfyUI/n8n style interface
- Connect nodes to build complex LLM workflows
- Node types: Phenomenon, Knowledge, Evaluation, Central, Programming, Suggestion, Correction, Standard

### 🤖 Multi-Provider LLM Support
- **Anthropic Claude** - OpenAI-compatible API
- **Ollama** - Local LLM inference (no API key required)
- **MiniMax** - Chinese LLM service
- **Poe** - LLM proxy aggregator

### 🧠 Memory System with RAG
- Keyword-based semantic search for context injection
- Memories are retrieved and fed to LLM before submission
- Tag-based organization with access tracking
- Import/export memories as JSON

### 📁 Windows Content Management
- Built-in file browser for Windows systems
- Read, write, create files and folders
- Search files by pattern
- Configurable base path for sandboxed access

### 📝 Template Management
- Pre-built templates for common workflows
- CRUD operations for all template types
- Custom template creation
- Template duplication

### 💬 Chat Interface
- Select flows and cases for focused conversations
- Full chat history with timestamps
- Export conversations as Markdown or JSON
- Summary and snapshot generation

## Screenshots

```
┌─────────────────────────────────────────────────────────────────┐
│  JIdeaLLM                                                        │
├─────────────────────────────────────────────────────────────────┤
│  [Runtime] [Flow Panel] [Templates] [Memory] [Content]         │
│                                                                 │
│  ┌─────────────┐  ┌─────────────────────────────────────────┐  │
│  │ Flows       │  │        Node Canvas                       │  │
│  │ ○ Flow 1    │  │                                          │  │
│  │ ○ Flow 2    │  │    ┌─────┐   ┌─────┐   ┌─────┐        │  │
│  │ ○ Flow 3    │  │    │ 📥  │───►│ ⚖️  │───►│ ⭐  │        │  │
│  │             │  │    └─────┘   └─────┘   └─────┘        │  │
│  │ [+ New]     │  │        │                 │              │  │
│  └─────────────┘  │        └────────┬────────┘              │  │
│                    │                 ▼                       │  │
│  ┌─────────────┐  │            ┌─────┐                    │  │
│  │ Node Palette │  │            │ 🔧  │                    │  │
│  │ 📥 現象體    │  │            └─────┘                    │  │
│  │ 📚 知識節點  │  │                                         │  │
│  │ ⚖️ 評估體    │  └─────────────────────────────────────────┘  │
│  │ ⭐ 中心類    │                                                │
│  │ 📜 程序編寫  │  ┌─────────────────────────────────────────┐  │
│  │ ...         │  │  Node Properties                          │  │
│  └─────────────┘  │  Title: [________________]                 │  │
│                   │  Content: [________________]               │  │
│                   └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    JIdeaLLM Server                               │
│                  (Express + WebSocket)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         GUI                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Runtime    │  │ Flow Panel  │  │   Memory    │            │
│  │             │  │             │  │   (RAG)     │            │
│  │ • Chat      │  │ • Node      │  │ • Search    │            │
│  │ • Cases     │  │   Editor    │  │ • Import    │            │
│  │ • Export    │  │ • CRUD      │  │ • Export    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LLM Worker                                    │
│              (Concurrent ~4 Threads)                             │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Request Queue → Provider Router → [Anthropic|Ollama|...]│   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
- Node.js >= 18.0
- (Optional) Ollama running locally for local inference

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/jideallm.git
cd jideallm/src

# Install dependencies
npm install

# Start the server
npm start
```

Open your browser to `http://localhost:3000`

### Environment Variables

```bash
# Server
PORT=3000

# LLM Provider (default: anthropic)
LLM_PROVIDER=anthropic

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Ollama (for local inference)
OLLAMA_API_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=llama3

# MiniMax
MINIMAX_API_KEY=...
MINIMAX_GROUP_ID=...

# Poe
POE_API_KEY=...
POE_MODEL=Claude-3-Sonnet

# Windows Content Path
WINDOWS_CONTENT_PATH=C:/Users/YourName/Documents/JIdeaLLM
```

## Project Structure

```
JIdeaLLM/
├── src/
│   ├── server.js              # Express + WebSocket server
│   ├── config/
│   │   └── index.js           # Configuration
│   ├── models/
│   │   └── index.js           # Data models & node types
│   ├── services/
│   │   ├── dataStore.js      # JSON file persistence
│   │   ├── memoryService.js   # RAG memory search
│   │   └── contentManager.js   # Windows file operations
│   ├── routes/
│   │   ├── flows.js           # Flow CRUD & execution
│   │   ├── cases.js           # Case & chat management
│   │   ├── templates.js       # Template CRUD
│   │   ├── codeTemplates.js   # Code template CRUD
│   │   ├── memory.js          # Memory/RAG endpoints
│   │   └── content.js         # File system endpoints
│   ├── worker/
│   │   └── llmWorker.js       # Multi-provider LLM queue
│   ├── nodes/
│   │   ├── nodeExecutor.js    # Node execution handlers
│   │   └── flowEngine.js      # Flow execution engine
│   └── public/                # GUI
│       ├── index.html
│       ├── css/styles.css
│       └── js/app.js
└── docs/                      # Documentation markdown
```

## API Reference

### Flows
```bash
GET    /api/flows              # List all flows
POST   /api/flows              # Create flow
GET    /api/flows/:id          # Get flow
PUT    /api/flows/:id          # Update flow
DELETE /api/flows/:id          # Delete flow
POST   /api/flows/:id/execute  # Execute flow
```

### Cases
```bash
GET    /api/cases              # List cases
POST   /api/cases              # Create case
POST   /api/cases/:id/chat     # Chat with LLM
GET    /api/cases/:id/export    # Export case
```

### Memory (RAG)
```bash
GET    /api/memory                      # List memories
GET    /api/memory/search?q=keyword     # Search memories
GET    /api/memory/context?q=keyword    # Get LLM context
POST   /api/memory                      # Add memory
DELETE /api/memory/:id                  # Delete memory
```

### Content
```bash
GET    /api/content/list?path=/          # List directory
GET    /api/content/read?path=file.txt   # Read file
POST   /api/content/write                 # Write file
POST   /api/content/mkdir               # Create directory
```

### Worker
```bash
GET    /api/worker/status                # Get status
GET    /api/worker/providers             # List providers
POST   /api/worker/provider              # Switch provider
```

## Node Types

| Node | Icon | Description |
|------|------|-------------|
| **現象體** | 📥 | Input source (Environment/Circle/Personal) |
| **知識節點** | 📚 | MCP knowledge connection |
| **評估體** | ⚖️ | Judge + View evaluation |
| **中心類** | ⭐ | Main target for modifications |
| **程序編寫** | 📜 | JS/Python code execution |
| **建議體** | 💡 | Generate suggestions |
| **修改體** | 🔧 | Corrections to Central |
| **規範類** | 📋 | Standardization nodes |

## Use Cases

### 1. AI-Powered Research Assistant
```
現象體 → 知識節點 → 評估體 → 綜合體 → Output
                ↓
           建議體 → 修改體 → 用戶審批
```

### 2. Content Generation Pipeline
```
現象體 → 程序編寫 → 評估體 → 中心類 → 輸出
   ↓
(MCP Knowledge)
```

### 3. Multi-Perspective Analysis
```
現象體
   ↓
評估體 (多視角)
   ├── 經濟視角
   ├── 財務視角
   └── IT視角
   ↓
綜合體 → 用戶決策
```

## License

MIT License - feel free to use, modify, and distribute.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
