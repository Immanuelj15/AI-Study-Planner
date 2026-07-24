import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboardAPI } from '../services/api';
import { WeeklyBarChart, SubjectDoughnutChart, MonthlyProgressChart } from '../components/AnalyticsChart';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { BarChart3, TrendingUp, Award, Target, Flame, Activity, BookOpen, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Analytics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await dashboardAPI.getAnalytics();
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton text="Loading Performance Analytics..." />;

  const subjectMastery = metrics?.subject_mastery || metrics?.topic_mastery || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] space-y-2 shadow-soft bg-[#FFFFFF]">
        <h1 className="font-poppins text-2xl font-black text-[#1E293B] flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#2563EB]" /> Student Performance Analytics
        </h1>
        <p className="text-[#64748B] font-inter text-xs">
          Multi-Agent feedback loop tracks subject mastery scores, study hour trends, and adaptive scheduler adjustments.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-[#E2E8F0] space-y-1 bg-[#FFFFFF]">
          <div className="flex items-center justify-between text-[#2563EB]">
            <span className="text-[10px] font-inter font-bold uppercase">Average Score</span>
            <Award className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="font-poppins text-2xl font-black text-[#1E293B]">
            {metrics?.average_quiz_score ?? 0}%
          </div>
          <div className="text-[10px] font-inter text-[#64748B] font-bold">
            {metrics?.quizzes_taken > 0 ? '↑ AutoGen Calibrated' : 'No Quizzes Taken Yet'}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[#E2E8F0] space-y-1 bg-[#FFFFFF]">
          <div className="flex items-center justify-between text-[#22C55E]">
            <span className="text-[10px] font-inter font-bold uppercase">Quizzes Completed</span>
            <Target className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="font-poppins text-2xl font-black text-[#1E293B]">
            {metrics?.quizzes_taken ?? 0}
          </div>
          <div className="text-[10px] font-inter text-[#64748B]">
            {metrics?.quizzes_taken > 0 ? '100% Calibrated' : '0 Quizzes Completed'}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[#E2E8F0] space-y-1 bg-[#FFFFFF]">
          <div className="flex items-center justify-between text-[#F59E0B]">
            <span className="text-[10px] font-inter font-bold uppercase">Active Streak</span>
            <Flame className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
          </div>
          <div className="font-poppins text-2xl font-black text-[#1E293B]">
            {metrics?.study_streak ?? 0} Days
          </div>
          <div className="text-[10px] font-inter text-[#D97706] font-bold">
            {metrics?.study_streak > 0 ? '🔥 On Fire!' : 'Start Your First Session'}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[#E2E8F0] space-y-1 bg-[#FFFFFF]">
          <div className="flex items-center justify-between text-[#38BDF8]">
            <span className="text-[10px] font-inter font-bold uppercase">Hours Completed</span>
            <Activity className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="font-poppins text-2xl font-black text-[#1E293B]">
            {metrics?.total_study_hours ?? 0} hrs
          </div>
          <div className="text-[10px] font-inter text-[#2563EB] font-bold">
            {metrics?.total_study_hours > 0 ? 'Optimal Velocity' : '0 Hours Completed'}
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Bar Chart */}
        <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-poppins font-bold text-[#1E293B] text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2563EB]" /> Weekly Target vs Completed Hours
            </h3>
            <span className="text-xs font-inter text-[#2563EB] font-bold">Chart.js</span>
          </div>
          <div className="h-64 relative overflow-hidden">
            <WeeklyBarChart weeklyData={metrics?.weekly_data} />
          </div>
        </div>

        {/* Subject Mastery Breakdown Chart */}
        <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-poppins font-bold text-[#1E293B] text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-[#22C55E]" /> Subject Mastery Breakdown
            </h3>
            <span className="text-xs font-inter text-[#22C55E] font-bold">Mastery %</span>
          </div>

          {subjectMastery.length > 0 && subjectMastery.some(m => m.mastery_score > 0) ? (
            <div className="h-64 flex items-center justify-center relative overflow-hidden">
              <SubjectDoughnutChart masteryData={subjectMastery} />
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center p-6 bg-[#F8FBFF] rounded-2xl border border-[#DBEAFE] text-center space-y-3">
              <BookOpen className="w-10 h-10 text-[#2563EB]" />
              <div>
                <h4 className="font-poppins font-bold text-sm text-[#1E293B]">No Subject Analytics Available</h4>
                <p className="text-xs text-[#64748B] font-inter mt-1 max-w-xs mx-auto">
                  Add subjects and take quizzes to populate your mastery breakdown chart.
                </p>
              </div>
              <button
                onClick={() => navigate('/study-planner')}
                className="px-4 py-2 rounded-xl btn-gradient-primary text-xs font-inter font-bold flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" /> Add Subjects
              </button>
            </div>
          )}
        </div>

        {/* Monthly Progress Trend Line Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-poppins font-bold text-[#1E293B] text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2563EB]" /> Monthly Accuracy Trend %
            </h3>
            <span className="text-xs font-inter text-[#38BDF8] font-bold">4-Week Timeline</span>
          </div>
          <div className="h-64 relative overflow-hidden">
            <MonthlyProgressChart monthlyData={metrics?.monthly_data} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
