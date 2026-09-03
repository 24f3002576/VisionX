import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Layers
} from 'lucide-react';

interface ProjectDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEAM_MEMBERS = [
  {
    name: 'Yash Pakhale',
    role: 'Team Leader',
    contribution: 'System Architecture & Kernel Isolation Sandbox'
  },
  {
    name: 'Ranjit Singh',
    role: 'RAG & Vector Search',
    contribution: 'Knowledge Retrieval & Local Vector Indexing'
  },
  {
    name: 'Kunal Patil',
    role: 'ML & Vision',
    contribution: 'Multimodal Vision LLM & CAD Parsing'
  },
  {
    name: 'Parth Ambhure',
    role: 'Agentic Backend',
    contribution: 'ReAct Agent Pipeline & Local Model Routing'
  },
  {
    name: 'Tanishq Suryawanshi',
    role: 'Frontend UI/UX',
    contribution: 'Industrial Workbench Interface & Telemetry'
  },
  {
    name: 'Tanishka Suryawanshi',
    role: 'Security & QA',
    contribution: 'Air-Gap Security & Zero-Egress Testing'
  }
];

export const ProjectDossierModal: React.FC<ProjectDossierModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'team' | 'specs'>('team');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-[#181B22] border border-[#2B313E] rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#282D37] bg-[#14171E] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#0066CC] text-white font-bold flex items-center justify-center font-mono text-sm shadow-sm">
              VX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Team VisionX
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#1C222C] text-[#38BDF8] border border-[#2B3545]">
                  SIH26117
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Confidential Industrial AI Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#252D3A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simple Tab Header */}
        <div className="flex border-b border-[#282D37] bg-[#14171E] px-4 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'team'
                ? 'border-[#0066CC] text-[#38BDF8] bg-[#1C222C]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Team Members
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'specs'
                ? 'border-[#0066CC] text-[#38BDF8] bg-[#1C222C]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            System Architecture
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* TAB 1: TEAM MEMBERS */}
          {activeTab === 'team' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEAM_MEMBERS.map((member, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-[#14171E] rounded-lg border border-[#282D37] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">
                        {member.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#1C222C] text-[#38BDF8] border border-[#2B3545]">
                        {member.role}
                      </span>
                    </div>
                    <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                      {member.contribution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM ARCHITECTURE */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              
              {/* Architecture Steps */}
              <div className="p-4 bg-[#14171E] rounded-lg border border-[#282D37] space-y-3">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
                  5-Stage Sovereign Execution Pipeline
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
                  <div className="p-2.5 rounded bg-[#1C222C] border border-[#282D37]">
                    <span className="text-[#64748B] text-[9px] block">STEP 1</span>
                    <span className="text-white font-bold text-[11px]">User Input</span>
                    <span className="text-[9px] text-[#94A3B8] block mt-0.5">PDFs & CAD</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#1C222C] border border-[#282D37]">
                    <span className="text-[#64748B] text-[9px] block">STEP 2</span>
                    <span className="text-[#38BDF8] font-bold text-[11px]">VisionX Agent</span>
                    <span className="text-[9px] text-[#94A3B8] block mt-0.5">FastAPI / ReAct</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#1C222C] border border-[#282D37]">
                    <span className="text-[#64748B] text-[9px] block">STEP 3</span>
                    <span className="text-[#F59E0B] font-bold text-[11px]">Model Router</span>
                    <span className="text-[9px] text-[#94A3B8] block mt-0.5">Local vLLM</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#1C222C] border border-[#282D37]">
                    <span className="text-[#64748B] text-[9px] block">STEP 4</span>
                    <span className="text-[#22C55E] font-bold text-[11px]">Code Sandbox</span>
                    <span className="text-[9px] text-[#94A3B8] block mt-0.5">nsjail Guard</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#1C222C] border border-[#0066CC]">
                    <span className="text-[#64748B] text-[9px] block">STEP 5</span>
                    <span className="text-white font-bold text-[11px]">Deliverables</span>
                    <span className="text-[9px] text-[#38BDF8] block mt-0.5">.docx / .xlsx</span>
                  </div>
                </div>
              </div>

              {/* Hardware Footprint */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#14171E] rounded-lg border border-[#282D37]">
                  <span className="text-[#64748B] text-[10px] block">Hardware Footprint</span>
                  <span className="text-white font-bold mt-1 block">Single 24GB GPU</span>
                  <span className="text-[#22C55E] text-[10px] mt-0.5 block">RTX 3090/4090 or A100</span>
                </div>

                <div className="p-3 bg-[#14171E] rounded-lg border border-[#282D37]">
                  <span className="text-[#64748B] text-[10px] block">Quantization</span>
                  <span className="text-white font-bold mt-1 block">4-bit AWQ / GGUF</span>
                  <span className="text-[#38BDF8] text-[10px] mt-0.5 block">Qwen2.5 / DeepSeek</span>
                </div>

                <div className="p-3 bg-[#14171E] rounded-lg border border-[#282D37]">
                  <span className="text-[#64748B] text-[10px] block">Cloud Dependency</span>
                  <span className="text-[#22C55E] font-bold mt-1 block">0 External APIs</span>
                  <span className="text-[#22C55E] text-[10px] mt-0.5 block">₹0 Recurring API Fees</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#282D37] bg-[#14171E] flex items-center justify-between">
          <div className="text-xs text-[#94A3B8]">
            Air-Gapped Sovereign Industrial System
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#0066CC] hover:bg-[#0077EE] text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
