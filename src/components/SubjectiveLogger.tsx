import { ReactNode } from 'react';
import { Smile, Zap, Moon } from 'lucide-react';
import { SubjectiveLog } from '../types';
import { cn } from '../lib/utils';

interface SubjectiveLoggerProps {
  todayLog: SubjectiveLog | undefined;
  onUpdate: (metric: keyof Omit<SubjectiveLog, 'date'>, value: number) => void;
}

export function SubjectiveLogger({ todayLog, onUpdate }: SubjectiveLoggerProps) {
  const renderScale = (metric: keyof Omit<SubjectiveLog, 'date'>, icon: ReactNode, label: string, activeColor: string) => {
    const currentValue = todayLog?.[metric] || 0;
    
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-28 shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
            {icon}
          </div>
          <span className="text-sm font-medium text-slate-300">{label}</span>
        </div>
        
        <div className="flex items-center gap-2 flex-1 justify-between">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              onClick={() => onUpdate(metric, val)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border",
                currentValue === val 
                  ? `${activeColor} border-transparent shadow-lg scale-110` 
                  : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
              )}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl shadow-indigo-900/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Daily Check-in</h2>
        <span className="text-xs text-slate-400">1 = Poor, 5 = Excellent</span>
      </div>
      
      <div className="space-y-4">
        {renderScale('mood', <Smile size={16} />, 'Mood', 'bg-amber-500 text-amber-50 shadow-amber-500/20')}
        {renderScale('energy', <Zap size={16} />, 'Energy', 'bg-emerald-500 text-emerald-50 shadow-emerald-500/20')}
        {renderScale('sleep', <Moon size={16} />, 'Sleep', 'bg-indigo-500 text-indigo-50 shadow-indigo-500/20')}
      </div>
    </div>
  );
}
