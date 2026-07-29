import React from 'react';
import { motion } from 'framer-motion';
import { Award, Flame, Target, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProgressCard({ metrics }) {
  const completion = metrics?.completion_percentage ?? 0;
  const streak = metrics?.study_streak_days ?? 0;
  const examTarget = metrics?.upcoming_exam_days ?? 0;

  return (
    <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] space-y-6 bg-[#FFFFFF] shadow-soft font-inter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center">
            <Award className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div>
            <h3 className="text-sm font-poppins font-bold text-[#1E293B]">Overall Learning Progress</h3>
            <span className="text-[11px] text-[#64748B]">Real-time completion & target metrics</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[11px] font-inter font-bold border border-[#DBEAFE]">
          Active
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* Animated Progress Circle */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
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
            <span className="font-poppins text-3xl font-black text-[#1E293B]">{completion}%</span>
            <span className="text-[10px] font-inter font-bold text-[#64748B] uppercase tracking-wider">Completed</span>
          </div>
        </div>

        {/* Streak & Exam Target Stat Pills */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FEF3C7]/50 border border-[#FDE68A]">
            <div className="p-2.5 rounded-xl bg-[#FEF3C7] text-[#D97706] shrink-0">
              <Flame className="w-5 h-5 fill-[#F59E0B]" />
            </div>
            <div>
              <div className="text-base font-poppins font-black text-[#1E293B]">{streak} Days</div>
              <div className="text-[11px] text-[#D97706] font-semibold">Active Daily Study Streak</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE]">
            <div className="p-2.5 rounded-xl bg-[#DBEAFE] text-[#2563EB] shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-poppins font-black text-[#1E293B]">{examTarget} Days</div>
              <div className="text-[11px] text-[#2563EB] font-semibold">Target Exam Countdown</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
