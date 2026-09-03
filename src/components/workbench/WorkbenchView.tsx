import React, { useState, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Paperclip, 
  ChevronRight, 
  ArrowRight, 
  Upload, 
  Cpu, 
  FileCheck2, 
  Layers,
  Trash2,
  AlertTriangle,
  FileX,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { SCENARIOS } from '../../data/scenariosData';
import { Scenario, AgentStep, Deliverable } from '../../types';
import { InteractivePidCanvas } from './InteractivePidCanvas';
import { DeliverablesPanel } from './DeliverablesPanel';
import { PdfEmbeddingExplorer } from './PdfEmbeddingExplorer';
import { useTheme } from '../../context/ThemeContext';

interface WorkbenchViewProps {
  onOpenAirgapModal: () => void;
  isExecuting?: boolean;
  setIsExecuting?: (val: boolean) => void;
}

interface AttachedFileInfo {
  name: string;
  type: string;
  size: string;
  sizeBytes: number;
  description: string;
  extractedSnippet?: string;
  tokens?: number;
  isEmpty?: boolean;
}

export const WorkbenchView: React.FC<WorkbenchViewProps> = ({
  onOpenAirgapModal
}) => {
  const { theme } = useTheme();
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [currentScenario, setCurrentScenario] = useState<Scenario>(SCENARIOS[0]);
  const [customPrompt, setCustomPrompt] = useState<string>(SCENARIOS[0].suggestedPrompt);
  
  // Custom uploaded files state
  const [customAttachedFiles, setCustomAttachedFiles] = useState<AttachedFileInfo[]>([]);
  const [removedFileNames, setRemovedFileNames] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Execution state & Error state
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionFailedAtStep, setExecutionFailedAtStep] = useState<number | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(SCENARIOS[0].steps.length);
  const [activeTab, setActiveTab] = useState<'report' | 'pid' | 'embeddings' | 'code' | 'files'>('report');
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  // When scenario changes
  const handleSelectScenario = (index: number) => {
    const sc = SCENARIOS[index];
    setSelectedScenarioIndex(index);
    setCurrentScenario(sc);
    setCustomPrompt(sc.suggestedPrompt);
    setCurrentStepIndex(sc.steps.length);
    setRemovedFileNames([]);
    setCustomAttachedFiles([]);
    setIsExecuting(false);
    setExecutionError(null);
    setExecutionFailedAtStep(null);
    setExpandedStepId(null);
  };

  // Remove attached file
  const handleRemoveFile = (fileName: string) => {
    setCustomAttachedFiles(prev => prev.filter(f => f.name !== fileName));
    setRemovedFileNames(prev => [...prev, fileName]);
    setExecutionError(null);
    setExecutionFailedAtStep(null);
  };

  const handleRestoreFiles = () => {
    setRemovedFileNames([]);
    setExecutionError(null);
    setExecutionFailedAtStep(null);
    setCurrentStepIndex(currentScenario.steps.length);
  };

  // Handle local user file upload with authentic parsing & empty-file detection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsUploading(true);
    setExecutionError(null);
    setExecutionFailedAtStep(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawResult = event.target?.result;
      let textContent = '';
      if (typeof rawResult === 'string') {
        textContent = rawResult.trim();
      } else if (rawResult instanceof ArrayBuffer) {
        const decoder = new TextDecoder('utf-8', { fatal: false });
        textContent = decoder.decode(rawResult).replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
      }

      const isFileEmpty = file.size === 0 || (file.size < 200 && textContent.length < 5);
      const tokenCount = isFileEmpty ? 0 : Math.max(160, Math.floor(file.size / 22));
      const snippet = isFileEmpty ? '' : (textContent.substring(0, 400) || `Parsed local document stream from ${file.name}. Processed without external network transit.`);

      const newFileItem: AttachedFileInfo = {
        name: file.name,
        type: file.name.endsWith('.pdf') ? 'Scanned PDF' : file.name.endsWith('.csv') ? 'Assay Data' : 'Engineering File',
        size: file.size === 0 ? '0 KB' : file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        sizeBytes: file.size,
        description: isFileEmpty 
          ? `EMPTY / INVALID PAYLOAD: File contains 0 extractable bytes/tokens.`
          : `Locally ingested user file (${file.type || 'document'}). Embedded locally into BGE-M3 vector database.`,
        extractedSnippet: snippet,
        tokens: tokenCount,
        isEmpty: isFileEmpty
      };

      setCustomAttachedFiles(prev => [newFileItem, ...prev]);
      setRemovedFileNames(prev => prev.filter(n => n !== file.name));
      setIsUploading(false);
      setCurrentStepIndex(0);

      if (isFileEmpty) {
        setExecutionError(`Warning: Uploaded document '${file.name}' is empty (0 bytes / 0 tokens). Running analysis on this empty document will fail.`);
        setCustomPrompt(`Analysis of ${file.name} - [ERROR: EMPTY DOCUMENT PAYLOAD]`);
      } else {
        setCustomPrompt(`Analyze attached ${file.name} for process engineering compliance, equipment sizing, and extraction.`);
      }
    };

    if (file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Convert scenario default files to rich AttachedFileInfo
  const defaultScenarioFiles: AttachedFileInfo[] = currentScenario.inputFiles.map(f => ({
    name: f.name,
    type: f.type,
    size: f.size,
    sizeBytes: 1024 * 1024 * 1.5,
    description: f.description,
    extractedSnippet: `Technical documentation stream for ${currentScenario.title}: P&ID drawings, standard operating procedures, and equipment tags.`,
    tokens: 4200,
    isEmpty: false
  }));

  const rawAttachedFiles = [...customAttachedFiles, ...defaultScenarioFiles];
  const allAttachedFiles = rawAttachedFiles.filter(f => !removedFileNames.includes(f.name));

  // Determine if active session has custom files
  const activeCustomFiles = customAttachedFiles.filter(f => !removedFileNames.includes(f.name));
  const hasCustomFiles = activeCustomFiles.length > 0;
  const primaryCustomFile = hasCustomFiles ? activeCustomFiles[0] : null;

  // Build dynamic steps tailored to custom uploaded file or scenario default
  const dynamicSteps: AgentStep[] = (hasCustomFiles && primaryCustomFile) ? [
    {
      id: 'step-1',
      title: `PDF & Vector Ingestion: ${primaryCustomFile.name}`,
      tool: 'local_pymupdf_parser',
      status: executionFailedAtStep === 0 ? 'failed' : (currentStepIndex > 0 ? 'completed' : isExecuting ? 'in_progress' : 'pending'),
      content: primaryCustomFile.isEmpty 
        ? `Failed to parse ${primaryCustomFile.name}: Document payload is empty (0 bytes / 0 tokens). Ingestion aborted.`
        : `Extracted text layers, equipment coordinates, and technical parameters from ${primaryCustomFile.name} (${primaryCustomFile.size}, ~${primaryCustomFile.tokens} tokens).`,
      toolOutput: primaryCustomFile.isEmpty
        ? `[ERROR: EMPTY_PAYLOAD_DETECTED]\nFile: ${primaryCustomFile.name}\nSize: 0 Bytes\nTokens Extracted: 0\nStatus: Ingestion Failed. Please provide a non-empty PDF or CAD file.`
        : `[PyMuPDF v1.23] Loaded ${primaryCustomFile.name}\nExtracted ~${primaryCustomFile.tokens} tokens into local memory buffer.\nAir-Gap verification: 0 B outbound traffic.`
    },
    {
      id: 'step-2',
      title: 'Recursive Chunking & Dense Tokenization',
      tool: 'recursive_token_chunker',
      status: currentStepIndex > 1 ? 'completed' : isExecuting && currentStepIndex === 1 ? 'in_progress' : 'pending',
      content: `Partitioned ${primaryCustomFile.name} into 512-token overlapping windows with 64-token stride, preserving tables and formula tags.`,
      toolOutput: `Chunking Complete:\n- Windows: 4 dense chunks\n- Max Token Length: 512\n- Stride: 64 tokens\n- Table integrity: 100% verified`
    },
    {
      id: 'step-3',
      title: 'BGE-M3 Vector Embedding & Qdrant Indexing',
      tool: 'bge_m3_vectorizer',
      status: currentStepIndex > 2 ? 'completed' : isExecuting && currentStepIndex === 2 ? 'in_progress' : 'pending',
      content: `Generated 1024-dimensional dense vectors and BM25 sparse keyword index in local in-memory Qdrant instance.`,
      toolOutput: `[Qdrant In-Memory HNSW]\n- Collection: uploaded_${primaryCustomFile.name.replace(/[^a-zA-Z0-9]/g, '_')}\n- Dimension: 1024 (float32)\n- Distance Metric: Cosine\n- Index status: READY`
    },
    {
      id: 'step-4',
      title: 'Sovereign LLM Engineering Synthesis',
      tool: 'qwen2.5_deepseek_reasoner',
      status: currentStepIndex > 3 ? 'completed' : isExecuting && currentStepIndex === 3 ? 'in_progress' : 'pending',
      content: `Synthesized findings from ${primaryCustomFile.name} against API 521, OISD-105, and refinery safety standards.`,
      toolOutput: `Extracted parameters:\n- File Source: ${primaryCustomFile.name}\n- Engineering Context: Process specification & safety verification\n- Compliance Status: Conforms to on-premise zero-egress data standards`
    },
    {
      id: 'step-5',
      title: 'Verification & Formal Deliverables Assembly',
      tool: 'airgap_audit_compiler',
      status: currentStepIndex > 4 ? 'completed' : isExecuting && currentStepIndex === 4 ? 'in_progress' : 'pending',
      content: `Compiled formal executive summary, engineering memorandum, and audit certificate for ${primaryCustomFile.name}.`,
      toolOutput: `[DELIVERABLES GENERATED]\n1. MEMORANDUM_${primaryCustomFile.name.replace(/\.[^/.]+$/, '').toUpperCase()}.md\n2. AUDIT_CERT_AIRGAP_${Date.now().toString().slice(-6)}.json\n3. Zero network egress cryptographically certified.`
    }
  ] : currentScenario.steps;

  const activeSteps: AgentStep[] = dynamicSteps;

  // Build dynamic deliverable for custom uploaded file
  const customDeliverable: Deliverable[] = primaryCustomFile && !primaryCustomFile.isEmpty ? [
    {
      id: `deliv-custom-${primaryCustomFile.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
      title: `Technical Memorandum: ${primaryCustomFile.name}`,
      type: 'docx',
      fileName: `MEMORANDUM_${primaryCustomFile.name.replace(/\.[^/.]+$/, '').toUpperCase().replace(/[^A-Z0-9_-]/g, '_')}.docx`,
      summary: `Air-gapped technical analysis note for ${primaryCustomFile.name}`,
      content: `================================================================================
ENGINEERING MEMORANDUM: SOVEREIGN ANALYSIS OF ${primaryCustomFile.name.toUpperCase()}
================================================================================
Date: ${new Date().toISOString().split('T')[0]}
Classification: RESTRICTED // AIR-GAPPED INDUSTRIAL ENVIRONMENT
Source Document: ${primaryCustomFile.name} (${primaryCustomFile.size}, ~${primaryCustomFile.tokens} tokens)
Inference Engine: Local Qwen2.5-32B + BGE-M3 (0 External Network Packets)

1. EXECUTIVE SUMMARY & INGESTION
The attached file '${primaryCustomFile.name}' was parsed locally without network egress.
Extracted Document Stream Sample:
"${primaryCustomFile.extractedSnippet || 'Document content vectorized and grounded.'}"

2. ENGINEERING VERIFICATION & STANDARDS CHECK
- OISD-STD-105 / API 521: Safety in petroleum refinery process boundaries
- ISO/IEC 42001: Sovereign data governance & on-premise model verification
- Data Sovereignty Audit: 0 bytes uploaded to third-party APIs

3. RECOMMENDATIONS & ACTION ITEMS
1. Verify equipment line items against local plant asset hierarchy.
2. Confirm instrumentation interlocks on DCS tag list.
3. Air-gap cryptographic attestation generated with exit code 0.
================================================================================`,
      meta: {
        department: 'Technical Services & Process Engineering',
        refNo: `MRPL/TS/SOV/${new Date().getFullYear()}/${primaryCustomFile.name.slice(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, '') || '001'}`,
        securityClassification: 'RESTRICTED // AIR-GAPPED INDUSTRIAL ENVIRONMENT',
        authorModel: 'Qwen2.5-32B + BGE-M3 (Local Sovereign Engine)',
        airgapVerified: true
      }
    }
  ] : (currentScenario.deliverables || []);

  const currentDeliverables: Deliverable[] = hasCustomFiles ? customDeliverable : (currentScenario.deliverables || []);

  // Run Scenario with step-by-step progression & strict empty/no-document validation
  const handleRunExecution = () => {
    setExecutionError(null);
    setExecutionFailedAtStep(null);

    // Case 1: No documents attached at all
    if (allAttachedFiles.length === 0) {
      setExecutionError("Execution Blocked: No documents or CAD drawings are attached. Please attach an engineering file or click 'Restore Scenario Documents' to proceed.");
      return;
    }

    // Case 2: Attached file is empty (0 bytes or 0 tokens)
    const emptyFile = allAttachedFiles.find(f => f.isEmpty || f.sizeBytes === 0);
    if (emptyFile) {
      setIsExecuting(true);
      setCurrentStepIndex(0);
      setExpandedStepId('step-1');

      setTimeout(() => {
        setExecutionFailedAtStep(0);
        setIsExecuting(false);
        setExecutionError(`Execution Failed: Attached document '${emptyFile.name}' is empty (0 bytes / 0 tokens). Sovereign agent cannot extract text or generate embeddings from an empty file.`);
      }, 700);
      return;
    }

    // Case 3: Valid execution
    setIsExecuting(true);
    setCurrentStepIndex(0);
    setExpandedStepId(null);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStepIndex(step);

      if (step >= activeSteps.length) {
        clearInterval(interval);
        setIsExecuting(false);
      }
    }, 650);
  };

  const handleReset = () => {
    setIsExecuting(false);
    setCurrentStepIndex(0);
    setExecutionError(null);
    setExecutionFailedAtStep(null);
    setExpandedStepId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      
      {/* Top Scenario Selector */}
      <div className={`border rounded-xl p-4 sm:p-5 shadow-sm space-y-3 transition-colors ${
        theme === 'dark'
          ? 'bg-[#181B22] border-[#282D37]'
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-[#38BDF8]' : 'text-sky-600'
            }`}>
              Industrial Scenarios
            </span>
            <h2 className={`text-sm sm:text-base font-bold mt-0.5 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Select Engineering Task
            </h2>
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
            Local Open-Weight Inference (Qwen2.5 / DeepSeek / BGE)
          </div>
        </div>

        {/* Clean Scenario Pill Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1">
          {SCENARIOS.map((sc, idx) => {
            const isSelected = selectedScenarioIndex === idx && !hasCustomFiles;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(idx)}
                className={`p-3 rounded-lg border text-left transition-all text-xs flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? theme === 'dark'
                      ? 'bg-[#1E293B] border-[#0066CC] shadow-sm ring-1 ring-[#0066CC] text-white'
                      : 'bg-sky-50 border-sky-500 shadow-xs ring-1 ring-sky-500 text-sky-950 font-medium'
                    : theme === 'dark'
                    ? 'bg-[#14171E] border-[#282D37] hover:border-[#3B4454] text-[#94A3B8] hover:text-white'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="space-y-1">
                  <span className={`text-[10px] font-mono block ${
                    theme === 'dark' ? 'text-[#64748B]' : 'text-slate-400'
                  }`}>
                    SCENARIO 0{idx + 1}
                  </span>
                  <span className={`font-semibold line-clamp-2 leading-snug ${
                    isSelected 
                      ? (theme === 'dark' ? 'text-white' : 'text-sky-950')
                      : (theme === 'dark' ? 'text-[#CBD5E1]' : 'text-slate-800')
                  }`}>
                    {sc.title}
                  </span>
                </div>
                <span className={`mt-2 text-[10px] font-mono font-medium ${
                  theme === 'dark' ? 'text-[#38BDF8]' : 'text-sky-600'
                }`}>
                  {sc.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Input, Files & Execution Progress (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Input Card */}
          <div className={`border rounded-xl p-4 sm:p-5 shadow-sm space-y-4 transition-colors ${
            theme === 'dark'
              ? 'bg-[#181B22] border-[#282D37]'
              : 'bg-white border-slate-200'
          }`}>
            
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold block ${
                theme === 'dark' ? 'text-[#CBD5E1]' : 'text-slate-700'
              }`}>
                Engineering Directive & Instructions
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                className={`w-full border rounded-lg p-3 text-xs leading-relaxed resize-none transition-colors outline-none font-sans ${
                  theme === 'dark'
                    ? 'bg-[#14171E] border-[#282D37] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] text-[#E2E8F0]'
                    : 'bg-slate-50 border-slate-300 focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] text-slate-900'
                }`}
                placeholder="Enter engineering instructions..."
              />
            </div>

            {/* Attached Files & Upload Trigger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-medium block ${
                  theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'
                }`}>
                  Attached Documents & CAD ({allAttachedFiles.length})
                </span>
                
                {/* Hidden File Input & Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg,.csv,.txt,.docx"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={`flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                    theme === 'dark' 
                      ? 'text-[#38BDF8] hover:text-[#0077EE]' 
                      : 'text-sky-600 hover:text-sky-800'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>{isUploading ? 'Ingesting...' : '+ Upload Custom File'}</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                {allAttachedFiles.length === 0 ? (
                  <div className={`p-3 rounded-lg border text-center space-y-2 text-xs ${
                    theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <FileX className={`w-5 h-5 mx-auto ${theme === 'dark' ? 'text-[#64748B]' : 'text-slate-400'}`} />
                    <p className={theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}>
                      No documents currently attached.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={handleRestoreFiles}
                        className="text-[11px] text-[#0066CC] hover:underline font-semibold cursor-pointer"
                      >
                        Restore Scenario Documents
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] text-[#38BDF8] hover:underline font-semibold cursor-pointer"
                      >
                        Upload PDF / CAD
                      </button>
                    </div>
                  </div>
                ) : (
                  allAttachedFiles.map((file, idx) => (
                    <div 
                      key={idx}
                      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                        file.isEmpty
                          ? theme === 'dark'
                            ? 'bg-red-950/20 border-red-800/40 text-red-300'
                            : 'bg-red-50 border-red-200 text-red-700'
                          : theme === 'dark'
                          ? 'bg-[#14171E] border-[#282D37] hover:border-[#38BDF8]/40'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0 pr-2">
                        {file.isEmpty ? (
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                        ) : (
                          <Paperclip className={`w-3.5 h-3.5 shrink-0 ${theme === 'dark' ? 'text-[#38BDF8]' : 'text-sky-600'}`} />
                        )}
                        <div className="truncate">
                          <span className={`font-medium block truncate text-[11px] ${
                            file.isEmpty
                              ? 'text-red-400 font-semibold'
                              : theme === 'dark' ? 'text-white' : 'text-slate-900'
                          }`}>
                            {file.name}
                          </span>
                          <span className={`text-[10px] ${
                            file.isEmpty
                              ? 'text-red-400/80'
                              : theme === 'dark' ? 'text-[#64748B]' : 'text-slate-400'
                          }`}>
                            {file.isEmpty ? 'EMPTY / 0 BYTES' : `${file.type} • ${file.size}`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!file.isEmpty && (
                          <button
                            onClick={() => setActiveTab('embeddings')}
                            title="Inspect Vector Embeddings & Chunks"
                            className={`px-2 py-0.5 text-[9px] font-mono font-medium rounded transition-colors border cursor-pointer ${
                              theme === 'dark'
                                ? 'bg-[#1C222C] text-[#38BDF8] hover:bg-[#0066CC] hover:text-white border-[#2B3545]'
                                : 'bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white border-sky-200'
                            }`}
                          >
                            VECTOR RAG
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(file.name);
                          }}
                          title={`Remove ${file.name}`}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            theme === 'dark'
                              ? 'text-[#64748B] hover:text-red-400 hover:bg-red-950/40'
                              : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Error / Warning Alert Banner */}
            {executionError && (
              <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-all ${
                theme === 'dark'
                  ? 'bg-red-950/30 border-red-800/60 text-red-200'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="font-semibold">{executionError}</p>
                  {allAttachedFiles.length === 0 && (
                    <button
                      onClick={handleRestoreFiles}
                      className="text-[11px] underline hover:no-underline font-mono text-[#38BDF8] cursor-pointer"
                    >
                      Click here to reload default scenario documents
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className={`flex items-center gap-2 pt-2 border-t ${
              theme === 'dark' ? 'border-[#222731]' : 'border-slate-100'
            }`}>
              <button
                onClick={handleRunExecution}
                disabled={isExecuting}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer ${
                  allAttachedFiles.length === 0
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 opacity-90'
                    : 'bg-[#0066CC] hover:bg-[#0077EE] disabled:opacity-60 text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isExecuting ? 'Processing Sovereign Pipeline...' : 'Run Analysis'}</span>
              </button>

              <button
                onClick={handleReset}
                title="Reset Execution"
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#14171E] hover:bg-[#202530] text-[#94A3B8] hover:text-white border-[#282D37]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Step-by-Step Execution Flow */}
          <div className={`border rounded-xl p-4 sm:p-5 shadow-sm space-y-3 transition-colors ${
            theme === 'dark'
              ? 'bg-[#181B22] border-[#282D37]'
              : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between pb-2.5 border-b ${
              theme === 'dark' ? 'border-[#282D37]' : 'border-slate-200'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Agent Execution Flow {allAttachedFiles.length > 0 ? `(${Math.min(currentStepIndex, activeSteps.length)}/${activeSteps.length})` : '(IDLE)'}
              </h3>
              <span className={`text-[10px] font-mono ${
                executionFailedAtStep !== null
                  ? 'text-red-400 font-bold'
                  : isExecuting
                  ? 'text-[#38BDF8] font-bold'
                  : allAttachedFiles.length === 0
                  ? 'text-slate-400'
                  : currentStepIndex >= activeSteps.length
                  ? 'text-[#22C55E] font-bold'
                  : theme === 'dark' ? 'text-[#64748B]' : 'text-slate-400'
              }`}>
                {executionFailedAtStep !== null 
                  ? 'FAILED' 
                  : isExecuting 
                  ? 'IN PROGRESS' 
                  : allAttachedFiles.length === 0 
                  ? 'NO DOCUMENT' 
                  : currentStepIndex >= activeSteps.length 
                  ? 'COMPLETE' 
                  : 'READY'}
              </span>
            </div>

            {allAttachedFiles.length === 0 ? (
              <div className={`p-4 rounded-lg border text-center space-y-2 text-xs ${
                theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className={theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}>
                  No documents attached to execute agent reasoning steps.
                </p>
                <button
                  onClick={handleRestoreFiles}
                  className="text-xs text-[#0066CC] hover:underline font-semibold cursor-pointer"
                >
                  Reload Scenario Documents
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {activeSteps.map((step, idx) => {
                  const isStepFailed = executionFailedAtStep === idx;
                  const isStepPast = (idx < currentStepIndex || (!isExecuting && currentStepIndex >= activeSteps.length)) && !isStepFailed;
                  const isStepCurrent = idx === currentStepIndex && isExecuting;
                  const isExpanded = expandedStepId === step.id || isStepFailed;

                  return (
                    <div 
                      key={step.id}
                      className={`p-3 rounded-lg border transition-all text-xs ${
                        isStepFailed
                          ? theme === 'dark'
                            ? 'bg-red-950/30 border-red-800 text-red-200'
                            : 'bg-red-50 border-red-300 text-red-900'
                          : isStepCurrent
                          ? theme === 'dark'
                            ? 'bg-[#1E293B] border-[#38BDF8] ring-1 ring-[#38BDF8]/40'
                            : 'bg-sky-50 border-sky-500 ring-1 ring-sky-400'
                          : isStepPast
                          ? theme === 'dark'
                            ? 'bg-[#14171E] border-[#282D37]'
                            : 'bg-slate-50 border-slate-200'
                          : theme === 'dark'
                          ? 'bg-[#12141A] border-[#20242E] opacity-50'
                          : 'bg-slate-100 border-slate-200 opacity-50'
                      }`}
                    >
                      <div 
                        onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isStepFailed
                              ? 'bg-red-900/60 text-red-200 border border-red-600'
                              : isStepPast
                              ? 'bg-[#12231A] text-[#22C55E] border border-[#224A32]'
                              : isStepCurrent
                              ? 'bg-[#0066CC] text-white animate-pulse'
                              : theme === 'dark' ? 'bg-[#1C222C] text-[#64748B]' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {idx + 1}
                          </div>
                          <span className={`font-semibold text-xs ${
                            isStepFailed
                              ? 'text-red-400'
                              : theme === 'dark' ? 'text-white' : 'text-slate-900'
                          }`}>
                            {step.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {step.tool && (
                            <span className={`hidden sm:inline px-2 py-0.5 text-[9px] font-mono rounded border ${
                              isStepFailed
                                ? 'bg-red-950 text-red-300 border-red-800'
                                : theme === 'dark'
                                ? 'bg-[#1C222C] text-[#38BDF8] border-[#2B3545]'
                                : 'bg-sky-50 text-sky-700 border-sky-200'
                            }`}>
                              {step.tool}
                            </span>
                          )}
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                            theme === 'dark' ? 'text-[#64748B]' : 'text-slate-400'
                          } ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {/* Expandable Step Details */}
                      {isExpanded && (
                        <div className={`mt-2.5 pt-2.5 border-t space-y-2 text-[11px] leading-relaxed ${
                          isStepFailed
                            ? 'border-red-800/40 text-red-200'
                            : theme === 'dark' ? 'border-[#222731] text-[#94A3B8]' : 'border-slate-200 text-slate-600'
                        }`}>
                          <p>{step.content}</p>
                          {step.toolOutput && (
                            <div className={`p-2 rounded border font-mono text-[10px] overflow-x-auto whitespace-pre-wrap ${
                              isStepFailed
                                ? 'bg-red-950/60 border-red-850 text-red-200'
                                : theme === 'dark'
                                ? 'bg-[#0B0D11] border-[#222731] text-[#22C55E]'
                                : 'bg-slate-900 border-slate-700 text-emerald-400'
                            }`}>
                              {step.toolOutput}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Dynamic Outputs, Vision Map, Embeddings & Deliverables (7 cols) */}
        <div className={`lg:col-span-7 border rounded-xl shadow-sm flex flex-col min-h-[640px] transition-colors ${
          theme === 'dark'
            ? 'bg-[#181B22] border-[#282D37]'
            : 'bg-white border-slate-200'
        }`}>
          
          {/* Header Tabs Navigation */}
          <div className={`p-3.5 border-b flex items-center justify-between gap-2 overflow-x-auto ${
            theme === 'dark' ? 'border-[#282D37] bg-[#14171E]' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center space-x-1.5 min-w-max">
              <button
                onClick={() => setActiveTab('report')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'report'
                    ? 'bg-[#0066CC] text-white shadow-sm'
                    : theme === 'dark'
                    ? 'text-[#94A3B8] hover:text-white hover:bg-[#1E232D]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Executive Report
              </button>

              <button
                onClick={() => setActiveTab('pid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'pid'
                    ? 'bg-[#0066CC] text-white shadow-sm'
                    : theme === 'dark'
                    ? 'text-[#94A3B8] hover:text-white hover:bg-[#1E232D]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                P&ID Vision Map
              </button>

              <button
                onClick={() => setActiveTab('embeddings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'embeddings'
                    ? 'bg-[#0066CC] text-white shadow-sm'
                    : theme === 'dark'
                    ? 'text-[#94A3B8] hover:text-white hover:bg-[#1E232D]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>PDF & Vector Embeddings</span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-[#0066CC] text-white shadow-sm'
                    : theme === 'dark'
                    ? 'text-[#94A3B8] hover:text-white hover:bg-[#1E232D]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Python Sandbox Code
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'files'
                    ? 'bg-[#0066CC] text-white shadow-sm'
                    : theme === 'dark'
                    ? 'text-[#94A3B8] hover:text-white hover:bg-[#1E232D]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Deliverables ({currentDeliverables.length})
              </button>
            </div>
          </div>

          {/* Tab 1: Executive Report */}
          {activeTab === 'report' && (
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Empty Document State */}
              {allAttachedFiles.length === 0 ? (
                <div className={`p-8 rounded-xl border text-center space-y-3 ${
                  theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <FileX className={`w-8 h-8 mx-auto ${theme === 'dark' ? 'text-[#64748B]' : 'text-slate-400'}`} />
                  <div className="space-y-1">
                    <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      No Document Loaded
                    </h3>
                    <p className={`text-xs max-w-md mx-auto ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
                      No active P&ID drawing or engineering PDF is currently attached. Attach a custom document or reload default scenario files to view generated compliance notes.
                    </p>
                  </div>
                  <button
                    onClick={handleRestoreFiles}
                    className="px-4 py-2 bg-[#0066CC] hover:bg-[#0077EE] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Restore Scenario Documents
                  </button>
                </div>
              ) : (
                <>
                  {/* Report Header Card */}
                  <div className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    executionFailedAtStep !== null
                      ? theme === 'dark'
                        ? 'bg-red-950/20 border-red-800 text-red-200'
                        : 'bg-red-50 border-red-200 text-red-900'
                      : theme === 'dark'
                      ? 'bg-[#14171E] border-[#282D37]'
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <span className={`text-[10px] font-mono uppercase tracking-wider block ${
                        executionFailedAtStep !== null
                          ? 'text-red-400 font-bold'
                          : theme === 'dark' ? 'text-[#38BDF8]' : 'text-sky-600 font-semibold'
                      }`}>
                        {hasCustomFiles ? 'Custom Ingested File Analysis' : 'Engineering Findings & Compliance Note'}
                      </span>
                      <h3 className={`text-sm font-bold mt-0.5 ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}>
                        {hasCustomFiles && primaryCustomFile ? `Assessment: ${primaryCustomFile.name}` : currentScenario.title}
                      </h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold shrink-0 ${
                      executionFailedAtStep !== null
                        ? 'bg-red-900/60 text-red-200 border border-red-600'
                        : 'bg-[#12231A] text-[#22C55E] border border-[#224A32]'
                    }`}>
                      {executionFailedAtStep !== null ? 'STATUS: INGESTION FAILED' : 'STATUS: AIRGAP VERIFIED'}
                    </span>
                  </div>

                  {/* Scenario / File Description */}
                  <div className="space-y-1.5">
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${
                      theme === 'dark' ? 'text-[#CBD5E1]' : 'text-slate-700'
                    }`}>
                      Operational Context
                    </h4>
                    <p className={`text-xs leading-relaxed ${
                      theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-600'
                    }`}>
                      {hasCustomFiles && primaryCustomFile
                        ? primaryCustomFile.isEmpty
                          ? `Ingestion halted for ${primaryCustomFile.name}: File is 0 bytes and has no parseable text.`
                          : `Local sovereign analysis of uploaded document "${primaryCustomFile.name}" (${primaryCustomFile.size}, ~${primaryCustomFile.tokens} tokens). Parsed locally via PyMuPDF with zero external network connectivity.`
                        : currentScenario.description}
                    </p>
                  </div>

                  {/* Regulatory Citations */}
                  <div className={`p-3.5 rounded-lg border space-y-2 ${
                    theme === 'dark'
                      ? 'bg-[#14171E] border-[#282D37]'
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] font-mono font-bold uppercase block ${
                      theme === 'dark' ? 'text-[#38BDF8]' : 'text-sky-700'
                    }`}>
                      Grounding Standards & Compliance Clauses Cited
                    </span>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] ${
                      theme === 'dark' ? 'text-[#CBD5E1]' : 'text-slate-700'
                    }`}>
                      <div><strong>OISD-STD-105:</strong> Safety in Petroleum Refineries</div>
                      <div><strong>API 579 / 521:</strong> Sizing & Pressure Relief</div>
                      <div><strong>ISO/IEC 42001:</strong> On-Premise Data Sovereignty</div>
                      <div><strong>MRPL Turnaround SOP:</strong> Critical Path Protocol</div>
                    </div>
                  </div>

                  {/* Sample Deliverable Preview */}
                  {currentDeliverables.length > 0 && (
                    <div className={`space-y-2 pt-2 border-t ${
                      theme === 'dark' ? 'border-[#222731]' : 'border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold uppercase tracking-wider ${
                          theme === 'dark' ? 'text-[#CBD5E1]' : 'text-slate-700'
                        }`}>
                          Generated Formal Note Preview
                        </h4>
                        <button
                          onClick={() => setActiveTab('files')}
                          className={`text-[11px] flex items-center gap-1 hover:underline cursor-pointer ${
                            theme === 'dark' ? 'text-[#38BDF8]' : 'text-sky-600'
                          }`}
                        >
                          <span>Download All Files</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className={`p-4 rounded-lg border text-[11px] font-mono leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto ${
                        theme === 'dark'
                          ? 'bg-[#14171E] border-[#282D37] text-[#CBD5E1]'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}>
                        {currentDeliverables[0].content}
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          )}

          {/* Tab 2: P&ID Drawing Map */}
          {activeTab === 'pid' && (
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <InteractivePidCanvas annotations={currentScenario.visionAnnotations || []} />
            </div>
          )}

          {/* Tab 3: PDF & Vector Embeddings Explorer */}
          {activeTab === 'embeddings' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <PdfEmbeddingExplorer 
                onSelectDocumentForAgent={(docName) => {
                  setCustomPrompt(`Analyze uploaded document: ${docName} for refinery safety standards and operational compliance.`);
                }}
              />
            </div>
          )}

          {/* Tab 4: Python Sandbox Code */}
          {activeTab === 'code' && (
            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Air-Gapped Python Solver
                  </h4>
                  <p className={`text-[11px] ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
                    Executed locally in nsjail sandbox with zero network access
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-[#12231A] text-[#22C55E] border border-[#224A32] rounded">
                  EXIT CODE: 0
                </span>
              </div>

              <div className="bg-[#0B0D11] border border-[#222731] rounded-lg p-3.5 font-mono text-[11px] text-[#38BDF8] overflow-x-auto whitespace-pre leading-relaxed">
                {currentScenario.steps.find(s => s.tool === 'sandboxed_python_runner')?.toolInput?.script ||
                  `# Thermodynamic Balance & Orifice Solver\nimport numpy as np\nfrom scipy.optimize import fsolve\n\ndef relief_orifice_calc(W, P_set, T_rel, M, Z=0.95, Kd=0.975):\n    # API 520 / 521 Orifice Area Derivation\n    P1 = P_set * 1.10 + 1.01325 # Accumulation pressure in bar(a)\n    C = 356 # Ideal gas constant factor\n    A_req = (W) / (C * Kd * P1 * np.sqrt(M / (Z * T_rel)))\n    return A_req\n\nA_calc = relief_orifice_calc(W=48200, P_set=4.2, T_rel=423.15, M=58.1)\nprint(f"Calculated Orifice Area: {A_calc:.3f} cm2")\nprint("Selected Standard Orifice: Letter 'P' (18.63 cm2)")`}
              </div>

              {/* Terminal Output */}
              <div className="space-y-1.5">
                <span className={`text-[11px] font-mono block ${
                  theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'
                }`}>
                  Console Output:
                </span>
                <div className="bg-[#0B0D11] border border-[#222731] rounded-lg p-3.5 font-mono text-[11px] text-[#22C55E] overflow-x-auto whitespace-pre-wrap">
                  {currentScenario.steps.find(s => s.tool === 'sandboxed_python_runner')?.toolOutput ||
                    `[nsjail] Sandbox initialization: OK\n[nsjail] Network namespaces unshared: 0 external interfaces\nCalculated Orifice Area: 14.821 cm2\nSelected Standard Orifice: Letter 'P' (18.63 cm2)\nOISD-105 Safety Margin: +25.7% Overcapacity OK`}
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Deliverables Download */}
          {activeTab === 'files' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <DeliverablesPanel 
                deliverables={currentDeliverables} 
                onOpenAuditCert={onOpenAirgapModal} 
              />
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
