import { llmWorker } from '../worker/llmWorker.js';
import { NodeTypes } from '../models/index.js';
import { dataStore } from '../services/dataStore.js';

class NodeExecutor {
  constructor() {
    this.handlers = new Map();
    this.registerHandlers();
  }

  registerHandlers() {
    // Central node - main processing target
    this.handlers.set(NodeTypes.CENTRAL, this.handleCentral.bind(this));

    // Phenomenon node - input source
    this.handlers.set(NodeTypes.PHENOMENON, this.handlePhenomenon.bind(this));

    // Knowledge node - MCP connection
    this.handlers.set(NodeTypes.KNOWLEDGE, this.handleKnowledge.bind(this));

    // Programming node - code execution
    this.handlers.set(NodeTypes.PROGRAMMING, this.handleProgramming.bind(this));

    // Evaluation node
    this.handlers.set(NodeTypes.EVALUATION, this.handleEvaluation.bind(this));

    // Suggestion node
    this.handlers.set(NodeTypes.SUGGESTION, this.handleSuggestion.bind(this));

    // Correction node
    this.handlers.set(NodeTypes.CORRECTION, this.handleCorrection.bind(this));

    // Judge node
    this.handlers.set(NodeTypes.JUDGE, this.handleJudge.bind(this));

    // View node
    this.handlers.set(NodeTypes.VIEW, this.handleView.bind(this));
  }

  async execute(node, context) {
    const handler = this.handlers.get(node.type);
    if (!handler) {
      return { success: false, error: `Unknown node type: ${node.type}` };
    }

    try {
      return await handler(node, context);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Central node - processes prompts and returns responses
  async handleCentral(node, context) {
    const { title, content } = node.properties;
    const { prompt, memory = [] } = context;

    // Build system prompt from title and content
    const systemPrompt = `You are working with the following context:
Title: ${title}
Content: ${content}

${memory.map(m => `Previous: ${m.role}: ${m.content}`).join('\n')}`;

    const result = await llmWorker.enqueue({
      prompt: prompt || 'Continue the conversation.',
      systemPrompt,
      context
    });

    return result;
  }

  // Phenomenon node - collects input from environment, circle, or personal
  async handlePhenomenon(node, context) {
    const { sourceType, data } = node.properties;

    return {
      success: true,
      data: {
        source: sourceType,
        content: data || context.input || '',
        timestamp: new Date().toISOString()
      }
    };
  }

  // Knowledge node - fetches from MCP and converts to LLM-readable format
  async handleKnowledge(node, context) {
    const { mcpSource, rawData } = node.properties;

    // In production, this would connect to MCP
    // For now, return the raw data as converted
    return {
      success: true,
      data: {
        source: mcpSource,
        raw: rawData,
        converted: rawData || 'Data from MCP source',
        adminApproved: true // Admin must approve conversion
      }
    };
  }

  // Programming node - executes code (JS or Python)
  async handleProgramming(node, context) {
    const { language, code, inputVariables, outputVariables } = node.properties;

    // Extract variables from context
    const inputs = {};
    (inputVariables || []).forEach(v => {
      inputs[v] = context[v] || context.input?.[v];
    });

    try {
      let result;
      let error;

      if (language === 'javascript') {
        result = await this.executeJavaScript(code, inputs);
      } else if (language === 'python') {
        // Python execution would require a Python runtime
        // For now, return error indicating Python not supported
        error = 'Python execution requires additional runtime configuration';
        result = null;
      }

      if (error) {
        return { success: false, error };
      }

      return {
        success: true,
        data: {
          result,
          outputs: result,
          language
        }
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Execute JavaScript code
  async executeJavaScript(code, inputs) {
    // Create a sandboxed function
    const inputKeys = Object.keys(inputs);
    const inputValues = Object.values(inputs);

    // Build function with inputs as parameters
    const wrappedCode = `
      const __inputs = arguments[0];
      ${code}
    `;

    const fn = new Function(wrappedCode);
    return fn(inputs);
  }

  // Evaluation node - combines judge and view templates
  async handleEvaluation(node, context) {
    const { judges, views } = node.properties;
    const results = [];

    // Execute each judge
    for (const judgeId of judges || []) {
      const judgeTemplate = dataStore.getTemplate(judgeId);
      if (judgeTemplate) {
        const result = await this.execute(judgeTemplate, context);
        results.push({ type: 'judge', id: judgeId, result });
      }
    }

    // Execute each view
    for (const viewId of views || []) {
      const viewTemplate = dataStore.getTemplate(viewId);
      if (viewTemplate) {
        const result = await this.execute(viewTemplate, context);
        results.push({ type: 'view', id: viewId, result });
      }
    }

    return {
      success: true,
      data: { evaluations: results }
    };
  }

  // Suggestion node - generates suggestions based on context
  async handleSuggestion(node, context) {
    const { target, content, version } = node.properties;

    const prompt = `Based on the following context, generate a suggestion:
${content || 'No specific content provided'}

Context: ${JSON.stringify(context)}

Provide a clear, actionable suggestion.`;

    const result = await llmWorker.enqueue({
      prompt,
      systemPrompt: 'You are a helpful assistant that generates suggestions.',
      context
    });

    return {
      success: true,
      data: {
        suggestion: result.content,
        target,
        version
      }
    };
  }

  // Correction node - generates corrections for MAIN (Central) node
  async handleCorrection(node, context) {
    const { suggestedTitle, suggestedContent, planContent } = node.properties;
    const centralNode = context.centralNode;

    // Get current title and content from Central
    const currentTitle = centralNode?.properties?.title || 'Untitled';
    const currentContent = centralNode?.properties?.content || '';

    // Generate correction suggestions
    const prompt = `Analyze the current MAIN content and suggest improvements:

Current Title: ${currentTitle}
Current Content: ${currentContent}

Plan: ${planContent || 'General improvement'}

Suggest a corrected/improved title and content.`;

    const result = await llmWorker.enqueue({
      prompt,
      systemPrompt: 'You are an editor that suggests corrections and improvements.',
      context
    });

    return {
      success: true,
      data: {
        current: { title: currentTitle, content: currentContent },
        suggested: {
          title: suggestedTitle || `Corrected: ${currentTitle}`,
          content: suggestedContent || result.content
        },
        approved: null, // Awaiting user decision
        planContent
      }
    };
  }

  // Judge node - evaluates fact or value
  async handleJudge(node, context) {
    const { target, judgeBase, baseContent, baseMethod } = node.properties;

    const prompt = `Evaluate the following based on ${judgeBase || 'standard criteria'}:

Content: ${baseContent || JSON.stringify(context)}

Method: ${baseMethod || 'Standard evaluation'}

Provide your judgment (${target}).`;

    const result = await llmWorker.enqueue({
      prompt,
      systemPrompt: `You are a judge evaluating based on ${target} criteria.`,
      context
    });

    return {
      success: true,
      data: {
        target,
        judgment: result.content,
        base: judgeBase
      }
    };
  }

  // View node - provides perspective (eco, financial, it, etc.)
  async handleView(node, context) {
    const { target, judgeBase, baseContent, baseMethod } = node.properties;

    const prompt = `Provide a ${target} perspective on the following:

${baseContent || JSON.stringify(context)}

Method: ${baseMethod || 'Standard analysis'}`;

    const result = await llmWorker.enqueue({
      prompt,
      systemPrompt: `You are an expert in ${target}, providing analysis from this perspective.`,
      context
    });

    return {
      success: true,
      data: {
        view: target,
        perspective: result.content,
        base: judgeBase
      }
    };
  }
}

export const nodeExecutor = new NodeExecutor();
