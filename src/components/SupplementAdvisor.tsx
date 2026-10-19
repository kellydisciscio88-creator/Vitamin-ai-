import { useState, FormEvent } from 'react';
import { Sparkles, Loader2, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ScheduleBlock, Supplement, UserProfile } from '../types';
import { cn } from '../lib/utils';

interface EvaluationResult {
  isRecommended: boolean;
  reason: string;
  suggestedBlockId: string | null;
  dosage: string | null;
  notes: string;
  benefits?: string;
  pairings?: string;
  foodSources?: string;
}

interface SupplementAdvisorProps {
  currentSchedule: ScheduleBlock[];
  personalProfile?: UserProfile;
  onAddSupplement: (blockId: string, supplement: Supplement) => void;
}

export function SupplementAdvisor({ currentSchedule, personalProfile, onAddSupplement }: SupplementAdvisorProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedBlockId, setSelectedBlockId] = useState<string>('');

  const handleEvaluate = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/evaluate-supplement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplementName: query, currentSchedule, personalProfile })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate supplement');
      }

      const data = await response.json();
      setResult(data);
      
      // Auto-select a valid block
      if (data.isRecommended && data.suggestedBlockId) {
        const isValid = currentSchedule.some(b => b.id === data.suggestedBlockId);
        setSelectedBlockId(isValid ? data.suggestedBlockId : currentSchedule[0].id);
      } else if (data.isRecommended) {
        setSelectedBlockId(currentSchedule[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!result || !result.isRecommended || !selectedBlockId) return;

    const newItem: Supplement = {
      id: `custom-${Date.now()}`,
      name: query.trim(),
      dosage: result.dosage || 'As directed',
      notes: result.notes || undefined,
      benefits: result.benefits || undefined,
      pairings: result.pairings || undefined,
      foodSources: result.foodSources || undefined,
    };

    onAddSupplement(selectedBlockId, newItem);
    
    // Reset state after adding
    setQuery('');
    setResult(null);
  };

  const getBlockTitle = (id: string) => {
    const block = currentSchedule.find(b => b.id === id);
    return block ? block.title : id;
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl shadow-indigo-900/10 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100">AI Supplement Advisor</h3>
          <p className="text-xs text-slate-400">Ask if a vitamin is right for your stack</p>
        </div>
      </div>

      <form onSubmit={handleEvaluate} className="flex gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Ashwagandha, Vitamin C..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center min-w-[120px]"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Evaluate'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle size={18} className="text-rose-400 mt-0.5 shrink-0" />
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      )}

      {result && (
        <div className={cn(
          "mt-6 p-5 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-4",
          result.isRecommended 
            ? "bg-indigo-500/5 border-indigo-500/20" 
            : "bg-rose-500/5 border-rose-500/20"
        )}>
          <div className="flex items-start gap-3 mb-4">
            {result.isRecommended ? (
              <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={24} className="text-rose-400 shrink-0" />
            )}
            <div>
              <h4 className={cn(
                "font-bold text-lg mb-1",
                result.isRecommended ? "text-emerald-400" : "text-rose-400"
              )}>
                {result.isRecommended ? "Great idea to add!" : "Not recommended"}
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">{result.reason}</p>
            </div>
          </div>

          {result.isRecommended && (
            <div className="bg-white/5 rounded-xl p-4 mt-4 border border-white/5">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">When to take</p>
                  <select
                    value={selectedBlockId}
                    onChange={(e) => setSelectedBlockId(e.target.value)}
                    className="bg-black/20 text-sm font-medium text-slate-200 border border-white/10 rounded-lg px-2 py-1.5 w-full outline-none"
                  >
                    {currentSchedule.map(b => (
                      <option key={b.id} value={b.id} className="bg-slate-800">{b.title}</option>
                    ))}
                  </select>
                </div>
                {result.dosage && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Suggested Dose</p>
                    <p className="text-sm font-medium text-slate-200">{result.dosage}</p>
                  </div>
                )}
              </div>
              
              {result.notes && (
                <div className="mb-6">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-slate-300">{result.notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmAdd}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Plus size={16} /> Add to Schedule
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all border border-transparent hover:border-white/10"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          
          {!result.isRecommended && (
             <div className="flex justify-end mt-4">
               <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all"
                >
                  Dismiss
                </button>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
