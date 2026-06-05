import { Router } from 'express';
import { dataStore } from '../services/dataStore.js';
import { createCodeTemplate, ProgrammingLanguages } from '../models/index.js';

const router = Router();

// Get all code templates
router.get('/', (req, res) => {
  const templates = dataStore.getCodeTemplates();
  res.json(templates);
});

// Get code templates by language
router.get('/language/:language', (req, res) => {
  const templates = dataStore.getCodeTemplates();
  const filtered = templates.filter(t => t.language === req.params.language);
  res.json(filtered);
});

// Get single code template
router.get('/:id', (req, res) => {
  const template = dataStore.getCodeTemplate(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Code template not found' });
  }
  res.json(template);
});

// Create new code template
router.post('/', (req, res) => {
  const { name, language, code, inputVariables, outputVariables } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!language) {
    return res.status(400).json({ error: 'Language is required' });
  }

  // Validate language
  if (!Object.values(ProgrammingLanguages).includes(language)) {
    return res.status(400).json({
      error: `Invalid language. Must be one of: ${Object.values(ProgrammingLanguages).join(', ')}`
    });
  }

  const template = createCodeTemplate(name, language, code || '');
  template.inputVariables = inputVariables || [];
  template.outputVariables = outputVariables || [];

  dataStore.saveCodeTemplate(template);
  res.status(201).json(template);
});

// Update code template
router.put('/:id', (req, res) => {
  const existing = dataStore.getCodeTemplate(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Code template not found' });
  }

  const { code, inputVariables, outputVariables } = req.body;

  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    createdAt: existing.createdAt,
    language: existing.language, // Language is locked!
    name: req.body.name || existing.name
  };

  if (code !== undefined) updated.code = code;
  if (inputVariables !== undefined) updated.inputVariables = inputVariables;
  if (outputVariables !== undefined) updated.outputVariables = outputVariables;

  dataStore.saveCodeTemplate(updated);
  res.json(updated);
});

// Delete code template
router.delete('/:id', (req, res) => {
  const result = dataStore.deleteCodeTemplate(req.params.id);
  if (!result) {
    return res.status(500).json({ error: 'Failed to delete code template' });
  }
  res.status(204).send();
});

// Duplicate code template
router.post('/:id/duplicate', (req, res) => {
  const existing = dataStore.getCodeTemplate(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Code template not found' });
  }

  const duplicate = {
    ...existing,
    id: undefined,
    name: `${existing.name} (copy)`,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };

  dataStore.saveCodeTemplate(duplicate);
  res.status(201).json(duplicate);
});

// Test run code template
router.post('/:id/test', async (req, res) => {
  const template = dataStore.getCodeTemplate(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Code template not found' });
  }

  const { inputs } = req.body;

  try {
    if (template.language === 'javascript') {
      // Execute JavaScript code
      const result = await executeJavaScript(template.code, inputs || {});
      res.json({
        success: true,
        result,
        language: template.language
      });
    } else if (template.language === 'python') {
      // Python requires runtime - return error with guidance
      res.status(501).json({
        success: false,
        error: 'Python execution requires additional runtime configuration',
        language: template.language,
        suggestion: 'Configure a Python runtime (e.g., Pyodide) to execute Python code in browser'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Execute JavaScript code
async function executeJavaScript(code, inputs) {
  const inputKeys = Object.keys(inputs);
  const inputValues = Object.values(inputs);

  // Wrap code in a function that receives inputs
  const wrappedCode = `
    const __inputs = arguments[0];
    ${code}
  `;

  const fn = new Function(wrappedCode);
  return fn(inputs);
}

// Export code template as file
router.get('/:id/export', (req, res) => {
  const template = dataStore.getCodeTemplate(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Code template not found' });
  }

  const extension = template.language === 'javascript' ? 'js' : 'py';
  const filename = `${template.name}.${extension}`;

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'text/plain');
  res.send(template.code);
});

// Import code template from file
router.post('/import', (req, res) => {
  const { name, language, code, inputVariables, outputVariables } = req.body;

  if (!name || !language || !code) {
    return res.status(400).json({ error: 'Name, language, and code are required' });
  }

  const template = createCodeTemplate(name, language, code);
  template.inputVariables = inputVariables || [];
  template.outputVariables = outputVariables || [];

  dataStore.saveCodeTemplate(template);
  res.status(201).json(template);
});

export default router;
