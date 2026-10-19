import { HealthInsight } from '../types';
import { FileText, Calendar, AlertCircle, ArrowUp, ArrowDown, Activity, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function HealthInsightsViewer({ insights }: { insights: HealthInsight[] }) {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black tracking-tight text-slate-100">Lab History & Insights</h2>
      
      {insights.map((insight) => (
        <div key={insight.id} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl shadow-indigo-900/10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-100">{insight.fileName}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <Calendar size={12} />
                  <span>{new Date(insight.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <p className="text-sm text-slate-300 leading-relaxed">
              {insight.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Biomarkers */}
            {insight.keyMarkers && insight.keyMarkers.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                  <Activity size={16} className="text-emerald-400" />
                  Key Biomarkers
                </h4>
                <div className="space-y-2">
                  {insight.keyMarkers.map((marker, idx) => (
                    <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                      <span className="text-sm text-slate-300">{marker.markerName}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-100">{marker.value}</span>
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold",
                          marker.status.toLowerCase().includes('high') ? "bg-rose-500/20 text-rose-400" :
                          marker.status.toLowerCase().includes('low') ? "bg-amber-500/20 text-amber-400" :
                          "bg-emerald-500/20 text-emerald-400"
                        )}>
                          {marker.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {insight.recommendations && insight.recommendations.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                  <CheckCircle size={16} className="text-indigo-400" />
                  Action Plan
                </h4>
                <div className="space-y-3">
                  {insight.recommendations.map((rec, idx) => {
                    const actionLower = rec.action.toLowerCase();
                    const isAdd = actionLower.includes('add') || actionLower.includes('increase');
                    const isStop = actionLower.includes('stop') || actionLower.includes('decrease') || actionLower.includes('remove');
                    
                    return (
                      <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                            isAdd ? "bg-emerald-500/20 text-emerald-400" : 
                            isStop ? "bg-rose-500/20 text-rose-400" : 
                            "bg-indigo-500/20 text-indigo-400"
                          )}>
                            {isAdd ? <ArrowUp size={14} strokeWidth={3} /> : 
                             isStop ? <ArrowDown size={14} strokeWidth={3} /> : 
                             <Activity size={14} />}
                          </div>
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-semibold text-slate-100 text-sm">{rec.action}:</span>
                              <span className="text-sm font-medium text-slate-300">{rec.supplement}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-snug">{rec.reason}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex items-start gap-2">
            <AlertCircle size={14} className="text-amber-400/50 mt-0.5 shrink-0" />
            <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
              {insight.disclaimer || "Disclaimer: This analysis is generated by an AI and does not constitute medical advice. Please consult with your healthcare provider before making any changes to your supplement regimen."}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
