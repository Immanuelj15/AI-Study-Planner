import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { agentAPI, subjectsAPI } from '../services/api';
import StudyCard from '../components/StudyCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { CalendarDays, Sparkles, RefreshCw } from 'lucide-react';

export default function StudyPlanner() {
  const [plans, setPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [examDate, setExamDate] = useState('2026-08-15');
  const [dailyHours, setDailyHours] = useState(3.5);
  const { addToast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [plansRes, subsRes] = await Promise.all([
        agentAPI.getStudyPlan(),
        subjectsAPI.getSubjects()
      ]);
      setPlans(plansRes.data);
      setSubjects(subsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setGenerating(true);

    const subjectNames = subjects.length > 0 
      ? subjects.map((s) => s.subject_name)
      : ["Data Structures", "DBMS", "Operating Systems"];

    try {
      const res = await agentAPI.generatePlan({
        exam_date: examDate,
        daily_hours: parseFloat(dailyHours),
        subjects: subjectNames
      });
      setPlans(res.data);
      addToast("Scheduler Agent generated your adaptive plan!", "success");
    } catch (err) {
      addToast("Failed to generate study plan.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStatus = async (planId) => {
    try {
      const res = await agentAPI.togglePlanStatus(planId);
      addToast(`Session marked as ${res.data.status}!`, 'success');
      setPlans((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, status: res.data.status } : p))
      );
    } catch (err) {
      addToast('Failed to update session status.', 'error');
    }
  };

  if (loading) return <LoadingSkeleton text="Loading Study Schedule..." />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header & Controls */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#334155] space-y-6 shadow-2xl">
        <div>
          <h1 className="font-poppins text-2xl font-black text-[#F8FAFC] flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#8B5CF6]" /> Agent 4 Adaptive Scheduler
          </h1>
          <p className="text-[#94A3B8] font-inter text-xs mt-1">
            Configure exam target date & daily study hours. Agent 4 dynamically recalculates allocated study hours based on quiz scores.
          </p>
        </div>

        <form onSubmit={handleGeneratePlan} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#1E293B] border border-[#334155]">
          <div className="space-y-1">
            <label className="text-xs font-inter font-bold text-[#F8FAFC]">Exam Target Date</label>
            <input
              type="date"
              required
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full glass-input py-2.5 px-3 rounded-xl text-xs font-inter"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-inter font-bold text-[#F8FAFC]">Daily Available Hours</label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="16"
              required
              value={dailyHours}
              onChange={(e) => setDailyHours(e.target.value)}
              className="w-full glass-input py-2.5 px-3 rounded-xl text-xs font-inter"
            />
          </div>

          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={generating}
              className="w-full py-2.5 px-4 rounded-xl btn-gradient-primary text-xs font-inter font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{generating ? 'Agent Scheduling...' : 'Generate New Plan'}</span>
            </motion.button>
          </div>
        </form>
      </div>

      {/* Plan Timeline Grid */}
      {plans.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-inter font-bold text-[#94A3B8]">
            <span>Generated Adaptive Schedule Matrix ({plans.length} sessions)</span>
            <span className="text-[#06B6D4]">Sorted by Priority & Date</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((item, idx) => (
              <StudyCard key={idx} item={item} onToggleStatus={handleToggleStatus} />
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center text-[#94A3B8] font-inter text-xs border border-[#334155] space-y-2">
          <CalendarDays className="w-8 h-8 text-[#94A3B8]/60 mx-auto" />
          <p>No study plan generated yet. Click "Generate New Plan" above to create an adaptive schedule!</p>
        </div>
      )}
    </motion.div>
  );
}
