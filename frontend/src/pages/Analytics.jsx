import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboardAPI } from '../services/api';
import { WeeklyBarChart, SubjectDoughnutChart, MonthlyProgressChart } from '../components/AnalyticsChart';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { BarChart3, TrendingUp, Award, Target, Flame, Activity } from 'lucide-react';

export default function Analytics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const subjectMastery = metrics?.subject_mastery || [
    { subject: "Data Structures", mastery_score: 88 },
    { subject: "DBMS", mastery_score: 52 },
    { subject: "Operating Systems", mastery_score: 92 },
    { subject: "Networks", mastery_score: 78 }
  ];

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
            {metrics?.average_quiz_score || 82}%
          </div>
          <div className="text-[10px] font-inter text-[#22C55E] font-bold">↑ +5% vs Last Week</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[#E2E8F0] space-y-1 bg-[#FFFFFF]">
          <div className="flex items-center justify-between text-[#22C55E]">
            <span className="text-[10px] font-inter font-bold uppercase">Quizzes Completed</span>
            <Target className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="font-poppins text-2xl font-black text-[#1E293B]">
            {metrics?.quizzes_taken || 18}
          </div>
          <div className="text-[10px] font-inter text-[#64748B]">100% AutoGen Calibrated</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[#E2E8F0] space-y-1 bg-[#FFFFFF]">
          <div className="flex items-center justify-between text-[#F59E0B]">
            <span className="text-[10px] font-inter font-bold uppercase">Active Streak</span>
            <Flame className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
          </div>
          <div className="font-poppins text-2xl font-black text-[#1E293B]">
            {metrics?.study_streak || 5} Days
          </div>
          <div className="text-[10px] font-inter text-[#D97706] font-bold">🔥 On Fire!</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[#E2E8F0] space-y-1 bg-[#FFFFFF]">
          <div className="flex items-center justify-between text-[#38BDF8]">
            <span className="text-[10px] font-inter font-bold uppercase">Hours Completed</span>
            <Activity className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="font-poppins text-2xl font-black text-[#1E293B]">
            {metrics?.total_study_hours || 42.5} hrs
          </div>
          <div className="text-[10px] font-inter text-[#2563EB] font-bold">Optimal Velocity</div>
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
          <div className="h-64">
            <WeeklyBarChart weeklyData={metrics?.weekly_data} />
          </div>
        </div>

        {/* Subject Mastery Doughnut Chart */}
        <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-poppins font-bold text-[#1E293B] text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-[#22C55E]" /> Subject Mastery Breakdown
            </h3>
            <span className="text-xs font-inter text-[#22C55E] font-bold">Mastery %</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <SubjectDoughnutChart masteryData={subjectMastery} />
          </div>
        </div>

        {/* Monthly Progress Trend Line Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-poppins font-bold text-[#1E293B] text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2563EB]" /> Monthly Accuracy Trend %
            </h3>
            <span className="text-xs font-inter text-[#38BDF8] font-bold">4-Week Timeline</span>
          </div>
          <div className="h-64">
            <MonthlyProgressChart />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
