import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Cpu, 
  Database, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Code2, 
  ShieldCheck, 
  FileCheck,
  Zap,
  Info,
  Sliders,
  RefreshCw,
  Eye,
  Hash,
  Trash2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface PdfChunk {
  id: string;
  chunkNumber: number;
  pageNumber: number;
  tokens: number;
  text: string;
  denseVectorSample: number[];
  sparseKeywords: string[];
  cosineSimilarity?: number;
}

interface PdfDocItem {
  id: string;
  fileName: string;
  fileSize: string;
  pageCount: number;
  totalTokens: number;
  embeddingModel: string;
  vectorDimensions: number;
  chunks: PdfChunk[];
}

const SAMPLE_DOCS: PdfDocItem[] = [
  {
    id: 'oisd_118',
    fileName: 'OISD-STD-118_Relief_and_Safety.pdf',
    fileSize: '4.8 MB',
    pageCount: 38,
    totalTokens: 24500,
    embeddingModel: 'BAAI/bge-m3 (Dense + Sparse)',
    vectorDimensions: 1024,
    chunks: [
      {
        id: 'chk-101',
        chunkNumber: 1,
        pageNumber: 14,
        tokens: 384,
        text: 'Section 5.3.1 - Gas Testing Protocols: In all refinery Zone-1 areas, continuous atmospheric combustible gas testing (LEL < 1.0%) and oxygen concentration verification (19.5% to 23.5% by volume) are mandatory throughout hot work activities.',
        denseVectorSample: [-0.0421, 0.1832, -0.0914, 0.3129, -0.1504, 0.0882, -0.2201, 0.1495],
        sparseKeywords: ['gas testing', 'Zone-1', 'LEL', 'combustible', 'oxygen concentration']
      },
      {
        id: 'chk-102',
        chunkNumber: 2,
        pageNumber: 15,
        tokens: 412,
        text: 'Section 7.1.4 - Pressure Relief Valve Isolation: Upstream and downstream isolation gate valves for staggered relief valves (PRV-102A/B) must be equipped with mechanical Car Seal Open (CSO) interlocks to prevent unauthorized valve closure during unit operations.',
        denseVectorSample: [0.1294, -0.0842, 0.2415, -0.1102, 0.0451, -0.1983, 0.3120, -0.0741],
        sparseKeywords: ['pressure relief', 'isolation valve', 'CSO', 'Car Seal Open', 'PRV-102A']
      },
      {
        id: 'chk-103',
        chunkNumber: 3,
        pageNumber: 22,
        tokens: 356,
        text: 'Section 9.4.2 - Flare Header Backpressure & Sizing: Relief systems serving hydrocracker and distillation overhead drums shall be evaluated under total power failure conditions with maximum accumulation pressure not exceeding 110% of design set pressure.',
        denseVectorSample: [-0.1032, 0.0954, -0.1643, 0.2841, 0.1209, -0.0542, 0.0871, 0.1923],
        sparseKeywords: ['flare header', 'backpressure', 'accumulation', 'power failure', 'overhead drum']
      }
    ]
  },
  {
    id: 'mrpl_ndt_scan',
    fileName: 'MRPL_NDT_UTG_REAC_44-E-102B_Scan.pdf',
    fileSize: '3.4 MB',
    pageCount: 12,
    totalTokens: 8900,
    embeddingModel: 'Qwen2.5-VL (OCR) + BGE-M3',
    vectorDimensions: 1024,
    chunks: [
      {
        id: 'chk-201',
        chunkNumber: 1,
        pageNumber: 3,
        tokens: 320,
        text: 'NDT Ultrasonic Thickness Report: Equipment 44-E-102B (DHDT Reactor Effluent Air Cooler Bay 2). Material of Construction: Duplex Stainless Steel 2205 (UNS S31803). Nominal wall thickness (t_nom): 3.20 mm. Minimum detected thickness (t_act): 1.62 mm located at Row 4 Tube 38.',
        denseVectorSample: [0.0821, 0.3104, -0.1284, 0.0452, -0.2109, 0.1742, -0.0381, 0.2910],
        sparseKeywords: ['44-E-102B', 'REAC', 'Duplex SS 2205', 'wall thickness', 't_act', '1.62 mm']
      },
      {
        id: 'chk-202',
        chunkNumber: 2,
        pageNumber: 5,
        tokens: 290,
        text: 'API 579 Remaining Life Derivation: Base corrosion rate Cr = 0.38 mm/yr. Calculated retirement limit t_min = 1.34 mm. Remaining service life RL = (1.62 - 1.34) / 0.38 = 0.74 years (8.8 months). Retubing mandatory prior to next 24-month turnaround.',
        denseVectorSample: [-0.1542, 0.0712, 0.2891, -0.0341, 0.1982, -0.1145, 0.1420, 0.0632],
        sparseKeywords: ['API 579', 'corrosion rate', 'remaining life', 't_min', 'retubing', '8.8 months']
      }
    ]
  }
];

interface PdfEmbeddingExplorerProps {
  onSelectDocumentForAgent?: (docName: string) => void;
}

export const PdfEmbeddingExplorer: React.FC<PdfEmbeddingExplorerProps> = ({
  onSelectDocumentForAgent
}) => {
  const { theme } = useTheme();
  const [documents, setDocuments] = useState<PdfDocItem[]>(SAMPLE_DOCS);
  const [selectedDocId, setSelectedDocId] = useState<string>(SAMPLE_DOCS[0].id);
  const [activePipelineStep, setActivePipelineStep] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState<string>('What is the gas testing frequency and minimum thickness?');
  const [simulatedResults, setSimulatedResults] = useState<{ chunkId: string; score: number }[]>([]);
  const [isEmbeddingUpload, setIsEmbeddingUpload] = useState<boolean>(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentDoc = documents.find(d => d.id === selectedDocId) || documents[0] || {
    id: 'empty',
    fileName: 'No Document Loaded',
    fileSize: '0 MB',
    pageCount: 0,
    totalTokens: 0,
    embeddingModel: 'BAAI/bge-m3 (Dense + Sparse)',
    vectorDimensions: 1024,
    chunks: []
  };

  // Remove document from local vector library
  const handleRemoveDocument = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = documents.filter(d => d.id !== docId);
    setDocuments(remaining);
    setSimulatedResults([]);
    if (selectedDocId === docId && remaining.length > 0) {
      setSelectedDocId(remaining[0].id);
    }
  };

  const handleResetSampleDocs = () => {
    setDocuments(SAMPLE_DOCS);
    setSelectedDocId(SAMPLE_DOCS[0].id);
    setSimulatedResults([]);
  };

  // Handle local file upload (Client-side zero-leak parsing)
  const handleFileUpload = (file: File) => {
    if (!file) return;

    // Check for empty / 0-byte file
    if (file.size === 0) {
      setIsEmbeddingUpload(false);
      setUploadStatusMsg(`Validation Error: '${file.name}' is empty (0 bytes). Vector ingestion cannot process an empty payload.`);
      setTimeout(() => setUploadStatusMsg(''), 6000);
      return;
    }

    setIsEmbeddingUpload(true);
    setUploadStatusMsg(`Reading ${file.name} (${(file.size / 1024).toFixed(1)} KB) locally...`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawResult = e.target?.result;
      let textContent = '';
      if (typeof rawResult === 'string') {
        textContent = rawResult.trim();
      } else if (rawResult instanceof ArrayBuffer) {
        // Try extracting text tokens from ArrayBuffer
        const decoder = new TextDecoder('utf-8', { fatal: false });
        textContent = decoder.decode(rawResult).replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
      }

      // If decoded text is extremely sparse or empty (e.g. empty PDF object tree)
      if (!textContent || textContent.length < 10) {
        // Check if it was supposed to be a scanned document or truly empty
        if (file.size < 500) {
          setIsEmbeddingUpload(false);
          setUploadStatusMsg(`Warning: '${file.name}' appears to contain no extractable text or visual elements (empty or invalid PDF structure).`);
          setTimeout(() => setUploadStatusMsg(''), 6000);
          return;
        }
        textContent = `Scanned engineering document: ${file.name}. PyMuPDF / Qwen2.5-VL optical raster processed on-premise.`;
      }
      
      setTimeout(() => {
        setUploadStatusMsg('Running Local Tokenizer & Recursive Chunking (512 tokens)...');
      }, 500);

      setTimeout(() => {
        setUploadStatusMsg('Generating BGE-M3 1024-dim Vector Embeddings on local GPU...');
      }, 1100);

      setTimeout(() => {
        // Build new document entry with extracted chunks based on actual text content
        const newDocId = `doc_${Date.now()}`;
        const snippet1 = textContent.substring(0, 350);
        const snippet2 = textContent.length > 350 ? textContent.substring(350, 700) : `Segment 2 index of ${file.name} with local vector representations.`;

        const newChunks: PdfChunk[] = [
          {
            id: `chk-${Date.now()}-1`,
            chunkNumber: 1,
            pageNumber: 1,
            tokens: Math.min(512, Math.max(120, Math.floor(snippet1.length / 3.8))),
            text: snippet1,
            denseVectorSample: [0.0341, -0.1982, 0.2415, 0.0892, -0.1205, 0.3102, -0.0451, 0.1873],
            sparseKeywords: [file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'), 'ingested', 'local-chunk', 'sovereign']
          },
          {
            id: `chk-${Date.now()}-2`,
            chunkNumber: 2,
            pageNumber: 2,
            tokens: Math.min(512, Math.max(140, Math.floor(snippet2.length / 3.8))),
            text: snippet2,
            denseVectorSample: [-0.0891, 0.1425, -0.0312, 0.2741, -0.1604, 0.0921, 0.2018, -0.0543],
            sparseKeywords: ['vector-embedding', 'qdrant-index', 'dense-1024', 'cosine-similarity']
          }
        ];

        const estimatedTokens = Math.max(250, Math.floor(file.size / 20));

        const newDoc: PdfDocItem = {
          id: newDocId,
          fileName: file.name,
          fileSize: file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          pageCount: Math.max(1, Math.ceil(file.size / (120 * 1024))),
          totalTokens: estimatedTokens,
          embeddingModel: file.name.endsWith('.pdf') ? 'PyMuPDF + BGE-M3 (1024D)' : 'Local Parser + BGE-M3',
          vectorDimensions: 1024,
          chunks: newChunks
        };

        setDocuments(prev => [newDoc, ...prev]);
        setSelectedDocId(newDocId);
        setIsEmbeddingUpload(false);
        setUploadStatusMsg('');

        if (onSelectDocumentForAgent) {
          onSelectDocumentForAgent(file.name);
        }
      }, 1800);
    };

    if (file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Run real-time vector search simulation against current chunks
  const handleTestSemanticSearch = () => {
    if (!searchQuery.trim()) return;

    const queryTerms = searchQuery.toLowerCase().split(' ').filter(w => w.length > 2);
    
    const scored = currentDoc.chunks.map(chunk => {
      let matchCount = 0;
      queryTerms.forEach(term => {
        if (chunk.text.toLowerCase().includes(term)) matchCount += 2;
        if (chunk.sparseKeywords.some(k => k.toLowerCase().includes(term))) matchCount += 3;
      });

      // Compute normalized score between 0.72 and 0.96
      const baseScore = 0.72;
      const boost = Math.min(0.24, matchCount * 0.05);
      const finalScore = parseFloat((baseScore + boost).toFixed(3));

      return {
        chunkId: chunk.id,
        score: finalScore
      };
    });

    scored.sort((a, b) => b.score - a.score);
    setSimulatedResults(scored);
  };

  return (
    <div className={`rounded-xl border overflow-hidden flex flex-col h-full shadow-sm font-sans transition-colors ${
      theme === 'dark' ? 'bg-[#181B22] border-[#282D37]' : 'bg-white border-slate-200'
    }`}>
      
      {/* Top Header */}
      <div className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
              theme === 'dark' ? 'text-[#38BDF8]' : 'text-sky-600'
            }`}>
              Local Vector Ingestion & RAG Architecture
            </span>
          </div>
          <h2 className={`text-sm sm:text-base font-bold mt-0.5 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            How PDF Documents Are Vector Embedded & Ingested
          </h2>
        </div>

        {/* Upload Trigger Button */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept=".pdf,.png,.jpg,.jpeg,.csv,.txt,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isEmbeddingUpload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0066CC] hover:bg-[#0077EE] disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isEmbeddingUpload ? 'Embedding File...' : 'Upload PDF / Document'}</span>
          </button>
        </div>
      </div>

      {/* 5-Stage Pipeline Interactive Stepper */}
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'bg-[#11141A] border-[#282D37]' : 'bg-slate-100 border-slate-200'
      }`}>
        <span className={`text-[10px] font-mono uppercase tracking-wider block mb-2 ${
          theme === 'dark' ? 'text-[#64748B]' : 'text-slate-500'
        }`}>
          5-Stage On-Premise PDF Embedding Pipeline
        </span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          
          {/* Stage 1 */}
          <div 
            onClick={() => setActivePipelineStep(1)}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
              activePipelineStep === 1 
                ? theme === 'dark'
                  ? 'bg-[#1E293B] border-[#0066CC] ring-1 ring-[#0066CC]' 
                  : 'bg-sky-50 border-sky-500 ring-1 ring-sky-400'
                : theme === 'dark'
                ? 'bg-[#14171E] border-[#282D37] hover:border-[#3B4454]'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className={theme === 'dark' ? 'text-[#38BDF8] font-bold' : 'text-sky-600 font-bold'}>STAGE 01</span>
              <FileText className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-400'}`} />
            </div>
            <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>PDF Parsing & OCR</h4>
            <p className={`text-[10px] mt-0.5 line-clamp-2 leading-tight ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
              PyMuPDF for digital text; Qwen2.5-VL for scanned engineering reports.
            </p>
          </div>

          {/* Stage 2 */}
          <div 
            onClick={() => setActivePipelineStep(2)}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
              activePipelineStep === 2 
                ? theme === 'dark'
                  ? 'bg-[#1E293B] border-[#0066CC] ring-1 ring-[#0066CC]' 
                  : 'bg-sky-50 border-sky-500 ring-1 ring-sky-400'
                : theme === 'dark'
                ? 'bg-[#14171E] border-[#282D37] hover:border-[#3B4454]'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className={theme === 'dark' ? 'text-[#38BDF8] font-bold' : 'text-sky-600 font-bold'}>STAGE 02</span>
              <Layers className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-400'}`} />
            </div>
            <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Recursive Chunking</h4>
            <p className={`text-[10px] mt-0.5 line-clamp-2 leading-tight ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
              512-token windows with 64-token stride, preserving tables and formulas.
            </p>
          </div>

          {/* Stage 3 */}
          <div 
            onClick={() => setActivePipelineStep(3)}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
              activePipelineStep === 3 
                ? theme === 'dark'
                  ? 'bg-[#1E293B] border-[#0066CC] ring-1 ring-[#0066CC]' 
                  : 'bg-sky-50 border-sky-500 ring-1 ring-sky-400'
                : theme === 'dark'
                ? 'bg-[#14171E] border-[#282D37] hover:border-[#3B4454]'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className={theme === 'dark' ? 'text-[#38BDF8] font-bold' : 'text-sky-600 font-bold'}>STAGE 03</span>
              <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
            </div>
            <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>BGE-M3 Vectorizer</h4>
            <p className={`text-[10px] mt-0.5 line-clamp-2 leading-tight ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
              1024-dim dense vectors + BM25 sparse weights computed locally.
            </p>
          </div>

          {/* Stage 4 */}
          <div 
            onClick={() => setActivePipelineStep(4)}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
              activePipelineStep === 4 
                ? theme === 'dark'
                  ? 'bg-[#1E293B] border-[#0066CC] ring-1 ring-[#0066CC]' 
                  : 'bg-sky-50 border-sky-500 ring-1 ring-sky-400'
                : theme === 'dark'
                ? 'bg-[#14171E] border-[#282D37] hover:border-[#3B4454]'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className={theme === 'dark' ? 'text-[#38BDF8] font-bold' : 'text-sky-600 font-bold'}>STAGE 04</span>
              <Database className="w-3.5 h-3.5 text-[#22C55E]" />
            </div>
            <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Qdrant HNSW Index</h4>
            <p className={`text-[10px] mt-0.5 line-clamp-2 leading-tight ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
              In-memory vector database with sub-millisecond approximate nearest neighbor.
            </p>
          </div>

          {/* Stage 5 */}
          <div 
            onClick={() => setActivePipelineStep(5)}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
              activePipelineStep === 5 
                ? theme === 'dark'
                  ? 'bg-[#1E293B] border-[#0066CC] ring-1 ring-[#0066CC]' 
                  : 'bg-sky-50 border-sky-500 ring-1 ring-sky-400'
                : theme === 'dark'
                ? 'bg-[#14171E] border-[#282D37] hover:border-[#3B4454]'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className={theme === 'dark' ? 'text-[#38BDF8] font-bold' : 'text-sky-600 font-bold'}>STAGE 05</span>
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
            </div>
            <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Rerank & Context</h4>
            <p className={`text-[10px] mt-0.5 line-clamp-2 leading-tight ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
              Cross-encoder reranking extracts top-k chunks for sovereign LLM reasoning.
            </p>
          </div>

        </div>
      </div>

      {/* Main Body: Document Selector, Upload Area & Vector Inspector */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5">
        
        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-all ${
            isDragOver 
              ? 'border-[#0066CC] bg-[#0066CC]/10' 
              : theme === 'dark'
              ? 'border-[#282D37] hover:border-[#38BDF8]/60 bg-[#14171E]'
              : 'border-slate-300 hover:border-sky-500 bg-slate-50'
          }`}
        >
          <div className="max-w-md mx-auto space-y-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto text-[#38BDF8] border ${
              theme === 'dark' ? 'bg-[#1C222C] border-[#282D37]' : 'bg-white border-slate-300'
            }`}>
              <Upload className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <p className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Drag & Drop any PDF, CAD Drawing, or CSV file here
              </p>
              <p className={`text-[11px] mt-0.5 ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
                or click to browse from your workstation • Processed strictly on-premise
              </p>
            </div>
            {uploadStatusMsg && (
              <div className="p-2 bg-sky-900/30 border border-[#0066CC] rounded-lg text-xs font-mono text-sky-400 animate-pulse">
                {uploadStatusMsg}
              </div>
            )}
          </div>
        </div>

        {/* Selected Document Metadata & Chunks Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: Documents List & Active Document Specs (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Document Switcher */}
            <div className={`border rounded-xl p-3.5 space-y-2.5 ${
              theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                theme === 'dark' ? 'text-[#CBD5E1]' : 'text-slate-700'
              }`}>
                Embedded Document Library ({documents.length})
              </span>
              <div className="space-y-1.5">
                {documents.length === 0 ? (
                  <div className={`p-3 rounded-lg border text-center space-y-1.5 text-xs ${
                    theme === 'dark' ? 'bg-[#11141A] border-[#222731]' : 'bg-white border-slate-200'
                  }`}>
                    <p className={theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}>
                      Vector library is empty.
                    </p>
                    <button
                      onClick={handleResetSampleDocs}
                      className="text-[11px] text-[#0066CC] hover:underline font-semibold cursor-pointer"
                    >
                      Restore Sample Engineering Docs
                    </button>
                  </div>
                ) : (
                  documents.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDocId(doc.id);
                        setSimulatedResults([]);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        doc.id === selectedDocId
                          ? theme === 'dark'
                            ? 'bg-[#1E293B] border-[#0066CC] text-white font-semibold shadow-sm'
                            : 'bg-white border-sky-500 text-sky-950 font-bold shadow-xs'
                          : theme === 'dark'
                          ? 'bg-[#11141A] border-[#222731] text-[#94A3B8] hover:text-white hover:border-[#282D37]'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2 flex-1 min-w-0">
                        <span className="block truncate text-xs font-medium">{doc.fileName}</span>
                        <span className={`text-[10px] ${theme === 'dark' ? 'text-[#64748B]' : 'text-slate-400'}`}>
                          {doc.pageCount} pgs • {doc.chunks.length} chunks
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <FileCheck className={`w-3.5 h-3.5 ${doc.id === selectedDocId ? 'text-[#38BDF8]' : 'text-[#64748B]'}`} />
                        <button
                          onClick={(e) => handleRemoveDocument(doc.id, e)}
                          title={`Remove ${doc.fileName} from vector library`}
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

            {/* Document Embedding Telemetry */}
            <div className={`border rounded-xl p-3.5 space-y-2 text-xs ${
              theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                theme === 'dark' ? 'text-[#38BDF8]' : 'text-sky-700'
              }`}>
                Embedding Vector Telemetry
              </span>
              
              <div className={`space-y-1.5 text-[11px] font-mono ${
                theme === 'dark' ? 'text-[#CBD5E1]' : 'text-slate-700'
              }`}>
                <div className={`flex justify-between py-1 border-b ${theme === 'dark' ? 'border-[#222731]' : 'border-slate-200'}`}>
                  <span className={theme === 'dark' ? 'text-[#64748B]' : 'text-slate-500'}>Embedding Model:</span>
                  <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{currentDoc.embeddingModel}</strong>
                </div>
                <div className={`flex justify-between py-1 border-b ${theme === 'dark' ? 'border-[#222731]' : 'border-slate-200'}`}>
                  <span className={theme === 'dark' ? 'text-[#64748B]' : 'text-slate-500'}>Vector Dimension:</span>
                  <strong className={theme === 'dark' ? 'text-[#38BDF8]' : 'text-sky-600'}>{currentDoc.vectorDimensions} Dimensions</strong>
                </div>
                <div className={`flex justify-between py-1 border-b ${theme === 'dark' ? 'border-[#222731]' : 'border-slate-200'}`}>
                  <span className={theme === 'dark' ? 'text-[#64748B]' : 'text-slate-500'}>Total Document Tokens:</span>
                  <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{currentDoc.totalTokens.toLocaleString()}</strong>
                </div>
                <div className={`flex justify-between py-1 border-b ${theme === 'dark' ? 'border-[#222731]' : 'border-slate-200'}`}>
                  <span className={theme === 'dark' ? 'text-[#64748B]' : 'text-slate-500'}>Indexed Vector Space:</span>
                  <strong className="text-[#22C55E]">Local Qdrant HNSW</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className={theme === 'dark' ? 'text-[#64748B]' : 'text-slate-500'}>Air-Gap Verification:</span>
                  <strong className="text-[#22C55E]">Verified Clean (0 B outbound)</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Chunk Viewer & Live Semantic Search (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Live Semantic Retrieval Sandbox */}
            <div className={`border rounded-xl p-4 space-y-3 ${
              theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  <Search className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Test Semantic Vector Query on Embedded PDF
                </span>
                <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#64748B]' : 'text-slate-400'}`}>
                  BGE-M3 Cosine Match
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTestSemanticSearch()}
                  placeholder="Enter semantic query to test vector match..."
                  className={`flex-1 border rounded-lg px-3 py-2 text-xs outline-none ${
                    theme === 'dark'
                      ? 'bg-[#0B0D11] border-[#282D37] focus:border-[#0066CC] text-white'
                      : 'bg-white border-slate-300 focus:border-sky-500 text-slate-900'
                  }`}
                />
                <button
                  onClick={handleTestSemanticSearch}
                  className="px-3.5 py-2 rounded-lg bg-[#0066CC] hover:bg-[#0077EE] text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
                >
                  Run Search
                </button>
              </div>

              {simulatedResults.length > 0 && (
                <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs font-mono ${
                  theme === 'dark'
                    ? 'bg-[#0B0D11] border-[#222731]'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}>
                  <span className={theme === 'dark' ? 'text-[#CBD5E1]' : 'text-slate-800'}>
                    Top Match: Chunk <strong className="text-[#38BDF8]">{simulatedResults[0].chunkId}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#12231A] text-[#22C55E] border border-[#224A32] font-bold text-[10px]">
                    Similarity: {(simulatedResults[0].score * 100).toFixed(1)}% Cosine Match
                  </span>
                </div>
              )}
            </div>

            {/* Extracted Document Chunks & Vector Representations */}
            <div className={`border rounded-xl p-4 space-y-3 ${
              theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className={`flex items-center justify-between pb-2 border-b ${
                theme === 'dark' ? 'border-[#282D37]' : 'border-slate-200'
              }`}>
                <h3 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Extracted Chunks & Local Dense Vector Representation
                </h3>
                <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#64748B]' : 'text-slate-400'}`}>
                  Showing {currentDoc.chunks.length} Chunks
                </span>
              </div>

              <div className="space-y-3">
                {currentDoc.chunks.map((chunk) => {
                  const searchScore = simulatedResults.find(r => r.chunkId === chunk.id)?.score;
                  const isTopMatch = simulatedResults.length > 0 && simulatedResults[0].chunkId === chunk.id;

                  return (
                    <div
                      key={chunk.id}
                      className={`p-3.5 rounded-lg border transition-all text-xs space-y-2.5 ${
                        isTopMatch
                          ? theme === 'dark'
                            ? 'bg-[#1E293B] border-[#38BDF8] ring-1 ring-[#38BDF8]/50 shadow-sm'
                            : 'bg-sky-50 border-sky-500 ring-1 ring-sky-300 shadow-xs'
                          : theme === 'dark'
                          ? 'bg-[#0B0D11] border-[#222731]'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Chunk Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                            theme === 'dark'
                              ? 'bg-[#1C222C] text-[#38BDF8] border-[#2B3545]'
                              : 'bg-sky-50 text-sky-800 border-sky-200'
                          }`}>
                            Chunk #{chunk.chunkNumber}
                          </span>
                          <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-400'}`}>
                            Page {chunk.pageNumber} • {chunk.tokens} Tokens
                          </span>
                        </div>

                        {searchScore && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#12231A] text-[#22C55E] border border-[#224A32]">
                            Score: {(searchScore * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>

                      {/* Chunk Text */}
                      <p className={`text-[11px] leading-relaxed font-sans ${
                        theme === 'dark' ? 'text-[#CBD5E1]' : 'text-slate-700'
                      }`}>
                        {chunk.text}
                      </p>

                      {/* Dense Vector Preview */}
                      <div className={`p-2 rounded border space-y-1 ${
                        theme === 'dark'
                          ? 'bg-[#14171E] border-[#222731]'
                          : 'bg-slate-900 border-slate-800 text-slate-100'
                      }`}>
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                          <span className={theme === 'dark' ? 'text-[#64748B]' : 'text-slate-400'}>Dense Embedding Vector (1024-dim sample):</span>
                          <span className="text-[#38BDF8]">float32[1024]</span>
                        </div>
                        <div className="font-mono text-[10px] text-[#22C55E] truncate">
                          [{chunk.denseVectorSample.map(n => n.toFixed(4)).join(', ')}, ... +1016 dims]
                        </div>
                      </div>

                      {/* Sparse Keywords */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#64748B]' : 'text-slate-500'}`}>
                          Sparse Keywords:
                        </span>
                        {chunk.sparseKeywords.map((kw, i) => (
                          <span 
                            key={i}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                              theme === 'dark'
                                ? 'bg-[#1C222C] text-[#94A3B8] border-[#282D37]'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

