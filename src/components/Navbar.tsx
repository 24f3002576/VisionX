import React from 'react';
import { 
  Layers, 
  Users,
  Play,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onOpenAirgapModal: () => void;
  onOpenDossierModal: () => void;
  onOpenModelsModal: () => void;
  onQuickDemo: () => void;
  isExecuting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAirgapModal,
  onOpenDossierModal,
  onOpenModelsModal,
  onQuickDemo,
  isExecuting
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`h-16 border-b sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between font-sans transition-colors duration-200 ${
      theme === 'dark' 
        ? 'border-[#282D37] bg-[#14171E]' 
        : 'border-slate-200 bg-white shadow-xs'
    }`}>
      
      {/* Brand & Project Identity */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onOpenDossierModal}
          className="w-8 h-8 bg-[#0066CC] hover:bg-[#0077EE] rounded-lg flex items-center justify-center font-bold text-white shadow-sm font-mono text-xs transition-colors cursor-pointer"
          title="VisionX Project Dossier"
        >
          VX
        </button>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              VisionX Sovereign AI
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold rounded border ${
              theme === 'dark'
                ? 'bg-[#1C222C] text-[#38BDF8] border-[#2B3545]'
                : 'bg-sky-50 text-sky-700 border-sky-200'
            }`}>
              SIH26117
            </span>
          </div>
          <span className={`text-[11px] ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
            On-Premise Industrial AI for Confidential Operations
          </span>
        </div>
      </div>

      {/* Action Buttons & Status Badge */}
      <div className="flex items-center space-x-2">
        
        {/* Network Status Badge - Clean & Minimal */}
        <button
          onClick={onOpenAirgapModal}
          title="Air-Gap Network Status"
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs font-mono transition-colors cursor-pointer ${
            theme === 'dark'
              ? 'bg-[#12231A] hover:bg-[#183024] border-[#224A32] text-[#22C55E]'
              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
          }`}
        >
          <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full"></span>
          <span className="text-[10px] font-semibold tracking-wider">
            AIR-GAPPED
          </span>
        </button>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          id="theme-toggle-btn"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Currently ${theme === 'dark' ? 'Dark' : 'Light'} Mode. Click to switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer ${
            theme === 'dark'
              ? 'bg-[#1C222C] hover:bg-[#252D3A] text-amber-300 border-[#2B3545] hover:border-amber-400/50'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-2xs'
          }`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 shrink-0 transition-transform rotate-0 hover:rotate-45 duration-300" />
              <span className="text-amber-200 font-mono text-[11px] hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600 shrink-0 transition-transform -rotate-12 duration-300" />
              <span className="text-slate-700 font-mono text-[11px] hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>

        {/* Model Architecture Info */}
        <button
          onClick={onOpenModelsModal}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
            theme === 'dark'
              ? 'bg-[#1C222C] hover:bg-[#252D3A] text-[#CBD5E1] border-[#2B3545]'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Models & GPU</span>
        </button>

        {/* Project Info & Team */}
        <button
          onClick={onOpenDossierModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
            theme === 'dark'
              ? 'bg-[#1C222C] hover:bg-[#252D3A] text-[#CBD5E1] border-[#2B3545]'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="hidden sm:inline">Team & Specs</span>
        </button>

        {/* Quick Demo Trigger */}
        <button
          onClick={onQuickDemo}
          disabled={isExecuting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0066CC] hover:bg-[#0077EE] disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>{isExecuting ? 'Processing...' : 'Run Demo'}</span>
        </button>

      </div>

    </header>
  );
};

