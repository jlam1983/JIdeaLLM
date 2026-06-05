import { dataStore } from './dataStore.js';
import { CONFIG } from '../config/index.js';

class MemoryService {
  constructor() {
    this.embeddings = new Map(); // In-memory embeddings cache
  }

  // Add a memory entry
  async addMemory(content, metadata = {}) {
    const memory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      metadata,
      createdAt: new Date().toISOString(),
      accessedAt: new Date().toISOString(),
      accessCount: 0,
      embedding: null // Will be computed if needed
    };

    const memories = this.getMemories();
    memories.push(memory);
    this.saveMemories(memories);

    return memory;
  }

  // Get all memories
  getMemories() {
    return dataStore.load('memory') || [];
  }

  // Save memories
  saveMemories(memories) {
    dataStore.save('memory', memories);
  }

  // Search memories using keyword matching (simple RAG)
  async searchMemories(query, options = {}) {
    const {
      limit = CONFIG.memory.maxResults,
      threshold = CONFIG.memory.similarityThreshold
    } = options;

    const memories = this.getMemories();
    const queryLower = query.toLowerCase();

    // Score each memory based on keyword matching
    const scored = memories.map(memory => {
      const contentLower = memory.content.toLowerCase();
      const metadataLower = JSON.stringify(memory.metadata).toLowerCase();

      // Calculate simple similarity score
      let score = 0;

      // Exact phrase match
      if (contentLower.includes(queryLower)) {
        score += 0.5;
      }

      // Word overlap
      const queryWords = queryLower.split(/\s+/);
      const contentWords = contentLower.split(/\s+/);
      const overlap = queryWords.filter(w => contentWords.includes(w)).length;
      score += overlap / queryWords.length * 0.3;

      // Metadata match
      if (metadataLower.includes(queryLower)) {
        score += 0.2;
      }

      // Boost by access count (recency bias)
      score *= (1 + Math.log10(memory.accessCount + 1) * 0.1);

      return { memory, score };
    });

    // Filter and sort
    const results = scored
      .filter(r => r.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results.map(r => ({
      ...r.memory,
      relevanceScore: r.score
    }));
  }

  // Get memory by ID
  getMemory(id) {
    const memories = this.getMemories();
    const memory = memories.find(m => m.id === id);

    if (memory) {
      // Update access stats
      memory.accessedAt = new Date().toISOString();
      memory.accessCount = (memory.accessCount || 0) + 1;
      this.saveMemories(memories);
    }

    return memory;
  }

  // Update memory
  updateMemory(id, content, metadata = {}) {
    const memories = this.getMemories();
    const index = memories.findIndex(m => m.id === id);

    if (index >= 0) {
      memories[index] = {
        ...memories[index],
        content,
        metadata,
        modifiedAt: new Date().toISOString()
      };
      this.saveMemories(memories);
      return memories[index];
    }

    return null;
  }

  // Delete memory
  deleteMemory(id) {
    const memories = this.getMemories();
    const filtered = memories.filter(m => m.id !== id);
    this.saveMemories(filtered);
  }

  // Search and return as context for LLM
  async getContextForLLM(query, options = {}) {
    const memories = await this.searchMemories(query, options);

    if (memories.length === 0) {
      return {
        context: '',
        memories: [],
        message: 'No relevant memories found'
      };
    }

    // Format memories as context string
    const context = memories
      .map((m, i) => `[Memory ${i + 1}] ${m.content}`)
      .join('\n\n');

    return {
      context: `Relevant memories:\n${context}`,
      memories,
      count: memories.length
    };
  }

  // Import memories from export
  async importMemories(memories, mode = 'merge') {
    if (mode === 'replace') {
      this.saveMemories(memories);
      return memories.length;
    }

    // Merge mode
    const existing = this.getMemories();
    const existingIds = new Set(existing.map(m => m.id));

    let imported = 0;
    for (const memory of memories) {
      if (!existingIds.has(memory.id)) {
        existing.push(memory);
        imported++;
      }
    }

    this.saveMemories(existing);
    return imported;
  }

  // Export memories
  exportMemories() {
    return this.getMemories();
  }

  // Clear all memories
  clearMemories() {
    this.saveMemories([]);
  }

  // Get memory statistics
  getStats() {
    const memories = this.getMemories();
    const total = memories.length;

    if (total === 0) {
      return { total, avgAccessCount: 0, newest: null, oldest: null };
    }

    const avgAccessCount = memories.reduce((sum, m) => sum + (m.accessCount || 0), 0) / total;
    const sorted = [...memories].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return {
      total,
      avgAccessCount: Math.round(avgAccessCount * 100) / 100,
      newest: sorted[0]?.createdAt,
      oldest: sorted[sorted.length - 1]?.createdAt
    };
  }
}

export const memoryService = new MemoryService();
