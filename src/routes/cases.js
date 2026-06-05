import { Router } from 'express';
import { dataStore } from '../services/dataStore.js';
import { createCase } from '../models/index.js';
import { llmWorker } from '../worker/llmWorker.js';
import { flowEngine } from '../nodes/flowEngine.js';

const router = Router();

// Get all cases
router.get('/', (req, res) => {
  const cases = dataStore.getCases();
  res.json(cases);
});

// Get single case
router.get('/:id', (req, res) => {
  const caseData = dataStore.getCase(req.params.id);
  if (!caseData) {
    return res.status(404).json({ error: 'Case not found' });
  }
  res.json(caseData);
});

// Create new case
router.post('/', (req, res) => {
  const { name, flowId, initialData } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const newCase = createCase(name, flowId, initialData || {});
  dataStore.saveCase(newCase);
  res.status(201).json(newCase);
});

// Update case
router.put('/:id', (req, res) => {
  const existing = dataStore.getCase(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    createdAt: existing.createdAt
  };

  dataStore.saveCase(updated);
  res.json(updated);
});

// Delete case
router.delete('/:id', (req, res) => {
  const result = dataStore.deleteCase(req.params.id);
  if (!result) {
    return res.status(500).json({ error: 'Failed to delete case' });
  }
  res.status(204).send();
});

// Add message to chat history
router.post('/:id/messages', (req, res) => {
  const caseData = dataStore.getCase(req.params.id);
  if (!caseData) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const { role, content } = req.body;
  if (!role || !content) {
    return res.status(400).json({ error: 'Role and content are required' });
  }

  caseData.chatHistory = caseData.chatHistory || [];
  caseData.chatHistory.push({
    id: `msg_${Date.now()}`,
    role,
    content,
    timestamp: new Date().toISOString()
  });

  dataStore.saveCase(caseData);
  res.status(201).json(caseData.chatHistory[caseData.chatHistory.length - 1]);
});

// Chat with LLM (using flow)
router.post('/:id/chat', async (req, res) => {
  const caseData = dataStore.getCase(req.params.id);
  if (!caseData) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Add user message
  caseData.chatHistory = caseData.chatHistory || [];
  caseData.chatHistory.push({
    id: `msg_${Date.now()}_user`,
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });

  // Get flow if associated
  let flow = null;
  if (caseData.flowId) {
    flow = dataStore.getFlow(caseData.flowId);
  }

  try {
    let response;

    if (flow) {
      // Execute through flow
      const result = await flowEngine.executeFlow(flow, null, {
        prompt: message,
        memory: caseData.chatHistory.slice(-10),
        waitForDecision: (data) => {
          // This would be handled via WebSocket in production
          return Promise.resolve({ approved: false });
        }
      });
      response = result.finalResult?.content || 'No response from flow';
    } else {
      // Direct LLM call
      const llmResult = await llmWorker.enqueue({
        prompt: message,
        systemPrompt: 'You are a helpful assistant.',
        context: { chatHistory: caseData.chatHistory }
      });
      response = llmResult.content;
    }

    // Add assistant message
    caseData.chatHistory.push({
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });

    dataStore.saveCase(caseData);
    res.json({
      message: response,
      chatHistory: caseData.chatHistory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate summary
router.post('/:id/summary', async (req, res) => {
  const caseData = dataStore.getCase(req.params.id);
  if (!caseData) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const chatHistory = caseData.chatHistory || [];
  const summaryPrompt = `Summarize the following conversation:

${chatHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Provide a concise summary.`;

  try {
    const result = await llmWorker.enqueue({
      prompt: summaryPrompt,
      systemPrompt: 'You are a helpful assistant that summarizes conversations.'
    });

    caseData.summary = result.content;
    dataStore.saveCase(caseData);

    res.json({ summary: result.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create snapshot
router.post('/:id/snapshot', (req, res) => {
  const caseData = dataStore.getCase(req.params.id);
  if (!caseData) {
    return res.status(404).json({ error: 'Case not found' });
  }

  caseData.snapshot = {
    id: `snapshot_${Date.now()}`,
    timestamp: new Date().toISOString(),
    chatHistory: [...caseData.chatHistory],
    summary: caseData.summary,
    flowId: caseData.flowId,
    initialData: caseData.initialData
  };

  dataStore.saveCase(caseData);
  res.status(201).json(caseData.snapshot);
});

// Export case
router.get('/:id/export', (req, res) => {
  const caseData = dataStore.getCase(req.params.id);
  if (!caseData) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const format = req.query.format || 'json';
  const exportData = {
    ...caseData,
    exportedAt: new Date().toISOString()
  };

  if (format === 'markdown') {
    let markdown = `# ${caseData.name}\n\n`;
    markdown += `**Created:** ${caseData.createdAt}\n`;
    markdown += `**Modified:** ${caseData.modifiedAt}\n\n`;

    if (caseData.summary) {
      markdown += `## Summary\n\n${caseData.summary}\n\n`;
    }

    markdown += `## Chat History\n\n`;
    (caseData.chatHistory || []).forEach(m => {
      markdown += `**${m.role}:** ${m.content}\n\n`;
    });

    res.setHeader('Content-Disposition', `attachment; filename="${caseData.name}.md"`);
    res.setHeader('Content-Type', 'text/markdown');
    return res.send(markdown);
  }

  res.setHeader('Content-Disposition', `attachment; filename="${caseData.name}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.json(exportData);
});

export default router;
