import { Router } from 'express';
import { dataStore } from '../services/dataStore.js';
import { createTemplate, TemplateTypes } from '../models/index.js';

const router = Router();

// Get all templates
router.get('/', (req, res) => {
  const templates = dataStore.getTemplates();
  res.json(templates);
});

// Get templates by type
router.get('/type/:type', (req, res) => {
  const templates = dataStore.getTemplates();
  const filtered = templates.filter(t => t.templateType === req.params.type);
  res.json(filtered);
});

// Get single template
router.get('/:id', (req, res) => {
  const template = dataStore.getTemplate(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
});

// Create new template
router.post('/', (req, res) => {
  const { name, templateType, ...properties } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!templateType) {
    return res.status(400).json({ error: 'Template type is required' });
  }

  // Validate template type
  const validTypes = Object.values(TemplateTypes);
  if (!validTypes.includes(templateType)) {
    return res.status(400).json({
      error: `Invalid template type. Must be one of: ${validTypes.join(', ')}`
    });
  }

  const template = createTemplate(name, templateType, properties);
  dataStore.saveTemplate(template);
  res.status(201).json(template);
});

// Update template
router.put('/:id', (req, res) => {
  const existing = dataStore.getTemplate(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    createdAt: existing.createdAt,
    templateType: existing.templateType // Don't allow changing type
  };

  dataStore.saveTemplate(updated);
  res.json(updated);
});

// Delete template
router.delete('/:id', (req, res) => {
  const result = dataStore.deleteTemplate(req.params.id);
  if (!result) {
    return res.status(500).json({ error: 'Failed to delete template' });
  }
  res.status(204).send();
});

// Duplicate template
router.post('/:id/duplicate', (req, res) => {
  const existing = dataStore.getTemplate(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const duplicate = {
    ...existing,
    id: undefined,
    name: `${existing.name} (copy)`,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };

  dataStore.saveTemplate(duplicate);
  res.status(201).json(duplicate);
});

// Export template
router.get('/:id/export', (req, res) => {
  const template = dataStore.getTemplate(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  res.setHeader('Content-Disposition', `attachment; filename="${template.name}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.json(template);
});

// Import template
router.post('/import', (req, res) => {
  const template = req.body;

  if (!template || !template.name || !template.templateType) {
    return res.status(400).json({ error: 'Invalid template data' });
  }

  // Generate new ID
  template.id = undefined;

  dataStore.saveTemplate(template);
  res.status(201).json(template);
});

export default router;
