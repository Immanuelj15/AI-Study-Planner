import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboardAPI, agentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProgressCard from '../components/ProgressCard';
import StudyCard from '../components/StudyCard';
import { WeeklyBarChart } from '../components/AnalyticsChart';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StudyHeatmap from '../components/StudyHeatmap';
import GamificationBadges from '../components/GamificationBadges';
import PomodoroTimer from '../components/PomodoroTimer';
import LearningTimeline from '../components/LearningTimeline';
import ChatTutor from '../components/ChatTutor';
import { useToast } from '../context/ToastContext';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock3,
  TrendingUp,
  Activity,
  Lightbulb,
  Network,
  Target,
  Award,
  PlusCircle,
  BookOpen,
  Heart,
  HelpCircle,
  Sparkles,
  Flame,
  CalendarDays,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await dashboardAPI.getDashboard();
      setMetrics(res.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (planId) => {
    try {
      const res = await agentAPI.togglePlanStatus(planId);
      addToast(`Session marked as ${res.data.status}! Great work! 🎉`, 'success');
      fetchDashboardData();
    } catch (err) {
      addToast('Something went wrong. Please try again.', 'error');
    }
  };

  if (loading) return <LoadingSkeleton text="Preparing your personalized study dashboard..." />;

  const todayPlans = metrics?.today_plan || [];
  const weakSubjects = metrics?.weak_subjects || [];
  const strongSubjects = metrics?.strong_subjects || [];

  // Time-Aware Greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20 font-inter relative"
    >
      {/* 1. Dashboard Welcome Hero Banner (#2563EB -> #38BDF8 Gradient) */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-6 lg:p-8 relative overflow-hidden hero-gradient-bg shadow-lg text-white border border-blue-400/30"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/20 to-transparent pointer-events-none"></div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-poppins font-bold shadow-xs">
            <Heart className="w-4 h-4 text-white fill-white" /> AI Multi-Agent Study Companion
          </div>
          <h1 className="font-poppins text-3xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {timeGreeting}, {user?.name || 'Student'}! 👋
          </h1>
          <p className="font-inter text-blue-50 text-xs lg:text-sm leading-relaxed max-w-xl">
            {metrics?.upcoming_exam_days > 0 
              ? `You're making steady progress. Your target exam is in ${metrics.upcoming_exam_days} Days. Keep going!`
              : 'Add your subjects and target exam date to create your personalized study schedule.'}
            {weakSubjects.length > 0 && ` We've scheduled a little extra review time for ${weakSubjects[0]}.`}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/study-planner')}
              className="px-5 py-2.5 rounded-xl bg-white text-[#2563EB] hover:bg-blue-50 text-xs font-poppins font-bold flex items-center gap-2 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{todayPlans.length > 0 ? 'Update Study Plan' : 'Build Study Plan'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/summary')}
              className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-inter font-bold border border-white/30 transition-colors backdrop-blur-md"
            >
              Read Class Notes
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/mindmap')}
              className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-inter font-bold border border-white/30 transition-colors backdrop-blur-md flex items-center gap-1.5"
            >
              <Network className="w-4 h-4" />
              <span>Concept Map</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 2. Top KPI Metric Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="p-4 rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-inter font-semibold text-[#64748B]">
            <span>Target Exam</span>
            <CalendarDays className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="font-poppins font-black text-2xl text-[#1E293B]">{metrics?.upcoming_exam_days || 0} Days</div>
          <div className="text-[10px] text-[#2563EB] font-bold">Countdown Target</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-4 rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-inter font-semibold text-[#64748B]">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-[#D97706] fill-[#F59E0B]" />
          </div>
          <div className="font-poppins font-black text-2xl text-[#1E293B]">{metrics?.study_streak_days || 0} Days</div>
          <div className="text-[10px] text-[#D97706] font-bold">Daily Activity</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-4 rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-inter font-semibold text-[#64748B]">
            <span>Completion Rate</span>
            <Award className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="font-poppins font-black text-2xl text-[#1E293B]">{metrics?.completion_percentage || 0}%</div>
          <div className="text-[10px] text-[#22C55E] font-bold">Overall Progress</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-4 rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-inter font-semibold text-[#64748B]">
            <span>Planned Today</span>
            <Zap className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="font-poppins font-black text-2xl text-[#1E293B]">{metrics?.today_study_hours || 0} Hrs</div>
          <div className="text-[10px] text-[#2563EB] font-bold">Scheduled Sessions</div>
        </motion.div>
      </div>

      {/* Explainable AI Schedule Justification Banner */}
      {todayPlans.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-xs text-[#1E293B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#2563EB] text-white shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-poppins font-bold text-[#2563EB]">Why did AI structure this schedule?</div>
              <div className="text-[#64748B] text-[11px] mt-0.5">
                Target Exam Date ({metrics?.upcoming_exam_days || 12} days away) + Subject Difficulty
                {weakSubjects.length > 0 && ` + Quiz Score <60% on ${weakSubjects[0]}`} → AI allocated higher priority and extra revision sessions.
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white border border-[#DBEAFE] text-[#2563EB] font-bold text-[10px] shrink-0">
            Explainable AI Active
          </span>
        </motion.div>
      )}

      {/* Learning Progress Timeline */}
      <motion.div variants={itemVariants}>
        <LearningTimeline />
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Schedule, Charts, Pomodoro, Heatmap */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Study Schedule */}
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 font-poppins font-bold text-[#1E293B] text-base">
                <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center">
                  <Clock3 className="w-[22px] h-[22px] text-[#2563EB]" />
                </div>
                <span>Today's Goal & Schedule</span>
              </div>
              <span className="text-xs font-inter font-semibold text-[#64748B]">
                {metrics?.today_study_hours || 0} hours planned today
              </span>
            </div>

            {todayPlans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
                {todayPlans.map((item, idx) => (
                  <StudyCard key={idx} item={item} onToggleStatus={handleToggleStatus} />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#F8FBFF] border border-[#DBEAFE] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto">
                  <BookOpen className="w-[30px] h-[30px]" />
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-sm text-[#1E293B]">No study plan yet. Let's create one together!</h4>
                  <p className="text-xs text-[#64748B] font-inter mt-1 max-w-sm mx-auto">
                    Add your subjects and exam date to generate easy-to-understand notes, mind maps, and practice quizzes.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/study-planner')}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-inter font-bold inline-flex items-center gap-2 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Build My Study Plan</span>
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* GitHub Style Study Heatmap */}
          <motion.div variants={itemVariants}>
            <StudyHeatmap streak={metrics?.study_streak_days || 0} />
          </motion.div>

          {/* Weekly Progress Bar Chart */}
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="font-poppins font-bold text-[#1E293B] text-base flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#2563EB]" />
                </div>
                <span>Weekly Progress Overview</span>
              </div>
              <span className="text-xs font-inter text-[#2563EB] font-bold">Planned vs Completed</span>
            </div>
            <div className="h-64">
              <WeeklyBarChart weeklyData={metrics?.weekly_progress} />
            </div>
          </motion.div>
        </div>

        {/* Right Column: Progress Card, Pomodoro, Gamification, Topics */}
        <div className="space-y-6">
          {/* Circular Completion Progress Ring */}
          <motion.div variants={itemVariants}>
            <ProgressCard metrics={metrics} />
          </motion.div>

          {/* Pomodoro Study Focus Timer */}
          <motion.div variants={itemVariants}>
            <PomodoroTimer />
          </motion.div>

          {/* Gamification Achievements */}
          <motion.div variants={itemVariants}>
            <GamificationBadges />
          </motion.div>

          {/* Subject Review Topics */}
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
            <div className="flex items-center gap-3 font-poppins font-bold text-[#1E293B] text-sm">
              <div className="w-11 h-11 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#D97706]" />
              </div>
              <span>Topics to Review</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-inter font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444]" /> Needs Extra Practice
                </div>
                <div className="flex flex-wrap gap-2">
                  {weakSubjects.length > 0 ? (
                    weakSubjects.map((sub, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5] text-xs font-inter font-semibold">
                        📘 {sub}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#64748B] font-inter italic">You're doing great! No review topics flagged yet.</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0]">
                <div className="text-[11px] font-inter font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#22C55E]" /> Solid Concept Mastery
                </div>
                <div className="flex flex-wrap gap-2">
                  {strongSubjects.length > 0 ? (
                    strongSubjects.map((sub, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] text-xs font-inter font-semibold">
                        ✨ {sub}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#64748B] font-inter italic">Practice quizzes to highlight your strong topics</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating AI Chat Tutor Assistant */}
      <ChatTutor topic={weakSubjects[0] || "Computer Science"} />
    </motion.div>
  );
}
