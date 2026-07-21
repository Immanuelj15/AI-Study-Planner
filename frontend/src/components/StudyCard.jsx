import React from 'react';
import { Clock, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';

const priorityColors = {
  High: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

export default function StudyCard({ item, onToggleStatus }) {
  const isCompleted = item.status === 'Completed';

  return (
    <div className={`p-4 rounded-xl border transition-all ${isCompleted ? 'bg-slate-900/40 border-slate-800/50 opacity-60' : 'glass-card border-slate-800 hover:border-brand-500/40'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-[11px] font-semibold text-brand-cyan tracking-wider uppercase">
            {item.subject_name || item.subject}
          </span>
          <h4 className={`text-sm font-bold text-slate-100 mt-0.5 ${isCompleted ? 'line-through' : ''}`}>
            {item.topic}
          </h4>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${priorityColors[item.priority] || priorityColors.Medium}`}>
          {item.priority} Priority
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/60 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5 text-brand-purple" />
          <span>{item.hours} hrs allocated</span>
        </div>

        <button
          onClick={() => onToggleStatus && onToggleStatus(item.id)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isCompleted ? 'Done' : 'Mark Done'}</span>
        </button>
      </div>
    </div>
  );
}
