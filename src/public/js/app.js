// JIdeaLLM Client Application

class JIdeaLLM {
  constructor() {
    this.currentView = 'runtime';
    this.currentFlow = null;
    this.currentCase = null;
    this.currentTemplate = null;
    this.flows = [];
    this.cases = [];
    this.templates = [];
    this.memories = [];
    this.selectedNode = null;
    this.canvasNodes = [];
    this.currentProvider = 'anthropic';
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadData();
    this.connectWebSocket();
    this.updateWorkerStatus();
    this.loadProviderList();
  }

  // API Helpers
  async api(endpoint, options = {}) {
    const response = await fetch(`/api${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    if (response.status === 204) return null;
    return response.json();
  }

  // Data Loading
  async loadData() {
    try {
      this.flows = await this.api('/flows');
      this.cases = await this.api('/cases');
      this.templates = await this.api('/templates');
      this.memories = await this.api('/memory');
      this.renderFlowList();
      this.renderCaseList();
      this.renderTemplateList();
      this.populateFlowSelect();
      this.renderMemoryList();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  // WebSocket
  connectWebSocket() {
    this.ws = new WebSocket(`ws://${location.host}/ws`);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status') {
        this.updateWorkerStatus(data.data?.llm);
        if (data.data?.providers) {
          this.updateProviderList(data.data.providers);
        }
      } else if (data.type === 'provider-changed') {
        document.getElementById('provider-select').value = data.data.provider;
      }
    };

    this.ws.onclose = () => {
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  updateWorkerStatus(status) {
    const el = document.getElementById('worker-status');
    if (status) {
      el.textContent = `Worker: ${status.running}/${status.maxConcurrent} (${status.providerName || status.currentProvider})`;
    }
  }

  async loadProviderList() {
    try {
      const providers = await this.api('/worker/providers');
      this.updateProviderList(providers);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  }

  updateProviderList(providers) {
    const select = document.getElementById('provider-select');
    select.innerHTML = providers.map(p =>
      `<option value="${p.id}" ${p.id === this.currentProvider ? 'selected' : ''}>${p.name}</option>`
    ).join('');
  }

  // Event Binding
  bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchView(btn.dataset.view));
    });

    // Provider switch
    document.getElementById('provider-select').addEventListener('change', (e) => {
      this.switchProvider(e.target.value);
    });

    // Runtime
    document.getElementById('runtime-flow-select').addEventListener('change', (e) => {
      this.onFlowSelect(e.target.value);
    });
    document.getElementById('load-flow-btn').addEventListener('click', () => {
      const select = document.getElementById('runtime-flow-select');
      this.onFlowSelect(select.value);
    });
    document.getElementById('new-case-btn').addEventListener('click', () => this.showNewCaseModal());
    document.getElementById('edit-case-btn').addEventListener('click', () => this.showEditCaseModal());
    document.getElementById('delete-case-btn').addEventListener('click', () => this.deleteCase());
    document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Flow Panel
    document.getElementById('new-flow-btn').addEventListener('click', () => this.showNewFlowModal());
    document.getElementById('delete-flow-btn').addEventListener('click', () => this.deleteFlow());
    document.getElementById('save-flow-btn').addEventListener('click', () => this.saveCurrentFlow());
    document.getElementById('export-flow-btn').addEventListener('click', () => this.exportFlow());
    document.getElementById('import-flow-btn').addEventListener('click', () => this.showImportFlowModal());

    // Node Palette drag
    document.querySelectorAll('.palette-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('nodeType', item.dataset.nodeType);
      });
    });

    // Canvas drop
    const canvas = document.getElementById('node-canvas');
    canvas.addEventListener('dragover', (e) => e.preventDefault());
    canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData('nodeType');
      if (nodeType && this.currentFlow) {
        this.addNodeToCanvas(nodeType, e.offsetX, e.offsetY);
      }
    });

    // Templates
    document.getElementById('new-template-btn').addEventListener('click', () => this.showNewTemplateModal());
    document.getElementById('delete-template-btn').addEventListener('click', () => this.deleteTemplate());
    document.getElementById('duplicate-template-btn').addEventListener('click', () => this.duplicateTemplate());

    // Memory
    document.getElementById('memory-search-btn').addEventListener('click', () => this.searchMemory());
    document.getElementById('memory-search-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.searchMemory();
    });
    document.getElementById('add-memory-btn').addEventListener('click', () => this.addMemory());
    document.getElementById('export-memories-btn').addEventListener('click', () => this.exportMemories());
    document.getElementById('import-memories-btn').addEventListener('click', () => this.showImportMemoriesModal());
    document.getElementById('clear-memories-btn').addEventListener('click', () => this.clearMemories());

    // Content
    document.getElementById('content-go-btn').addEventListener('click', () => this.loadContentPath());
    document.getElementById('content-refresh-btn').addEventListener('click', () => this.loadContentPath());
    document.getElementById('content-new-file-btn').addEventListener('click', () => this.showNewFileModal());
    document.getElementById('content-new-folder-btn').addEventListener('click', () => this.showNewFolderModal());
    document.getElementById('content-set-base-btn').addEventListener('click', () => this.setContentBasePath());
  }

  async switchProvider(provider) {
    try {
      await this.api('/worker/provider', { method: 'POST', body: { provider } });
      this.currentProvider = provider;
      this.updateWorkerStatus({ ...await this.api('/worker/status') });
    } catch (error) {
      alert('Failed to switch provider: ' + error.message);
    }
  }

  // View Switching
  switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${viewName}-view`).classList.add('active');
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
    this.currentView = viewName;

    // Load view-specific data
    if (viewName === 'content') {
      this.loadContentPath();
    }
  }

  // Runtime Functions
  populateFlowSelect() {
    const select = document.getElementById('runtime-flow-select');
    select.innerHTML = '<option value="">-- Select Flow --</option>';
    this.flows.forEach(flow => {
      const option = document.createElement('option');
      option.value = flow.id;
      option.textContent = flow.name;
      select.appendChild(option);
    });
  }

  async onFlowSelect(flowId) {
    if (!flowId) {
      this.currentFlow = null;
      return;
    }
    this.currentFlow = this.flows.find(f => f.id === flowId);
    this.renderCaseList();
  }

  renderCaseList() {
    const list = document.getElementById('case-list');
    list.innerHTML = '';

    const filteredCases = this.currentFlow
      ? this.cases.filter(c => c.flowId === this.currentFlow.id)
      : this.cases;

    filteredCases.forEach(caseItem => {
      const div = document.createElement('div');
      div.className = 'case-item';
      div.textContent = `${caseItem.name} - ${new Date(caseItem.createdAt).toLocaleDateString()}`;
      div.onclick = () => this.selectCase(caseItem);
      if (this.currentCase?.id === caseItem.id) {
        div.classList.add('selected');
      }
      list.appendChild(div);
    });
  }

  selectCase(caseItem) {
    this.currentCase = caseItem;
    this.renderCaseList();
    this.renderChatHistory();

    document.getElementById('chat-input').disabled = false;
    document.getElementById('send-btn').disabled = false;
    document.getElementById('export-chat-btn').disabled = false;
    document.getElementById('export-summary-btn').disabled = false;
    document.getElementById('export-snapshot-btn').disabled = false;
  }

  renderChatHistory() {
    const history = document.getElementById('chat-history');
    if (!this.currentCase || !this.currentCase.chatHistory?.length) {
      history.innerHTML = '<div class="chat-placeholder">Select a case to view chat history</div>';
      return;
    }

    history.innerHTML = this.currentCase.chatHistory.map(msg => `
      <div class="chat-message ${msg.role}">
        <div class="role">${msg.role === 'user' ? 'You' : 'AI'}</div>
        <div class="content">${this.escapeHtml(msg.content)}</div>
      </div>
    `).join('');

    history.scrollTop = history.scrollHeight;
  }

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message || !this.currentCase) return;

    input.value = '';
    this.currentCase.chatHistory = this.currentCase.chatHistory || [];
    this.currentCase.chatHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    this.renderChatHistory();

    try {
      const result = await this.api(`/cases/${this.currentCase.id}/chat`, {
        method: 'POST',
        body: { message }
      });

      this.currentCase.chatHistory = result.chatHistory;
      this.renderChatHistory();
    } catch (error) {
      alert('Failed to send message: ' + error.message);
    }
  }

  // Case Modals
  showNewCaseModal() {
    this.showModal('New Case', `
      <div class="form-group">
        <label>Case Name:</label>
        <input type="text" id="case-name-input" placeholder="Enter case name">
      </div>
      <div class="form-group">
        <label>Flow:</label>
        <select id="case-flow-select">
          <option value="">-- No Flow --</option>
          ${this.flows.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
        </select>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.createCase()">Create</button>
      </div>
    `);
  }

  async createCase() {
    const name = document.getElementById('case-name-input').value.trim();
    const flowId = document.getElementById('case-flow-select').value;

    if (!name) {
      alert('Please enter a case name');
      return;
    }

    try {
      const newCase = await this.api('/cases', {
        method: 'POST',
        body: { name, flowId: flowId || undefined }
      });
      this.cases.push(newCase);
      this.renderCaseList();
      this.closeModal();
    } catch (error) {
      alert('Failed to create case: ' + error.message);
    }
  }

  showEditCaseModal() {
    if (!this.currentCase) return;

    this.showModal('Edit Case', `
      <div class="form-group">
        <label>Case Name:</label>
        <input type="text" id="case-name-input" value="${this.escapeHtml(this.currentCase.name)}">
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.updateCase()">Save</button>
      </div>
    `);
  }

  async updateCase() {
    const name = document.getElementById('case-name-input').value.trim();
    if (!name) {
      alert('Please enter a case name');
      return;
    }

    try {
      const updated = await this.api(`/cases/${this.currentCase.id}`, {
        method: 'PUT',
        body: { name }
      });

      const index = this.cases.findIndex(c => c.id === this.currentCase.id);
      this.cases[index] = updated;
      this.currentCase = updated;
      this.renderCaseList();
      this.closeModal();
    } catch (error) {
      alert('Failed to update case: ' + error.message);
    }
  }

  async deleteCase() {
    if (!this.currentCase) return;
    if (!confirm(`Delete case "${this.currentCase.name}"?`)) return;

    try {
      await this.api(`/cases/${this.currentCase.id}`, { method: 'DELETE' });
      this.cases = this.cases.filter(c => c.id !== this.currentCase.id);
      this.currentCase = null;
      this.renderCaseList();
    } catch (error) {
      alert('Failed to delete case: ' + error.message);
    }
  }

  // Flow Panel Functions
  renderFlowList() {
    const list = document.getElementById('flow-list');
    list.innerHTML = '';

    this.flows.forEach(flow => {
      const div = document.createElement('div');
      div.className = 'flow-item';
      div.textContent = flow.name;
      div.onclick = () => this.selectFlow(flow);
      if (this.currentFlow?.id === flow.id) {
        div.classList.add('selected');
      }
      list.appendChild(div);
    });
  }

  selectFlow(flow) {
    this.currentFlow = flow;
    this.renderFlowList();
    this.loadFlowToCanvas();
    document.getElementById('current-flow-name').textContent = flow.name;
    document.getElementById('save-flow-btn').disabled = false;
  }

  loadFlowToCanvas() {
    const canvas = document.getElementById('node-canvas');
    canvas.innerHTML = '';

    if (!this.currentFlow?.nodes?.length) {
      canvas.innerHTML = '<div class="canvas-placeholder">Drag nodes from the palette to build your flow</div>';
      return;
    }

    this.canvasNodes = this.currentFlow.nodes.map(node => {
      const el = this.createCanvasNode(node);
      el.style.left = `${node.position?.x || 100}px`;
      el.style.top = `${node.position?.y || 100}px`;
      canvas.appendChild(el);
      return { id: node.id, element: el };
    });
  }

  createCanvasNode(node) {
    const el = document.createElement('div');
    el.className = `canvas-node ${node.type === 'central' ? 'central' : ''}`;
    el.dataset.nodeId = node.id;

    const icon = this.getNodeIcon(node.type);

    el.innerHTML = `
      <div class="canvas-node-header">${icon} ${node.name}</div>
      <div class="canvas-node-body">${this.getNodeDescription(node)}</div>
      <div class="canvas-node-ports">
        <div class="port input"></div>
        <div class="port output"></div>
      </div>
    `;

    el.onclick = (e) => {
      e.stopPropagation();
      this.selectCanvasNode(node.id);
    };

    el.addEventListener('mousedown', (e) => this.startDragNode(e, el));

    return el;
  }

  getNodeIcon(type) {
    const icons = {
      phenomenon: '📥',
      knowledge: '📚',
      evaluation: '⚖️',
      central: '⭐',
      programming: '📜',
      suggestion: '💡',
      correction: '🔧',
      standard: '📋'
    };
    return icons[type] || '📦';
  }

  getNodeDescription(node) {
    switch (node.type) {
      case 'central':
        return node.properties?.title || 'Main target';
      case 'programming':
        return node.properties?.language || 'No language';
      case 'phenomenon':
        return node.properties?.sourceType || 'Environment';
      default:
        return node.type;
    }
  }

  selectCanvasNode(nodeId) {
    document.querySelectorAll('.canvas-node').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-node-id="${nodeId}"]`)?.classList.add('selected');
    this.selectedNode = this.currentFlow.nodes.find(n => n.id === nodeId);
    this.renderNodeProperties();
  }

  startDragNode(e, el) {
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = parseInt(el.style.left) || 0;
    const startTop = parseInt(el.style.top) || 0;

    const onMove = (e) => {
      el.style.left = `${startLeft + e.clientX - startX}px`;
      el.style.top = `${startTop + e.clientY - startY}px`;
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);

      const nodeId = el.dataset.nodeId;
      const node = this.currentFlow.nodes.find(n => n.id === nodeId);
      if (node) {
        node.position = {
          x: parseInt(el.style.left),
          y: parseInt(el.style.top)
        };
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  addNodeToCanvas(nodeType, x, y) {
    const node = {
      id: `node_${Date.now()}`,
      type: nodeType,
      name: `${nodeType}-${Date.now()}`,
      position: { x, y },
      properties: {},
      inputs: [{ id: 'input', name: 'Input' }],
      outputs: [{ id: 'output', name: 'Output' }]
    };

    this.currentFlow.nodes.push(node);

    const el = this.createCanvasNode(node);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.getElementById('node-canvas').appendChild(el);

    this.canvasNodes.push({ id: node.id, element: el });
  }

  renderNodeProperties() {
    const panel = document.getElementById('node-properties');
    if (!this.selectedNode) {
      panel.innerHTML = '<div class="placeholder">Select a node to edit properties</div>';
      return;
    }

    const node = this.selectedNode;

    panel.innerHTML = `
      <div class="form-group">
        <label>Name:</label>
        <input type="text" id="node-name" value="${this.escapeHtml(node.name)}">
      </div>
      <div class="form-group">
        <label>Type:</label>
        <input type="text" value="${node.type}" disabled>
      </div>
      ${this.renderNodeTypeProperties(node)}
    `;

    document.getElementById('node-name').addEventListener('change', (e) => {
      node.name = e.target.value;
      this.updateCanvasNode(node);
    });

    this.bindNodePropertyChanges(node);
  }

  renderNodeTypeProperties(node) {
    const props = node.properties || {};

    switch (node.type) {
      case 'central':
        return `
          <div class="form-group">
            <label>Title:</label>
            <input type="text" id="node-prop-title" value="${this.escapeHtml(props.title || '')}">
          </div>
          <div class="form-group">
            <label>Content:</label>
            <textarea id="node-prop-content">${this.escapeHtml(props.content || '')}</textarea>
          </div>
        `;

      case 'programming':
        return `
          <div class="form-group">
            <label>Language:</label>
            <select id="node-prop-language" ${props.language ? 'disabled' : ''}>
              <option value="">Select...</option>
              <option value="javascript" ${props.language === 'javascript' ? 'selected' : ''}>JavaScript</option>
              <option value="python" ${props.language === 'python' ? 'selected' : ''}>Python</option>
            </select>
            ${props.language ? '<small>Language is locked after creation</small>' : ''}
          </div>
          <div class="form-group">
            <label>Code:</label>
            <div class="code-editor">
              <textarea id="node-prop-code" placeholder="// Enter your code here">${this.escapeHtml(props.code || '')}</textarea>
            </div>
          </div>
        `;

      case 'phenomenon':
        return `
          <div class="form-group">
            <label>Source Type:</label>
            <select id="node-prop-sourceType">
              <option value="environment" ${props.sourceType === 'environment' ? 'selected' : ''}>Environment</option>
              <option value="circle" ${props.sourceType === 'circle' ? 'selected' : ''}>Circle</option>
              <option value="personal" ${props.sourceType === 'personal' ? 'selected' : ''}>Personal</option>
            </select>
          </div>
        `;

      default:
        return '<p>No additional properties</p>';
    }
  }

  bindNodePropertyChanges(node) {
    const updateProp = (key, inputId) => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('change', () => {
          node.properties = node.properties || {};
          node.properties[key] = input.value;
        });
      }
    };

    updateProp('title', 'node-prop-title');
    updateProp('content', 'node-prop-content');
    updateProp('code', 'node-prop-code');
    updateProp('language', 'node-prop-language');
    updateProp('sourceType', 'node-prop-sourceType');
  }

  updateCanvasNode(node) {
    const el = document.querySelector(`[data-node-id="${node.id}"]`);
    if (el) {
      el.querySelector('.canvas-node-header').innerHTML = `${this.getNodeIcon(node.type)} ${node.name}`;
      el.querySelector('.canvas-node-body').textContent = this.getNodeDescription(node);
    }
  }

  // Flow CRUD
  showNewFlowModal() {
    this.showModal('New Flow', `
      <div class="form-group">
        <label>Flow Name:</label>
        <input type="text" id="flow-name-input" placeholder="Enter flow name">
      </div>
      <div class="form-group">
        <label>Description:</label>
        <textarea id="flow-desc-input" placeholder="Optional description"></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.createFlow()">Create</button>
      </div>
    `);
  }

  async createFlow() {
    const name = document.getElementById('flow-name-input').value.trim();
    const description = document.getElementById('flow-desc-input').value.trim();

    if (!name) {
      alert('Please enter a flow name');
      return;
    }

    try {
      const flow = await this.api('/flows', {
        method: 'POST',
        body: { name, description }
      });
      this.flows.push(flow);
      this.selectFlow(flow);
      this.renderFlowList();
      this.populateFlowSelect();
      this.closeModal();
    } catch (error) {
      alert('Failed to create flow: ' + error.message);
    }
  }

  async saveCurrentFlow() {
    if (!this.currentFlow) return;

    try {
      await this.api(`/flows/${this.currentFlow.id}`, {
        method: 'PUT',
        body: this.currentFlow
      });
      alert('Flow saved!');
    } catch (error) {
      alert('Failed to save flow: ' + error.message);
    }
  }

  async deleteFlow() {
    if (!this.currentFlow) return;
    if (!confirm(`Delete flow "${this.currentFlow.name}"?`)) return;

    try {
      await this.api(`/flows/${this.currentFlow.id}`, { method: 'DELETE' });
      this.flows = this.flows.filter(f => f.id !== this.currentFlow.id);
      this.currentFlow = null;
      this.renderFlowList();
      this.populateFlowSelect();
      document.getElementById('current-flow-name').textContent = 'No flow selected';
      document.getElementById('save-flow-btn').disabled = true;
    } catch (error) {
      alert('Failed to delete flow: ' + error.message);
    }
  }

  exportFlow() {
    if (!this.currentFlow) return;
    const blob = new Blob([JSON.stringify(this.currentFlow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentFlow.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  showImportFlowModal() {
    this.showModal('Import Flow', `
      <div class="form-group">
        <label>Select JSON file:</label>
        <input type="file" id="flow-file-input" accept=".json">
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.importFlow()">Import</button>
      </div>
    `);
  }

  async importFlow() {
    const fileInput = document.getElementById('flow-file-input');
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const flow = JSON.parse(e.target.result);
        const result = await this.api('/flows/import', {
          method: 'POST',
          body: flow
        });
        this.flows.push(result);
        this.selectFlow(result);
        this.renderFlowList();
        this.populateFlowSelect();
        this.closeModal();
      } catch (error) {
        alert('Failed to import flow: ' + error.message);
      }
    };
    reader.readAsText(file);
  }

  // Template CRUD
  renderTemplateList() {
    const list = document.getElementById('template-list');
    list.innerHTML = '';

    const grouped = {};
    this.templates.forEach(t => {
      if (!grouped[t.templateType]) grouped[t.templateType] = [];
      grouped[t.templateType].push(t);
    });

    Object.entries(grouped).forEach(([type, items]) => {
      const group = document.createElement('div');
      group.innerHTML = `<strong>${type}</strong>`;
      group.style.marginTop = '10px';
      list.appendChild(group);

      items.forEach(template => {
        const div = document.createElement('div');
        div.className = 'template-item';
        div.textContent = template.name;
        div.onclick = () => this.selectTemplate(template);
        list.appendChild(div);
      });
    });
  }

  selectTemplate(template) {
    document.querySelectorAll('.template-item').forEach(el => el.classList.remove('selected'));
    event.target.classList.add('selected');
    this.currentTemplate = template;
    this.renderTemplateEditor();
  }

  renderTemplateEditor() {
    const editor = document.getElementById('template-editor');
    if (!this.currentTemplate) {
      editor.innerHTML = '<div class="placeholder">Select a template to edit</div>';
      return;
    }

    const t = this.currentTemplate;
    editor.innerHTML = `
      <div class="form-group">
        <label>Name:</label>
        <input type="text" id="template-name" value="${this.escapeHtml(t.name)}">
      </div>
      <div class="form-group">
        <label>Type:</label>
        <input type="text" value="${t.templateType}" disabled>
      </div>
      ${this.renderTemplateTypeFields(t)}
      <button class="btn btn-primary" onclick="app.saveTemplate()">Save</button>
    `;
  }

  renderTemplateTypeFields(t) {
    switch (t.templateType) {
      case 'CENTERAL_TEMPLATE':
        return `
          <div class="form-group">
            <label>Title:</label>
            <input type="text" id="t-title" value="${this.escapeHtml(t.title || '')}">
          </div>
          <div class="form-group">
            <label>Content:</label>
            <textarea id="t-content">${this.escapeHtml(t.content || '')}</textarea>
          </div>
        `;
      case 'PROMPT_TEMPLATE':
        return `
          <div class="form-group">
            <label>Role:</label>
            <input type="text" id="t-role" value="${this.escapeHtml(t.role || '')}">
          </div>
          <div class="form-group">
            <label>Description:</label>
            <input type="text" id="t-description" value="${this.escapeHtml(t.description || '')}">
          </div>
          <div class="form-group">
            <label>System Prompt:</label>
            <textarea id="t-sysPrompt">${this.escapeHtml(t.sysPrompt || '')}</textarea>
          </div>
          <div class="form-group">
            <label>User Prompt:</label>
            <textarea id="t-userPrompt">${this.escapeHtml(t.userPrompt || '')}</textarea>
          </div>
        `;
      default:
        return `
          <div class="form-group">
            <label>Content:</label>
            <textarea id="t-content">${this.escapeHtml(t.content || '')}</textarea>
          </div>
        `;
    }
  }

  async saveTemplate() {
    if (!this.currentTemplate) return;

    const name = document.getElementById('template-name')?.value;
    const data = { name };

    if (document.getElementById('t-title')) data.title = document.getElementById('t-title').value;
    if (document.getElementById('t-content')) data.content = document.getElementById('t-content').value;
    if (document.getElementById('t-role')) data.role = document.getElementById('t-role').value;
    if (document.getElementById('t-description')) data.description = document.getElementById('t-description').value;
    if (document.getElementById('t-sysPrompt')) data.sysPrompt = document.getElementById('t-sysPrompt').value;
    if (document.getElementById('t-userPrompt')) data.userPrompt = document.getElementById('t-userPrompt').value;

    try {
      const updated = await this.api(`/templates/${this.currentTemplate.id}`, {
        method: 'PUT',
        body: data
      });

      const index = this.templates.findIndex(t => t.id === this.currentTemplate.id);
      this.templates[index] = updated;
      this.currentTemplate = updated;
      this.renderTemplateList();
      alert('Template saved!');
    } catch (error) {
      alert('Failed to save template: ' + error.message);
    }
  }

  showNewTemplateModal() {
    this.showModal('New Template', `
      <div class="form-group">
        <label>Name:</label>
        <input type="text" id="t-name" placeholder="Template name">
      </div>
      <div class="form-group">
        <label>Type:</label>
        <select id="t-type">
          <option value="CENTERAL_TEMPLATE">CENTRAL_TEMPLATE</option>
          <option value="PROMPT_TEMPLATE">PROMPT_TEMPLATE</option>
          <option value="ITEM_TEMPLATE">ITEM_TEMPLATE</option>
          <option value="JUDGE_TEMPLATE">JUDGE_TEMPLATE</option>
          <option value="VIEW_TEMPLATE">VIEW_TEMPLATE</option>
          <option value="PLAN_TEMPLATE">PLAN_TEMPLATE</option>
          <option value="CUSTOM_TEMPLATE">CUSTOM_TEMPLATE</option>
        </select>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.createTemplate()">Create</button>
      </div>
    `);
  }

  async createTemplate() {
    const name = document.getElementById('t-name').value.trim();
    const templateType = document.getElementById('t-type').value;

    if (!name) {
      alert('Please enter a name');
      return;
    }

    try {
      const template = await this.api('/templates', {
        method: 'POST',
        body: { name, templateType }
      });
      this.templates.push(template);
      this.renderTemplateList();
      this.closeModal();
    } catch (error) {
      alert('Failed to create template: ' + error.message);
    }
  }

  async deleteTemplate() {
    if (!this.currentTemplate) return;
    if (!confirm(`Delete template "${this.currentTemplate.name}"?`)) return;

    try {
      await this.api(`/templates/${this.currentTemplate.id}`, { method: 'DELETE' });
      this.templates = this.templates.filter(t => t.id !== this.currentTemplate.id);
      this.currentTemplate = null;
      this.renderTemplateList();
      this.renderTemplateEditor();
    } catch (error) {
      alert('Failed to delete template: ' + error.message);
    }
  }

  async duplicateTemplate() {
    if (!this.currentTemplate) return;

    try {
      const duplicated = await this.api(`/templates/${this.currentTemplate.id}/duplicate`, {
        method: 'POST'
      });
      this.templates.push(duplicated);
      this.renderTemplateList();
    } catch (error) {
      alert('Failed to duplicate template: ' + error.message);
    }
  }

  // Memory Functions (RAG)
  renderMemoryList() {
    const list = document.getElementById('all-memories');
    list.innerHTML = '';

    this.memories.forEach(memory => {
      const div = document.createElement('div');
      div.className = 'memory-item';
      div.innerHTML = `
        <div class="memory-content">${this.escapeHtml(memory.content.substring(0, 100))}...</div>
        <div class="memory-meta">
          <span>${new Date(memory.createdAt).toLocaleDateString()}</span>
          <span>Access: ${memory.accessCount || 0}</span>
          <button class="btn btn-sm" onclick="app.deleteMemory('${memory.id}')">Delete</button>
        </div>
      `;
      list.appendChild(div);
    });
  }

  async searchMemory() {
    const query = document.getElementById('memory-search-input').value.trim();
    if (!query) {
      alert('Please enter a search query');
      return;
    }

    try {
      const results = await this.api(`/memory/search?q=${encodeURIComponent(query)}`);
      const resultsDiv = document.getElementById('memory-search-results');
      resultsDiv.innerHTML = results.length
        ? results.map(r => `
            <div class="memory-result">
              <div class="memory-content">${this.escapeHtml(r.content)}</div>
              <div class="memory-meta">
                Score: ${(r.relevanceScore * 100).toFixed(1)}% |
                ${new Date(r.createdAt).toLocaleDateString()}
              </div>
            </div>
          `).join('')
        : '<div class="chat-placeholder">No results found</div>';
    } catch (error) {
      alert('Failed to search: ' + error.message);
    }
  }

  async addMemory() {
    const content = document.getElementById('memory-content-input').value.trim();
    const tagsInput = document.getElementById('memory-tags-input').value.trim();

    if (!content) {
      alert('Please enter memory content');
      return;
    }

    const metadata = {};
    if (tagsInput) {
      metadata.tags = tagsInput.split(',').map(t => t.trim());
    }

    try {
      const memory = await this.api('/memory', {
        method: 'POST',
        body: { content, metadata }
      });
      this.memories.push(memory);
      this.renderMemoryList();
      document.getElementById('memory-content-input').value = '';
      document.getElementById('memory-tags-input').value = '';
      alert('Memory added!');
    } catch (error) {
      alert('Failed to add memory: ' + error.message);
    }
  }

  async deleteMemory(id) {
    if (!confirm('Delete this memory?')) return;

    try {
      await this.api(`/memory/${id}`, { method: 'DELETE' });
      this.memories = this.memories.filter(m => m.id !== id);
      this.renderMemoryList();
    } catch (error) {
      alert('Failed to delete memory: ' + error.message);
    }
  }

  exportMemories() {
    const blob = new Blob([JSON.stringify(this.memories, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'memories.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  showImportMemoriesModal() {
    this.showModal('Import Memories', `
      <div class="form-group">
        <label>Select JSON file:</label>
        <input type="file" id="memory-file-input" accept=".json">
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.importMemories()">Import</button>
      </div>
    `);
  }

  async importMemories() {
    const fileInput = document.getElementById('memory-file-input');
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const memories = JSON.parse(e.target.result);
        await this.api('/memory/import', {
          method: 'POST',
          body: { memories, mode: 'merge' }
        });
        this.memories = await this.api('/memory');
        this.renderMemoryList();
        this.closeModal();
        alert('Memories imported!');
      } catch (error) {
        alert('Failed to import: ' + error.message);
      }
    };
    reader.readAsText(file);
  }

  async clearMemories() {
    if (!confirm('Clear ALL memories? This cannot be undone.')) return;

    try {
      await this.api('/memory/clear/all', { method: 'DELETE' });
      this.memories = [];
      this.renderMemoryList();
      alert('All memories cleared');
    } catch (error) {
      alert('Failed to clear memories: ' + error.message);
    }
  }

  // Content Management Functions
  async loadContentPath(path = '') {
    try {
      const result = await this.api(`/content/list?path=${encodeURIComponent(path || '')}`);
      document.getElementById('current-content-path').textContent = result.path;
      document.getElementById('content-path-input').value = result.path;

      const list = document.getElementById('content-list');
      list.innerHTML = result.items.map(item => `
        <div class="content-item" onclick="app.handleContentClick('${this.escapeHtml(item.path)}', '${item.type}')">
          <span class="content-icon">${item.type === 'directory' ? '📁' : '📄'}</span>
          <span class="content-name">${this.escapeHtml(item.name)}</span>
          <span class="content-size">${item.type === 'file' ? this.formatSize(item.size) : ''}</span>
        </div>
      `).join('');
    } catch (error) {
      alert('Failed to load content: ' + error.message);
    }
  }

  handleContentClick(path, type) {
    if (type === 'directory') {
      this.loadContentPath(path);
    } else {
      this.showFilePreview(path);
    }
  }

  async showFilePreview(path) {
    try {
      const result = await this.api(`/content/read?path=${encodeURIComponent(path)}`);
      this.showModal(result.name, `
        <div class="form-group">
          <textarea readonly style="height: 300px; font-family: monospace;">${this.escapeHtml(result.content)}</textarea>
        </div>
        <div class="modal-footer">
          <button class="btn" onclick="app.closeModal()">Close</button>
        </div>
      `);
    } catch (error) {
      alert('Failed to read file: ' + error.message);
    }
  }

  showNewFileModal() {
    const currentPath = document.getElementById('current-content-path').textContent;
    this.showModal('New File', `
      <div class="form-group">
        <label>File Name:</label>
        <input type="text" id="new-file-name" placeholder="filename.txt">
      </div>
      <div class="form-group">
        <label>Content:</label>
        <textarea id="new-file-content" placeholder="File content..." style="height: 150px;"></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.createFile()">Create</button>
      </div>
    `);
  }

  async createFile() {
    const name = document.getElementById('new-file-name').value.trim();
    const content = document.getElementById('new-file-content').value;
    const currentPath = document.getElementById('current-content-path').textContent;

    if (!name) {
      alert('Please enter a file name');
      return;
    }

    const fullPath = currentPath.endsWith('/') ? currentPath + name : currentPath + '/' + name;

    try {
      await this.api('/content/write', {
        method: 'POST',
        body: { path: fullPath, content }
      });
      this.closeModal();
      this.loadContentPath(currentPath);
    } catch (error) {
      alert('Failed to create file: ' + error.message);
    }
  }

  showNewFolderModal() {
    this.showModal('New Folder', `
      <div class="form-group">
        <label>Folder Name:</label>
        <input type="text" id="new-folder-name" placeholder="folder name">
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.createFolder()">Create</button>
      </div>
    `);
  }

  async createFolder() {
    const name = document.getElementById('new-folder-name').value.trim();
    const currentPath = document.getElementById('current-content-path').textContent;

    if (!name) {
      alert('Please enter a folder name');
      return;
    }

    const fullPath = currentPath.endsWith('/') ? currentPath + name : currentPath + '/' + name;

    try {
      await this.api('/content/mkdir', {
        method: 'POST',
        body: { path: fullPath }
      });
      this.closeModal();
      this.loadContentPath(currentPath);
    } catch (error) {
      alert('Failed to create folder: ' + error.message);
    }
  }

  async setContentBasePath() {
    const newPath = document.getElementById('content-base-path').value.trim();
    if (!newPath) {
      alert('Please enter a path');
      return;
    }

    try {
      await this.api('/content/base-path', {
        method: 'POST',
        body: { path: newPath }
      });
      alert('Base path set!');
      this.loadContentPath(newPath);
    } catch (error) {
      alert('Failed to set base path: ' + error.message);
    }
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Modal Helpers
  showModal(title, content) {
    const modal = document.getElementById('modal-content');
    modal.innerHTML = `<h2>${title}</h2>${content}`;
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }
}

// Initialize app
const app = new JIdeaLLM();
