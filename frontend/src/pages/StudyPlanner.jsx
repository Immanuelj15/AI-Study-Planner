import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { agentAPI, subjectsAPI, adaptiveAPI } from '../services/api';
import StudyCard from '../components/StudyCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
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

  const handleToggleStatus = async (planId) => {
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
                className="px-3.5 py-2 rounded-2xl bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#DBEAFE] text-[#2563EB] text-xs font-inter font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Calendar className="w-4 h-4 text-[#2563EB]" />
                <span>Export Calendar (.ics)</span>
              </motion.button>
            )}

            <div className="px-3.5 py-2 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-inter font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{totalHours} Total Hours</span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] text-xs font-inter font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{completionPercentage}% Complete</span>
            </div>
          </div>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleGeneratePlan} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
          <div className="space-y-1.5">
            <label className="text-xs font-inter font-bold text-[#1E293B] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#2563EB]" /> Exam Target Date
            </label>
            <input
              type="date"
              required
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full glass-input py-2.5 px-3 rounded-xl text-xs font-inter bg-[#FFFFFF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-inter font-bold text-[#1E293B] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> Daily Available Hours
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="16"
              required
              value={dailyHours}
              onChange={(e) => setDailyHours(e.target.value)}
              className="w-full glass-input py-2.5 px-3 rounded-xl text-xs font-inter bg-[#FFFFFF]"
            />
          </div>

          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={generating}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] text-white text-xs font-inter font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{generating ? 'Structuring Schedule...' : 'Build My Study Plan'}</span>
            </motion.button>
          </div>
        </form>
      </div>

      {/* 2. Interactive Filter Bar */}
      {plans.length > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-[#E2E8F0] bg-[#FFFFFF] flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-poppins font-bold text-[#1E293B]">
            <Filter className="w-4 h-4 text-[#2563EB]" />
            <span>Filter Sessions:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="glass-input py-1.5 px-3 rounded-xl text-xs font-inter bg-[#F8FBFF]"
            >
              <option value="ALL">All Subjects ({subjects.length})</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.subject_name}>{sub.subject_name}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="glass-input py-1.5 px-3 rounded-xl text-xs font-inter bg-[#F8FBFF]"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority ({highPriorityCount})</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input py-1.5 px-3 rounded-xl text-xs font-inter bg-[#F8FBFF]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending Sessions</option>
              <option value="Completed">Completed ({completedCount})</option>
            </select>
          </div>
        </div>
      )}

      {/* 3. Schedule Matrix Sessions Grid */}
      {filteredPlans.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-inter font-bold text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#2563EB]" /> Displaying {filteredPlans.length} of {plans.length} Study Sessions
            </span>
            <span className="text-[#2563EB]">Your Personalized Timetable</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredPlans.map((item, idx) => (
              <StudyCard key={idx} item={item} onToggleStatus={handleToggleStatus} />
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center text-[#64748B] font-inter text-xs border border-[#E2E8F0] space-y-3 bg-[#FFFFFF] shadow-soft">
          <CalendarDays className="w-10 h-10 text-[#94A3B8]/60 mx-auto" />
          <h3 className="font-poppins text-base font-bold text-[#1E293B]">No study plan yet. Let's create one together!</h3>
          <p className="max-w-md mx-auto">
            {plans.length === 0 
              ? "Set your exam date above and click 'Build My Study Plan' to generate your personalized study timetable." 
              : "No sessions match your selected filter criteria. Try resetting your subject or priority filters."}
          </p>
        </div>
      )}
    </motion.div>
  );
}
