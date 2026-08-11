import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adaptiveAPI } from '../services/api';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  BookOpen, 
  Target, 
  TrendingUp, 
  HelpCircle, 
  Activity,
  Award,
  Layers,
  Heart
} from 'lucide-react';

export default function AdaptiveProfileCard() {
  const [profileData, setProfileData] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdaptiveData();
  }, []);

  const fetchAdaptiveData = async () => {
    try {
      const [profRes, recRes] = await Promise.all([
        adaptiveAPI.getProfile(),
        adaptiveAPI.getRecommendation()
      ]);
      setProfileData(profRes.data);
      setRecommendation(recRes.data);
    } catch (err) {
      console.error("Failed to load adaptive learning profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!profileData) return null;

  const styleColors = {
    Visual: { bg: '#EFF6FF', border: '#DBEAFE', text: '#2563EB', icon: Sparkles },
    Reading: { bg: '#F5F3FF', border: '#DDD6FE', text: '#7C3AED', icon: BookOpen },
    Practice: { bg: '#FEF3C7', border: '#FDE68A', text: '#B45309', icon: Target },
    Mixed: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D', icon: Zap }
  };

  const currentStyleConfig = styleColors[profileData.learning_style] || styleColors.Mixed;
  const StyleIcon = currentStyleConfig.icon;

  const hasQuizData = profileData.average_quiz_score > 0;
  const hasReadingData = profileData.average_reading_time > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-5 shadow-soft font-inter"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] text-white flex items-center justify-center shadow-md">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-poppins font-bold text-base text-[#1E293B] flex items-center gap-2">
              <span>Adaptive Learning Profile</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                Auto Detected
              </span>
            </div>
            <div className="text-xs text-[#64748B]">Real-time telemetry observations & behavioral insights</div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-bold border border-[#86EFAC] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#22C55E]" /> Engine Active
        </span>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Learning Style */}
        <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: currentStyleConfig.bg, borderColor: currentStyleConfig.border }}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Learning Style</div>
          <div className="font-poppins font-black text-sm mt-1 flex items-center gap-1.5" style={{ color: currentStyleConfig.text }}>
            <StyleIcon className="w-4 h-4" />
            <span>{profileData.learning_style}</span>
          </div>
        </div>

        {/* Learning Speed */}
        <div className="p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Learning Speed</div>
          <div className="font-poppins font-black text-sm text-[#1E293B] mt-1 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#2563EB]" />
            <span>{profileData.learning_speed} Pace</span>
          </div>
        </div>

        {/* Improvement Trend */}
        <div className="p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Classification</div>
          <div className="font-poppins font-black text-sm text-[#2563EB] mt-1 flex items-center gap-1.5 truncate">
            <TrendingUp className="w-4 h-4 text-[#2563EB]" />
            <span className="truncate">{profileData.improvement_trend || "New Student"}</span>
          </div>
        </div>

        {/* Confidence Level */}
        <div className="p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Confidence Level</div>
          <div className="font-poppins font-black text-sm text-[#22C55E] mt-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#22C55E]" />
            <span>{profileData.confidence_level}</span>
          </div>
        </div>
      </div>

      {/* Behavioral Telemetry Stats Bar */}
      <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <div className="font-poppins font-bold text-lg text-[#2563EB]">
            {hasQuizData ? `${profileData.average_quiz_score}%` : '0%'}
          </div>
          <div className="text-[10px] font-bold text-[#64748B] uppercase">Quiz Accuracy</div>
        </div>
        <div>
          <div className="font-poppins font-bold text-lg text-[#0EA5E9]">
            {hasReadingData ? `${intFormat(profileData.average_reading_time)}s` : '0s'}
          </div>
          <div className="text-[10px] font-bold text-[#64748B] uppercase">Avg Reading Time</div>
        </div>
        <div>
          <div className="font-poppins font-bold text-lg text-[#8B5CF6]">{profileData.mindmap_usage || 0}</div>
          <div className="text-[10px] font-bold text-[#64748B] uppercase">Mindmap Views</div>
        </div>
        <div>
          <div className="font-poppins font-bold text-lg text-[#22C55E]">{profileData.revision_frequency || 0}</div>
          <div className="text-[10px] font-bold text-[#64748B] uppercase">Revisions Done</div>
        </div>
      </div>

      {/* Explainable AI Banner */}
      {recommendation?.explainable_ai && (
        <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-2 text-xs">
          <div className="font-poppins font-bold text-[#2563EB] flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#2563EB]" />
            <span>Explainable AI: Why is today's schedule assigned this way?</span>
          </div>
          <p className="text-[#1E293B] leading-relaxed">
            {recommendation.explainable_ai.why_schedule_assigned}
          </p>
          <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#DBEAFE] text-[#2563EB] font-bold text-[11px] flex items-center gap-1.5 mt-1">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Recommendation: {recommendation.explainable_ai.actionable_recommendation}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function intFormat(num) {
  return Math.round(num || 0);
}
