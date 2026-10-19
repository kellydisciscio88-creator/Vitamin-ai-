import { useState } from 'react';
import { Check, AlertCircle, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { Supplement } from '../types';
import { cn } from '../lib/utils';

interface SupplementItemProps {
  key?: string | number;
  item: Supplement;
  isCompleted: boolean;
  onToggle: (id: string) => void;
  onEdit?: (item: Supplement) => void;
  onDelete?: (id: string) => void;
}

export function SupplementItem({ item, isCompleted, onToggle, onEdit, onDelete }: SupplementItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasRichData = !!(item.benefits || item.pairings || item.foodSources);

  return (
    <div 
      className={cn(
        "group flex flex-col p-4 rounded-2xl border transition-all relative overflow-hidden",
        isCompleted 
          ? "bg-emerald-500/10 border-emerald-500/20 opacity-70 hover:opacity-100" 
          : "bg-white/5 border-white/5 hover:bg-white/10"
      )}
    >
      <div className="flex items-center">
        {/* Checkmark Button */}
        <div 
          onClick={() => onToggle(item.id)}
          className={cn(
            "flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center mr-3.5 transition-colors cursor-pointer",
            isCompleted 
              ? "bg-emerald-500/20 text-emerald-400" 
              : "bg-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10"
          )}
        >
          <Check size={18} strokeWidth={isCompleted ? 3 : 2} />
        </div>
        
        {/* Info */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onToggle(item.id)}
        >
          <div className="flex flex-col">
            <h4 className={cn(
              "font-medium transition-colors text-[15px]",
              isCompleted ? "text-slate-400 line-through decoration-slate-500" : "text-slate-100"
            )}>
              {item.name}
            </h4>
            <span className="text-xs text-slate-400 whitespace-nowrap mt-0.5">
              {item.dosage}
            </span>
          </div>
          
          {item.notes && (
            <div className="mt-1.5 flex items-start gap-1.5">
              {item.isCrucial ? (
                <AlertCircle size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-1 h-1 rounded-full bg-slate-500 flex-shrink-0 mt-1.5" />
              )}
              <p className={cn(
                "text-[10px] uppercase tracking-wider leading-snug",
                item.isCrucial ? "text-amber-400/90 font-semibold" : "text-slate-400"
              )}>
                {item.notes}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons (Edit & Delete) */}
        <div className="flex items-center gap-1 ml-2">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-white/10 opacity-70 group-hover:opacity-100 transition-all"
              title="Edit dosage or details"
            >
              <Edit2 size={14} />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Remove ${item.name} from your stack?`)) {
                  onDelete(item.id);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 opacity-60 group-hover:opacity-100 transition-all"
              title="Delete supplement"
            >
              <Trash2 size={14} />
            </button>
          )}

          {hasRichData && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
              title="View science & pairings"
            >
              <ChevronDown size={16} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
            </button>
          )}
        </div>
      </div>

      {isExpanded && hasRichData && (
        <div className="mt-4 pt-3.5 border-t border-white/10 space-y-2.5 animate-in slide-in-from-top-2 fade-in duration-200">
          {item.benefits && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-0.5">Why take it?</p>
              <p className="text-xs text-slate-300 leading-relaxed">{item.benefits}</p>
            </div>
          )}
          {item.pairings && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-0.5">Synergistic Pairings</p>
              <p className="text-xs text-slate-300 leading-relaxed">{item.pairings}</p>
            </div>
          )}
          {item.foodSources && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-0.5">Food sources & Diet</p>
              <p className="text-xs text-slate-300 leading-relaxed">{item.foodSources}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
