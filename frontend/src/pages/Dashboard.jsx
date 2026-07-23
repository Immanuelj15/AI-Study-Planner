import React, { useState, useEffect } from 'react';
import { dashboardAPI, agentAPI } from '../services/api';
import ProgressCard from '../components/ProgressCard';
import StudyCard from '../components/StudyCard';
import { WeeklyBarChart } from '../components/AnalyticsChart';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { 
  Calendar, 
  Flame, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowUpRight,
  Zap,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  if (loading) return <LoadingSkeleton text="Loading Adaptive Dashboard..." />;

  const todayPlans = metrics?.today_plan || [];
  const weakSubjects = metrics?.weak_subjects || [];
  const strongSubjects = metrics?.strong_subjects || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-brand-600/20">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-cyan text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-brand-purple" /> Multi-Agent Feedback Loop Active
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold text-slate-100 tracking-tight">
            Your Adaptive Study Command Center
          </h1>
          <p className="text-slate-400 text-xs lg:text-sm leading-relaxed">
            Upcoming Exam in <span className="text-brand-cyan font-bold">{metrics?.upcoming_exam_days || 14} days</span>. 
            {weakSubjects.length > 0 && ` Extra focus allocated to ${weakSubjects[0]}.`}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/study-planner')}
              className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20"
            >
              <span>Recalculate Schedule</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/summary')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
            >
              Research Topic Notes
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Schedule & Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Study Schedule */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-base">
                <Clock className="w-5 h-5 text-brand-cyan" />
                <span>Today's Study Plan</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {metrics?.today_study_hours || 3.5} hrs total
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {todayPlans.map((item, idx) => (
                <StudyCard key={idx} item={item} onToggleStatus={handleToggleStatus} />
              ))}
            </div>
          </div>

          {/* Weekly Progress Bar Chart */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-100 text-base">Weekly Target vs Completed Hours</div>
              <span className="text-xs text-brand-cyan font-bold">Chart.js Visualization</span>
            </div>
            <div className="h-64">
              <WeeklyBarChart weeklyData={metrics?.weekly_progress} />
            </div>
          </div>
        </div>

        {/* Right Column: Progress Card, Weak/Strong Badges */}
        <div className="space-y-6">
          {/* Circular Completion Ring */}
          <ProgressCard metrics={metrics} />

          {/* Weak & Strong Subjects */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Topic Mastery Feedback
            </h3>

            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Weak Topics (Increased Study Time)
                </div>
                <div className="flex flex-wrap gap-2">
                  {weakSubjects.map((sub, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">
                      ⚠️ {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Strong Topics (Optimized Revision)
                </div>
                <div className="flex flex-wrap gap-2">
                  {strongSubjects.map((sub, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                      ✅ {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
