import React from 'react';
import { BookOpen, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const difficultyColors = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

export default function SubjectCard({ subject }) {
  const navigate = useNavigate();

  return (
    <div className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between border border-slate-800">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-500">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${difficultyColors[subject.difficulty] || difficultyColors.Medium}`}>
            {subject.difficulty || 'Medium'}
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-1">{subject.subject_name}</h3>
        <p className="text-slate-400 text-xs mb-4">Target Exam Preparation & Adaptive Quizzing</p>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
        <button
          onClick={() => navigate(`/summary?subject_id=${subject.id}&topic=${encodeURIComponent(subject.subject_name)}`)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-cyan" /> Research Notes
        </button>
        <button
          onClick={() => navigate(`/quiz?subject_id=${subject.id}&topic=${encodeURIComponent(subject.subject_name)}`)}
          className="py-2 px-3 rounded-xl bg-brand-600/20 hover:bg-brand-600/40 text-brand-cyan border border-brand-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Quiz
        </button>
      </div>
    </div>
  );
}
