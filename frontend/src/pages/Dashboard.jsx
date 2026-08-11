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
import AdaptiveProfileCard from '../components/AdaptiveProfileCard';
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
  PlayCircle,
  BarChart3,
  Trophy
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'analytics', 'tools'
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
  const remainingHours = todayPlans.filter(p => p.status !== 'Completed').reduce((acc, p) => acc + (p.hours || 1), 0);

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
      {/* 1. Sleek Integrated Hero Banner */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-6 relative overflow-hidden hero-gradient-bg shadow-lg text-white border border-blue-400/30"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/20 to-transparent pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
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

        {/* Integrated Clean Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 mt-5 border-t border-white/20 text-white">
          <div className="space-y-0.5">
            <div className="text-[11px] text-blue-100 font-medium">Focus Subject</div>
            <div className="font-poppins font-bold text-base truncate">{currentSubject}</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] text-blue-100 font-medium">Remaining Study Time</div>
            <div className="font-poppins font-bold text-base flex items-center gap-1">
              <span>{remainingHours.toFixed(1)} Hrs</span>
              {todayPlans.length > 0 && remainingHours === 0 ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#22C55E]/30 text-[#86EFAC] font-bold">🎉 All Done!</span>
              ) : todayPlans.length === 0 ? (
                <span className="text-[10px] text-blue-200 font-normal"> (No Plan Yet)</span>
              ) : null}
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] text-blue-100 font-medium">Active Streak</div>
            <div className="font-poppins font-bold text-base">{metrics?.study_streak_days || 0} Days 🔥</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] text-blue-100 font-medium">Target Progress</div>
            <div className="font-poppins font-bold text-base">{metrics?.completion_percentage || 0}% Done</div>
          </div>
        </div>
      </motion.div>

      {/* 2. Sleek Section Navigation Tabs */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2 bg-[#F8FBFF] p-1 rounded-2xl border border-[#E2E8F0]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-poppins font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Daily Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-poppins font-bold transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics & Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 rounded-xl text-xs font-poppins font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tools'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Focus & XP Badges</span>
          </button>
        </div>

        <span className="text-xs font-inter font-semibold text-[#64748B] hidden sm:inline">
          {activeTab === 'overview' ? 'AI Personal Study Hub' : activeTab === 'analytics' ? 'Study Heatmap & Progress' : 'Focus Timer & Achievements'}
        </span>
      </motion.div>

      {/* TAB 1: DAILY OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Adaptive Learning Intelligence Profile Card */}
          <motion.div variants={itemVariants}>
            <AdaptiveProfileCard />
          </motion.div>

          {/* Personalized AI Coach Panel */}
          <motion.div variants={itemVariants}>
            <AICoachPanel weakTopic={weakSubjects[0] || "Operating Systems"} strongTopic={strongSubjects[0] || "Binary Search"} />
          </motion.div>


          {/* 2-Column Schedule & XP Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Today's Schedule */}
            <motion.div variants={itemVariants} className="lg:col-span-2 glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
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

            {/* Right 1 Column: XP Progress Card */}
            <motion.div variants={itemVariants} className="space-y-6">
              <XPProgressCard streak={metrics?.study_streak_days || 0} completedCount={todayPlans.filter(p => p.status === 'Completed').length} />
              <ProgressCard metrics={metrics} />
            </motion.div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS & HEATMAP */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <AdaptiveProfileCard />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StudyHeatmap streak={metrics?.study_streak_days || 0} />
          </motion.div>

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
            <div className="h-72">
              <WeeklyBarChart weeklyData={metrics?.weekly_progress} />
            </div>
          </motion.div>
        </div>
      )}

      {/* TAB 3: FOCUS TOOLS & BADGES */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <PomodoroTimer />
          </motion.div>
          <motion.div variants={itemVariants}>
            <GamificationBadges />
          </motion.div>
        </div>
      )}

      {/* Floating AI Chat Tutor Assistant */}
      <ChatTutor topic={weakSubjects[0] || "Computer Science"} />
    </motion.div>
  );
}
