import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataStore {
  constructor() {
    this.dataPath = path.join(__dirname, '..', 'data');
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  getFilePath(name) {
    return path.join(this.dataPath, `${name}.json`);
  }

  load(name) {
    const filePath = this.getFilePath(name);
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(`Error loading ${name}:`, error);
    }
    return this.getDefaultData(name);
  }

  getDefaultData(name) {
    switch (name) {
      case 'flows':
        return [];
      case 'templates':
        return [];
      case 'cases':
        return [];
      case 'codeTemplates':
        return [];
      default:
        return null;
    }
  }

  save(name, data) {
    const filePath = this.getFilePath(name);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error(`Error saving ${name}:`, error);
      return false;
    }
  }

  // Flows
  getFlows() {
    return this.load('flows');
  }

  getFlow(id) {
    const flows = this.getFlows();
    return flows.find(f => f.id === id);
  }

  saveFlow(flow) {
    const flows = this.getFlows();
    const index = flows.findIndex(f => f.id === flow.id);
    flow.modifiedAt = new Date().toISOString();

    if (index >= 0) {
      flows[index] = flow;
    } else {
      flows.push(flow);
    }

    return this.save('flows', flows);
  }

  deleteFlow(id) {
    const flows = this.getFlows();
    const filtered = flows.filter(f => f.id !== id);
    return this.save('flows', filtered);
  }

  // Cases
  getCases() {
    return this.load('cases');
  }

  getCase(id) {
    const cases = this.getCases();
    return cases.find(c => c.id === id);
  }

  saveCase(caseData) {
    const cases = this.getCases();
    const index = cases.findIndex(c => c.id === caseData.id);
    caseData.modifiedAt = new Date().toISOString();

    if (index >= 0) {
      cases[index] = caseData;
    } else {
      cases.push(caseData);
    }

    return this.save('cases', cases);
  }

  deleteCase(id) {
    const cases = this.getCases();
    const filtered = cases.filter(c => c.id !== id);
    return this.save('cases', filtered);
  }

  // Templates
  getTemplates() {
    return this.load('templates');
  }

  getTemplate(id) {
    const templates = this.getTemplates();
    return templates.find(t => t.id === id);
  }

  saveTemplate(template) {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    template.modifiedAt = new Date().toISOString();

    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }

    return this.save('templates', templates);
  }

  deleteTemplate(id) {
    const templates = this.getTemplates();
    const filtered = templates.filter(t => t.id !== id);
    return this.save('templates', filtered);
  }

  // Code Templates
  getCodeTemplates() {
    return this.load('codeTemplates');
  }

  getCodeTemplate(id) {
    const templates = this.getCodeTemplates();
    return templates.find(t => t.id === id);
  }

  saveCodeTemplate(template) {
    const templates = this.getCodeTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    template.modifiedAt = new Date().toISOString();

    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }

    return this.save('codeTemplates', templates);
  }

  deleteCodeTemplate(id) {
    const templates = this.getCodeTemplates();
    const filtered = templates.filter(t => t.id !== id);
    return this.save('codeTemplates', filtered);
  }
}

export const dataStore = new DataStore();
