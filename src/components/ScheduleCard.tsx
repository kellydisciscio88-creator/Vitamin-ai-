import { Sunrise, Sun, SunMedium, Utensils, Moon, CheckCircle2, Clock, Bell, Plus, Settings2, Coffee, Dumbbell, Sparkles } from 'lucide-react';
import { ScheduleBlock, Supplement } from '../types';
import { SupplementItem } from './SupplementItem';
import { cn } from '../lib/utils';

const ICONS: Record<string, any> = {
  Sunrise: Sunrise,
  Sun: Sun,
  SunMedium: SunMedium,
  Utensils: Utensils,
  Moon: Moon,
  Coffee: Coffee,
  Dumbbell: Dumbbell,
  Sparkles: Sparkles,
};

interface ScheduleCardProps {
  key?: string | number;
  block: ScheduleBlock;
  dailyRecord: Record<string, boolean>;
  onToggleItem: (id: string) => void;
  onUpdateBlock?: (id: string, updates: Partial<ScheduleBlock>) => void;
  onAddItem?: (blockId: string) => void;
  onEditItem?: (blockId: string, item: Supplement) => void;
  onDeleteItem?: (blockId: string, itemId: string) => void;
  onEditBlockModal?: (block: ScheduleBlock) => void;
}

export function ScheduleCard({
  block,
  dailyRecord,
  onToggleItem,
  onUpdateBlock,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onEditBlockModal
}: ScheduleCardProps) {
  const Icon = ICONS[block.iconName] || CheckCircle2;
  
  const completedCount = block.items.filter(item => dailyRecord[item.id]).length;
  const isFullyCompleted = completedCount === block.items.length && block.items.length > 0;

  return (
    <div className="mb-8 last:mb-0 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl shadow-indigo-900/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors shrink-0",
            isFullyCompleted ? "bg-emerald-500/20 text-emerald-400 shadow-emerald-500/10" : "bg-indigo-500/20 text-indigo-400 shadow-indigo-500/10"
          )}>
            <Icon size={24} strokeWidth={2} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-xl text-slate-100 tracking-tight">{block.title}</h3>
              
              {block.mealTime && onUpdateBlock && (
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-md px-2 py-1 ml-1">
                  <Clock size={12} className="text-slate-400" />
                  <input 
                    type="time" 
                    value={block.mealTime}
                    onChange={(e) => onUpdateBlock(block.id, { mealTime: e.target.value })}
                    className="bg-transparent text-xs text-slate-300 font-medium outline-none w-[65px] [&::-webkit-calendar-picker-indicator]:invert-[0.6]"
                  />
                </div>
              )}
              {block.prepTimeMinutes !== undefined && onUpdateBlock && (
                <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md px-2 py-1 text-indigo-300">
                  <Bell size={12} />
                  <select 
                    value={block.prepTimeMinutes}
                    onChange={(e) => onUpdateBlock(block.id, { prepTimeMinutes: Number(e.target.value) })}
                    className="bg-transparent text-xs font-medium outline-none appearance-none cursor-pointer pr-1"
                  >
                    <option value={5} className="bg-slate-800 text-slate-200">5m prep</option>
                    <option value={15} className="bg-slate-800 text-slate-200">15m prep</option>
                    <option value={20} className="bg-slate-800 text-slate-200">20m prep</option>
                    <option value={30} className="bg-slate-800 text-slate-200">30m prep</option>
                    <option value={45} className="bg-slate-800 text-slate-200">45m prep</option>
                    <option value={60} className="bg-slate-800 text-slate-200">60m prep</option>
                  </select>
                </div>
              )}
              
              {onEditBlockModal && (
                <button
                  type="button"
                  onClick={() => onEditBlockModal(block)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
                  title="Configure Block Timing & Settings"
                >
                  <Settings2 size={15} />
                </button>
              )}
            </div>

            {block.instructions && (
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">{block.instructions}</p>
            )}
            {(block.mealSuggestion || block.fastingNote) && (
              <div className="mt-2 space-y-1">
                {block.mealSuggestion && (
                  <p className="text-xs text-emerald-400/90 font-medium">
                    <span className="opacity-70">🍽️ Meal:</span> {block.mealSuggestion}
                  </p>
                )}
                {block.fastingNote && (
                  <p className="text-xs text-indigo-400/90 font-medium">
                    <span className="opacity-70">⏳ Fasting:</span> {block.fastingNote}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="text-xs font-semibold bg-white/5 text-slate-300 px-3.5 py-1.5 rounded-full border border-white/10 shrink-0 text-center">
            {block.items.length - completedCount} Pending
          </div>

          {onAddItem && (
            <button
              type="button"
              onClick={() => onAddItem(block.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold transition-colors"
            >
              <Plus size={13} />
              <span>Add Vitamin</span>
            </button>
          )}
        </div>
      </div>

      {block.items.length === 0 ? (
        <div className="text-center py-8 px-4 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <p className="text-sm text-slate-400 font-medium">No vitamins added to this block yet.</p>
          {onAddItem && (
            <button
              onClick={() => onAddItem(block.id)}
              className="mt-3 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Add First Supplement
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {block.items.map(item => (
            <SupplementItem 
              key={item.id}
              item={item}
              isCompleted={!!dailyRecord[item.id]}
              onToggle={onToggleItem}
              onEdit={onEditItem ? (it) => onEditItem(block.id, it) : undefined}
              onDelete={onDeleteItem ? (itemId) => onDeleteItem(block.id, itemId) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
