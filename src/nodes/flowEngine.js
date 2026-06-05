import { nodeExecutor } from './nodeExecutor.js';
import { NodeTypes } from '../models/index.js';

class FlowEngine {
  constructor() {
    this.executionCache = new Map();
  }

  // Execute a complete flow
  async executeFlow(flow, startNodeId, context) {
    const { nodes, connections } = flow;
    const results = {};
    const executionOrder = this.getExecutionOrder(nodes, connections, startNodeId);

    // Find the central node (MAIN)
    const centralNode = nodes.find(n => n.type === NodeTypes.CENTRAL);
    context.centralNode = centralNode;

    // Execute nodes in order
    for (const nodeId of executionOrder) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      // Get inputs from previous nodes
      const inputs = this.getNodeInputs(node, connections, results);

      // Execute node
      const result = await nodeExecutor.execute(node, {
        ...context,
        input: inputs
      });

      results[nodeId] = {
        node,
        result,
        timestamp: new Date().toISOString()
      };

      // If this is a correction node, handle user decision
      if (node.type === NodeTypes.CORRECTION && result.data?.suggested) {
        // Wait for user decision (approve/reject)
        if (context.waitForDecision) {
          const decision = await context.waitForDecision(result.data);
          if (decision.approved) {
            // Apply correction to Central
            if (centralNode && results[centralNode.id]) {
              results[centralNode.id].result.data.title = result.data.suggested.title;
              results[centralNode.id].result.data.content = result.data.suggested.content;
            }
          }
        }
      }

      // If node has error output and failed, handle it
      if (!result.success && node.outputs.find(o => o.id === 'error')) {
        // Continue to error handling
        const errorOutput = this.findConnectedNode(connections, node.id, 'error');
        if (errorOutput) {
          executionOrder.push(errorOutput);
        }
      }
    }

    // Get final result from Central node
    const centralResult = results[centralNode?.id];

    return {
      success: true,
      finalResult: centralResult?.result,
      allResults: results,
      flowId: flow.id,
      executedAt: new Date().toISOString()
    };
  }

  // Get execution order based on connections
  getExecutionOrder(nodes, connections, startNodeId) {
    const order = [];
    const visited = new Set();
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Build adjacency list
    const adj = new Map();
    nodes.forEach(n => adj.set(n.id, []));
    connections.forEach(c => {
      const existing = adj.get(c.source) || [];
      existing.push({ nodeId: c.target, port: c.targetPort });
      adj.set(c.source, existing);
    });

    // DFS to get order
    const traverse = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      order.push(nodeId);

      const neighbors = adj.get(nodeId) || [];
      for (const { nodeId: neighborId } of neighbors) {
        traverse(neighborId);
      }
    };

    if (startNodeId) {
      traverse(startNodeId);
    } else {
      // Start from nodes with no input connections
      const startNodes = nodes.filter(n =>
        !connections.some(c => c.target === n.id && c.targetPort === 'input')
      );
      startNodes.forEach(n => traverse(n.id));
    }

    return order;
  }

  // Get inputs for a node from connected nodes
  getNodeInputs(node, connections, results) {
    const inputs = {};

    connections
      .filter(c => c.target === node.id)
      .forEach(c => {
        const sourceResult = results[c.source]?.result;
        if (sourceResult) {
          inputs[c.targetPort] = sourceResult.data || sourceResult;
        }
      });

    return inputs;
  }

  // Find connected node
  findConnectedNode(connections, fromNodeId, fromPort) {
    const conn = connections.find(
      c => c.source === fromNodeId && c.sourcePort === fromPort
    );
    return conn?.target;
  }

  // Execute single node (for testing/debugging)
  async executeNode(node, context) {
    return nodeExecutor.execute(node, context);
  }

  // Validate flow
  validateFlow(flow) {
    const errors = [];
    const warnings = [];
    const { nodes, connections } = flow;

    // Check for Central node (required)
    const centralNodes = nodes.filter(n => n.type === NodeTypes.CENTRAL);
    if (centralNodes.length === 0) {
      errors.push('Flow must have at least one Central (MAIN) node');
    } else if (centralNodes.length > 1) {
      warnings.push('Flow has multiple Central nodes - first one will be used as MAIN');
    }

    // Check for start nodes (nodes with no input)
    const startNodes = nodes.filter(n =>
      !connections.some(c => c.target === n.id && c.targetPort === 'input')
    );
    if (startNodes.length === 0) {
      errors.push('Flow has no starting node (node with no input connections)');
    }

    // Check for orphan nodes (nodes with no connections at all)
    const orphanNodes = nodes.filter(n =>
      !connections.some(c => c.source === n.id || c.target === n.id)
    );
    if (orphanNodes.length > 0) {
      warnings.push(`${orphanNodes.length} orphan node(s) found with no connections`);
    }

    // Check for disconnected connections
    const invalidConnections = connections.filter(c => {
      const sourceExists = nodes.some(n => n.id === c.source);
      const targetExists = nodes.some(n => n.id === c.target);
      return !sourceExists || !targetExists;
    });
    if (invalidConnections.length > 0) {
      errors.push(`${invalidConnections.length} invalid connection(s)`);
    }

    // Check programming nodes have language set
    const programmingNodes = nodes.filter(n => n.type === NodeTypes.PROGRAMMING);
    for (const pNode of programmingNodes) {
      if (!pNode.properties.language) {
        errors.push(`Programming node "${pNode.name}" has no language set`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Clear execution cache
  clearCache() {
    this.executionCache.clear();
  }
}

export const flowEngine = new FlowEngine();
