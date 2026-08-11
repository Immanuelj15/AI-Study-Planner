import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Star, Sparkles, ShieldCheck } from 'lucide-react';

export default function XPProgressCard({ streak = 0, completedCount = 0 }) {
  const currentXP = (streak * 50) + (completedCount * 100);
  
  let levelName = "Level 1 Novice";
  let levelBadge = "L1";
  let nextLevelXP = 250;

  if (currentXP >= 1000) {
    levelName = "Level 4 Master";
    levelBadge = "L4";
    nextLevelXP = 2000;
  } else if (currentXP >= 500) {
    levelName = "Level 3 Scholar";
    levelBadge = "L3";
    nextLevelXP = 1000;
  } else if (currentXP >= 250) {
    levelName = "Level 2 Apprentice";
    levelBadge = "L2";
    nextLevelXP = 500;
  }

  const levelProgress = Math.min(100, Math.round((currentXP / nextLevelXP) * 100));

  return (
    <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft font-inter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] text-white flex items-center justify-center font-poppins font-black text-sm shadow-md">
            {levelBadge}
          </div>
          <div>
            <div className="font-poppins font-bold text-sm text-[#1E293B]">{levelName}</div>
            <div className="text-[11px] text-[#64748B]">Earn XP by reading notes & taking quizzes</div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-xs border border-[#DBEAFE] flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 fill-[#2563EB]" /> {currentXP} XP
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-[#64748B]">
          <span>Progress to Next Rank</span>
          <span className="text-[#2563EB] font-bold">{currentXP} / {nextLevelXP} XP</span>
        </div>

        <div className="w-full h-3 bg-[#EFF6FF] rounded-full overflow-hidden border border-[#DBEAFE]">
          <motion.div
            className="h-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8]"
            initial={{ width: '0%' }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* XP Earning Tips */}
      <div className="grid grid-cols-3 gap-2 text-[10px] font-medium text-[#64748B] pt-1">
        <div className="p-2 rounded-xl bg-[#F8FBFF] border border-[#E2E8F0] text-center">
          ⚡ <span className="font-bold text-[#1E293B]">+50 XP</span> Notes Read
        </div>
        <div className="p-2 rounded-xl bg-[#F8FBFF] border border-[#E2E8F0] text-center">
          🏆 <span className="font-bold text-[#1E293B]">+100 XP</span> Quiz Master
        </div>
        <div className="p-2 rounded-xl bg-[#F8FBFF] border border-[#E2E8F0] text-center">
          🔥 <span className="font-bold text-[#1E293B]">+20 XP</span> Daily Login
        </div>
      </div>
    </div>
  );
}
