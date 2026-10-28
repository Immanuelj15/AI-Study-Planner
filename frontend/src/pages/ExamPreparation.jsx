import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Flame, 
  BookOpen, 
  Trash2, 
  Award, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { examPrepAPI, subjectsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ExamPreparation() {
  const { addToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);

  // Form State
  const [subjectName, setSubjectName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [availableHours, setAvailableHours] = useState(3.0);
  const [prepLevel, setPrepLevel] = useState('Intermediate');
  const [preferredTime, setPreferredTime] = useState('Morning (9:00 AM - 12:00 PM)');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadSubjects();
    loadPlans();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await subjectsAPI.getSubjects();
      setSubjects(res.data || []);
      if (res.data?.length > 0) {
        setSubjectName(res.data[0].subject_name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await examPrepAPI.getPlans();
      setPlans(res.data || []);
      if (res.data?.length > 0) {
        setActivePlan(res.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!subjectName || !examDate) {
      addToast('Please provide subject and exam date.', 'error');
      return;
    }
    setGenerating(true);
    try {
      const res = await examPrepAPI.createPlan({
        subject_name: subjectName,
        exam_date: examDate,
        available_hours_per_day: parseFloat(availableHours),
        preparation_level: prepLevel,
        preferred_study_time: preferredTime
      });
      addToast('Exam preparation plan generated successfully!', 'success');
      loadPlans();
    } catch (err) {
      addToast('Failed to generate exam plan.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      await examPrepAPI.toggleTask(taskId);
      // Refresh current active plan
      if (activePlan) {
        const res = await examPrepAPI.getPlan(activePlan.id);
        setActivePlan(res.data);
      }
    } catch (e) {
      addToast('Failed to update task status.', 'error');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this exam preparation plan?')) return;
    try {
      await examPrepAPI.deletePlan(planId);
      addToast('Plan deleted.', 'info');
      loadPlans();
    } catch (e) {
      addToast('Failed to delete plan.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div 
        className="rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-lg border border-blue-400/20"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #0EA5E9 100%)' }}
      >
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-white">
            <Flame className="w-3.5 h-3.5" />
            Exam Preparation Mode
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight font-poppins text-white">
            Sprint to Exam Day with Real Syllabus Milestones
          </h1>
          <p className="text-blue-100 text-sm lg:text-base leading-relaxed">
            Automatic day-by-day task distribution across syllabus units, diagnostic assessments, and spaced mock exams.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form to create new plan */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Generate Exam Sprint Plan
            </h2>

            <form onSubmit={handleCreatePlan} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Subject</label>
                <select
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.subject_name}>{s.subject_name}</option>
                  ))}
                  <option value="Database Management Systems">Database Management Systems</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Computer Networks">Computer Networks</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Daily Study Hours ({availableHours}h)
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(e.target.value)}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Preparation Level</label>
                <select
                  value={prepLevel}
                  onChange={(e) => setPrepLevel(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium"
                >
                  <option value="Beginner">Beginner (Intensive Syllabus Foundations)</option>
                  <option value="Intermediate">Intermediate (Standard Curriculum Pace)</option>
                  <option value="Advanced">Advanced (High-Yield Practice & Mocks)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Preferred Time Block</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium"
                >
                  <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
                  <option value="Evening (6:00 PM - 9:00 PM)">Evening (6:00 PM - 9:00 PM)</option>
                  <option value="Night (10:00 PM - 1:00 AM)">Night (10:00 PM - 1:00 AM)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Calculating Schedule...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Build Exam Schedule
                  </>
                )}
              </button>
            </form>
          </div>

          {/* List of Student's Active Plans */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Active Exam Plans</h3>
            <div className="space-y-2">
              {plans.map(p => (
                <div
                  key={p.id}
                  onClick={() => setActivePlan(p)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    activePlan?.id === p.id 
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-slate-800">{p.subject_name}</div>
                    <div className="text-[10px] text-slate-500">Exam: {p.exam_date}</div>
                  </div>
                  <span className="text-[11px] font-extrabold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-full">
                    {p.days_countdown}d left
                  </span>
                </div>
              ))}
              {plans.length === 0 && (
                <div className="text-xs text-slate-400 py-3 text-center">No active exam plans yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Plan Tasks and Progress */}
        <div className="lg:col-span-8 space-y-6">
          {activePlan ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* Header with Countdown and Progress */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900">{activePlan.subject_name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      {activePlan.preparation_level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Exam Date: {activePlan.exam_date} • {activePlan.available_hours_per_day} hrs/day • {activePlan.preferred_study_time}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-600">{activePlan.days_countdown}</div>
                    <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Days Remaining</div>
                  </div>
                  <button
                    onClick={() => handleDeletePlan(activePlan.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Syllabus Completion</span>
                  <span className="text-blue-600">{activePlan.completion_percentage}% ({activePlan.completed_tasks}/{activePlan.total_tasks} tasks)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300 rounded-full"
                    style={{ width: `${activePlan.completion_percentage}%` }}
                  />
                </div>
              </div>

              {/* Day-by-Day Task Timeline */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Daily Milestone Tasks</h3>
                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {activePlan.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-4 ${
                        task.status === 'Completed'
                          ? 'border-emerald-200 bg-emerald-50/40 opacity-80'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 transition"
                        >
                          {task.status === 'Completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                        <div className="space-y-0.5">
                          <div className={`text-sm font-bold ${task.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                            {task.topic}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-slate-600">{task.study_date}</span>
                            <span>•</span>
                            <span>{task.allocated_hours} hrs</span>
                            <span>•</span>
                            <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                              task.task_type === 'Mock Exam' ? 'bg-purple-100 text-purple-700' :
                              task.task_type === 'Quiz' ? 'bg-amber-100 text-amber-700' :
                              task.task_type === 'Revision' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {task.task_type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {task.priority} Priority
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-400">
              <Calendar className="w-12 h-12 text-blue-500/40 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 mb-1">No Active Exam Schedule Selected</h3>
              <p className="text-xs max-w-sm mx-auto">Generate a new plan on the left or select an active subject plan to view your day-by-day exam roadmap.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
