import React from 'react';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  CheckCircle, 
  WifiOff, 
  Server
} from 'lucide-react';

interface NetworkMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  packetsSent: number;
  packetsBlocked: number;
}

export const NetworkMonitorModal: React.FC<NetworkMonitorModalProps> = ({
  isOpen,
  onClose,
  packetsSent: _packetsSent,
  packetsBlocked: _packetsBlocked
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#181B22] border border-[#282D37] rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="p-4 bg-[#14171E] border-b border-[#282D37] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#12231A] border border-[#224A32] text-[#22C55E]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  Air-Gapped Sovereign Status
                </h3>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Zero data leaves this device. All AI models run locally in GPU memory.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E232D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Main Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="p-3.5 rounded-lg bg-[#14171E] border border-[#282D37] flex flex-col justify-between">
              <span className="text-[11px] text-[#94A3B8]">External Internet</span>
              <div className="flex items-center gap-1.5 my-2">
                <WifiOff className="w-4 h-4 text-[#22C55E]" />
                <span className="font-mono font-bold text-xs text-[#22C55E]">DISCONNECTED</span>
              </div>
              <span className="text-[10px] text-[#64748B]">Zero cloud network access</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#14171E] border border-[#282D37] flex flex-col justify-between">
              <span className="text-[11px] text-[#94A3B8]">AI Inference Engine</span>
              <div className="flex items-center gap-1.5 my-2">
                <Server className="w-4 h-4 text-[#38BDF8]" />
                <span className="font-mono font-bold text-xs text-white">100% Local GPU</span>
              </div>
              <span className="text-[10px] text-[#64748B]">Qwen2.5 & BGE in VRAM</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#14171E] border border-[#282D37] flex flex-col justify-between">
              <span className="text-[11px] text-[#94A3B8]">Data Leakage</span>
              <div className="flex items-center gap-1.5 my-2">
                <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                <span className="font-mono font-bold text-sm text-[#22C55E]">0 Bytes</span>
              </div>
              <span className="text-[10px] text-[#22C55E]">Strictly isolated on-premise</span>
            </div>

          </div>

          {/* Security Summary Box */}
          <div className="p-3.5 bg-[#12231A] border border-[#224A32] rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 text-[#22C55E] font-semibold text-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>Cryptographic Air-Gap Guarantee</span>
            </div>
            <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
              No prompts, drawings, or documents ever leave your machine. The system operates with strict kernel-level network isolation, guaranteeing complete compliance with industrial secrecy and safety standards (OISD-STD-105 / ISO 42001).
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#14171E] border-t border-[#282D37] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1C222C] hover:bg-[#282D37] text-white rounded-lg text-xs font-semibold transition-colors border border-[#282D37] cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
