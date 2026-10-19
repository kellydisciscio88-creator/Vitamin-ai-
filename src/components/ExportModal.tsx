import { useState } from 'react';
import { 
  X, 
  FileArchive, 
  Copy, 
  Check, 
  Download, 
  Bot, 
  Sparkles, 
  Code2, 
  BookOpen, 
  FileText, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { ScheduleBlock, UserProfile } from '../types';
import { 
  createChatGPTZipBlob, 
  triggerDownloadBlob, 
  generatePromptText, 
  downloadFromUrl 
} from '../lib/exportToZip';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: UserProfile;
  schedule: ScheduleBlock[];
  allProfiles: UserProfile[];
}

export function ExportModal({
  isOpen,
  onClose,
  activeProfile,
  schedule,
  allProfiles,
}: ExportModalProps) {
  const [isGeneratingPacket, setIsGeneratingPacket] = useState(false);
  const [isDownloadingCodebase, setIsDownloadingCodebase] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'packet' | 'codebase' | 'preview'>('packet');

  if (!isOpen) return null;

  const totalSupplements = schedule.reduce((acc, b) => acc + b.items.length, 0);
  const safeName = (activeProfile.name || 'my-stack').toLowerCase().replace(/\s+/g, '-');
  const packetFileName = `vitality-chatgpt-${safeName}-stack.zip`;

  const handleDownloadPacket = async () => {
    setIsGeneratingPacket(true);
    setDownloadSuccess(null);
    try {
      const blob = await createChatGPTZipBlob(activeProfile, schedule, allProfiles);
      const ok = triggerDownloadBlob(blob, packetFileName);
      if (ok) {
        setDownloadSuccess('ZIP download started! Check your downloads folder.');
      } else {
        downloadFromUrl('/vitality-chatgpt-packet.zip', packetFileName);
        setDownloadSuccess('ZIP downloaded via direct server connection.');
      }
    } catch (err) {
      console.warn('Failed to generate client-side zip, downloading from server:', err);
      downloadFromUrl('/vitality-chatgpt-packet.zip', packetFileName);
      setDownloadSuccess('ZIP downloaded via direct server connection.');
    } finally {
      setIsGeneratingPacket(false);
      setTimeout(() => setDownloadSuccess(null), 6000);
    }
  };

  const handleDownloadMarkdownOnly = () => {
    const text = generatePromptText(activeProfile, schedule);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    triggerDownloadBlob(blob, `vitality-chatgpt-${safeName}-protocol.md`);
    setDownloadSuccess('Markdown file downloaded! Drag into ChatGPT.');
    setTimeout(() => setDownloadSuccess(null), 6000);
  };

  const handleDownloadCodebase = async () => {
    setIsDownloadingCodebase(true);
    setDownloadSuccess(null);
    try {
      const res = await fetch('/api/export/codebase');
      if (res.ok) {
        const blob = await res.blob();
        triggerDownloadBlob(blob, 'vitality-codebase.zip');
        setDownloadSuccess('Codebase ZIP downloaded!');
      } else {
        downloadFromUrl('/vitality-codebase.zip', 'vitality-codebase.zip');
        setDownloadSuccess('Codebase ZIP downloaded via direct link!');
      }
    } catch (err) {
      console.warn('Failed to download codebase blob:', err);
      downloadFromUrl('/vitality-codebase.zip', 'vitality-codebase.zip');
      setDownloadSuccess('Codebase ZIP downloaded via direct link!');
    } finally {
      setIsDownloadingCodebase(false);
      setTimeout(() => setDownloadSuccess(null), 6000);
    }
  };

  const handleCopyPrompt = async () => {
    const text = generatePromptText(activeProfile, schedule);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const previewPrompt = generatePromptText(activeProfile, schedule);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0b1329] border-b border-white/10 p-5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <FileArchive size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Share with ChatGPT
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  .ZIP Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Export personalized stack for <strong className="text-indigo-300">{activeProfile.name}</strong> ({totalSupplements} items)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center border-b border-white/5 px-6 bg-[#0f172a]/60 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setActiveTab('packet')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'packet'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Bot size={14} />
            ChatGPT Health Packet (.zip)
          </button>
          <button
            onClick={() => setActiveTab('codebase')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'codebase'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Code2 size={14} />
            Full App Codebase (.zip)
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <BookOpen size={14} />
            View Full Prompt Text
          </button>
        </div>

        {/* Download Success Banner */}
        {downloadSuccess && (
          <div className="bg-emerald-950/60 border-b border-emerald-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
            <button 
              onClick={() => setDownloadSuccess(null)}
              className="text-emerald-400 hover:text-emerald-200"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'packet' && (
            <div className="space-y-4">
              <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-4 text-xs text-indigo-200 leading-relaxed flex items-start gap-3">
                <Sparkles size={20} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-1">Tailored for ChatGPT Code Interpreter & Clinical Analysis</p>
                  <p className="text-slate-300">
                    This archive packages your exact daily vitamin schedule, doses, personal sensitivities, and circadian timing blocks into formatted Markdown and JSON, paired with an expert clinical nutritionist consultation prompt.
                  </p>
                </div>
              </div>

              {/* What's inside box */}
              <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Included Files Inside ZIP:</p>
                <ul className="text-xs space-y-1.5 text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <strong className="text-white">PROMPT_TO_PASTE_IN_CHATGPT.txt</strong> - Clinical prompt asking ChatGPT to detect nutrient clashes & timing errors.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    <strong className="text-white">CURRENT_VITAMIN_SCHEDULE.md</strong> - Clean tables of Morning, Breakfast, Lunch, Dinner, and Bedtime supplements.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <strong className="text-white">PERSONAL_HEALTH_PROFILE.md</strong> - Age, dietary goals, sensitivities for {activeProfile.name}.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <strong className="text-white">ALL_DATA.json</strong> - Machine-readable JSON for ChatGPT data analysis.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    <strong className="text-white">VITAMIN_CLASHES_AND_SYNERGIES_REFERENCE.md</strong> - Divalent cations, fat solubility, and coffee blocking rules.
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownloadPacket}
                  disabled={isGeneratingPacket}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <Download size={18} />
                  {isGeneratingPacket ? 'Generating ZIP...' : 'Download ChatGPT Packet (.zip)'}
                </button>

                <button
                  onClick={handleCopyPrompt}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-100 font-semibold text-sm border border-white/15 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  {copiedPrompt ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                  {copiedPrompt ? 'Copied Full Prompt!' : 'Copy Entire Text for ChatGPT'}
                </button>
              </div>

              {/* Alternative Fallback Options */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  Direct backup links:
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href="/vitality-chatgpt-packet.zip"
                    download="vitality-chatgpt-packet.zip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 flex items-center gap-1 font-medium"
                  >
                    Direct ZIP Link <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={handleDownloadMarkdownOnly}
                    className="text-slate-300 hover:text-white underline underline-offset-4 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    Single Markdown (.md) <FileText size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'codebase' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
                <Code2 size={20} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-1">Full Application Codebase</p>
                  <p>
                    Download a clean zip archive containing the entire React 19 + TypeScript + Express + Cloud SQL + Tailwind CSS source code, ready to share with ChatGPT to ask for code modifications, bug fixes, or architecture audits.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-4 text-xs space-y-2">
                <p className="font-bold text-slate-300">Codebase Specs:</p>
                <p className="text-slate-400">• Includes: /src, server.ts, DB schemas, types, configuration, index.html</p>
                <p className="text-slate-400">• Cleaned: Excludes bloated node_modules and temporary build artifacts</p>
                <p className="text-slate-400">• Ready to drop directly into ChatGPT Code Interpreter or Canvas</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownloadCodebase}
                  disabled={isDownloadingCodebase}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <Download size={18} />
                  {isDownloadingCodebase ? 'Downloading...' : 'Download Codebase (.zip)'}
                </button>

                <a
                  href="/vitality-codebase.zip"
                  download="vitality-codebase.zip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-100 font-semibold text-sm border border-white/15 transition-all hover:scale-[1.01]"
                >
                  <ExternalLink size={18} />
                  Direct Codebase Link (.zip)
                </a>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Pre-generated ChatGPT prompt for {activeProfile.name}:</span>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  {copiedPrompt ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedPrompt ? 'Copied Full Prompt!' : 'Copy to Clipboard'}
                </button>
              </div>

              <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 max-h-[300px] overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap select-all">
                {previewPrompt}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0b1329] border-t border-white/10 p-4 px-6 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-time data synced for <strong>{activeProfile.name}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
