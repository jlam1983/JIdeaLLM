import { Router } from 'express';
import { contentManager } from '../services/contentManager.js';

const router = Router();

// Get base path
router.get('/base-path', (req, res) => {
  res.json({ basePath: contentManager.getBasePath() });
});

// Set base path
router.post('/base-path', (req, res) => {
  const { path: newPath } = req.body;
  if (!newPath) {
    return res.status(400).json({ error: 'path is required' });
  }
  const basePath = contentManager.setBasePath(newPath);
  res.json({ basePath });
});

// List directory
router.get('/list', (req, res) => {
  const { path: dirPath, extensions, sortBy } = req.query;
  const result = contentManager.listDirectory(dirPath || '', {
    extensions: extensions ? extensions.split(',') : undefined,
    sortBy
  });
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// Read file
router.get('/read', (req, res) => {
  const { path: filePath } = req.query;
  if (!filePath) {
    return res.status(400).json({ error: 'path is required' });
  }
  const result = contentManager.readFile(filePath);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// Read file as download
router.get('/download', (req, res) => {
  const { path: filePath } = req.query;
  if (!filePath) {
    return res.status(400).json({ error: 'path is required' });
  }
  const result = contentManager.readFileBuffer(filePath);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.setHeader('Content-Disposition', `attachment; filename="${result.name}"`);
  res.send(result.buffer);
});

// Write file
router.post('/write', (req, res) => {
  const { path: filePath, content } = req.body;
  if (!filePath || content === undefined) {
    return res.status(400).json({ error: 'path and content are required' });
  }
  const result = contentManager.writeFile(filePath, content);
  if (!result.success) {
    return res.status(500).json(result);
  }
  res.json(result);
});

// Write file (multipart/form-data style for binary)
router.post('/upload', (req, res) => {
  const { path: filePath, data, encoding } = req.body;
  if (!filePath || !data) {
    return res.status(400).json({ error: 'path and data are required' });
  }

  let content;
  if (encoding === 'base64') {
    content = Buffer.from(data, 'base64');
  } else {
    content = data;
  }

  const result = contentManager.writeFileBuffer(filePath, content);
  if (!result.success) {
    return res.status(500).json(result);
  }
  res.json(result);
});

// Delete file
router.delete('/delete', (req, res) => {
  const { path: filePath } = req.query;
  if (!filePath) {
    return res.status(400).json({ error: 'path is required' });
  }
  const result = contentManager.deleteFile(filePath);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// Create directory
router.post('/mkdir', (req, res) => {
  const { path: dirPath } = req.body;
  if (!dirPath) {
    return res.status(400).json({ error: 'path is required' });
  }
  const result = contentManager.createDirectory(dirPath);
  if (!result.success) {
    return res.status(500).json(result);
  }
  res.json(result);
});

// Delete directory
router.delete('/rmdir', (req, res) => {
  const { path: dirPath, recursive } = req.query;
  if (!dirPath) {
    return res.status(400).json({ error: 'path is required' });
  }
  const result = contentManager.deleteDirectory(dirPath, recursive === 'true');
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// Copy file
router.post('/copy', (req, res) => {
  const { source, dest } = req.body;
  if (!source || !dest) {
    return res.status(400).json({ error: 'source and dest are required' });
  }
  const result = contentManager.copyFile(source, dest);
  if (!result.success) {
    return res.status(500).json(result);
  }
  res.json(result);
});

// Move file
router.post('/move', (req, res) => {
  const { source, dest } = req.body;
  if (!source || !dest) {
    return res.status(400).json({ error: 'source and dest are required' });
  }
  const result = contentManager.moveFile(source, dest);
  if (!result.success) {
    return res.status(500).json(result);
  }
  res.json(result);
});

// Search files
router.get('/search', (req, res) => {
  const { directory, pattern, recursive } = req.query;
  if (!directory || !pattern) {
    return res.status(400).json({ error: 'directory and pattern are required' });
  }
  const result = contentManager.searchFiles(directory, pattern, {
    recursive: recursive !== 'false'
  });
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// Get file info
router.get('/info', (req, res) => {
  const { path: filePath } = req.query;
  if (!filePath) {
    return res.status(400).json({ error: 'path is required' });
  }
  const result = contentManager.getFileInfo(filePath);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// Check if path exists
router.get('/exists', (req, res) => {
  const { path: filePath } = req.query;
  if (!filePath) {
    return res.status(400).json({ error: 'path is required' });
  }
  res.json({ exists: contentManager.exists(filePath) });
});

export default router;
