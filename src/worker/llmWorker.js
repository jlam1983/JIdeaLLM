import { CONFIG } from '../config/index.js';

class LLMWorker {
  constructor() {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = CONFIG.llm.concurrentThreads;
    this.callbacks = new Map();
    this.currentProvider = CONFIG.llm.defaultProvider;
  }

  // Add request to queue
  enqueue(request) {
    return new Promise((resolve, reject) => {
      const job = {
        id: this.generateJobId(),
        request,
        resolve,
        reject,
        createdAt: Date.now()
      };

      this.callbacks.set(job.id, { resolve, reject });
      this.queue.push(job);
      this.processQueue();
    });
  }

  generateJobId() {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Process queue
  async processQueue() {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const job = this.queue.shift();
      this.running++;
      this.executeJob(job);
    }
  }

  // Execute a single job
  async executeJob(job) {
    try {
      const result = await this.callLLM(job.request);
      job.resolve(result);
    } catch (error) {
      job.reject(error);
    } finally {
      this.running--;
      this.processQueue();
    }
  }

  // Set provider
  setProvider(provider) {
    if (CONFIG.llm.providers[provider]) {
      this.currentProvider = provider;
      return true;
    }
    return false;
  }

  // Get current provider config
  getProviderConfig() {
    return CONFIG.llm.providers[this.currentProvider];
  }

  // List available providers
  listProviders() {
    return Object.entries(CONFIG.llm.providers).map(([key, value]) => ({
      id: key,
      name: value.name,
      configured: !!value.apiKey || key === 'ollama'
    }));
  }

  // Call LLM API based on current provider
  async callLLM(request) {
    const provider = this.currentProvider;
    const config = CONFIG.llm.providers[provider];

    // If no API key (except Ollama), return mock response
    if (!config.apiKey && provider !== 'ollama') {
      return this.getMockResponse(request.prompt, request.context);
    }

    try {
      switch (provider) {
        case 'anthropic':
          return await this.callAnthropic(request, config);
        case 'ollama':
          return await this.callOllama(request, config);
        case 'minimax':
          return await this.callMinimax(request, config);
        case 'poe':
          return await this.callPoe(request, config);
        default:
          return await this.callAnthropic(request, config);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Anthropic API
  async callAnthropic(request, config) {
    const { prompt, systemPrompt = '', context = {} } = request;

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      content: data.content?.[0]?.text || '',
      usage: data.usage,
      provider: 'anthropic'
    };
  }

  // Ollama API
  async callOllama(request, config) {
    const { prompt, systemPrompt = '' } = request;

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        prompt: `${systemPrompt ? `System: ${systemPrompt}\n\n` : ''}User: ${prompt}`,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      content: data.response || '',
      provider: 'ollama'
    };
  }

  // MiniMax API
  async callMinimax(request, config) {
    const { prompt, systemPrompt = '' } = request;

    const response = await fetch(`${config.apiUrl}?GroupId=${config.groupId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        prompt: prompt,
        system_prompt: systemPrompt
      })
    });

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      content: data.choices?.[0]?.text || data.output || '',
      provider: 'minimax'
    };
  }

  // Poe API
  async callPoe(request, config) {
    const { prompt, systemPrompt = '' } = request;

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Poe API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      content: data.choices?.[0]?.message?.content || '',
      provider: 'poe'
    };
  }

  // Mock response for development
  getMockResponse(prompt, context) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          content: `[Mock Response from ${this.currentProvider}]\n\nReceived: "${prompt.substring(0, 80)}..."\n\nContext: ${JSON.stringify(context).substring(0, 100)}`,
          provider: 'mock'
        });
      }, 500);
    });
  }

  // Get queue status
  getStatus() {
    return {
      queueLength: this.queue.length,
      running: this.running,
      maxConcurrent: this.maxConcurrent,
      currentProvider: this.currentProvider,
      providerName: CONFIG.llm.providers[this.currentProvider]?.name
    };
  }

  // Cancel a job
  cancel(jobId) {
    const index = this.queue.findIndex(j => j.id === jobId);
    if (index >= 0) {
      this.queue.splice(index, 1);
      const callbacks = this.callbacks.get(jobId);
      if (callbacks) {
        callbacks.reject(new Error('Job cancelled'));
        this.callbacks.delete(jobId);
      }
      return true;
    }
    return false;
  }
}

export const llmWorker = new LLMWorker();
