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
import XPProgressCard from '../components/XPProgressCard';
import AICoachPanel from '../components/AICoachPanel';
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
  ArrowRight,
  PlayCircle
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

  // Current Focus Subject
  const currentSubject = todayPlans[0]?.subject || (weakSubjects[0] || "Operating Systems");
  const currentTopic = todayPlans[0]?.topic || "Core Concepts & Binary Search";
  const remainingHours = todayPlans.filter(p => p.status !== 'Completed').reduce((acc, p) => acc + (p.hours || 1), 0);

  // Time-Aware Greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20 font-inter relative"
    >
      {/* 1. Compact Hero Banner (Reduced height by ~40%) */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-5 lg:p-6 relative overflow-hidden hero-gradient-bg shadow-lg text-white border border-blue-400/30"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/20 to-transparent pointer-events-none"></div>
        <div className="max-w-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-poppins font-bold shadow-xs">
              <Heart className="w-3.5 h-3.5 text-white fill-white" /> AI Multi-Agent Study Companion
            </div>
            <h1 className="font-poppins text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
              {timeGreeting}, {user?.name || 'Student'}! 👋
            </h1>
            <p className="font-inter text-blue-50 text-xs leading-relaxed max-w-lg">
              {metrics?.upcoming_exam_days > 0 
                ? `Target Exam is in ${metrics.upcoming_exam_days} Days. You have ${remainingHours.toFixed(1)} hrs left today.`
                : 'Add your subjects and target exam date to create your study schedule.'}
            </p>
          </div>

          {/* Goal 2: Primary CTA Button "Continue Today's Study" */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/summary?topic=${encodeURIComponent(currentSubject)}`)}
            className="px-6 py-3 rounded-2xl bg-white text-[#2563EB] hover:bg-blue-50 text-xs font-poppins font-bold flex items-center gap-2.5 shadow-xl shrink-0"
          >
            <PlayCircle className="w-5 h-5 text-[#2563EB] fill-[#2563EB]/20" />
            <span>Continue Today's Study</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* 2. Goal 3: Above-the-Fold Immediate Focus KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="p-4 rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-inter font-semibold text-[#64748B]">
            <span>Current Subject</span>
            <BookOpen className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="font-poppins font-bold text-lg text-[#1E293B] truncate">{currentSubject}</div>
          <div className="text-[10px] text-[#2563EB] font-bold truncate">Active Focus Topic</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-4 rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-inter font-semibold text-[#64748B]">
            <span>Remaining Time</span>
            <Clock3 className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="font-poppins font-bold text-lg text-[#1E293B]">{remainingHours.toFixed(1)} Hrs</div>
          <div className="text-[10px] text-[#38BDF8] font-bold">Left to Study Today</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-4 rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-inter font-semibold text-[#64748B]">
            <span>Active Streak</span>
            <Flame className="w-4 h-4 text-[#D97706] fill-[#F59E0B]" />
          </div>
          <div className="font-poppins font-bold text-lg text-[#1E293B]">{metrics?.study_streak_days || 0} Days</div>
          <div className="text-[10px] text-[#D97706] font-bold">Daily Activity</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-4 rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-inter font-semibold text-[#64748B]">
            <span>Daily Goal</span>
            <Award className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="font-poppins font-bold text-lg text-[#1E293B]">{metrics?.completion_percentage || 0}%</div>
          <div className="text-[10px] text-[#22C55E] font-bold">Target Completed</div>
        </motion.div>
      </div>

      {/* Goal 9: Personalized AI Coach Panel */}
      <motion.div variants={itemVariants}>
        <AICoachPanel weakTopic={weakSubjects[0] || "Operating Systems"} strongTopic={strongSubjects[0] || "Binary Search"} />
      </motion.div>

      {/* Goal 6: Interactive Learning Journey Timeline */}
      <motion.div variants={itemVariants}>
        <LearningTimeline />
      </motion.div>

      {/* Grid Layout: Varied Card Sizes for Clear Visual Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Schedule, XP Progress, Charts, Heatmap */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Study Timetable */}
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 font-poppins font-bold text-[#1E293B] text-base">
                <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center">
                  <Clock3 className="w-5 h-5 text-[#2563EB]" />
                </div>
                <span>Today's Study Schedule</span>
              </div>
              <span className="text-xs font-inter font-semibold text-[#64748B]">
                {metrics?.today_study_hours || 0} hours planned today
              </span>
            </div>

            {todayPlans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                {todayPlans.map((item, idx) => (
                  <StudyCard key={idx} item={item} onToggleStatus={handleToggleStatus} />
                ))}
              </div>
            ) : (
              /* Goal 10: Friendly Empty State with Illustration */
              <div className="p-8 rounded-2xl bg-[#F8FBFF] border border-[#DBEAFE] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-sm text-[#1E293B]">Your study timetable is ready to be built!</h4>
                  <p className="text-xs text-[#64748B] font-inter mt-1 max-w-sm mx-auto">
                    Add your target subjects to generate structured bullet notes, concept maps, and practice quizzes.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/study-planner')}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-inter font-bold inline-flex items-center gap-2 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Study Schedule</span>
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Goal 7: Interactive GitHub-Style Heatmap */}
          <motion.div variants={itemVariants}>
            <StudyHeatmap streak={metrics?.study_streak_days || 0} />
          </motion.div>

          {/* Weekly Progress Bar Chart */}
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="font-poppins font-bold text-[#1E293B] text-base flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#2563EB]" />
                </div>
                <span>Weekly Progress Overview</span>
              </div>
              <span className="text-xs font-inter text-[#2563EB] font-bold">Target vs Completed</span>
            </div>
            <div className="h-64">
              <WeeklyBarChart weeklyData={metrics?.weekly_progress} />
            </div>
          </motion.div>
        </div>

        {/* Right 1 Column: XP Progress, Circular Progress Ring, Pomodoro, Badges */}
        <div className="space-y-6">
          {/* Goal 8: XP & Level Achievement System */}
          <motion.div variants={itemVariants}>
            <XPProgressCard streak={metrics?.study_streak_days || 0} />
          </motion.div>

          {/* Circular Completion Ring */}
          <motion.div variants={itemVariants}>
            <ProgressCard metrics={metrics} />
          </motion.div>

          {/* Pomodoro Focus Timer */}
          <motion.div variants={itemVariants}>
            <PomodoroTimer />
          </motion.div>

          {/* Gamification Badges */}
          <motion.div variants={itemVariants}>
            <GamificationBadges />
          </motion.div>
        </div>
      </div>

      {/* Floating AI Chat Tutor Assistant */}
      <ChatTutor topic={weakSubjects[0] || "Computer Science"} />
    </motion.div>
  );
}
