import { useState, useEffect, FormEvent } from 'react';
import { X, Clock, Bell, Trash2, Sun, Moon, Sunrise, Utensils, Sparkles, Dumbbell, Coffee, SunMedium } from 'lucide-react';
import { ScheduleBlock } from '../types';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockToEdit?: ScheduleBlock | null;
  onSave: (block: ScheduleBlock) => void;
  onDelete?: (blockId: string) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Sunrise', label: 'Waking / Dawn', icon: Sunrise },
  { name: 'Sun', label: 'Morning', icon: Sun },
  { name: 'SunMedium', label: 'Mid-Day', icon: SunMedium },
  { name: 'Utensils', label: 'Meal Time', icon: Utensils },
  { name: 'Coffee', label: 'Snack / Break', icon: Coffee },
  { name: 'Dumbbell', label: 'Workout', icon: Dumbbell },
  { name: 'Moon', label: 'Bedtime', icon: Moon },
  { name: 'Sparkles', label: 'Special / Biohack', icon: Sparkles },
];

export function BlockModal({ isOpen, onClose, blockToEdit, onSave, onDelete }: BlockModalProps) {
  const [title, setTitle] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [iconName, setIconName] = useState('Sun');
  const [mealTime, setMealTime] = useState('10:00');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(15);
  const [instructions, setInstructions] = useState('');
  const [mealSuggestion, setMealSuggestion] = useState('');
  const [fastingNote, setFastingNote] = useState('');

  useEffect(() => {
    if (blockToEdit) {
      setTitle(blockToEdit.title || '');
      setTimeOfDay(blockToEdit.timeOfDay || 'Morning');
      setIconName(blockToEdit.iconName || 'Sun');
      setMealTime(blockToEdit.mealTime || '10:00');
      setPrepTimeMinutes(blockToEdit.prepTimeMinutes ?? 15);
      setInstructions(blockToEdit.instructions || '');
      setMealSuggestion(blockToEdit.mealSuggestion || '');
      setFastingNote(blockToEdit.fastingNote || '');
    } else {
      setTitle('');
      setTimeOfDay('Morning');
      setIconName('Sun');
      setMealTime('10:00');
      setPrepTimeMinutes(15);
      setInstructions('Take with water or light snack');
      setMealSuggestion('');
      setFastingNote('');
    }
  }, [blockToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const blockId = blockToEdit?.id || `block-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

    const newBlock: ScheduleBlock = {
      id: blockId,
      title: title.trim(),
      timeOfDay,
      iconName,
      mealTime,
      prepTimeMinutes,
      instructions: instructions.trim() || undefined,
      mealSuggestion: mealSuggestion.trim() || undefined,
      fastingNote: fastingNote.trim() || undefined,
      items: blockToEdit?.items || [],
    };

    onSave(newBlock);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                {blockToEdit ? 'Edit Timing Block' : 'Add New Timing Block'}
              </h2>
              <p className="text-xs text-slate-400">Organize your supplements into spaced intervals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Block Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. MID-MORNING, PRE-WORKOUT, or EVENING TEA"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock size={12} className="text-amber-400" />
                Scheduled Time
              </label>
              <input
                type="time"
                value={mealTime}
                onChange={e => setMealTime(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Bell size={12} className="text-indigo-400" />
                Prep Alert
              </label>
              <select
                value={prepTimeMinutes}
                onChange={e => setPrepTimeMinutes(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value={5}>5 min alert</option>
                <option value={15}>15 min alert</option>
                <option value={30}>30 min alert</option>
                <option value={45}>45 min alert</option>
                <option value={60}>60 min alert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map(i => {
                const IconComponent = i.icon;
                const isSelected = iconName === i.name;
                return (
                  <button
                    key={i.name}
                    type="button"
                    onClick={() => setIconName(i.name)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <IconComponent size={18} />
                    <span className="text-[10px] mt-1 font-medium truncate max-w-full">{i.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              General Instructions
            </label>
            <input
              type="text"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. Empty Stomach, or Take with dense meal"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Suggested Meal / Food
              </label>
              <input
                type="text"
                value={mealSuggestion}
                onChange={e => setMealSuggestion(e.target.value)}
                placeholder="e.g. Eggs, avocado, spinach"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Fasting Window Note
              </label>
              <input
                type="text"
                value={fastingNote}
                onChange={e => setFastingNote(e.target.value)}
                placeholder="e.g. Water & black coffee only"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {blockToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete the "${blockToEdit.title}" timing block and all its items?`)) {
                    onDelete(blockToEdit.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-1.5 border border-rose-500/20"
              >
                <Trash2 size={14} /> Delete Block
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-bold shadow-lg shadow-amber-500/25 transition-all"
              >
                {blockToEdit ? 'Save Block' : 'Create Block'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
