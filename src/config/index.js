export const CONFIG = {
  port: process.env.PORT || 3000,
  llm: {
    concurrentThreads: 4,
    defaultProvider: process.env.LLM_PROVIDER || 'anthropic',
    providers: {
      anthropic: {
        name: 'Anthropic',
        apiUrl: process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com/v1/messages',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
        maxTokens: 4096
      },
      ollama: {
        name: 'Ollama',
        apiUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate',
        model: process.env.OLLAMA_MODEL || 'llama3',
        apiKey: '' // Ollama doesn't need API key
      },
      minimax: {
        name: 'MiniMax',
        apiUrl: process.env.MINIMAX_API_URL || 'https://api.minimax.chat/v1/text_generation',
        apiKey: process.env.MINIMAX_API_KEY || '',
        model: process.env.MINIMAX_MODEL || 'abab6-chat',
        groupId: process.env.MINIMAX_GROUP_ID || ''
      },
      poe: {
        name: 'Poe',
        apiUrl: process.env.POE_API_URL || 'https://api.poe.com/api/v1/chat/chat_completion',
        apiKey: process.env.POE_API_KEY || '',
        model: process.env.POE_MODEL || 'Claude-3-Sonnet'
      }
    }
  },
  memory: {
    // IndexedDB settings for browser storage
    dbName: 'JIdeaLLM Memory',
    storeName: 'memories',
    indexName: 'memories_index',
    // RAG settings
    embeddingModel: process.env.EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2',
    similarityThreshold: 0.7,
    maxResults: 5
  },
  paths: {
    data: './data',
    flows: './data/flows.json',
    templates: './data/templates.json',
    cases: './data/cases.json',
    codeTemplates: './data/codeTemplates.json',
    memory: './data/memory.json',
    windowsContent: process.env.WINDOWS_CONTENT_PATH || 'C:/Users/j_lam/Documents/JIdeaLLM'
  }
};
