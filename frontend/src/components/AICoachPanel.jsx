import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Clock, Target, Lightbulb, Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AICoachPanel({ weakTopic = "Operating Systems", strongTopic = "Binary Search" }) {
  const navigate = useNavigate();

  return (
    <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft font-inter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 font-poppins font-bold text-[#1E293B] text-base">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] text-white flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div>Personalized AI Study Coach</div>
            <div className="text-[11px] text-[#64748B] font-normal">Real-time study recommendations tailored for you</div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-xs border border-[#DBEAFE] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Active Coach
        </span>
      </div>

      {/* Encouraging Message & Insight */}
      <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-poppins font-bold text-[#2563EB]">
          <Heart className="w-4 h-4 fill-[#2563EB]" /> Coach Recommendation for Today:
        </div>
        <p className="text-xs text-[#1E293B] leading-relaxed">
          "Focus 45 minutes on <strong>{weakTopic}</strong> today before attempting your practice quiz. Your optimal peak focus window is between 9:00 AM – 11:30 AM."
        </p>
      </div>

      {/* Key Coach Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">Optimal Focus Window</div>
          <div className="font-poppins font-bold text-[#1E293B] mt-0.5">9:00 AM – 11:30 AM</div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">Focus Priority</div>
          <div className="font-poppins font-bold text-[#EF4444] truncate mt-0.5">{weakTopic}</div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">Solid Concept</div>
          <div className="font-poppins font-bold text-[#22C55E] truncate mt-0.5">{strongTopic}</div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">Est. Completion</div>
          <div className="font-poppins font-bold text-[#2563EB] mt-0.5">1 Hr 45 Mins</div>
        </div>
      </div>

      {/* Quick Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/summary?topic=${encodeURIComponent(weakTopic)}`)}
        className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] text-white font-poppins font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
      >
        <span>Open {weakTopic} Class Notes</span>
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
