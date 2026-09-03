import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ShieldAlert, 
  Info, 
  Scan, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Eye,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Annotation {
  tag: string;
  type: 'defect' | 'instrument' | 'valve' | 'hazard';
  x: number;
  y: number;
  w: number;
  h: number;
  description: string;
  severity?: 'CRITICAL' | 'WARNING' | 'NOMINAL';
  recommendation?: string;
  standard?: string;
}

interface InteractivePidCanvasProps {
  annotations?: Annotation[];
  onSelectTag?: (tag: Annotation) => void;
}

const DEFAULT_ANNOTATIONS: Annotation[] = [
  {
    tag: 'PRV-102A/B',
    type: 'hazard',
    x: 70,
    y: 12,
    w: 20,
    h: 24,
    description: 'Dual Safety Relief Valves lack Car Seal Open (CSO) interlock on upstream isolation gate valves.',
    severity: 'CRITICAL',
    recommendation: 'Install mechanical key interlock or Car Seal Open (CSO) on isolation gate valves upstream of both PRVs.',
    standard: 'API 521 §5.4.2 / OISD-STD-118'
  },
  {
    tag: 'LCV-104 & Bypass',
    type: 'valve',
    x: 58,
    y: 72,
    w: 18,
    h: 22,
    description: 'Level Control Valve (Fail-Closed) verified; Manual bypass valve requires Locked Closed (LC) administrative tag.',
    severity: 'WARNING',
    recommendation: 'Affix tamper-evident Locked Closed (LC) tag on 3-inch manual bypass gate valve.',
    standard: 'OISD-STD-118 §6.2'
  },
  {
    tag: 'FT-201 & TI-208',
    type: 'instrument',
    x: 44,
    y: 74,
    w: 14,
    h: 18,
    description: 'Overhead reflux flow and temperature transmitters verified on Distributed Control System (DCS).',
    severity: 'NOMINAL',
    recommendation: 'Transmitters operating within calibration range (0-150 m³/h, 40-180°C).',
    standard: 'ISA-5.1 Instrumentation Standard'
  },
  {
    tag: 'Vessel V-102',
    type: 'defect',
    x: 26,
    y: 26,
    w: 24,
    h: 36,
    description: 'Overhead Reflux Accumulator Drum (Design: 6.5 bar g @ 120°C). No nozzle or structural discrepancies found.',
    severity: 'NOMINAL',
    recommendation: 'Thickness inspection within tolerance (>14.2 mm).',
    standard: 'ASME Sec VIII Div 1'
  }
];

export const InteractivePidCanvas: React.FC<InteractivePidCanvasProps> = ({
  annotations = [],
  onSelectTag
}) => {
  const { theme } = useTheme();
  const activeList = annotations.length > 0 ? annotations : DEFAULT_ANNOTATIONS;

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [filter, setFilter] = useState<'all' | 'hazard' | 'valve' | 'instrument'>('all');
  const [zoom, setZoom] = useState<number>(1);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const filteredAnnotations = activeList.filter(ann => {
    if (filter === 'all') return true;
    if (filter === 'hazard') return ann.severity === 'CRITICAL' || ann.type === 'hazard';
    if (filter === 'valve') return ann.type === 'valve';
    if (filter === 'instrument') return ann.type === 'instrument';
    return true;
  });

  const selectedAnnotation = filteredAnnotations[selectedIndex] || filteredAnnotations[0] || null;

  const handleTagClick = (ann: Annotation) => {
    const idx = filteredAnnotations.findIndex(a => a.tag === ann.tag);
    if (idx !== -1) setSelectedIndex(idx);
    if (onSelectTag) onSelectTag(ann);
  };

  const handleNext = () => {
    if (filteredAnnotations.length === 0) return;
    const nextIdx = (selectedIndex + 1) % filteredAnnotations.length;
    setSelectedIndex(nextIdx);
    if (onSelectTag) onSelectTag(filteredAnnotations[nextIdx]);
  };

  const handlePrev = () => {
    if (filteredAnnotations.length === 0) return;
    const prevIdx = (selectedIndex - 1 + filteredAnnotations.length) % filteredAnnotations.length;
    setSelectedIndex(prevIdx);
    if (onSelectTag) onSelectTag(filteredAnnotations[prevIdx]);
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className={`rounded-xl border overflow-hidden flex flex-col h-full shadow-sm font-sans transition-colors ${
      theme === 'dark'
        ? 'bg-[#181B22] border-[#282D37]'
        : 'bg-white border-slate-200'
    }`}>
      
      {/* Visual Guide & Explanation Banner */}
      <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-2.5 ${
        theme === 'dark'
          ? 'bg-[#14171E] border-[#282D37]'
          : 'bg-sky-50/70 border-sky-100'
      }`}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#0066CC] text-white">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                P&ID Vision Twin (Qwen2.5-VL)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Live AI Annotations
              </span>
            </div>
            <p className={`text-[11px] ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
              Click any colored bounding box on the blueprint below to inspect AI findings.
            </p>
          </div>
        </div>

        {/* How It Works Button & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHowItWorks(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#1C222C] hover:bg-[#252D3A] text-[#38BDF8] border-[#2B3545]'
                : 'bg-white hover:bg-slate-50 text-sky-700 border-sky-200 shadow-2xs'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How Vision Map Works</span>
          </button>

          <button
            onClick={handleSimulateScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0066CC] hover:bg-[#0077EE] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>{isScanning ? 'Scanning...' : 'Re-Scan Vision'}</span>
          </button>
        </div>
      </div>

      {/* Legend & Filter Bar */}
      <div className={`px-3 py-2 border-b flex flex-wrap items-center justify-between gap-2 text-xs ${
        theme === 'dark'
          ? 'bg-[#101318] border-[#282D37]'
          : 'bg-slate-50 border-slate-200'
      }`}>
        {/* Color Legend */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className={`font-semibold ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
            Legend:
          </span>
          <span className="flex items-center gap-1 text-red-500 font-medium">
            <span className="w-2.5 h-2.5 rounded-xs bg-red-500 inline-block"></span>
            Critical Safety Hazard
          </span>
          <span className="flex items-center gap-1 text-amber-500 font-medium">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block"></span>
            Valve Warning
          </span>
          <span className="flex items-center gap-1 text-sky-500 font-medium">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 inline-block"></span>
            Instrument / Transmitter
          </span>
        </div>

        {/* Filter Buttons & Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/10 dark:bg-[#14171E] p-0.5 rounded-md border border-slate-200 dark:border-[#282D37]">
            <button
              onClick={() => { setFilter('all'); setSelectedIndex(0); }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                filter === 'all' 
                  ? 'bg-[#0066CC] text-white' 
                  : theme === 'dark' ? 'text-[#94A3B8] hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({activeList.length})
            </button>
            <button
              onClick={() => { setFilter('hazard'); setSelectedIndex(0); }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                filter === 'hazard' 
                  ? 'bg-red-600 text-white' 
                  : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
              }`}
            >
              Hazards
            </button>
            <button
              onClick={() => { setFilter('valve'); setSelectedIndex(0); }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                filter === 'valve' 
                  ? 'bg-amber-600 text-white' 
                  : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              Valves
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom(prev => Math.max(0.8, prev - 0.1))}
              className={`p-1 rounded border cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#1C222C] hover:bg-[#252D3A] text-white border-[#282D37]'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className={`text-[10px] font-mono w-7 text-center ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))}
              className={`p-1 rounded border cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#1C222C] hover:bg-[#252D3A] text-white border-[#282D37]'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className={`p-1 rounded border cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#1C222C] hover:bg-[#252D3A] text-white border-[#282D37]'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Schematic Viewer Area with Interactive Canvas Overlay */}
      <div className={`relative flex-1 min-h-[360px] overflow-hidden flex items-center justify-center p-4 transition-colors ${
        theme === 'dark' ? 'bg-[#0B0D11]' : 'bg-slate-100'
      }`}>
        
        {/* Scanning Laser Animation */}
        {isScanning && (
          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
            <div className="w-full h-1 bg-[#38BDF8] shadow-[0_0_15px_#38BDF8] animate-pulse"></div>
            <div className="absolute inset-0 bg-[#38BDF8]/5"></div>
            <div className="absolute top-4 left-4 bg-black/80 border border-[#38BDF8] px-3 py-1.5 rounded-lg text-xs font-mono text-[#38BDF8]">
              Scanning Vision Patches via Qwen2.5-VL...
            </div>
          </div>
        )}

        {/* SVG Engineering Drawing Schematic Representation */}
        <div 
          className={`relative w-full max-w-2xl aspect-[16/10] rounded-xl border p-4 transition-transform duration-200 shadow-inner ${
            theme === 'dark'
              ? 'bg-[#14171E] border-[#282D37]'
              : 'bg-[#F8FAFC] border-slate-300'
          }`}
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Engineering Blueprint Grid Background */}
          <div 
            className="absolute inset-0 opacity-15 rounded-xl pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #38BDF8 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* SVG Industrial Graphic Lines */}
          <svg className="w-full h-full text-[#94A3B8] select-none" viewBox="0 0 800 500">
            {/* Main Overhead Column Vapor Line */}
            <path d="M 50 250 L 180 250 L 180 180 L 300 180" fill="none" stroke="#0284C7" strokeWidth="4" />
            <text x="70" y="240" fill="#0284C7" fontSize="11" fontFamily="monospace" fontWeight="bold">12"-VAP-CDU2-0101-CS</text>

            {/* Vessel Drum V-102 (Overhead Reflux Accumulator) */}
            <rect x="220" y="140" width="160" height="200" rx="40" fill={theme === 'dark' ? '#1C222C' : '#E2E8F0'} stroke={theme === 'dark' ? '#3B4454' : '#94A3B8'} strokeWidth="3" />
            <text x="250" y="245" fill={theme === 'dark' ? '#E2E8F0' : '#1E293B'} fontSize="14" fontWeight="bold" fontFamily="sans-serif">DRUM V-102</text>
            <text x="240" y="265" fill={theme === 'dark' ? '#94A3B8' : '#475569'} fontSize="10" fontFamily="monospace">OVERHEAD REFLUX</text>

            {/* Top Vapor Relief Line to PRV */}
            <path d="M 300 140 L 300 80 L 580 80" fill="none" stroke="#DC2626" strokeWidth="3" />
            <path d="M 580 80 L 580 50 L 620 50" fill="none" stroke="#DC2626" strokeWidth="3" />
            <path d="M 620 80 L 620 50" fill="none" stroke="#DC2626" strokeWidth="3" />
            <text x="350" y="70" fill="#DC2626" fontSize="10" fontFamily="monospace" fontWeight="bold">6"-RELIEF-TO-FLARE</text>

            {/* PRV-102A & PRV-102B Symbols (Dual relief valves) */}
            <polygon points="565,65 595,65 580,85" fill="#DC2626" stroke="#ffffff" strokeWidth="1" />
            <polygon points="565,105 595,105 580,85" fill="#DC2626" stroke="#ffffff" strokeWidth="1" />
            <text x="540" y="125" fill="#DC2626" fontSize="10" fontWeight="bold">PRV-102A</text>

            <polygon points="635,65 665,65 650,85" fill="#DC2626" stroke="#ffffff" strokeWidth="1" />
            <polygon points="635,105 665,105 650,85" fill="#DC2626" stroke="#ffffff" strokeWidth="1" />
            <text x="630" y="125" fill="#DC2626" fontSize="10" fontWeight="bold">PRV-102B</text>

            {/* Bottom Liquid Line from Drum V-102 */}
            <path d="M 300 340 L 300 420 L 680 420" fill="none" stroke="#0284C7" strokeWidth="4" />
            <text x="330" y="440" fill="#0284C7" fontSize="10" fontFamily="monospace" fontWeight="bold">8"-HC-CDU2-201-CS</text>

            {/* Flow & Temp Transmitter Bubbles */}
            <circle cx="380" cy="420" r="16" fill={theme === 'dark' ? '#0B0D11' : '#FFFFFF'} stroke="#0284C7" strokeWidth="2" />
            <text x="370" y="424" fill="#0284C7" fontSize="9" fontWeight="bold">FT</text>
            <text x="367" y="448" fill={theme === 'dark' ? '#94A3B8' : '#475569'} fontSize="9" fontFamily="monospace">201</text>

            <circle cx="430" cy="420" r="16" fill={theme === 'dark' ? '#0B0D11' : '#FFFFFF'} stroke="#0284C7" strokeWidth="2" />
            <text x="424" y="424" fill="#0284C7" fontSize="9" fontWeight="bold">TI</text>
            <text x="421" y="448" fill={theme === 'dark' ? '#94A3B8' : '#475569'} fontSize="9" fontFamily="monospace">208</text>

            {/* Control Valve LCV-104 (Level control) */}
            <polygon points="500,405 530,405 515,420" fill="#D97706" stroke="#ffffff" strokeWidth="1" />
            <polygon points="500,435 530,435 515,420" fill="#D97706" stroke="#ffffff" strokeWidth="1" />
            <circle cx="515" cy="390" r="10" fill={theme === 'dark' ? '#1C222C' : '#FFFFFF'} stroke="#D97706" strokeWidth="1.5" />
            <line x1="515" y1="400" x2="515" y2="405" stroke="#D97706" strokeWidth="2" />
            <text x="495" y="380" fill="#D97706" fontSize="10" fontWeight="bold">LCV-104 (FC)</text>

            {/* Manual Bypass Line around LCV-104 */}
            <path d="M 470 420 L 470 470 L 560 470 L 560 420" fill="none" stroke="#64748B" strokeWidth="2" strokeDasharray="3,3" />
            <polygon points="505,460 525,460 515,470" fill="#64748B" />
            <polygon points="505,480 525,480 515,470" fill="#64748B" />
            <text x="495" y="495" fill="#64748B" fontSize="9" fontFamily="monospace">BYPASS (NC)</text>

            {/* Pressure Transmitter PT-204 on Top of Drum */}
            <line x1="240" y1="140" x2="240" y2="100" stroke="#0284C7" strokeWidth="2" />
            <circle cx="240" cy="90" r="16" fill={theme === 'dark' ? '#0B0D11' : '#FFFFFF'} stroke="#0284C7" strokeWidth="2" />
            <text x="232" y="94" fill="#0284C7" fontSize="9" fontWeight="bold">PT</text>
            <text x="228" y="118" fill={theme === 'dark' ? '#94A3B8' : '#475569'} fontSize="9" fontFamily="monospace">204</text>
          </svg>

          {/* Interactive Bounding Box Overlays Detected by Qwen2.5-VL */}
          {filteredAnnotations.map((ann, idx) => {
            const isSelected = selectedAnnotation?.tag === ann.tag;
            const isHazard = ann.severity === 'CRITICAL';
            const isWarning = ann.severity === 'WARNING';

            return (
              <div
                key={idx}
                onClick={() => handleTagClick(ann)}
                style={{
                  left: `${ann.x}%`,
                  top: `${ann.y}%`,
                  width: `${ann.w}%`,
                  height: `${ann.h}%`,
                }}
                className={`absolute cursor-pointer rounded-lg transition-all duration-150 border-2 ${
                  isHazard
                    ? 'border-red-500 bg-red-500/20 shadow-lg shadow-red-500/30 animate-pulse'
                    : isWarning
                    ? 'border-amber-500 bg-amber-500/20 shadow-lg shadow-amber-500/20'
                    : 'border-sky-500 bg-sky-500/15 hover:border-sky-400'
                } ${isSelected ? 'ring-2 ring-white scale-105 z-20' : 'hover:scale-102 z-10'}`}
              >
                <div className={`absolute -top-3 left-1 px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-sm ${
                  isHazard
                    ? 'bg-red-600 text-white'
                    : isWarning
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#0066CC] text-white'
                }`}>
                  {ann.tag}
                </div>
              </div>
            );
          })}

        </div>

      </div>

      {/* Selected Tag Inspection Card / Step-through Panel */}
      {selectedAnnotation && (
        <div className={`p-3.5 border-t flex flex-col sm:flex-row items-start justify-between gap-3 text-xs transition-colors ${
          theme === 'dark'
            ? 'bg-[#14171E] border-[#282D37]'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
              selectedAnnotation.severity === 'CRITICAL'
                ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                : selectedAnnotation.severity === 'WARNING'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                : 'bg-sky-500/10 text-sky-500 border border-sky-500/30'
            }`}>
              {selectedAnnotation.severity === 'CRITICAL' ? (
                <ShieldAlert className="w-4 h-4" />
              ) : selectedAnnotation.severity === 'WARNING' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-mono font-bold text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {selectedAnnotation.tag}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                  selectedAnnotation.severity === 'CRITICAL'
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                    : selectedAnnotation.severity === 'WARNING'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}>
                  {selectedAnnotation.severity || 'NOMINAL'}
                </span>
                {selectedAnnotation.standard && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#1E232D] text-slate-700 dark:text-[#94A3B8] font-mono">
                    {selectedAnnotation.standard}
                  </span>
                )}
              </div>

              <p className={`text-[11px] leading-relaxed ${theme === 'dark' ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                <strong>AI Finding:</strong> {selectedAnnotation.description}
              </p>

              {selectedAnnotation.recommendation && (
                <p className="text-[11px] leading-relaxed text-sky-600 dark:text-[#38BDF8]">
                  <strong>Action:</strong> {selectedAnnotation.recommendation}
                </p>
              )}
            </div>
          </div>

          {/* Stepper controls to navigate between detected items */}
          <div className="shrink-0 flex sm:flex-col items-end justify-between gap-2 self-stretch sm:self-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-[#282D37]">
            <div className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
              Finding {selectedIndex + 1} of {filteredAnnotations.length}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                className={`p-1 rounded border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#1C222C] hover:bg-[#252D3A] text-white border-[#282D37]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                }`}
                title="Previous finding"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="text-[10px]">Prev</span>
              </button>
              <button
                onClick={handleNext}
                className={`p-1 px-2 rounded border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#0066CC] hover:bg-[#0077EE] text-white border-transparent'
                    : 'bg-[#0066CC] hover:bg-[#0077EE] text-white border-transparent shadow-2xs'
                }`}
                title="Next finding"
              >
                <span className="text-[10px]">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How Vision Map is Generated Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className={`border rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs ${
            theme === 'dark' ? 'bg-[#181B22] border-[#282D37]' : 'bg-white border-slate-200'
          }`}>
            
            <div className={`p-4 border-b flex items-center justify-between ${
              theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#0066CC]" />
                <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  How the Vision Map Works (Simple 4 Steps)
                </h3>
              </div>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                The Vision Map automatically reads scanned engineering drawings (P&IDs) and turns them into an interactive digital model using our on-premise vision AI:
              </p>

              <div className="space-y-3">
                
                {/* Step 1 */}
                <div className={`p-3 rounded-lg border flex items-start gap-3 ${
                  theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="w-6 h-6 rounded-full bg-[#0066CC] text-white font-bold flex items-center justify-center font-mono text-[11px] shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className={`font-bold text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      Blueprint Ingestion (Air-Gapped)
                    </h4>
                    <p className={`text-[11px] mt-0.5 leading-relaxed ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                      The P&ID drawing is loaded directly into local GPU memory without sending any pixels to external cloud APIs.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`p-3 rounded-lg border flex items-start gap-3 ${
                  theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="w-6 h-6 rounded-full bg-[#0066CC] text-white font-bold flex items-center justify-center font-mono text-[11px] shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className={`font-bold text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      Vision AI Symbol Detection (Qwen2.5-VL)
                    </h4>
                    <p className={`text-[11px] mt-0.5 leading-relaxed ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                      The model spots valves, relief valves, transmitters, and vessels, placing colored bounding boxes around each item.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`p-3 rounded-lg border flex items-start gap-3 ${
                  theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="w-6 h-6 rounded-full bg-[#0066CC] text-white font-bold flex items-center justify-center font-mono text-[11px] shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className={`font-bold text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      Tag & OCR Extraction
                    </h4>
                    <p className={`text-[11px] mt-0.5 leading-relaxed ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                      Reads instrument numbers (like <code>PRV-102A</code>, <code>LCV-104</code>, <code>FT-201</code>) and checks valve positions (Fail-Closed, Normally Closed).
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className={`p-3 rounded-lg border flex items-start gap-3 ${
                  theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="w-6 h-6 rounded-full bg-[#0066CC] text-white font-bold flex items-center justify-center font-mono text-[11px] shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className={`font-bold text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      Automated Safety HazOp Audit
                    </h4>
                    <p className={`text-[11px] mt-0.5 leading-relaxed ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                      Cross-checks against refinery safety rules (<strong>OISD-STD-118</strong> and <strong>API 521</strong>). If a safety relief valve lacks a lock or car-seal open, it flags it immediately in <strong className="text-red-500">RED</strong>.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <div className={`p-4 border-t flex justify-end ${
              theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="px-4 py-1.5 rounded-lg bg-[#0066CC] hover:bg-[#0077EE] text-white font-bold text-xs cursor-pointer"
              >
                Understood!
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
