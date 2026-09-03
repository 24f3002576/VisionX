export type TaskType = 
  | 'doc_inspection'
  | 'pid_vision'
  | 'code_sandbox'
  | 'financial_spreadsheet'
  | 'sovereign_rag'
  | 'custom_query';

export type ModelId = 
  | 'qwen-2.5-32b'
  | 'qwen-2.5-coder-32b'
  | 'qwen-2.5-vl-7b'
  | 'llama-3.3-70b-awq'
  | 'deepseek-coder-14b'
  | 'bge-m3-embedder';

export interface ModelInfo {
  id: ModelId;
  name: string;
  family: string;
  taskSpecialty: string;
  contextWindow: string;
  vramUsage: string; // e.g. "18.4 GB"
  quantization: string; // e.g. "AWQ / Q4_K_M"
  status: 'loaded' | 'warm' | 'ready';
  tokensPerSec: number;
  description: string;
}

export interface RouterDecision {
  selectedModel: ModelInfo;
  confidence: number;
  classificationReason: string;
  secondaryModel?: ModelInfo;
  estimatedVram: string;
  latencyEstimate: string;
  toolSet: string[];
}

export type StepType = 'thought' | 'action' | 'observation' | 'reflection' | 'deliverable';

export interface AgentStep {
  id: string;
  stepNumber: number;
  type: StepType;
  title: string;
  content: string;
  tool?: string;
  toolInput?: Record<string, any> | string;
  toolOutput?: string;
  status: 'pending' | 'running' | 'completed' | 'verified';
  durationMs: number;
  timestamp: string;
}

export interface Deliverable {
  id: string;
  title: string;
  type: 'docx' | 'xlsx' | 'py' | 'pdf' | 'report';
  fileName: string;
  summary: string;
  content: string;
  downloadData?: string;
  meta: {
    department: string;
    refNo: string;
    securityClassification: string;
    authorModel: string;
    airgapVerified: boolean;
  };
}

export interface Scenario {
  id: string;
  title: string;
  category: string;
  taskType: TaskType;
  description: string;
  suggestedPrompt: string;
  inputFiles: {
    name: string;
    type: string;
    size: string;
    previewUrl?: string;
    description: string;
  }[];
  expectedModel: ModelId;
  routerReason: string;
  steps: AgentStep[];
  deliverables: Deliverable[];
  codeSnippet?: string;
  visionAnnotations?: {
    tag: string;
    type: 'defect' | 'instrument' | 'valve' | 'hazard';
    x: number;
    y: number;
    w: number;
    h: number;
    description: string;
    severity?: 'CRITICAL' | 'WARNING' | 'NOMINAL';
  }[];
}

export interface NetworkTelemetry {
  eth0Status: 'DISABLED' | 'BLOCKED_EGRESS' | 'PHYSICALLY_ISOLATED';
  loStatus: '127.0.0.1 (LOCAL ONLY)';
  outboundPacketsTotal: number;
  outboundPacketsBlocked: number;
  dnsQueriesExternal: number;
  activeSockets: {
    protocol: string;
    localAddress: string;
    remoteAddress: string;
    state: string;
    process: string;
  }[];
  sha256AuditSeal: string;
  lastAuditTimestamp: string;
}

export interface GpuSpec {
  name: string;
  vram: string;
  suitability: 'Optimal' | 'Budget Supported' | 'Multi-Model Parallel' | 'Quantized Only';
  recommendedStack: string;
  approxCost: string;
}
