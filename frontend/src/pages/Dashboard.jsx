import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboardAPI, agentAPI } from '../services/api';
import ProgressCard from '../components/ProgressCard';
import StudyCard from '../components/StudyCard';
import { WeeklyBarChart } from '../components/AnalyticsChart';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  Zap,
  TrendingUp,
  Activity,
  Lightbulb,
  GitFork,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
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
      addToast(`Session marked as ${res.data.status}!`, 'success');
      fetchDashboardData();
    } catch (err) {
      addToast('Failed to update status.', 'error');
    }
  };

  if (loading) return <LoadingSkeleton text="Loading Adaptive AI Dashboard..." />;

  const todayPlans = metrics?.today_plan || [];
  const weakSubjects = metrics?.weak_subjects || [];
  const strongSubjects = metrics?.strong_subjects || [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* 1. Dashboard Welcome Hero Banner (#2563EB -> #38BDF8 Gradient) */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-6 lg:p-8 relative overflow-hidden hero-gradient-bg shadow-md text-white border border-blue-400/30"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/15 to-transparent pointer-events-none"></div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-poppins font-bold">
            <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> Multi-Agent Feedback Loop Active
          </div>
          <h1 className="font-poppins text-3xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            AI Multi-Agent Study Command Center
          </h1>
          <p className="font-inter text-blue-50 text-xs lg:text-sm leading-relaxed max-w-xl">
            Target Exam Countdown: <span className="font-bold text-yellow-300 font-poppins">{metrics?.upcoming_exam_days || 14} Days</span>. 
            {weakSubjects.length > 0 && ` Extra study hours allocated to ${weakSubjects[0]}.`}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/study-planner')}
              className="px-5 py-2.5 rounded-xl bg-white text-[#2563EB] hover:bg-blue-50 text-xs font-poppins font-bold flex items-center gap-2 shadow-md"
            >
              <span>Recalculate Schedule</span>
              <ArrowUpRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/summary')}
              className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-inter font-bold border border-white/30 transition-colors backdrop-blur-md"
            >
              Research Topic Notes
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Schedule, Charts, Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Study Plan */}
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-poppins font-bold text-[#1E293B] text-base">
                <Clock className="w-5 h-5 text-[#2563EB]" />
                <span>Today's Study Schedule</span>
              </div>
              <span className="text-xs font-inter font-semibold text-[#64748B]">
                {metrics?.today_study_hours || 3.5} hrs total allocated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {todayPlans.map((item, idx) => (
                <StudyCard key={idx} item={item} onToggleStatus={handleToggleStatus} />
              ))}
            </div>
          </motion.div>

          {/* Weekly Progress Bar Chart */}
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="font-poppins font-bold text-[#1E293B] text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2563EB]" />
                <span>Weekly Target vs Completed Hours</span>
              </div>
              <span className="text-xs font-inter text-[#2563EB] font-bold">Chart.js Visualizer</span>
            </div>
            <div className="h-64">
              <WeeklyBarChart weeklyData={metrics?.weekly_progress} />
            </div>
          </motion.div>

          {/* AI Recommendations Section */}
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
            <div className="flex items-center gap-2 font-poppins font-bold text-[#1E293B] text-base">
              <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
              <span>AI Multi-Agent Study Recommendations</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-inter">
              <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-2">
                <div className="flex items-center justify-between font-bold text-[#2563EB]">
                  <span>🧠 Mind Map Revision</span>
                  <Zap className="w-3.5 h-3.5 text-[#38BDF8]" />
                </div>
                <p className="text-[#64748B] leading-relaxed">
                  Review <span className="text-[#1E293B] font-semibold">Binary Search Tree rotations</span> on the interactive React Flow visual graph before taking your next quiz.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-2">
                <div className="flex items-center justify-between font-bold text-[#22C55E]">
                  <span>⚡ Priority Allocation</span>
                  <Target className="w-3.5 h-3.5 text-[#22C55E]" />
                </div>
                <p className="text-[#64748B] leading-relaxed">
                  Scheduler Agent added <span className="text-[#1E293B] font-semibold">+1.5 hours</span> to DBMS Indexes to boost retention for low-scoring topics.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Mind Map Preview Banner */}
          <motion.div
            variants={itemVariants}
            onClick={() => navigate('/mindmap')}
            className="glass-card glass-card-hover rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] flex items-center justify-between gap-4 cursor-pointer shadow-soft"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
                <GitFork className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-poppins font-bold text-[#1E293B] text-sm">Interactive Mind Map Visualizer</h4>
                <p className="text-xs text-[#64748B] font-inter">Agent 2 generated React Flow visual graphs for concepts & algorithms.</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-[#2563EB]" />
          </motion.div>
        </div>

        {/* Right Column: Progress Card, Weak/Strong Badges, Recent Activities */}
        <div className="space-y-6">
          {/* Circular Completion Progress Ring */}
          <motion.div variants={itemVariants}>
            <ProgressCard metrics={metrics} />
          </motion.div>

          {/* Weak & Strong Subject Badges */}
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
            <h3 className="text-sm font-poppins font-bold text-[#1E293B] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B]" /> Topic Mastery Feedback
            </h3>

            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-inter font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Weak Topics (Increased Study Hours)
                </div>
                <div className="flex flex-wrap gap-2">
                  {weakSubjects.map((sub, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5] text-xs font-inter font-semibold">
                      ⚠️ {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0]">
                <div className="text-[11px] font-inter font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Strong Topics (Optimized Revision)
                </div>
                <div className="flex flex-wrap gap-2">
                  {strongSubjects.map((sub, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] text-xs font-inter font-semibold">
                      ✅ {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activities Feed */}
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
            <div className="flex items-center gap-2 font-poppins font-bold text-[#1E293B] text-sm">
              <Activity className="w-4 h-4 text-[#2563EB]" />
              <span>Recent AI Activities</span>
            </div>

            <div className="space-y-3 text-xs font-inter">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#1E293B]">Quiz Submitted: Binary Search</div>
                  <div className="text-[10px] text-[#64748B]">Score: 80% • Agent 4 recalculated schedule</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
                <Zap className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#1E293B]">Research Notes & Mind Map Created</div>
                  <div className="text-[10px] text-[#64748B]">Agents 1 & 2 structured notes for B+ Trees</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
