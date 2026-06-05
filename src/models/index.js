import { v4 as uuidv4 } from 'uuid';

// Base model with common properties
function createBaseModel(name) {
  return {
    id: uuidv4(),
    name,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

// Node types enum
export const NodeTypes = {
  // Input
  PHENOMENON: 'phenomenon', // 現象體

  // Knowledge
  KNOWLEDGE: 'knowledge', // 知識節點

  // Evaluation
  EVALUATION: 'evaluation', // 評估體
  JUDGE: 'judge', // JUDGE_TEMPLATE
  VIEW: 'view', // VIEW_TEMPLATE

  // Central
  CENTRAL: 'central', // 中心類 - MAIN target

  // Programming
  PROGRAMMING: 'programming', // 程序編寫

  // Value-Added
  SUGGESTION: 'suggestion', // 建議體
  CORRECTION: 'correction', // 修改體

  // Standard
  VALUE_JUDGMENT: 'valueJudgment', // 價值判斷體
  CONTROL: 'control', // 控制體
  INSPECTION: 'inspection', // 檢察體
  CORRECTION_STANDARD: 'correctionStandard', // 修正體

  // Tools
  CONCEPT: 'concept', // 概念類
  PRINCIPLE: 'principle', // 原理類
  REASONING: 'reasoning', // 推理類
  CONSTRAINT: 'constraint' // 限制類
};

// Node category mapping
export const NodeCategories = {
  input: [NodeTypes.PHENOMENON],
  knowledge: [NodeTypes.KNOWLEDGE],
  evaluation: [NodeTypes.EVALUATION, NodeTypes.JUDGE, NodeTypes.VIEW],
  central: [NodeTypes.CENTRAL],
  programming: [NodeTypes.PROGRAMMING],
  valueAdded: [NodeTypes.SUGGESTION, NodeTypes.CORRECTION],
  standard: [NodeTypes.VALUE_JUDGMENT, NodeTypes.CONTROL, NodeTypes.INSPECTION, NodeTypes.CORRECTION_STANDARD],
  tools: [NodeTypes.CONCEPT, NodeTypes.PRINCIPLE, NodeTypes.REASONING, NodeTypes.CONSTRAINT]
};

// Template types
export const TemplateTypes = {
  CENTERAL: 'CENTERAL_TEMPLATE',
  PROMPT: 'PROMPT_TEMPLATE',
  ITEM: 'ITEM_TEMPLATE',
  JUDGE: 'JUDGE_TEMPLATE',
  VIEW: 'VIEW_TEMPLATE',
  PLAN: 'PLAN_TEMPLATE',
  CUSTOM: 'CUSTOM_TEMPLATE'
};

// Item template targets
export const ItemTargets = {
  SNAPSHOT: 'SNAPSHOT',
  SUMMARY: 'SUMMARY',
  SUGGESTION: 'SUGGESTION'
};

// Judge template targets
export const JudgeTargets = {
  VALUE: 'VALUE',
  FACT: 'FACT'
};

// View template targets
export const ViewTargets = {
  ECO: 'ECO',
  FINANCIAL: 'FINANCIAL',
  IT: 'IT'
};

// Plan template targets
export const PlanTargets = {
  CORRECTION: 'CORRECTION'
};

// Programming languages
export const ProgrammingLanguages = {
  JAVASCRIPT: 'javascript',
  PYTHON: 'python'
};

// Create a new node
export function createNode(type, position = { x: 0, y: 0 }) {
  const base = createBaseModel(`${type}-${Date.now()}`);
  const node = {
    ...base,
    type,
    position,
    properties: getDefaultProperties(type),
    inputs: [],
    outputs: []
  };

  // Set up inputs/outputs based on type
  setupNodePorts(node);

  return node;
}

function getDefaultProperties(type) {
  switch (type) {
    case NodeTypes.CENTRAL:
      return {
        templateType: TemplateTypes.CENTERAL,
        title: '',
        content: '',
        isMain: true
      };

    case NodeTypes.PHENOMENON:
      return {
        sourceType: 'environment', // environment, circle, personal
        data: ''
      };

    case NodeTypes.KNOWLEDGE:
      return {
        mcpSource: '',
        rawData: '',
        convertedData: ''
      };

    case NodeTypes.PROGRAMMING:
      return {
        language: null, // Set at creation, then locked
        code: '',
        inputVariables: [],
        outputVariables: []
      };

    case NodeTypes.JUDGE:
      return {
        templateType: TemplateTypes.JUDGE,
        target: JudgeTargets.VALUE,
        judgeBase: '',
        baseContent: '',
        baseMethod: ''
      };

    case NodeTypes.VIEW:
      return {
        templateType: TemplateTypes.VIEW,
        target: ViewTargets.ECO,
        judgeBase: '',
        baseContent: '',
        baseMethod: ''
      };

    case NodeTypes.SUGGESTION:
      return {
        templateType: TemplateTypes.ITEM,
        target: ItemTargets.SUGGESTION,
        version: '1.0',
        content: ''
      };

    case NodeTypes.CORRECTION:
      return {
        templateType: TemplateTypes.ITEM,
        target: ItemTargets.SUGGESTION,
        suggestedTitle: '',
        suggestedContent: '',
        planContent: ''
      };

    case NodeTypes.EVALUATION:
      return {
        judges: [],
        views: []
      };

    default:
      return {};
  }
}

function setupNodePorts(node) {
  // Default ports
  node.inputs = [{ id: 'input', name: 'Input' }];
  node.outputs = [{ id: 'output', name: 'Output' }];

  switch (node.type) {
    case NodeTypes.CORRECTION:
      node.outputs.push(
        { id: 'suggestion', name: 'Suggestion' },
        { id: 'approved', name: 'Approved' }
      );
      break;

    case NodeTypes.KNOWLEDGE:
      node.inputs.push({ id: 'mcp_input', name: 'MCP Input' });
      node.outputs.push({ id: 'llm_output', name: 'LLM Output' });
      break;

    case NodeTypes.PROGRAMMING:
      node.outputs.push(
        { id: 'code', name: 'Code Output' },
        { id: 'error', name: 'Error' }
      );
      break;
  }
}

// Create a connection between nodes
export function createConnection(sourceId, sourcePort, targetId, targetPort) {
  return {
    id: uuidv4(),
    source: sourceId,
    sourcePort,
    target: targetId,
    targetPort,
    createdAt: new Date().toISOString()
  };
}

// Create a flow
export function createFlow(name, description = '', category = '') {
  const base = createBaseModel(name);
  return {
    ...base,
    description,
    category,
    nodes: [],
    connections: []
  };
}

// Create a case
export function createCase(name, flowId, initialData = {}) {
  const base = createBaseModel(name);
  return {
    ...base,
    flowId,
    initialData,
    chatHistory: [],
    summary: '',
    snapshot: null
  };
}

// Create a template
export function createTemplate(name, templateType, properties = {}) {
  const base = createBaseModel(name);
  return {
    ...base,
    templateType,
    ...properties
  };
}

// Create a code template
export function createCodeTemplate(name, language, code = '') {
  const base = createBaseModel(name);
  return {
    ...base,
    language, // Locked at creation
    code,
    inputVariables: [],
    outputVariables: []
  };
}
