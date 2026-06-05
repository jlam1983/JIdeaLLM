import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ContentManager {
  constructor() {
    this.basePath = CONFIG.paths.windowsContent;
    this.ensureDirectory(this.basePath);
  }

  // Ensure directory exists
  ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
  }

  // Normalize Windows path
  normalizePath(filePath) {
    // Convert backslashes to forward slashes
    return filePath.replace(/\\/g, '/');
  }

  // Join paths properly for Windows
  joinPath(...parts) {
    return path.join(...parts).replace(/\\/g, '/');
  }

  // Read file
  readFile(filePath) {
    try {
      const fullPath = this.resolvePath(filePath);
      if (!fs.existsSync(fullPath)) {
        return { success: false, error: 'File not found' };
      }
      const content = fs.readFileSync(fullPath, 'utf-8');
      const stats = fs.statSync(fullPath);
      return {
        success: true,
        content,
        path: fullPath,
        name: path.basename(fullPath),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Read file as buffer
  readFileBuffer(filePath) {
    try {
      const fullPath = this.resolvePath(filePath);
      if (!fs.existsSync(fullPath)) {
        return { success: false, error: 'File not found' };
      }
      const buffer = fs.readFileSync(fullPath);
      return {
        success: true,
        buffer,
        path: fullPath,
        name: path.basename(fullPath)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Write file
  writeFile(filePath, content) {
    try {
      const fullPath = this.resolvePath(filePath);
      const dir = path.dirname(fullPath);
      this.ensureDirectory(dir);
      fs.writeFileSync(fullPath, content, 'utf-8');
      return {
        success: true,
        path: fullPath,
        name: path.basename(fullPath)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Write buffer (binary)
  writeFileBuffer(filePath, buffer) {
    try {
      const fullPath = this.resolvePath(filePath);
      const dir = path.dirname(fullPath);
      this.ensureDirectory(dir);
      fs.writeFileSync(fullPath, Buffer.from(buffer));
      return {
        success: true,
        path: fullPath,
        name: path.basename(fullPath)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete file
  deleteFile(filePath) {
    try {
      const fullPath = this.resolvePath(filePath);
      if (!fs.existsSync(fullPath)) {
        return { success: false, error: 'File not found' };
      }
      fs.unlinkSync(fullPath);
      return { success: true, path: fullPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // List directory contents
  listDirectory(dirPath = '', options = {}) {
    try {
      const fullPath = this.resolvePath(dirPath);
      if (!fs.existsSync(fullPath)) {
        return { success: false, error: 'Directory not found' };
      }

      const items = fs.readdirSync(fullPath, { withFileTypes: true });
      const result = items.map(item => {
        const itemPath = this.joinPath(fullPath, item.name);
        const stats = fs.statSync(itemPath);
        return {
          name: item.name,
          path: itemPath,
          type: item.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          extension: item.isFile() ? path.extname(item.name).toLowerCase() : null
        };
      });

      // Filter by extension if specified
      let filtered = result;
      if (options.extensions) {
        const exts = Array.isArray(options.extensions) ? options.extensions : [options.extensions];
        filtered = result.filter(f =>
          f.type === 'directory' || exts.some(ext => f.extension === ext)
        );
      }

      // Sort
      if (options.sortBy) {
        filtered.sort((a, b) => {
          if (options.sortBy === 'name') return a.name.localeCompare(b.name);
          if (options.sortBy === 'size') return b.size - a.size;
          if (options.sortBy === 'modified') return new Date(b.modified) - new Date(a.modified);
          return 0;
        });
      }

      return {
        success: true,
        path: fullPath,
        items: filtered,
        total: filtered.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Create directory
  createDirectory(dirPath) {
    try {
      const fullPath = this.resolvePath(dirPath);
      this.ensureDirectory(fullPath);
      return { success: true, path: fullPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete directory
  deleteDirectory(dirPath, recursive = false) {
    try {
      const fullPath = this.resolvePath(dirPath);
      if (!fs.existsSync(fullPath)) {
        return { success: false, error: 'Directory not found' };
      }
      fs.rmdirSync(fullPath, { recursive });
      return { success: true, path: fullPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Copy file
  copyFile(sourcePath, destPath) {
    try {
      const src = this.resolvePath(sourcePath);
      const dest = this.resolvePath(destPath);
      const destDir = path.dirname(dest);
      this.ensureDirectory(destDir);
      fs.copyFileSync(src, dest);
      return { success: true, source: src, dest };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Move file
  moveFile(sourcePath, destPath) {
    try {
      const src = this.resolvePath(sourcePath);
      const dest = this.resolvePath(destPath);
      const destDir = path.dirname(dest);
      this.ensureDirectory(destDir);
      fs.renameSync(src, dest);
      return { success: true, source: src, dest };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Search files
  searchFiles(directory, pattern, options = {}) {
    try {
      const fullPath = this.resolvePath(directory);
      const results = [];

      const searchRecursive = (dir) => {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
          const itemPath = this.joinPath(dir, item.name);
          if (item.isDirectory() && options.recursive !== false) {
            searchRecursive(itemPath);
          } else if (item.isFile()) {
            if (this.matchesPattern(item.name, pattern)) {
              const stats = fs.statSync(itemPath);
              results.push({
                name: item.name,
                path: itemPath,
                size: stats.size,
                modified: stats.mtime
              });
            }
          }
        }
      };

      searchRecursive(fullPath);

      // Sort by name by default
      results.sort((a, b) => a.name.localeCompare(b.name));

      return {
        success: true,
        directory: fullPath,
        pattern,
        results,
        count: results.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Match filename against pattern
  matchesPattern(filename, pattern) {
    if (!pattern) return true;
    const patternLower = pattern.toLowerCase();
    const filenameLower = filename.toLowerCase();

    // Wildcard patterns
    if (pattern.includes('*')) {
      const regex = new RegExp(
        '^' + patternLower.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
      );
      return regex.test(filenameLower);
    }

    // Extension only
    if (pattern.startsWith('.')) {
      return filenameLower.endsWith(patternLower);
    }

    // Contains
    return filenameLower.includes(patternLower);
  }

  // Resolve relative path to base path
  resolvePath(relativePath) {
    if (path.isAbsolute(relativePath)) {
      return relativePath.replace(/\\/g, '/');
    }
    return this.joinPath(this.basePath, relativePath);
  }

  // Get base path
  getBasePath() {
    return this.basePath;
  }

  // Set base path
  setBasePath(newPath) {
    this.ensureDirectory(newPath);
    this.basePath = newPath;
    return this.basePath;
  }

  // Get file info
  getFileInfo(filePath) {
    try {
      const fullPath = this.resolvePath(filePath);
      if (!fs.existsSync(fullPath)) {
        return { success: false, error: 'File not found' };
      }
      const stats = fs.statSync(fullPath);
      return {
        success: true,
        path: fullPath,
        name: path.basename(fullPath),
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Check if path exists
  exists(filePath) {
    return fs.existsSync(this.resolvePath(filePath));
  }
}

export const contentManager = new ContentManager();
