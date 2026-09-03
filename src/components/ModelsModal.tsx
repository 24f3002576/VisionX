import React from 'react';
import { X, Layers, Cpu, Server, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { OPEN_WEIGHT_MODELS } from '../data/modelsData';

interface ModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelsModal: React.FC<ModelsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-[#181B22] border border-[#2B313E] rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#282D37] bg-[#14171E] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#0066CC] text-white font-bold flex items-center justify-center font-mono text-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Open-Weight Model Hub & GPU Sizing
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Runs 100% on local 24GB GPU without external APIs
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Hardware Sizing Banner */}
          <div className="p-4 bg-[#14171E] rounded-lg border border-[#282D37] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#38BDF8]" />
                <span className="font-bold text-white text-sm">Hardware Footprint: Single 24GB GPU</span>
              </div>
              <p className="text-[#94A3B8]">
                Fits on NVIDIA RTX 3090 / 4090 or A100 using 4-bit AWQ quantization. Zero recurring cloud fees.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#12231A] text-[#22C55E] border border-[#224A32] font-mono font-bold text-[11px] shrink-0">
              ₹0 Cloud Cost / Year
            </span>
          </div>

          {/* Model List */}
          <div className="space-y-2.5">
            <h3 className="font-semibold text-[#CBD5E1] text-xs uppercase tracking-wider">
              Deployed Open-Weight Models
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(OPEN_WEIGHT_MODELS).map((model) => (
                <div 
                  key={model.id}
                  className="p-3.5 bg-[#14171E] rounded-lg border border-[#282D37] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{model.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1C222C] text-[#38BDF8] border border-[#2B3545]">
                      {model.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                    {model.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#222731] text-[10px] font-mono text-[#64748B]">
                    <span>VRAM: <strong className="text-[#CBD5E1]">{model.vramUsage.split('/')[0]}</strong></span>
                    <span>Tokens: <strong className="text-[#22C55E]">{model.tokensPerSec} t/s</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#282D37] bg-[#14171E] flex justify-end">
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
