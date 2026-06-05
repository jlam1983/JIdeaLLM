import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

import { CONFIG } from './config/index.js';
import { flowsRouter, casesRouter, templatesRouter, codeTemplatesRouter, memoryRouter, contentRouter } from './routes/index.js';
import { llmWorker } from './worker/llmWorker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/flows', flowsRouter);
app.use('/api/cases', casesRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/code-templates', codeTemplatesRouter);
app.use('/api/memory', memoryRouter);
app.use('/api/content', contentRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    llmWorker: llmWorker.getStatus(),
    uptime: process.uptime()
  });
});

// Worker status & provider management
app.get('/api/worker/status', (req, res) => {
  res.json(llmWorker.getStatus());
});

app.get('/api/worker/providers', (req, res) => {
  res.json(llmWorker.listProviders());
});

app.post('/api/worker/provider', (req, res) => {
  const { provider } = req.body;
  if (llmWorker.setProvider(provider)) {
    res.json({ success: true, provider, name: CONFIG.llm.providers[provider]?.name });
  } else {
    res.status(400).json({ error: 'Invalid provider' });
  }
});

// WebSocket for real-time updates
const wss = new WebSocketServer({ server, path: '/ws' });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('close', () => {
    clients.delete(ws);
  });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    } catch (error) {
      ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  });

  // Send initial status
  ws.send(JSON.stringify({
    type: 'status',
    data: {
      llm: llmWorker.getStatus(),
      providers: llmWorker.listProviders()
    }
  }));
});

function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;

    case 'subscribe':
      ws.send(JSON.stringify({
        type: 'subscribed',
        channels: data.channels || []
      }));
      break;

    case 'provider-change':
      if (llmWorker.setProvider(data.provider)) {
        broadcast('provider-changed', {
          provider: data.provider,
          name: CONFIG.llm.providers[data.provider]?.name
        });
      }
      break;

    default:
      ws.send(JSON.stringify({ error: 'Unknown message type' }));
  }
}

// Broadcast to all clients
function broadcast(type, data) {
  const message = JSON.stringify({ type, data });
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// Serve static files from public directory
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Serve GUI (catch-all route)
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(getDefaultPage());
    }
  });
});

function getDefaultPage() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>JIdeaLLM Server</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 50px auto; padding: 20px; }
        h1 { color: #4a90d9; }
        .card { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .card h3 { margin-top: 0; color: #333; }
        code { background: #e0e0e0; padding: 2px 6px; border-radius: 3px; }
        pre { background: #333; color: #fff; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .provider { display: inline-block; background: #e3f2fd; padding: 5px 10px; border-radius: 4px; margin: 5px; }
        .provider.active { background: #4a90d9; color: white; }
      </style>
    </head>
    <body>
      <h1>JIdeaLLM Server</h1>
      <p>Server is running. Access the API endpoints below:</p>

      <div class="card">
        <h3>LLM Worker Status</h3>
        <p>Concurrent Threads: ${CONFIG.llm.concurrentThreads}</p>
        <p>Current Provider: <span class="provider active">${CONFIG.llm.defaultProvider}</span></p>
        <p>Available Providers:</p>
        ${Object.entries(CONFIG.llm.providers).map(([key, val]) =>
          `<span class="provider">${val.name} (${key})</span>`
        ).join('')}
      </div>

      <div class="card">
        <h3>Flows API</h3>
        <ul>
          <li><code>GET /api/flows</code> - List all flows</li>
          <li><code>POST /api/flows</code> - Create new flow</li>
          <li><code>POST /api/flows/:id/execute</code> - Execute flow</li>
        </ul>
      </div>

      <div class="card">
        <h3>Cases API</h3>
        <ul>
          <li><code>GET /api/cases</code> - List all cases</li>
          <li><code>POST /api/cases/:id/chat</code> - Chat with LLM</li>
          <li><code>GET /api/cases/:id/export?format=markdown</code> - Export</li>
        </ul>
      </div>

      <div class="card">
        <h3>Templates API</h3>
        <ul>
          <li><code>GET /api/templates</code> - List all templates</li>
          <li><code>POST /api/templates</code> - Create template</li>
          <li><code>POST /api/templates/:id/duplicate</code> - Duplicate</li>
        </ul>
      </div>

      <div class="card">
        <h3>Memory API (RAG)</h3>
        <ul>
          <li><code>GET /api/memory</code> - List all memories</li>
          <li><code>GET /api/memory/search?q=keyword</code> - Search memories</li>
          <li><code>GET /api/memory/context?q=keyword</code> - Get LLM context</li>
          <li><code>POST /api/memory</code> - Add memory</li>
        </ul>
      </div>

      <div class="card">
        <h3>Content Management API</h3>
        <ul>
          <li><code>GET /api/content/list?path=/</code> - List directory</li>
          <li><code>GET /api/content/read?path=file.txt</code> - Read file</li>
          <li><code>POST /api/content/write</code> - Write file</li>
          <li><code>GET /api/content/search?directory=/&pattern=*.txt</code> - Search</li>
        </ul>
      </div>

      <div class="card">
        <h3>Worker Management</h3>
        <ul>
          <li><code>GET /api/worker/status</code> - Get status</li>
          <li><code>GET /api/worker/providers</code> - List providers</li>
          <li><code>POST /api/worker/provider</code> - Switch provider</li>
        </ul>
      </div>

      <pre>Environment Variables:
  LLM_PROVIDER=anthropic|ollama|minimax|poe
  ANTHROPIC_API_KEY=your-key
  OLLAMA_API_URL=http://localhost:11434
  MINIMAX_API_KEY=your-key
  POE_API_KEY=your-key
  WINDOWS_CONTENT_PATH=C:/Users/.../Documents/JIdeaLLM</pre>
    </body>
    </html>
  `;
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
server.listen(CONFIG.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                    JIdeaLLM Server                     ║
╠═══════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${CONFIG.port}              ║
║  WebSocket at:       ws://localhost:${CONFIG.port}/ws            ║
║                                                        ║
║  LLM Provider:      ${(CONFIG.llm.defaultProvider + '               ').slice(0, 16)}║
║  Concurrent:        ${CONFIG.llm.concurrentThreads} threads                              ║
║  Content Path:      ${CONFIG.paths.windowsContent.slice(0, 30)}...║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
