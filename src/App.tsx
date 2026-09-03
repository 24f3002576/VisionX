import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { WorkbenchView } from './components/workbench/WorkbenchView';
import { NetworkMonitorModal } from './components/network/NetworkMonitorModal';
import { ProjectDossierModal } from './components/ProjectDossierModal';
import { ModelsModal } from './components/ModelsModal';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { theme } = useTheme();
  const [isAirgapModalOpen, setIsAirgapModalOpen] = useState<boolean>(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [isModelsModalOpen, setIsModelsModalOpen] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [packetsBlocked, setPacketsBlocked] = useState<number>(24);

  const handleOpenAirgap = () => {
    setIsAirgapModalOpen(true);
  };

  const handleOpenDossier = () => {
    setIsDossierModalOpen(true);
  };

  const handleOpenModels = () => {
    setIsModelsModalOpen(true);
  };

  const handleQuickDemo = () => {
    setIsExecuting(true);
    setPacketsBlocked(prev => prev + 2);
    setTimeout(() => {
      setIsExecuting(false);
    }, 2800);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-[#0F1117] text-[#E2E8F0] selection:bg-[#0066CC]/40 selection:text-white' 
        : 'bg-slate-50 text-slate-900 selection:bg-[#0066CC]/20 selection:text-slate-900'
    }`}>
      
      {/* Top Navigation */}
      <Navbar
        onOpenAirgapModal={handleOpenAirgap}
        onOpenDossierModal={handleOpenDossier}
        onOpenModelsModal={handleOpenModels}
        onQuickDemo={handleQuickDemo}
        isExecuting={isExecuting}
      />

      {/* Main Single-View Workbench */}
      <main className={`flex-1 transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#0F1117]' : 'bg-slate-50'
      }`}>
        <WorkbenchView 
          onOpenAirgapModal={handleOpenAirgap} 
          isExecuting={isExecuting}
          setIsExecuting={setIsExecuting}
        />
      </main>

      {/* Team Details Modal */}
      <ProjectDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
      />

      {/* Open-Weight Models & Hardware Modal */}
      <ModelsModal
        isOpen={isModelsModalOpen}
        onClose={() => setIsModelsModalOpen(false)}
      />

      {/* Air-Gap Telemetry & Network Proof Modal */}
      <NetworkMonitorModal
        isOpen={isAirgapModalOpen}
        onClose={() => setIsAirgapModalOpen(false)}
        packetsSent={0}
        packetsBlocked={packetsBlocked}
      />

      {/* Clean Minimalist Footer */}
      <footer className={`border-t py-3.5 px-4 sm:px-6 lg:px-8 mt-10 text-xs transition-colors duration-200 ${
        theme === 'dark' 
          ? 'border-[#222731] bg-[#14171E] text-[#94A3B8]' 
          : 'border-slate-200 bg-white text-slate-600 shadow-2xs'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          <div className="flex items-center space-x-2">
            <span className={`font-semibold text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              VisionX Sovereign Engine
            </span>
            <span className={theme === 'dark' ? 'text-[#475569]' : 'text-slate-300'}>|</span>
            <span className={`text-xs ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
              SIH26117 • Oil & Gas Refining Division
            </span>
          </div>

          <div className={`text-xs ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
            100% Air-Gapped Local Inference • Zero External Data Leaks
          </div>

        </div>
      </footer>

    </div>
  );
}

