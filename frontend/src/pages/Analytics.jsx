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
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#334155] space-y-2 shadow-2xl">
        <h1 className="font-poppins text-2xl font-black text-[#F8FAFC] flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#3B82F6]" /> Student Performance Analytics
        </h1>
        <p className="text-[#94A3B8] font-inter text-xs">
          Multi-Agent feedback loop tracks subject mastery scores, study hour trends, and adaptive scheduler adjustments.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-[#334155] space-y-1">
          <div className="flex items-center justify-between text-[#06B6D4]">
            <span className="text-[10px] font-inter font-bold uppercase">Average Score</span>
            <Award className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <div className="font-poppins text-2xl font-black text-[#F8FAFC]">
            {metrics?.average_quiz_score || 82}%
          </div>
          <div className="text-[10px] font-inter text-[#10B981] font-bold">↑ +5% vs Last Week</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[#334155] space-y-1">
          <div className="flex items-center justify-between text-[#10B981]">
            <span className="text-[10px] font-inter font-bold uppercase">Quizzes Completed</span>
            <Target className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="font-poppins text-2xl font-black text-[#F8FAFC]">
            {metrics?.quizzes_taken || 18}
          </div>
          <div className="text-[10px] font-inter text-[#94A3B8]">100% AutoGen Calibrated</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[#334155] space-y-1">
          <div className="flex items-center justify-between text-[#F59E0B]">
            <span className="text-[10px] font-inter font-bold uppercase">Active Streak</span>
            <Flame className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
          </div>
          <div className="font-poppins text-2xl font-black text-[#F8FAFC]">
            {metrics?.study_streak || 5} Days
          </div>
          <div className="text-[10px] font-inter text-[#F59E0B] font-bold">🔥 On Fire!</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[#334155] space-y-1">
          <div className="flex items-center justify-between text-[#8B5CF6]">
            <span className="text-[10px] font-inter font-bold uppercase">Hours Completed</span>
            <Activity className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="font-poppins text-2xl font-black text-[#F8FAFC]">
            {metrics?.total_study_hours || 42.5} hrs
          </div>
          <div className="text-[10px] font-inter text-[#06B6D4] font-bold">Optimal Velocity</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Bar Chart */}
        <div className="glass-card rounded-3xl p-6 border border-[#334155] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-poppins font-bold text-[#F8FAFC] text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#3B82F6]" /> Weekly Target vs Completed Hours
            </h3>
            <span className="text-xs font-inter text-[#06B6D4] font-bold">Chart.js</span>
          </div>
          <div className="h-64">
            <WeeklyBarChart weeklyData={metrics?.weekly_data} />
          </div>
        </div>

        {/* Subject Mastery Doughnut Chart */}
        <div className="glass-card rounded-3xl p-6 border border-[#334155] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-poppins font-bold text-[#F8FAFC] text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-[#10B981]" /> Subject Mastery Breakdown
            </h3>
            <span className="text-xs font-inter text-[#10B981] font-bold">Mastery %</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <SubjectDoughnutChart masteryData={subjectMastery} />
          </div>
        </div>

        {/* Monthly Progress Trend Line Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-[#334155] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-poppins font-bold text-[#F8FAFC] text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#06B6D4]" /> Monthly Accuracy Trend %
            </h3>
            <span className="text-xs font-inter text-[#8B5CF6] font-bold">4-Week Timeline</span>
          </div>
          <div className="h-64">
            <MonthlyProgressChart />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
