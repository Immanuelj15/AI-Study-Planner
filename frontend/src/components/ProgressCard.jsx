import React from 'react';
import { motion } from 'framer-motion';
import { Award, Flame, Target } from 'lucide-react';

export default function ProgressCard({ metrics }) {
  const completion = metrics?.completion_percentage ?? 0;
  const streak = metrics?.study_streak_days ?? 0;
  const examTarget = metrics?.upcoming_exam_days ?? 0;

  return (
    <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] space-y-6 bg-[#FFFFFF] shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-poppins font-bold text-[#1E293B]">Overall Progress Overview</h3>
        <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[11px] font-inter font-bold border border-[#DBEAFE]">
          Active Streak
        </span>
      </div>

      <div className="flex items-center justify-around py-2">
        {/* Animated Progress Circle */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#EFF6FF]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <motion.path
              className="text-[#2563EB]"
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
            <span className="font-poppins text-2xl font-black text-[#1E293B]">{completion}%</span>
            <span className="text-[10px] font-inter font-bold text-[#64748B] uppercase">Complete</span>
          </div>
        </div>

        {/* Streak & Stats */}
        <div className="space-y-3 font-inter">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FEF3C7]/40 border border-[#FDE68A]">
            <div className="p-2 rounded-xl bg-[#FEF3C7] text-[#D97706]">
              <Flame className="w-4 h-4 fill-[#F59E0B]" />
            </div>
            <div>
              <div className="text-sm font-poppins font-black text-[#1E293B]">{streak} Days</div>
              <div className="text-[10px] text-[#64748B]">Study Streak</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE]">
            <div className="p-2 rounded-lg bg-[#DBEAFE] text-[#2563EB]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-poppins font-black text-[#1E293B]">{examTarget} Days</div>
              <div className="text-[10px] text-[#64748B]">Exam Target</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
