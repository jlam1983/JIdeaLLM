import { Router } from 'express';
import { dataStore } from '../services/dataStore.js';
import { createFlow, createNode, createConnection, NodeTypes } from '../models/index.js';
import { flowEngine } from '../nodes/flowEngine.js';

const router = Router();

// Get all flows
router.get('/', (req, res) => {
  const flows = dataStore.getFlows();
  res.json(flows);
});

// Get single flow
router.get('/:id', (req, res) => {
  const flow = dataStore.getFlow(req.params.id);
  if (!flow) {
    return res.status(404).json({ error: 'Flow not found' });
  }
  res.json(flow);
});

// Create new flow
router.post('/', (req, res) => {
  const { name, description, category } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const flow = createFlow(name, description, category);
  dataStore.saveFlow(flow);
  res.status(201).json(flow);
});

// Update flow
router.put('/:id', (req, res) => {
  const existing = dataStore.getFlow(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Flow not found' });
  }

  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    createdAt: existing.createdAt
  };

  dataStore.saveFlow(updated);
  res.json(updated);
});

// Delete flow
router.delete('/:id', (req, res) => {
  const result = dataStore.deleteFlow(req.params.id);
  if (!result) {
    return res.status(500).json({ error: 'Failed to delete flow' });
  }
  res.status(204).send();
});

// Add node to flow
router.post('/:id/nodes', (req, res) => {
  const flow = dataStore.getFlow(req.params.id);
  if (!flow) {
    return res.status(404).json({ error: 'Flow not found' });
  }

  const { type, position, name } = req.body;
  const node = createNode(type, position);

  if (name) {
    node.name = name;
  }

  flow.nodes.push(node);
  dataStore.saveFlow(flow);
  res.status(201).json(node);
});

// Update node in flow
router.put('/:id/nodes/:nodeId', (req, res) => {
  const flow = dataStore.getFlow(req.params.id);
  if (!flow) {
    return res.status(404).json({ error: 'Flow not found' });
  }

  const nodeIndex = flow.nodes.findIndex(n => n.id === req.params.nodeId);
  if (nodeIndex < 0) {
    return res.status(404).json({ error: 'Node not found' });
  }

  flow.nodes[nodeIndex] = {
    ...flow.nodes[nodeIndex],
    ...req.body,
    id: flow.nodes[nodeIndex].id
  };

  dataStore.saveFlow(flow);
  res.json(flow.nodes[nodeIndex]);
});

// Delete node from flow
router.delete('/:id/nodes/:nodeId', (req, res) => {
  const flow = dataStore.getFlow(req.params.id);
  if (!flow) {
    return res.status(404).json({ error: 'Flow not found' });
  }

  // Remove node
  flow.nodes = flow.nodes.filter(n => n.id !== req.params.nodeId);

  // Remove connections involving this node
  flow.connections = flow.connections.filter(
    c => c.source !== req.params.nodeId && c.target !== req.params.nodeId
  );

  dataStore.saveFlow(flow);
  res.status(204).send();
});

// Add connection to flow
router.post('/:id/connections', (req, res) => {
  const flow = dataStore.getFlow(req.params.id);
  if (!flow) {
    return res.status(404).json({ error: 'Flow not found' });
  }

  const { source, sourcePort, target, targetPort } = req.body;

  // Validate nodes exist
  const sourceNode = flow.nodes.find(n => n.id === source);
  const targetNode = flow.nodes.find(n => n.id === target);

  if (!sourceNode || !targetNode) {
    return res.status(400).json({ error: 'Source or target node not found' });
  }

  // Validate ports exist
  const sourceHasPort = sourceNode.outputs.some(o => o.id === sourcePort);
  const targetHasPort = targetNode.inputs.some(i => i.id === targetPort);

  if (!sourceHasPort || !targetHasPort) {
    return res.status(400).json({ error: 'Invalid port' });
  }

  const connection = createConnection(source, sourcePort, target, targetPort);
  flow.connections.push(connection);

  dataStore.saveFlow(flow);
  res.status(201).json(connection);
});

// Delete connection from flow
router.delete('/:id/connections/:connId', (req, res) => {
  const flow = dataStore.getFlow(req.params.id);
  if (!flow) {
    return res.status(404).json({ error: 'Flow not found' });
  }

  flow.connections = flow.connections.filter(c => c.id !== req.params.connId);
  dataStore.saveFlow(flow);
  res.status(204).send();
});

// Validate flow
router.get('/:id/validate', (req, res) => {
  const flow = dataStore.getFlow(req.params.id);
  if (!flow) {
    return res.status(404).json({ error: 'Flow not found' });
  }

  const validation = flowEngine.validateFlow(flow);
  res.json(validation);
});

// Execute flow
router.post('/:id/execute', async (req, res) => {
  const flow = dataStore.getFlow(req.params.id);
  if (!flow) {
    return res.status(404).json({ error: 'Flow not found' });
  }

  const { startNodeId, context } = req.body;

  try {
    const result = await flowEngine.executeFlow(flow, startNodeId, {
      ...context,
      waitForDecision: req.body.waitForDecision
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export flow
router.get('/:id/export', (req, res) => {
  const flow = dataStore.getFlow(req.params.id);
  if (!flow) {
    return res.status(404).json({ error: 'Flow not found' });
  }

  res.setHeader('Content-Disposition', `attachment; filename="${flow.name}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.json(flow);
});

// Import flow
router.post('/import', (req, res) => {
  const flow = req.body;

  if (!flow || !flow.name || !flow.nodes) {
    return res.status(400).json({ error: 'Invalid flow data' });
  }

  // Generate new ID to avoid conflicts
  flow.id = undefined;
  flow.nodes.forEach(n => n.id = undefined);

  const newFlow = createFlow(flow.name, flow.description, flow.category);
  newFlow.nodes = flow.nodes;
  newFlow.connections = flow.connections || [];

  dataStore.saveFlow(newFlow);
  res.status(201).json(newFlow);
});

export default router;
