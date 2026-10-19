import { useState } from 'react';
import { Sparkles, Loader2, ArrowRight, CheckCircle2, Target } from 'lucide-react';
import { HistoryRecord, SubjectiveHistory, WeeklyReport } from '../types';
import { cn } from '../lib/utils';

interface WeeklyReportViewerProps {
  vitaminHistory: HistoryRecord;
  subjectiveHistory: SubjectiveHistory;
}

export function WeeklyReportViewer({ vitaminHistory, subjectiveHistory }: WeeklyReportViewerProps) {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get last 7 days of data
      const vitaminData: Record<string, any> = {};
      const subjectiveData: Record<string, any> = {};
      
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        vitaminData[dateStr] = vitaminHistory[dateStr] || {};
        subjectiveData[dateStr] = subjectiveHistory[dateStr] || null;
      }

      const response = await fetch('/api/generate-weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vitaminData, subjectiveData })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!report) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl shadow-indigo-900/10 h-full flex flex-col justify-center items-center text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
          <Sparkles className="text-white" size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">Weekly AI Synthesis</h3>
        <p className="text-sm text-slate-400 max-w-sm mb-8 leading-relaxed">
          Generate a comprehensive, personalized analysis of how your habits this week impacted your overall wellness.
        </p>
        
        <button
          onClick={generateReport}
          disabled={isLoading}
          className="bg-white text-indigo-950 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analyzing Data...
            </>
          ) : (
            <>
              Generate Report
              <ArrowRight size={18} />
            </>
          )}
        </button>
        {error && <p className="text-rose-400 text-sm mt-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl shadow-indigo-900/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <h3 className="font-semibold text-slate-100">AI Synthesis</h3>
        </div>
        <button onClick={generateReport} disabled={isLoading} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
          {isLoading ? 'Updating...' : 'Regenerate'}
        </button>
      </div>

      <div className="space-y-6 relative z-10">
        <div>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {report.summary}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
              <CheckCircle2 size={14} /> Highlights
            </h4>
            <ul className="space-y-2">
              {report.highlights.map((item, idx) => (
                <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400/50 mt-1">•</span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2">
              <Target size={14} /> Focus Areas
            </h4>
            <ul className="space-y-2">
              {report.improvements.map((item, idx) => (
                <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400/50 mt-1">•</span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5 text-indigo-400">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200 mb-1">Actionable Advice</h4>
            <p className="text-sm text-slate-400 leading-relaxed">{report.actionableAdvice}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
