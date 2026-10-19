import { useState, useEffect, FormEvent } from 'react';
import { X, User, Heart, ShieldAlert, Sparkles, Check, Clock, Scale } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
}

const COMMON_GOALS = [
  'Mitochondrial Energy',
  'Deep REM Sleep',
  'Cognitive Focus & Memory',
  'Histamine Tolerance',
  'Methylation Support',
  'Gut Barrier Repair',
  'Anti-Aging & Longevity',
  'Athletic Recovery',
  'Hormonal Optimization',
  'Immune Resilience',
  'Cardiovascular Health'
];

const COMMON_CONDITIONS = [
  'MTHFR Gene Polymorphism',
  'Histamine Intolerance',
  'Slow COMT / Catecholamine Sensitivity',
  'Caffeine Sensitive',
  'Sensitive Stomach / GERD',
  'Gluten / Celiac Sensitive',
  'Dairy / Lactose Sensitive',
  'High Blood Pressure',
  'Sulfa / Sulfur Sensitivity'
];

const DIETS = [
  'Omnivore',
  'Ketogenic',
  'Intermittent Fasting (16:8)',
  'Low-Histamine',
  'Mediterranean',
  'Paleo',
  'Plant-Based / Vegan',
  'Low-FODMAP',
  'Carnivore'
];

export function ProfileModal({ isOpen, onClose, profile, onSave }: ProfileModalProps) {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [customGoal, setCustomGoal] = useState('');
  const [customCondition, setCustomCondition] = useState('');

  useEffect(() => {
    setFormData(profile);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const toggleGoal = (goal: string) => {
    setFormData(prev => {
      const current = prev.healthGoals || [];
      const updated = current.includes(goal)
        ? current.filter(g => g !== goal)
        : [...current, goal];
      return { ...prev, healthGoals: updated };
    });
  };

  const addCustomGoal = (e: FormEvent) => {
    e.preventDefault();
    if (!customGoal.trim()) return;
    if (!formData.healthGoals.includes(customGoal.trim())) {
      setFormData(prev => ({ ...prev, healthGoals: [...prev.healthGoals, customGoal.trim()] }));
    }
    setCustomGoal('');
  };

  const toggleCondition = (cond: string) => {
    setFormData(prev => {
      const current = prev.healthConditions || [];
      const updated = current.includes(cond)
        ? current.filter(c => c !== cond)
        : [...current, cond];
      return { ...prev, healthConditions: updated };
    });
  };

  const addCustomCondition = (e: FormEvent) => {
    e.preventDefault();
    if (!customCondition.trim()) return;
    if (!formData.healthConditions.includes(customCondition.trim())) {
      setFormData(prev => ({ ...prev, healthConditions: [...prev.healthConditions, customCondition.trim()] }));
    }
    setCustomCondition('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Personal Information & Profile</h2>
              <p className="text-xs text-slate-400">Customizes dosage, warnings, and AI recommendations for this individual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Identity & Basic Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name or Individual Identifier *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Cory, Taylen, or Kelly"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={formData.age || ''}
                onChange={e => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="e.g. 10 or 38"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Biological Sex / Gender
              </label>
              <select
                value={formData.gender || ''}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Select (optional)</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Non-Binary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Weight & Height
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.weight || ''}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g. 145 lbs / 65 kg"
                  className="bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={formData.height || ''}
                  onChange={e => setFormData({ ...formData, height: e.target.value })}
                  placeholder="e.g. 5'8&quot; / 172 cm"
                  className="bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Diet & Circadian */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Dietary Pattern
              </label>
              <select
                value={formData.dietaryPreference || 'Omnivore'}
                onChange={e => setFormData({ ...formData, dietaryPreference: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {DIETS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock size={12} className="text-amber-400" />
                Wake Time
              </label>
              <input
                type="time"
                value={formData.wakeTime || '07:00'}
                onChange={e => setFormData({ ...formData, wakeTime: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock size={12} className="text-indigo-400" />
                Target Bedtime
              </label>
              <input
                type="time"
                value={formData.bedTime || '22:30'}
                onChange={e => setFormData({ ...formData, bedTime: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Primary Health & Longevity Goals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Heart size={14} className="text-rose-400" />
                Primary Health & Longevity Goals
              </label>
              <span className="text-[11px] text-slate-500">Tap to toggle</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_GOALS.map(goal => {
                const isSelected = (formData.healthGoals || []).includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-sm shadow-rose-500/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {isSelected && <Check size={12} className="inline mr-1 stroke-[3]" />}
                    {goal}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customGoal}
                onChange={e => setCustomGoal(e.target.value)}
                placeholder="Add other custom goal..."
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={addCustomGoal}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 rounded-xl transition-colors"
              >
                Add Goal
              </button>
            </div>
          </div>

          {/* Health Conditions, Genetics & Allergies */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-amber-400" />
                Health Conditions, Sensitivities & Genetics
              </label>
              <span className="text-[11px] text-slate-500">Crucial for AI safety checks</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_CONDITIONS.map(cond => {
                const isSelected = (formData.healthConditions || []).includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {isSelected && <Check size={12} className="inline mr-1 stroke-[3]" />}
                    {cond}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customCondition}
                onChange={e => setCustomCondition(e.target.value)}
                placeholder="Add allergy, polymorphism, or condition..."
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={addCustomCondition}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 rounded-xl transition-colors"
              >
                Add Condition
              </button>
            </div>
          </div>

          {/* Special Notes / Context */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-400" />
              Special Notes / Biohacker Context
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Experiences brain fog in the afternoon; prefers liquid or powder over large pills; intermittent fasting on weekdays."
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all"
            >
              Save Personal Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
