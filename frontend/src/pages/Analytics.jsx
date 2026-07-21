import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { SubjectDoughnutChart } from '../components/AnalyticsChart';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { BarChart3, Award, Clock, Target } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await dashboardAPI.getAnalytics();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton text="Loading Analytics & Mastery Metrics..." />;

  const topicMastery = data?.topic_mastery || [];

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 space-y-2">
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-cyan" /> Performance & Mastery Analytics
        </h1>
        <p className="text-slate-400 text-xs">
          Analyze topic accuracy, total hours studied, and subject time distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-500/10 text-brand-cyan">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-100">{data?.total_study_hours || 42.5} hrs</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Study Time</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-purple/10 text-brand-purple">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-100">{data?.average_accuracy || 81.4}%</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Average Accuracy</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-100">{data?.total_quizzes_completed || 8}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Quizzes Completed</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Mastery List */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-100">Topic Mastery Breakdown</h3>
          <div className="space-y-3">
            {topicMastery.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{item.subject}</h4>
                  <span className="text-[10px] text-slate-400">Difficulty: {item.difficulty}</span>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-black ${item.mastery_score >= 80 ? 'text-emerald-400' : item.mastery_score < 60 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {item.mastery_score}%
                  </div>
                  <div className="text-[10px] text-slate-400">Mastery Score</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Distribution Doughnut Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-100">Subject Study Time Distribution</h3>
          <div className="w-64 mx-auto">
            <SubjectDoughnutChart masteryData={topicMastery} />
          </div>
        </div>
      </div>
    </div>
  );
}
