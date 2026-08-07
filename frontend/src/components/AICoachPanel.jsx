import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Clock, Target, Lightbulb, Heart, ArrowRight, ClipboardCheck, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adaptiveAPI } from '../services/api';

export default function AICoachPanel({ weakTopic = "Operating Systems", strongTopic = "Binary Search" }) {
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    adaptiveAPI.getRecommendation()
      .then(res => setRecommendation(res.data))
      .catch(err => console.error("Error loading coach recommendation:", err));
  }, []);

  const profile = recommendation?.profile;
  const explainable = recommendation?.explainable_ai;

  let coachMessage = `"Focus 45 minutes on ${weakTopic} today before attempting your practice quiz. Your optimal focus window is 9:00 AM – 11:30 AM."`;
  if (profile) {
    if (profile.improvement_trend === 'Late Bloomer') {
      coachMessage = `"Great progress! You learn better with steady revision. Today's plan includes extra practice and step-by-step guidance on ${weakTopic}."`;
    } else if (profile.learning_style === 'Visual') {
      coachMessage = `"Great progress! You learn best using visual explanations. Today's lesson includes interactive mind maps for ${weakTopic}."`;
    } else if (profile.learning_speed === 'Fast') {
      coachMessage = `"Outstanding pace! You're mastering concepts fast. Today we've scaled ${weakTopic} to advanced interview-level questions."`;
    }
  }

  return (
    <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft font-inter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 font-poppins font-bold text-[#1E293B] text-base">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] text-white flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 animate-bounce" />
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
          <Heart className="w-4 h-4 fill-[#2563EB]" /> Coach Encouragement & Action Plan:
        </div>
        <p className="text-xs text-[#1E293B] leading-relaxed font-medium">
          {coachMessage}
        </p>
      </div>

      {/* Key Coach Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">Learning Style</div>
          <div className="font-poppins font-bold text-[#2563EB] mt-0.5">{profile?.learning_style || "Visual"}</div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">Focus Priority</div>
          <div className="font-poppins font-bold text-[#EF4444] truncate mt-0.5">{weakTopic}</div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">Mastered Concept</div>
          <div className="font-poppins font-bold text-[#22C55E] truncate mt-0.5">{strongTopic}</div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">Learning Pace</div>
          <div className="font-poppins font-bold text-[#2563EB] mt-0.5">{profile?.learning_speed || "Medium"}</div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(`/summary?topic=${encodeURIComponent(weakTopic)}`)}
          className="py-2.5 px-4 rounded-2xl bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] font-poppins font-bold text-xs flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>Open {weakTopic} Notes</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(`/quiz?topic=${encodeURIComponent(weakTopic)}`)}
          className="py-2.5 px-4 rounded-2xl bg-[#2563EB] text-white font-poppins font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Start 5-Min Quiz on {weakTopic}</span>
        </motion.button>
      </div>
    </div>
  );
}
