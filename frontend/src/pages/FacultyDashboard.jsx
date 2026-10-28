import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  ShieldAlert, 
  Filter, 
  BarChart2, 
  Sparkles,
  BookOpen,
  Search,
  GraduationCap
} from 'lucide-react';
import { facultyAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function FacultyDashboard() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOverview();
  }, [department, semester, section]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await facultyAPI.getOverview({
        department: department || undefined,
        semester: semester ? parseInt(semester) : undefined,
        section: section || undefined
      });
      setData(res.data);
    } catch (e) {
      addToast('Failed to load faculty analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = data?.students?.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'ALL' || s.early_warning_status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div 
        className="rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-lg border border-blue-400/20"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #0EA5E9 100%)' }}
      >
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-white">
            <GraduationCap className="w-3.5 h-3.5" />
            Faculty Analytics & AI Early Warning System
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight font-poppins text-white">
            Class-Wide Mastery & Academic Support
          </h1>
          <p className="text-blue-100 text-sm lg:text-base leading-relaxed">
            Multi-signal class telemetry, transparent rule-based early warnings, and common syllabus weak areas.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics</option>
          </select>

          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>

          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium animate-pulse">
          Aggregating department telemetry, quiz distributions, and student learning signals...
        </div>
      ) : (
        <>
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-full flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-extrabold text-slate-800">{data?.total_students || 0}</div>
                <div className="text-xs font-semibold text-slate-500 truncate">Total Enrolled</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-full flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-extrabold text-slate-800">{data?.average_quiz_score || 0}%</div>
                <div className="text-xs font-semibold text-slate-500 truncate">Average Quiz Score</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-full flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-extrabold text-slate-800">{data?.participation_rate || 0}%</div>
                <div className="text-xs font-semibold text-slate-500 truncate">Student Participation</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs h-full flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-extrabold text-red-600">
                  {data?.status_distribution?.['At Risk'] || 0}
                </div>
                <div className="text-xs font-semibold text-slate-500 truncate">Needs Support (At Risk)</div>
              </div>
            </div>
          </div>

          {/* AI Early Warning Status Tabs & Common Weak Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Common Weak Topics across the cohort */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Class-Wide Common Weak Topics
              </h3>
              <p className="text-xs text-slate-500">
                Syllabus concepts where multiple students repeatedly scored below 60% in diagnostic quizzes.
              </p>

              <div className="space-y-3 pt-2">
                {data?.common_weak_topics?.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-800">{item.topic}</div>
                      <div className="text-[10px] text-slate-400">Class Remediation Recommended</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-700">
                      {item.student_count} students
                    </span>
                  </div>
                ))}
                {(!data?.common_weak_topics || data?.common_weak_topics.length === 0) && (
                  <div className="text-xs text-slate-400 text-center py-6">
                    No critical cohort-wide weak topics identified.
                  </div>
                )}
              </div>
            </div>

            {/* Status Breakdown Buttons */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                  Student Intervention Alerts
                </h3>
                <div className="flex items-center gap-1.5">
                  {['ALL', 'On Track', 'Needs Attention', 'At Risk'].map(st => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        selectedStatusFilter === st
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st} {st !== 'ALL' && data?.status_distribution?.[st] !== undefined ? `(${data.status_distribution[st]})` : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Cards List */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {filteredStudents.map((s) => (
                  <div
                    key={s.student_id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-white space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.email} • Sec {s.section} • Sem {s.semester}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        s.early_warning_status === 'At Risk' ? 'bg-red-100 text-red-700 border border-red-200' :
                        s.early_warning_status === 'Needs Attention' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {s.early_warning_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div><span className="text-slate-400">Avg Quiz:</span> <b className="text-slate-700">{s.average_score}%</b></div>
                      <div><span className="text-slate-400">Completion:</span> <b className="text-slate-700">{s.syllabus_completion}%</b></div>
                      <div><span className="text-slate-400">Attempts:</span> <b className="text-slate-700">{s.quiz_attempts}</b></div>
                      <div><span className="text-slate-400">Dept:</span> <b className="text-slate-700">{s.department}</b></div>
                    </div>

                    <div className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50 space-y-1">
                      <div><b>Signal:</b> {s.supporting_reasons?.join(', ')}</div>
                      <div className="text-blue-700"><b>Intervention:</b> {s.recommended_intervention}</div>
                    </div>
                  </div>
                ))}
                {filteredStudents.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No students match the current filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
