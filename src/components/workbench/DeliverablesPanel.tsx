import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  FileCode, 
  FileSpreadsheet, 
  Copy, 
  Printer, 
  FileCheck2
} from 'lucide-react';
import { Deliverable } from '../../types';
import { downloadDocxNote, downloadTextFile } from '../../utils/fileGenerators';
import { useTheme } from '../../context/ThemeContext';

interface DeliverablesPanelProps {
  deliverables: Deliverable[];
  onOpenAuditCert: () => void;
}

export const DeliverablesPanel: React.FC<DeliverablesPanelProps> = ({
  deliverables
}) => {
  const { theme } = useTheme();
  const [selectedDelivId, setSelectedDelivId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!deliverables || deliverables.length === 0) {
    return (
      <div className={`p-8 text-center rounded-xl border ${
        theme === 'dark'
          ? 'bg-[#14171E] border-[#282D37] text-[#94A3B8]'
          : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <FileText className="w-8 h-8 mx-auto text-[#64748B] mb-2" />
        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
          No deliverables generated yet.
        </p>
        <p className="text-xs text-[#94A3B8] mt-1">Run an agent scenario to generate documents and reports.</p>
      </div>
    );
  }

  const current = (selectedDelivId ? deliverables.find(d => d.id === selectedDelivId) : null) || deliverables[0];

  const handleDownload = (deliv: Deliverable) => {
    const refNo = deliv.meta?.refNo || 'MRPL/SOV/2026/001';
    const dept = deliv.meta?.department || 'TECHNICAL SERVICES';
    const fileName = deliv.fileName || 'deliverable.docx';
    const title = deliv.title || 'Technical Document';

    if (deliv.type === 'docx') {
      downloadDocxNote(
        fileName,
        title,
        deliv.content,
        refNo,
        dept
      );
    } else if (deliv.type === 'xlsx') {
      downloadTextFile(fileName, deliv.content, 'text/csv;charset=utf-8');
    } else if (deliv.type === 'py') {
      downloadTextFile(fileName, deliv.content, 'text/x-python;charset=utf-8');
    } else {
      downloadTextFile(fileName, deliv.content, 'text/plain;charset=utf-8');
    }
  };

  const handleCopy = () => {
    if (!current) return;
    navigator.clipboard.writeText(current.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'docx':
        return <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />;
      case 'xlsx':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-[#22C55E]" />;
      case 'py':
        return <FileCode className="w-3.5 h-3.5 text-[#FFD700]" />;
      default:
        return <FileCheck2 className="w-3.5 h-3.5 text-[#38BDF8]" />;
    }
  };

  return (
    <div className={`rounded-xl border overflow-hidden flex flex-col h-full shadow-sm font-sans transition-colors ${
      theme === 'dark'
        ? 'bg-[#181B22] border-[#282D37]'
        : 'bg-white border-slate-200'
    }`}>
      {/* Header bar */}
      <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-3 ${
        theme === 'dark' ? 'bg-[#14171E] border-[#282D37]' : 'bg-slate-50 border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Generated Deliverables
            </span>
            <span className={`px-2 py-0.5 text-[9px] font-mono font-semibold rounded border ${
              theme === 'dark'
                ? 'bg-[#1C222C] text-[#38BDF8] border-[#2B3545]'
                : 'bg-sky-50 text-sky-700 border-sky-200'
            }`}>
              {deliverables.length} Available
            </span>
          </div>
          <span className={`text-[10px] ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
            Audited with zero external network access
          </span>
        </div>

        {/* Deliverable selector pills */}
        <div className={`flex items-center gap-1 p-1 rounded-lg border ${
          theme === 'dark'
            ? 'bg-[#181B22] border-[#282D37]'
            : 'bg-white border-slate-200'
        }`}>
          {deliverables.map(deliv => (
            <button
              key={deliv.id}
              onClick={() => setSelectedDelivId(deliv.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                current.id === deliv.id
                  ? 'bg-[#0066CC] text-white shadow-sm font-bold'
                  : theme === 'dark'
                  ? 'text-[#94A3B8] hover:bg-[#1C222C] hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {getFileIcon(deliv.type)}
              <span className="truncate max-w-[130px]">{deliv.fileName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Meta Bar */}
      <div className={`px-3.5 py-2 border-b flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono ${
        theme === 'dark'
          ? 'bg-[#14171E] border-[#282D37] text-[#94A3B8]'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-3">
          <span>Ref: <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{current.meta?.refNo || 'MRPL/SOV/2026/001'}</strong></span>
          <span>Dept: <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{current.meta?.department || 'TECHNICAL SERVICES'}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className={`px-2 py-1 rounded text-[11px] border flex items-center gap-1 transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#1C222C] hover:bg-[#252D3A] text-white border-[#282D37]'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Copy content"
            >
              <Copy className="w-3 h-3 text-[#38BDF8]" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className={`px-2 py-1 rounded text-[11px] border flex items-center gap-1 transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#1C222C] hover:bg-[#252D3A] text-white border-[#282D37]'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Print official document"
            >
              <Printer className="w-3 h-3 text-[#94A3B8]" />
              <span>Print</span>
            </button>

            <button
              onClick={() => handleDownload(current)}
              className="px-3 py-1 rounded bg-[#0066CC] hover:bg-[#0077EE] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Download {current.type.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deliverable Content Body */}
      <div className={`p-4 flex-1 overflow-y-auto ${
        theme === 'dark' ? 'bg-[#0B0D11]' : 'bg-slate-100'
      }`}>
        <div className="max-w-4xl mx-auto">
          {current.type === 'docx' ? (
            /* Document Layout */
            <div className={`border rounded-xl p-5 shadow-sm space-y-4 font-sans text-xs ${
              theme === 'dark'
                ? 'bg-[#14171E] border-[#282D37]'
                : 'bg-white border-slate-300'
            }`}>
              <div className={`text-center border-b pb-3 ${
                theme === 'dark' ? 'border-[#282D37]' : 'border-slate-200'
              }`}>
                <h2 className={`text-sm font-extrabold tracking-wide ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  MANGALORE REFINERY AND PETROCHEMICALS LIMITED
                </h2>
                <p className={`text-[11px] mt-0.5 ${
                  theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'
                }`}>
                  (A Subsidiary of Oil and Natural Gas Corporation Limited - ONGC)
                </p>
                <div className={`mt-2 inline-block px-3 py-0.5 border text-[10px] font-bold font-mono rounded ${
                  theme === 'dark'
                    ? 'bg-[#1C222C] border-[#282D37] text-[#38BDF8]'
                    : 'bg-sky-50 border-sky-200 text-sky-800'
                }`}>
                  INTERNAL ADMINISTRATIVE APPROVAL NOTE SHEET
                </div>
              </div>

              <div className={`font-mono text-[11px] p-3.5 rounded-lg border whitespace-pre-wrap leading-relaxed ${
                theme === 'dark'
                  ? 'bg-[#0B0D11] border-[#282D37] text-[#CBD5E1]'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {current.content}
              </div>
            </div>
          ) : current.type === 'xlsx' ? (
            /* CSV / Spreadsheet View */
            <div className={`border rounded-xl p-4 shadow-sm space-y-2.5 ${
              theme === 'dark'
                ? 'bg-[#14171E] border-[#282D37]'
                : 'bg-white border-slate-300'
            }`}>
              <div className={`flex items-center justify-between pb-2 border-b ${
                theme === 'dark' ? 'border-[#282D37]' : 'border-slate-200'
              }`}>
                <span className="font-semibold text-[#22C55E] text-xs">
                  {current.title}
                </span>
                <span className={`text-[10px] font-mono ${
                  theme === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'
                }`}>
                  Qwen2.5-32B + Python openpyxl
                </span>
              </div>
              <div className="overflow-x-auto">
                <pre className={`p-3 rounded-lg border font-mono text-[11px] whitespace-pre ${
                  theme === 'dark'
                    ? 'bg-[#0B0D11] border-[#282D37] text-[#22C55E]'
                    : 'bg-slate-900 border-slate-700 text-emerald-400'
                }`}>
                  {current.content}
                </pre>
              </div>
            </div>
          ) : current.type === 'py' ? (
            /* Python Code File View */
            <div className={`border rounded-xl p-4 shadow-sm space-y-2.5 ${
              theme === 'dark'
                ? 'bg-[#14171E] border-[#282D37]'
                : 'bg-white border-slate-300'
            }`}>
              <div className={`flex items-center justify-between pb-2 border-b ${
                theme === 'dark' ? 'border-[#282D37]' : 'border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span className={`font-mono font-semibold text-xs ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {current.fileName}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-[#2b2413] text-[#FFD700] border border-[#59471b] rounded text-[10px] font-mono">
                  Python 3.11 Sandboxed
                </span>
              </div>
              <pre className="p-3.5 bg-[#0B0D11] rounded-lg border border-[#282D37] font-mono text-[11px] text-[#FFD700]/90 overflow-x-auto leading-relaxed">
                {current.content}
              </pre>
            </div>
          ) : (
            /* Standard Report / TXT View */
            <div className={`border rounded-xl p-4 shadow-sm space-y-2.5 ${
              theme === 'dark'
                ? 'bg-[#14171E] border-[#282D37]'
                : 'bg-white border-slate-300'
            }`}>
              <pre className={`p-3.5 rounded-lg border font-mono text-[11px] whitespace-pre-wrap leading-relaxed ${
                theme === 'dark'
                  ? 'bg-[#0B0D11] border-[#282D37] text-[#CBD5E1]'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {current.content}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

