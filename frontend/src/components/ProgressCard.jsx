import React from 'react';
import { motion } from 'framer-motion';
import { Award, Flame, Target } from 'lucide-react';

export default function ProgressCard({ metrics }) {
  const completion = metrics?.completion_percentage || 68.5;
  const streak = metrics?.study_streak_days || 5;

  return (
    <div className="glass-card rounded-3xl p-6 border border-[#334155] space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-poppins font-bold text-[#F8FAFC]">Overall Progress Overview</h3>
        <span className="px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#06B6D4] text-[11px] font-inter font-bold border border-[#3B82F6]/30">
          Active Streak
        </span>
      </div>

      <div className="flex items-center justify-around py-2">
        {/* Animated Progress Circle */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#1E293B]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <motion.path
              className="text-[#06B6D4]"
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${completion}, 100` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-poppins text-2xl font-black text-[#F8FAFC]">{completion}%</span>
            <span className="text-[10px] font-inter font-bold text-[#94A3B8] uppercase">Complete</span>
          </div>
        </div>

        {/* Streak & Stats */}
        <div className="space-y-3 font-inter">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1E293B] border border-[#334155]">
            <div className="p-2 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]">
              <Flame className="w-4 h-4 fill-[#F59E0B]" />
            </div>
            <div>
              <div className="text-sm font-poppins font-black text-[#F8FAFC]">{streak} Days</div>
              <div className="text-[10px] text-[#94A3B8]">Study Streak</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1E293B] border border-[#334155]">
            <div className="p-2 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-poppins font-black text-[#F8FAFC]">14 Days</div>
              <div className="text-[10px] text-[#94A3B8]">Exam Target</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
