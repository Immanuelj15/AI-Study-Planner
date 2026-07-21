import React from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function QuizResult() {
  return (
    <div className="space-y-6 pb-12 max-w-2xl mx-auto">
      <div className="glass-card rounded-3xl p-8 border border-slate-800 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-100">Quiz Analytics & Feedback</h1>
          <p className="text-slate-400 text-xs mt-1">Review your recent topic performance feedback loop.</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-black text-brand-cyan">80%</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Avg Accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">4 / 5</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Correct</div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">+1.5 hrs</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Schedule Shift</div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            to="/study-planner"
            className="flex-1 py-3 rounded-xl gradient-btn text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
          >
            <span>View Updated Study Plan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/quiz"
            className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            Take Another Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}
