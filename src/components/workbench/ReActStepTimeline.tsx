import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Terminal, 
  BrainCircuit, 
  Search, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  Zap, 
  Lock,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { AgentStep } from '../../types';

interface ReActStepTimelineProps {
  steps: AgentStep[];
  isExecuting: boolean;
  currentStepIndex: number;
}

export const ReActStepTimeline: React.FC<ReActStepTimelineProps> = ({
  steps,
  isExecuting,
  currentStepIndex
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({
    'step-1': true,
    'step-2': true,
    'step-3': true
  });

  const toggleStep = (id: string) => {
    setExpandedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'thought':
        return <BrainCircuit className="w-3.5 h-3.5 text-[#4CAF50]" />;
      case 'action':
        return <Zap className="w-3.5 h-3.5 text-[#FFD700]" />;
      case 'observation':
        return <Search className="w-3.5 h-3.5 text-[#00BFFF]" />;
      case 'reflection':
        return <RefreshCw className="w-3.5 h-3.5 text-[#4CAF50]" />;
      case 'deliverable':
        return <FileText className="w-3.5 h-3.5 text-[#00BFFF]" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-[#8E9299]" />;
    }
  };

  const getStepBadgeColor = (type: string) => {
    switch (type) {
      case 'thought':
        return 'bg-[#152518] text-[#4CAF50] border-[#234529]';
      case 'action':
        return 'bg-[#2b2413] text-[#FFD700] border-[#59471b]';
      case 'observation':
        return 'bg-[#112338] text-[#00BFFF] border-[#1d436c]';
      case 'reflection':
        return 'bg-[#152518] text-[#4CAF50] border-[#234529]';
      case 'deliverable':
        return 'bg-[#005FB8]/20 text-[#00BFFF] border-[#005FB8]';
      default:
        return 'bg-[#1F232B] text-[#8E9299] border-[#2A2D35]';
    }
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-[#2A2D35]">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-[#00BFFF]" />
          <span className="font-semibold text-xs text-[#E0E0E0] uppercase tracking-wider">
            ReAct Agent Execution Trace
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono bg-[#16191E] text-[#8E9299] border border-[#2A2D35] rounded">
            {steps.length} Steps Logged
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8E9299]">
          <Lock className="w-3 h-3 text-[#4CAF50]" />
          <span className="text-[#4CAF50]">Airgap Active</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentStepIndex && isExecuting;
          const isPast = idx < currentStepIndex || (!isExecuting && step.status === 'completed' || step.status === 'verified');
          const isExpanded = expandedSteps[step.id] ?? true;

          return (
            <div
              key={step.id}
              className={`rounded-lg border transition-all duration-200 overflow-hidden ${
                isCurrent
                  ? 'border-[#005FB8] bg-[#1F232B] shadow-sm'
                  : isPast
                  ? 'border-[#2A2D35] bg-[#16191E] hover:border-[#3A3F4B]'
                  : 'border-[#2A2D35]/50 bg-[#0D0F13]/40 opacity-50'
              }`}
            >
              {/* Step Header */}
              <div
                onClick={() => toggleStep(step.id)}
                className="p-2.5 flex items-center justify-between cursor-pointer select-none bg-[#1A1D23] hover:bg-[#1F232B] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded bg-[#0D0F13] border border-[#2A2D35]">
                    {getStepIcon(step.type)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#8E9299] font-semibold">
                      0{step.stepNumber}.
                    </span>
                    <span className="text-xs font-semibold text-[#E0E0E0]">
                      {step.title}
                    </span>
                  </div>

                  <span className={`px-2 py-0.2 rounded text-[9px] font-mono uppercase font-bold border ${getStepBadgeColor(step.type)}`}>
                    {step.type}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {step.tool && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-[#FFD700] bg-[#2b2413] px-2 py-0.5 rounded border border-[#59471b]">
                      <Cpu className="w-3 h-3 text-[#FFD700]" />
                      tool: {step.tool}
                    </span>
                  )}

                  <span className="text-[10px] font-mono text-[#8E9299] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {step.durationMs}ms
                  </span>

                  {step.status === 'completed' || step.status === 'verified' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50]" />
                  ) : isCurrent ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00BFFF] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#005FB8]"></span>
                    </span>
                  ) : null}

                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#8E9299]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#8E9299]" />
                  )}
                </div>
              </div>

              {/* Step Expanded Content */}
              {isExpanded && (
                <div className="p-3 border-t border-[#2A2D35] space-y-2.5 text-xs text-[#B0B5C0] bg-[#16191E]">
                  <p className="leading-relaxed whitespace-pre-wrap font-sans text-[#E0E0E0]">
                    {step.content}
                  </p>

                  {/* Tool Input Payload */}
                  {step.toolInput && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-[#FFD700] font-semibold uppercase flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-[#FFD700]" />
                        Tool Invocation Arguments:
                      </div>
                      <pre className="p-2.5 rounded bg-[#0D0F13] border border-[#2A2D35] font-mono text-[11px] text-[#FFD700]/90 overflow-x-auto">
                        {typeof step.toolInput === 'string'
                          ? step.toolInput
                          : JSON.stringify(step.toolInput, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Tool Output & Sandbox Observation */}
                  {step.toolOutput && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-[#4CAF50] font-semibold uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#4CAF50]" />
                        Sandbox Tool Observation:
                      </div>
                      <pre className="p-2.5 rounded bg-[#0D0F13] border border-[#234529] font-mono text-[11px] text-[#4CAF50] overflow-x-auto whitespace-pre-wrap">
                        {step.toolOutput}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

