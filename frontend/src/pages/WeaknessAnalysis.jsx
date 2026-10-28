import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Target,
  Zap,
  HelpCircle,
  FileText
} from 'lucide-react';
import { weaknessAPI, subjectsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function WeaknessAnalysis() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [activeTopic, setActiveTopic] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    loadSubjects();
    fetchAnalysis();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await subjectsAPI.getSubjects();
      setSubjects(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalysis = async (subj = '') => {
    setLoading(true);
    try {
      const res = await weaknessAPI.getAnalysis(subj || undefined);
      setData(res.data);
      if (res.data?.weak_topics?.length > 0) {
        handleSelectTopic(res.data.weak_topics[0].topic, res.data.weak_topics[0].subject);
      } else if (res.data?.needs_revision?.length > 0) {
        handleSelectTopic(res.data.needs_revision[0].topic, res.data.needs_revision[0].subject);
      }
    } catch (err) {
      addToast('Failed to load weakness analysis data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = async (topic, subject) => {
    setActiveTopic(topic);
    setRecLoading(true);
    try {
      const res = await weaknessAPI.getRecommendations(topic, subject);
      setRecommendations(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setRecLoading(false);
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
            <Zap className="w-3.5 h-3.5" />
            AI Weakness Detection & Interventions
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight font-poppins text-white">
            Target Weak Concepts with Precision
          </h1>
          <p className="text-blue-100 text-sm lg:text-base leading-relaxed">
            Multi-signal diagnostic engine aggregating quiz incorrect attempts, syllabus units, and study retention.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase">Filter Subject:</span>
          <select 
            value={selectedSubject} 
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              fetchAnalysis(e.target.value);
            }}
            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.subject_name}>{s.subject_name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => fetchAnalysis(selectedSubject)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Signals
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium animate-pulse">
          Analyzing student telemetry, quiz history, and topic masteries...
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-800">{data?.summary?.weak_count || 0}</div>
                  <div className="text-xs font-semibold text-slate-500">Weak Topics</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-800">{data?.summary?.needs_revision_count || 0}</div>
                  <div className="text-xs font-semibold text-slate-500">Needs Revision</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-800">{data?.summary?.strong_count || 0}</div>
                  <div className="text-xs font-semibold text-slate-500">Strong Topics</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Recommended Next</div>
                  <div className="text-sm font-extrabold text-blue-600 truncate max-w-[150px]">
                    {data?.summary?.recommended_next_topic || 'All Complete'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Split: Topics List vs Actionable Interventions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Topics List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Identified Weak & Revision Topics
                </h3>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {data?.weak_topics?.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectTopic(item.topic, item.subject)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        activeTopic === item.topic
                          ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-slate-800">{item.topic}</div>
                        <div className="text-xs text-slate-500">{item.subject} • Unit {item.unit}</div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          {item.score}%
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.attempts} attempts</div>
                      </div>
                    </button>
                  ))}

                  {data?.needs_revision?.map((item, idx) => (
                    <button
                      key={`rev-${idx}`}
                      onClick={() => handleSelectTopic(item.topic, item.subject)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        activeTopic === item.topic
                          ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-slate-800">{item.topic}</div>
                        <div className="text-xs text-slate-500">{item.subject} • Unit {item.unit}</div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          {item.score}%
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Needs Revision</div>
                      </div>
                    </button>
                  ))}

                  {(!data?.weak_topics?.length && !data?.needs_revision?.length) && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      No weak concepts detected! Take quizzes to generate detailed telemetry.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Personalized Action Recommendations */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <div className="text-xs font-bold uppercase text-blue-600 tracking-wider">
                    Personalized AI Intervention Plan
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    {activeTopic || 'Select a topic to view recommendations'}
                  </h2>
                </div>

                {recLoading ? (
                  <div className="p-8 text-center text-slate-400 animate-pulse">
                    Synthesizing syllabus notes, worked examples, and diagnostic tools...
                  </div>
                ) : recommendations ? (
                  <div className="space-y-4">
                    {recommendations.rag_available && (
                      <div className="p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Grounded in College Syllabus: </span>
                          <span>Relevant curriculum text found and ready for focused study.</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                      {recommendations.actions.map((act, i) => (
                        <div 
                          key={i}
                          className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition bg-slate-50/50 flex items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700">
                                {act.tag}
                              </span>
                              <div className="font-bold text-slate-800 text-sm">{act.title}</div>
                            </div>
                            <p className="text-xs text-slate-600">{act.description}</p>
                          </div>
                          <a
                            href={act.action_url}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 transition"
                          >
                            <span>Start</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    Choose a concept on the left to inspect multi-agent recommendations.
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
