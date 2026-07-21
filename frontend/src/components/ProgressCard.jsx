import React from 'react';
import { Award, Flame, Target, TrendingUp } from 'lucide-react';

export default function ProgressCard({ metrics }) {
  const completion = metrics?.completion_percentage || 68.5;
  const streak = metrics?.study_streak_days || 5;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200">Weekly Progress Overview</h3>
        <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-cyan text-[11px] font-bold border border-brand-500/30">
          Active Streak
        </span>
      </div>

      <div className="flex items-center justify-around py-2">
        {/* Completion Circular Visual */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-brand-cyan"
              strokeDasharray={`${completion}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-black text-slate-100">{completion}%</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase">Complete</span>
          </div>
        </div>

        {/* Streak & Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-100">{streak} Days</div>
              <div className="text-[10px] text-slate-400">Study Streak</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-purple">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-100">14 Days</div>
              <div className="text-[10px] text-slate-400">Exam Countdown</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
