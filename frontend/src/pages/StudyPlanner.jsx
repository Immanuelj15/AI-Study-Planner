import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { agentAPI, subjectsAPI, adaptiveAPI } from '../services/api';
import StudyCard from '../components/StudyCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SessionVerificationModal from '../components/SessionVerificationModal';
import { useToast } from '../context/ToastContext';
import { 
  CalendarDays, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  Target, 
  CheckCircle2, 
  Filter,
  Layers,
  Heart,
  Calendar
} from 'lucide-react';

export default function StudyPlanner() {
  const [plans, setPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [examDate, setExamDate] = useState('2026-08-15');
  const [dailyHours, setDailyHours] = useState(3.5);
  const [verifyingSession, setVerifyingSession] = useState(null);
  
  // Filter States
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
      setPlans(plansRes.data || []);
      setSubjects(subsRes.data || []);
    } catch (err) {
      console.error("Error fetching study planner data:", err);
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
      setPlans(res.data || []);
      addToast("Study Plan Created 🎉 Great work!", "success");
    } catch (err) {
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStatus = (planId) => {
    const targetPlan = plans.find((p) => p.id === planId);
    if (!targetPlan) return;

    if (targetPlan.status === 'Completed') {
      executeToggleStatus(planId);
    } else {
      setVerifyingSession(targetPlan);
    }
  };

  const executeToggleStatus = async (planId) => {
    try {
      const res = await agentAPI.togglePlanStatus(planId);
      const newStatus = res.data.status;
      addToast(`Session marked as ${newStatus}! Great work! 🎉`, 'success');
      setPlans((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, status: newStatus } : p))
      );
      if (newStatus === 'Completed') {
        adaptiveAPI.trackEvent({ event_type: 'revision' }).catch(() => {});
      }
    } catch (err) {
      addToast('Something went wrong. Please try again.', 'error');
    }
  };

  // Standard iCal (.ics) Calendar Export
  const handleExportICS = () => {
    if (!plans || plans.length === 0) return;

    let csContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AI Study Planner//Study Schedule//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    plans.forEach((plan, idx) => {
      const subject = plan.subject_name || plan.subject || 'Study Session';
      const topic = plan.topic || 'General Review';
      const dateStr = plan.date ? plan.date.replace(/-/g, '') : '20260815';

      csContent.push(
        "BEGIN:VEVENT",
        `UID:study-session-${idx}-${Date.now()}@studyplanner.ai`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${dateStr}T090000Z`,
        `DTEND:${dateStr}T110000Z`,
        `SUMMARY:📚 ${subject} - ${topic}`,
        `DESCRIPTION:AI Study Planner Session: ${topic}. Allocated time: ${plan.hours || 2} hrs. Priority: ${plan.priority || 'Medium'}.`,
        "STATUS:CONFIRMED",
        "BEGIN:VALARM",
        "TRIGGER:-PT15M",
        "ACTION:DISPLAY",
        `DESCRIPTION:Reminder: ${subject} study session starts in 15 minutes!`,
        "END:VALARM",
        "END:VEVENT"
      );
    });

    csContent.push("END:VCALENDAR");

    const blob = new Blob([csContent.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "AI_Study_Schedule.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exported schedule to Google Calendar / iCal (.ics)! 📅", "success");
  };

  // Filtered Plans Logic
  const filteredPlans = useMemo(() => {
    return plans.filter((item) => {
      const itemSubject = item.subject_name || item.subject || '';
      const matchesSubject = selectedSubject === 'ALL' || itemSubject.toLowerCase() === selectedSubject.toLowerCase();
      const matchesPriority = selectedPriority === 'ALL' || item.priority === selectedPriority;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesSubject && matchesPriority && matchesStatus;
    });
  }, [plans, selectedSubject, selectedPriority, statusFilter]);

  // Derived Metrics
  const totalHours = useMemo(() => plans.reduce((acc, curr) => acc + (curr.hours || 0), 0), [plans]);
  const completedCount = useMemo(() => plans.filter((p) => p.status === 'Completed').length, [plans]);
  const highPriorityCount = useMemo(() => plans.filter((p) => p.priority === 'High').length, [plans]);
  const completionPercentage = plans.length > 0 ? Math.round((completedCount / plans.length) * 100) : 0;

  if (loading) return <LoadingSkeleton text="Preparing your study planner..." />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 font-inter"
    >
      {/* 1. Header & Adaptive Generator Control Center */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] space-y-6 shadow-soft bg-[#FFFFFF]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">
              <Heart className="w-4 h-4 text-[#2563EB] fill-[#2563EB]" /> Your Personal Study Timetable
            </div>
            <h1 className="font-poppins text-2xl lg:text-3xl font-black text-[#1E293B] mt-1">
              Personalized Study Planner
            </h1>
            <p className="text-[#64748B] font-inter text-xs mt-1 max-w-xl">
              Organize your learning timetable, set your target exam date, and let your study companion structure your days.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {plans.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportICS}
                className="px-4 py-2.5 rounded-2xl bg-[#EFF6FF] text-[#2563EB] font-poppins font-bold text-xs border border-[#DBEAFE] flex items-center gap-2 shadow-xs"
              >
                <Calendar className="w-4 h-4 text-[#2563EB]" />
                <span>Export Calendar (.ics)</span>
              </motion.button>
            )}

            <div className="px-4 py-2 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] text-xs font-inter font-bold text-[#1E293B] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              <span>{totalHours} Total Hours</span>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] text-xs font-inter font-bold text-[#15803D] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <span>{completionPercentage}% Complete</span>
            </div>
          </div>
        </div>

        {/* Timetable Configuration Form */}
        <form onSubmit={handleGeneratePlan} className="pt-2 border-t border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-poppins font-bold text-[#1E293B] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#2563EB]" /> Exam Target Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full glass-input px-4 py-2.5 rounded-2xl text-xs font-inter bg-white border border-[#E2E8F0]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-poppins font-bold text-[#1E293B] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> Daily Available Hours
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="16"
              value={dailyHours}
              onChange={(e) => setDailyHours(e.target.value)}
              className="w-full glass-input px-4 py-2.5 rounded-2xl text-xs font-inter bg-white border border-[#E2E8F0]"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={generating}
            className="py-3 px-6 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-poppins font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scheduling Timetable...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Build My Study Plan</span>
              </>
            )}
          </motion.button>
        </form>
      </div>

      {/* 2. Filter & Sort Toolbar */}
      {plans.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0]">
          <div className="flex items-center gap-2 text-xs font-inter font-bold text-[#64748B]">
            <Filter className="w-4 h-4 text-[#2563EB]" /> Filter Sessions:
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-inter font-bold bg-[#F8FBFF] border border-[#E2E8F0] text-[#1E293B]"
            >
              <option value="ALL">All Subjects ({subjects.length || 1})</option>
              {subjects.map((sub, i) => (
                <option key={i} value={sub.subject_name}>{sub.subject_name}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-inter font-bold bg-[#F8FBFF] border border-[#E2E8F0] text-[#1E293B]"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-inter font-bold bg-[#F8FBFF] border border-[#E2E8F0] text-[#1E293B]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      )}

      {/* 3. Study Sessions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-inter font-bold text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#2563EB]" /> Displaying {filteredPlans.length} of {plans.length} Study Sessions
          </span>
          <span className="text-[#2563EB]">Your Personalized Timetable</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlans.map((item) => (
            <StudyCard
              key={item.id}
              item={item}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      </div>

      {/* Session Verification Mastery Checkpoint Modal */}
      {verifyingSession && (
        <SessionVerificationModal
          sessionData={verifyingSession}
          onConfirm={(planId) => executeToggleStatus(planId)}
          onClose={() => setVerifyingSession(null)}
        />
      )}
    </motion.div>
  );
}
