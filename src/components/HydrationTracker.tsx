import { Droplet, Plus, Minus } from 'lucide-react';
import { ScheduleBlock } from '../types';

interface HydrationTrackerProps {
  schedule: ScheduleBlock[];
  currentOunces: number;
  onLogHydration: (amount: number) => void;
}

export function HydrationTracker({ schedule, currentOunces, onLogHydration }: HydrationTrackerProps) {
  // Calculate total supplements across all blocks
  const totalSupplements = schedule.reduce((acc, block) => acc + block.items.length, 0);
  
  // Base hydration: 64 oz (8 cups) + 4 oz per supplement to assist clearance and absorption
  const targetOunces = 64 + (totalSupplements * 4); 
  
  // Cap visual progress at 100%
  const progress = Math.min((currentOunces / targetOunces) * 100, 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-60" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-inner">
            <Droplet size={24} className="fill-blue-500/20" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-lg tracking-tight">Hydration Status</h3>
            <p className="text-xs text-slate-400 font-medium">Recommended: {targetOunces} oz based on {totalSupplements} daily supplements</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white tracking-tighter">{currentOunces}</span>
            <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">oz</span>
          </div>
          <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase mt-1">
            Target {targetOunces} oz
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative z-10 mb-6">
        <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) relative"
            style={{ width: `${progress}%` }}
          >
            {/* Subtle shimmer effect on the filled bar */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        <button 
          onClick={() => onLogHydration(8)}
          className="flex items-center justify-center gap-2 py-3 px-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-slate-200 transition-all active:scale-95 hover:border-blue-500/30 group/btn"
        >
          <Plus size={16} className="text-blue-400 transition-transform group-hover/btn:scale-110" />
          8 oz
        </button>
        <button 
          onClick={() => onLogHydration(12)}
          className="flex items-center justify-center gap-2 py-3 px-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-slate-200 transition-all active:scale-95 hover:border-blue-500/30 group/btn"
        >
          <Plus size={16} className="text-blue-400 transition-transform group-hover/btn:scale-110" />
          12 oz <span className="hidden sm:inline text-slate-500 font-normal">Can</span>
        </button>
        <button 
          onClick={() => onLogHydration(16)}
          className="flex items-center justify-center gap-2 py-3 px-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-slate-200 transition-all active:scale-95 hover:border-blue-500/30 group/btn"
        >
          <Plus size={16} className="text-blue-400 transition-transform group-hover/btn:scale-110" />
          16 oz
        </button>
        <div className="flex gap-2">
           <button 
            onClick={() => onLogHydration(32)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-sm font-semibold text-blue-300 transition-all active:scale-95 hover:border-blue-400/40 group/btn"
          >
            <Plus size={16} className="transition-transform group-hover/btn:scale-110" />
            32 oz
          </button>
          <button 
            onClick={() => onLogHydration(-8)}
            className="w-12 flex-shrink-0 flex items-center justify-center py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all active:scale-95"
            title="Remove 8 oz"
          >
            <Minus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
