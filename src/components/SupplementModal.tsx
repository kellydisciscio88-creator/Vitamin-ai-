import { useState, useEffect, FormEvent } from 'react';
import { X, Pill, AlertCircle, Sparkles, Plus, Trash2, Check } from 'lucide-react';
import { Supplement, ScheduleBlock } from '../types';

interface SupplementModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: ScheduleBlock[];
  initialBlockId?: string;
  supplementToEdit?: Supplement | null;
  onSave: (blockId: string, supplement: Supplement) => void;
  onDelete?: (blockId: string, supplementId: string) => void;
}

const COMMON_SUPPLEMENT_PRESETS = [
  { name: 'Magnesium Glycinate', dosage: '200–400 mg', defaultBlock: 'bedtime', benefits: 'Promotes deep sleep, muscle relaxation, and nervous system recovery.', notes: 'Best taken 30-60 min before sleep', pairings: 'Vitamin B6, Taurine' },
  { name: 'Creatine Monohydrate', dosage: '5 g', defaultBlock: 'waking', benefits: 'Boosts cellular ATP synthesis, cognitive speed, and physical output.', notes: 'Drink with plentiful water', pairings: 'Sea salt, Electrolytes' },
  { name: 'Vitamin D3 + K2', dosage: '5000 IU / 100 mcg', defaultBlock: 'breakfast', benefits: 'Regulates calcium absorption, immune health, and mood.', notes: 'Take with meal containing dietary fat', pairings: 'Omega-3 fish oil, Magnesium' },
  { name: 'Omega-3 Fish Oil (EPA/DHA)', dosage: '2000 mg', defaultBlock: 'lunch', benefits: 'Reduces systemic inflammation, supports cell membranes and brain tissue.', notes: 'Take with food to prevent gastric reflux', pairings: 'Vitamin D3, Astaxanthin' },
  { name: 'CoQ10 (Ubiquinol)', dosage: '100–200 mg', defaultBlock: 'breakfast', benefits: 'Mitochondrial antioxidant critical for ATP production in heart and brain.', notes: 'Fat-soluble; take with morning meal', pairings: 'PQQ, Alpha Lipoic Acid' },
  { name: 'N-Acetyl Cysteine (NAC)', dosage: '600–1200 mg', defaultBlock: 'lunch', benefits: 'Direct precursor to Glutathione (the master antioxidant); liver detox.', notes: 'Can be taken away from food or with meals', pairings: 'Vitamin C, Selenium' },
  { name: 'Zinc Picolinate', dosage: '15–30 mg', defaultBlock: 'lunch', benefits: 'Crucial for immune cellular defense, hormone balance, and barrier integrity.', notes: 'Crucial: Never take on an empty stomach', pairings: 'Copper (spaced 4 hours apart), Quercetin' },
  { name: 'Methylfolate (L-5-MTHF)', dosage: '400–1000 mcg', defaultBlock: 'breakfast', benefits: 'Active bioavailable B9 for methylation; bypasses MTHFR defects.', notes: 'Do not use synthetic folic acid', pairings: 'Methylcobalamin (B12), B6' },
  { name: 'Ashwagandha (KSM-66)', dosage: '300–600 mg', defaultBlock: 'bedtime', benefits: 'Lowers cortisol, balances stress response, improves deep sleep.', notes: 'Cycle 5 days on, 2 days off', pairings: 'L-Theanine, Magnesium' },
  { name: 'L-Theanine', dosage: '200 mg', defaultBlock: 'waking', benefits: 'Increases alpha brain waves, calms jitteriness without sedation.', notes: 'Great paired with morning coffee', pairings: 'Caffeine, Magnesium' },
  { name: 'Berberine HCl', dosage: '500 mg', defaultBlock: 'lunch', benefits: 'Activates AMPK, optimizes glucose metabolism and insulin sensitivity.', notes: 'Take immediately prior to carbohydrate meal', pairings: 'Milk Thistle (Silymarin)' },
  { name: 'Quercetin Phytosome', dosage: '500 mg', defaultBlock: 'lunch', benefits: 'Natural mast cell stabilizer; reduces histamine symptoms and viral entry.', notes: 'Take with meal', pairings: 'Zinc, Vitamin C' }
];

export function SupplementModal({
  isOpen,
  onClose,
  blocks,
  initialBlockId,
  supplementToEdit,
  onSave,
  onDelete
}: SupplementModalProps) {
  const [selectedBlockId, setSelectedBlockId] = useState(initialBlockId || (blocks[0]?.id ?? ''));
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [isCrucial, setIsCrucial] = useState(false);
  const [benefits, setBenefits] = useState('');
  const [pairings, setPairings] = useState('');
  const [foodSources, setFoodSources] = useState('');

  useEffect(() => {
    if (supplementToEdit) {
      setName(supplementToEdit.name || '');
      setDosage(supplementToEdit.dosage || '');
      setNotes(supplementToEdit.notes || '');
      setIsCrucial(!!supplementToEdit.isCrucial);
      setBenefits(supplementToEdit.benefits || '');
      setPairings(supplementToEdit.pairings || '');
      setFoodSources(supplementToEdit.foodSources || '');
    } else {
      setName('');
      setDosage('');
      setNotes('');
      setIsCrucial(false);
      setBenefits('');
      setPairings('');
      setFoodSources('');
    }
    if (initialBlockId) {
      setSelectedBlockId(initialBlockId);
    } else if (blocks.length > 0 && !selectedBlockId) {
      setSelectedBlockId(blocks[0].id);
    }
  }, [supplementToEdit, initialBlockId, isOpen, blocks]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof COMMON_SUPPLEMENT_PRESETS[0]) => {
    setName(preset.name);
    setDosage(preset.dosage);
    setNotes(preset.notes);
    setBenefits(preset.benefits);
    setPairings(preset.pairings);
    const matchingBlock = blocks.find(b => b.id.toLowerCase().includes(preset.defaultBlock));
    if (matchingBlock) {
      setSelectedBlockId(matchingBlock.id);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim() || !selectedBlockId) return;

    const supp: Supplement = {
      id: supplementToEdit?.id || `supp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      dosage: dosage.trim(),
      notes: notes.trim() || undefined,
      isCrucial,
      benefits: benefits.trim() || undefined,
      pairings: pairings.trim() || undefined,
      foodSources: foodSources.trim() || undefined,
    };

    onSave(selectedBlockId, supp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Pill size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                {supplementToEdit ? 'Edit Supplement' : 'Add to Your Stack'}
              </h2>
              <p className="text-xs text-slate-400">Add or fine-tune exact dosages and timing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Presets (Only when adding fresh) */}
        {!supplementToEdit && (
          <div className="mt-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Pick Popular Vitamins / Compounds:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 no-scrollbar">
              {COMMON_SUPPLEMENT_PRESETS.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 text-xs bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-lg transition-colors text-left"
                >
                  + {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Supplement Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Magnesium L-Threonate"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Dosage / Amount *
              </label>
              <input
                type="text"
                required
                value={dosage}
                onChange={e => setDosage(e.target.value)}
                placeholder="e.g. 500 mg, 2 capsules, 5000 IU"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Schedule Timing Block *
              </label>
              <select
                value={selectedBlockId}
                onChange={e => setSelectedBlockId(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {blocks.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.mealTime || b.timeOfDay})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center sm:pt-6">
              <label className="flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl w-full transition-colors">
                <input
                  type="checkbox"
                  checked={isCrucial}
                  onChange={e => setIsCrucial(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-slate-800 border-white/20 w-4 h-4"
                />
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle size={14} /> Crucial / High Priority
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Timing & Consumption Instructions
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Take with healthy fats; do not take on empty stomach"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Why Take It? (Expected Benefits)
            </label>
            <input
              type="text"
              value={benefits}
              onChange={e => setBenefits(e.target.value)}
              placeholder="e.g. Supports mitochondrial energy production and nervous system calm"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Synergistic Pairings
              </label>
              <input
                type="text"
                value={pairings}
                onChange={e => setPairings(e.target.value)}
                placeholder="e.g. Pair with B-Complex or Vitamin C"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Whole Food Sources
              </label>
              <input
                type="text"
                value={foodSources}
                onChange={e => setFoodSources(e.target.value)}
                placeholder="e.g. Wild salmon, leafy greens"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {supplementToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove ${supplementToEdit.name} from your stack?`)) {
                    onDelete(selectedBlockId, supplementToEdit.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-1.5 border border-rose-500/20"
              >
                <Trash2 size={14} /> Remove Supplement
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
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all"
              >
                {supplementToEdit ? 'Save Changes' : 'Add to Stack'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
