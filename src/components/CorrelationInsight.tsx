import { Zap, AlertCircle } from 'lucide-react';
import { HistoryRecord, SubjectiveHistory, ScheduleBlock } from '../types';
import { getTotalSupplements } from '../data';

interface CorrelationInsightProps {
  schedule: ScheduleBlock[];
  vitaminHistory: HistoryRecord;
  subjectiveHistory: SubjectiveHistory;
}

export function CorrelationInsight({ schedule, vitaminHistory, subjectiveHistory }: CorrelationInsightProps) {
  let highAdherenceEnergy = 0;
  let highAdherenceCount = 0;
  let lowAdherenceEnergy = 0;
  let lowAdherenceCount = 0;

  const total = getTotalSupplements(schedule);

  // Process the last 14 days
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayRecord = vitaminHistory[dateStr] || {};
    const completed = Object.keys(dayRecord).filter(k => dayRecord[k]).length;
    const adherence = total > 0 ? (completed / total) : 0;
    
    const subLog = subjectiveHistory[dateStr];
    
    // Only count days where they actually logged energy
    if (subLog && subLog.energy > 0) {
      if (adherence >= 0.7) {
        highAdherenceEnergy += subLog.energy;
        highAdherenceCount++;
      } else {
        lowAdherenceEnergy += subLog.energy;
        lowAdherenceCount++;
      }
    }
  }

  const avgHigh = highAdherenceCount > 0 ? (highAdherenceEnergy / highAdherenceCount).toFixed(1) : null;
  const avgLow = lowAdherenceCount > 0 ? (lowAdherenceEnergy / lowAdherenceCount).toFixed(1) : null;

  return (
    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-indigo-500/30 p-6 shadow-2xl shadow-indigo-900/20 h-full flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <Zap size={20} />
        </div>
        <h3 className="font-semibold text-slate-100">Data Insight</h3>
      </div>
      
      {avgHigh && avgLow ? (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Over the last 14 days, your energy levels are significantly impacted by your protocol adherence.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-xs text-slate-400 mb-1">High Adherence</p>
              <p className="text-2xl font-black text-emerald-400">{avgHigh} <span className="text-sm font-normal text-slate-500">/ 5</span></p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-xs text-slate-400 mb-1">Low Adherence</p>
              <p className="text-2xl font-black text-amber-400">{avgLow} <span className="text-sm font-normal text-slate-500">/ 5</span></p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 mt-2">
          <AlertCircle size={16} className="text-indigo-400 mt-1 shrink-0" />
          <p className="text-sm text-slate-400 leading-relaxed">
            Keep logging your vitamins and daily energy levels. We need a few more days of data to uncover meaningful correlations.
          </p>
        </div>
      )}
    </div>
  );
}
