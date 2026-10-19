import { useState } from 'react';
import { ScheduleBlock, UserProfile } from '../types';
import { ShieldCheck, AlertTriangle, Shield, CheckCircle2, Loader2, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface StackEvaluatorProps {
  schedule: ScheduleBlock[];
  personalProfile?: UserProfile;
  onApplySchedule?: (newSchedule: ScheduleBlock[]) => void;
}

interface StackAssessment {
  overallScore: number;
  overallAssessment: string;
  warnings: string[];
  brandRecommendations: {
    supplementName: string;
    brands: string[];
    reasoning: string;
  }[];
  recommendedSchedule: ScheduleBlock[];
}

export function StackEvaluator({ schedule, personalProfile, onApplySchedule }: StackEvaluatorProps) {
  const [assessment, setAssessment] = useState<StackAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const evaluateStack = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/evaluate-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule, personalProfile })
      });
      if (!response.ok) throw new Error('Failed to evaluate stack');
      const data = await response.json();
      setAssessment(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden mb-8">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 p-32 bg-amber-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none transition-opacity duration-700 opacity-60" />
      
      {!isOpen ? (
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-inner">
              <ShieldCheck size={24} className="fill-amber-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-lg tracking-tight">Protocol Quality Auditor</h3>
                {personalProfile?.name && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {personalProfile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Verify interactions, spacing intervals, and clinical brand recommendations tailored to your profile.
              </p>
            </div>
          </div>
          <button 
            onClick={() => { setIsOpen(true); evaluateStack(); }}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-amber-500 text-slate-900 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            Audit My Stack
          </button>
        </div>
      ) : (
        <div className="relative z-10 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-xl tracking-tight">Stack Audit Results</h3>
                {personalProfile && (
                  <p className="text-xs text-indigo-300 flex items-center gap-1.5 mt-0.5">
                    <User size={12} />
                    Personalized for: <span className="font-semibold text-white">{personalProfile.name}</span>
                    {personalProfile.age ? ` (${personalProfile.age} yo)` : ''}
                    {personalProfile.dietaryPreference ? ` • ${personalProfile.dietaryPreference}` : ''}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              Close
            </button>
          </div>

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <Loader2 size={32} className="animate-spin text-amber-500 mb-4" />
              <p className="font-medium animate-pulse text-sm">
                Analyzing interactions, sensitivities ({personalProfile?.healthConditions?.join(', ') || 'general'}), and optimal timing...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
              Error: {error}
            </div>
          )}

          {assessment && !loading && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* Score & Overall Assessment */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-6 min-w-[140px] shrink-0">
                  <span className="text-4xl font-black text-white">{assessment.overallScore}</span>
                  <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase mt-1">Score / 100</span>
                </div>
                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Clinical Assessment</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{assessment.overallAssessment}</p>
                </div>
              </div>

              {/* Warnings / Timing Issues */}
              {assessment.warnings && assessment.warnings.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6">
                  <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-rose-400 font-bold mb-4">
                    <AlertTriangle size={14} /> Optimization & Safety Alerts
                  </h4>
                  <ul className="space-y-3">
                    {assessment.warnings.map((warning, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Brand Recommendations */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
                <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-4">
                  <Shield size={14} /> Clinically Backed Brand Recommendations
                </h4>
                <div className="space-y-4">
                  {assessment.brandRecommendations.map((rec, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <span className="font-bold text-slate-100">{rec.supplementName}</span>
                        <div className="flex flex-wrap gap-2">
                          {rec.brands.map((brand, bIdx) => (
                            <span key={bIdx} className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5">
                              <CheckCircle2 size={12} /> {brand}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed bg-black/20 rounded-lg p-3">
                        <span className="text-slate-300 font-semibold">Why these brands? </span> 
                        {rec.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Schedule Apply Action */}
              {assessment.recommendedSchedule && onApplySchedule && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div>
                    <h4 className="font-bold text-indigo-400 text-lg">Optimized Schedule Available</h4>
                    <p className="text-sm text-slate-300 mt-1">The AI has reorganized your protocol with calculated spacing intervals for optimal bioavailability.</p>
                  </div>
                  <button 
                    onClick={() => {
                      onApplySchedule(assessment.recommendedSchedule);
                      setIsOpen(false);
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                  >
                    Apply New Schedule
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
