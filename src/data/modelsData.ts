import { ModelInfo, GpuSpec } from '../types';

export const OPEN_WEIGHT_MODELS: Record<string, ModelInfo> = {
  'qwen-2.5-32b': {
    id: 'qwen-2.5-32b',
    name: 'Qwen2.5-32B-Instruct',
    family: 'Alibaba Cloud (Open Weights, Apache 2.0)',
    taskSpecialty: 'Multi-Step Agentic Planning, Complex Reasoning, PSU Approval Note Drafting',
    contextWindow: '128,000 tokens',
    vramUsage: '18.8 GB (AWQ 4-bit) / 36 GB (FP8)',
    quantization: 'AWQ 4-bit / GPTQ / FP8',
    status: 'loaded',
    tokensPerSec: 46.2,
    description: 'Premier open-weight reasoning model for formal administrative language, complex multi-step tool orchestration, and regulatory report synthesis.'
  },
  'qwen-2.5-coder-32b': {
    id: 'qwen-2.5-coder-32b',
    name: 'Qwen2.5-Coder-32B-Instruct',
    family: 'Alibaba Cloud (Open Weights, Apache 2.0)',
    taskSpecialty: 'Industrial Python Scripts, Mathematical Optimizations, SQL, Airgap Sandbox Executions',
    contextWindow: '128,000 tokens',
    vramUsage: '18.4 GB (AWQ 4-bit) / 34 GB (FP8)',
    quantization: 'AWQ 4-bit / Q4_K_M',
    status: 'ready',
    tokensPerSec: 52.8,
    description: 'SOTA open code generation engine matching Claude 3.5 Sonnet on HumanEval/MBPP; generates verifiable industrial algorithms without hallucinations.'
  },
  'qwen-2.5-vl-7b': {
    id: 'qwen-2.5-vl-7b',
    name: 'Qwen2.5-VL-7B-Instruct',
    family: 'Alibaba Cloud (Open Weights, Apache 2.0)',
    taskSpecialty: 'Piping & Instrumentation Diagrams (P&IDs), Scanned Inspection Reports, Handwritten Log OCR',
    contextWindow: '32,768 tokens (Dynamic Resolution)',
    vramUsage: '5.8 GB (4-bit) / 14.5 GB (FP16)',
    quantization: 'GGUF Q5_K_M / FP16',
    status: 'loaded',
    tokensPerSec: 38.5,
    description: 'Native vision-language model capable of parsing complex industrial line schematics, pressure vessel corrosion graphs, and degraded scanned PDFs.'
  },
  'llama-3.3-70b-awq': {
    id: 'llama-3.3-70b-awq',
    name: 'Llama-3.3-70B-Instruct (Quantized)',
    family: 'Meta AI (Llama Community License)',
    taskSpecialty: 'Executive Board Presentations, High-Level Strategic Policy Alignment, Complex Summaries',
    contextWindow: '128,000 tokens',
    vramUsage: '38.5 GB (4-bit AWQ)',
    quantization: 'AWQ 4-bit',
    status: 'ready',
    tokensPerSec: 28.4,
    description: 'Heavyweight reasoning flagship for boardroom presentations and policy alignment. Fits on dual RTX 3090 or single A6000.'
  },
  'deepseek-coder-14b': {
    id: 'deepseek-coder-14b',
    name: 'DeepSeek-Coder-V2-Lite-16B',
    family: 'DeepSeek AI (Open Source)',
    taskSpecialty: 'Lightweight Code Sandbox, Excel openpyxl Scripts, Fast Unit Testing',
    contextWindow: '64,000 tokens',
    vramUsage: '9.2 GB (Q4_K_M)',
    quantization: 'GGUF Q4_K_M',
    status: 'ready',
    tokensPerSec: 64.0,
    description: 'Low-latency code generator tailored for smaller GPUs (e.g. single RTX 4080 16GB) to execute unit tests and spreadsheet macros.'
  },
  'bge-m3-embedder': {
    id: 'bge-m3-embedder',
    name: 'BAAI BGE-M3 Multi-lingual Embedder',
    family: 'BAAI (Open Source)',
    taskSpecialty: 'Dense & Sparse Hybrid Search across MRPL SOPs, OISD Guidelines, Technical Standards',
    contextWindow: '8,192 tokens',
    vramUsage: '1.2 GB',
    quantization: 'FP16',
    status: 'loaded',
    tokensPerSec: 420.0,
    description: 'Ultra-fast embedding model running permanently in VRAM for sub-millisecond local vector retrieval over proprietary plant manuals.'
  }
};

export const GPU_HARDWARE_PRESETS: GpuSpec[] = [
  {
    name: 'Single NVIDIA RTX 4090 (24 GB VRAM)',
    vram: '24 GB GDDR6X',
    suitability: 'Budget Supported',
    recommendedStack: 'Qwen2.5-32B (AWQ 4-bit, 18.5GB) + BGE-M3 (1.2GB) hot-swapped with Qwen2.5-VL-7B',
    approxCost: '₹1.8 - 2.2 Lakhs (Single Consumer Workstation)'
  },
  {
    name: 'Dual NVIDIA RTX 3090 / 4090 (48 GB VRAM Total)',
    vram: '48 GB GDDR6X (NVLink / PCIe 4.0)',
    suitability: 'Optimal',
    recommendedStack: 'Qwen2.5-32B-Instruct + Qwen2.5-VL-7B + Qwen2.5-Coder concurrently loaded in VRAM',
    approxCost: '₹3.5 - 4.2 Lakhs (Affordable PSU Workstation)'
  },
  {
    name: 'NVIDIA RTX A6000 Ada / A100 (48 - 80 GB VRAM)',
    vram: '48 - 80 GB ECC',
    suitability: 'Multi-Model Parallel',
    recommendedStack: 'Full precision FP8/FP16 models with zero swapping latency, concurrent multi-user serving',
    approxCost: '₹6.5 - 12.0 Lakhs (Enterprise On-Prem Server)'
  },
  {
    name: 'Mid-Range Laptop / Workstation (Apple M3 Max / RTX 4080 16GB)',
    vram: '16 - 36 GB Unified / VRAM',
    suitability: 'Quantized Only',
    recommendedStack: 'Qwen2.5-14B-Instruct (8GB) + Qwen2.5-VL-7B (4-bit, 5GB) via Ollama/GGUF',
    approxCost: '₹1.2 - 2.5 Lakhs (Field Inspection Laptop)'
  }
];
