import { Router } from 'express';
import { memoryService } from '../services/memoryService.js';

const router = Router();

// Get all memories
router.get('/', (req, res) => {
  const memories = memoryService.getMemories();
  res.json(memories);
});

// Search memories
router.get('/search', async (req, res) => {
  const { q, limit, threshold } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const results = await memoryService.searchMemories(q, {
      limit: parseInt(limit) || 5,
      threshold: parseFloat(threshold) || 0.3
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get context for LLM (RAG)
router.get('/context', async (req, res) => {
  const { q, limit, threshold } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const context = await memoryService.getContextForLLM(q, {
      limit: parseInt(limit) || 5,
      threshold: parseFloat(threshold) || 0.3
    });
    res.json(context);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single memory
router.get('/:id', (req, res) => {
  const memory = memoryService.getMemory(req.params.id);
  if (!memory) {
    return res.status(404).json({ error: 'Memory not found' });
  }
  res.json(memory);
});

// Add memory
router.post('/', async (req, res) => {
  const { content, metadata } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const memory = await memoryService.addMemory(content, metadata || {});
    res.status(201).json(memory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update memory
router.put('/:id', (req, res) => {
  const { content, metadata } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const memory = memoryService.updateMemory(req.params.id, content, metadata);
  if (!memory) {
    return res.status(404).json({ error: 'Memory not found' });
  }
  res.json(memory);
});

// Delete memory
router.delete('/:id', (req, res) => {
  memoryService.deleteMemory(req.params.id);
  res.status(204).send();
});

// Export memories
router.get('/export/all', (req, res) => {
  const memories = memoryService.exportMemories();
  res.setHeader('Content-Disposition', 'attachment; filename="memories.json"');
  res.setHeader('Content-Type', 'application/json');
  res.json(memories);
});

// Import memories
router.post('/import', (req, res) => {
  const { memories, mode = 'merge' } = req.body;

  if (!Array.isArray(memories)) {
    return res.status(400).json({ error: 'memories array is required' });
  }

  try {
    const imported = memoryService.importMemories(memories, mode);
    res.json({ imported, total: memoryService.getMemories().length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all memories
router.delete('/clear/all', (req, res) => {
  memoryService.clearMemories();
  res.json({ message: 'All memories cleared' });
});

// Get statistics
router.get('/stats', (req, res) => {
  const stats = memoryService.getStats();
  res.json(stats);
});

export default router;
