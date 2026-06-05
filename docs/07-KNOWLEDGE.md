# 知識節點 (Knowledge Node)

> Connects to MCP (Model Context Protocol) for external data source

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Knowledge Node                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌───────────────┐       ┌───────────────┐                    │
│   │      MCP       │──────►│   Knowledge   │                    │
│   │  (External)    │       │     Node      │                    │
│   └───────────────┘       └───────┬───────┘                    │
│                                   │                              │
│                                   ▼                              │
│                           ┌───────────────┐                    │
│                           │ Admin Convert │                    │
│                           │ (LLM-readable) │                    │
│                           └───────┬───────┘                    │
│                                   │                              │
│                                   ▼                              │
│                           ┌───────────────┐                    │
│                           │  LLM Worker   │                    │
│                           └───────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Node Structure

```
┌─────────────────────────────────────────┐
│   📚 知識節點 (Knowledge Node)          │
├─────────────────────────────────────────┤
│  MCP Source: [Dropdown / URL]          │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ Raw Data (from MCP)             │   │
│  │ [_____________________________]  │   │
│  └──────────────────────────────────┘   │
│           │                              │
│           ▼  Admin converts              │
│  ┌──────────────────────────────────┐   │
│  │ LLM-Readable Format             │   │
│  │ [_____________________________]  │   │
│  └──────────────────────────────────┘   │
│                                          │
├─────────────────────────────────────────┤
│  ○ mcp_input    ○ llm_output           │
└─────────────────────────────────────────┘
```

## Workflow

1. **MCP Connection**
   - Configure MCP source (URL, API, database, etc.)
   - Admin sets up connection parameters

2. **Data Fetch**
   - Node fetches raw data from MCP source

3. **Admin Conversion**
   - Admin reviews raw data
   - Converts/transformation to LLM-readable format
   - (Admin intervention required)

4. **LLM Output**
   - Converted data passed to LLM Worker
   - LLM can now process the information

## Admin Responsibilities

| Step | Action |
|------|--------|
| 1 | Configure MCP connection |
| 2 | Fetch raw data |
| 3 | Convert to LLM-readable format |
| 4 | Verify output before sending to LLM |

## MCP Data Types

- Web search results
- Database queries
- API responses
- Document retrieval
- File system access
- External services

## Usage in Flow

```
┌────────────┐    ┌────────────┐    ┌────────────┐
│ 現象體     │───►│ 知識節點   │───►│ 評估體     │
│ (Input)   │    │ (MCP Fetch)│    │ (Evaluate) │
└────────────┘    └────────────┘    └────────────┘
```

## Properties

| Property | Description |
|----------|-------------|
| MCP Source | External data source URL/connection |
| Fetch Method | GET, POST, Query, etc. |
| Raw Data Field | Raw input from MCP |
| Converted Data | Admin-processed LLM-readable output |
| Cache | Optional: cache fetched data |
