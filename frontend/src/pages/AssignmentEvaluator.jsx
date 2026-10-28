import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  Clock, 
  Award,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { assignmentAPI, subjectsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AssignmentEvaluator() {
  const { addToast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Form
  const [subjectName, setSubjectName] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [questionPrompt, setQuestionPrompt] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [rubric, setRubric] = useState('');
  const [unitNumber, setUnitNumber] = useState(1);

  // Result
  const [evaluationResult, setEvaluationResult] = useState(null);

  useEffect(() => {
    loadSubjects();
    loadHistory();
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

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await assignmentAPI.getHistory();
      setHistory(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subjectName || !assignmentTitle || !questionPrompt || !studentAnswer) {
      addToast('Please fill out all required assignment fields.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await assignmentAPI.evaluate({
        subject_name: subjectName,
        assignment_title: assignmentTitle,
        question_prompt: questionPrompt,
        student_answer: studentAnswer,
        unit_number: unitNumber,
        rubric: rubric || undefined
      });
      setEvaluationResult(res.data);
      addToast('Practice assignment evaluated successfully!', 'success');
      loadHistory();
    } catch (err) {
      addToast('Evaluation failed. Please try again.', 'error');
    } finally {
      setLoading(false);
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
            <FileCheck className="w-3.5 h-3.5" />
            AI Assignment Evaluator & Rubric Review
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight font-poppins text-white">
            Instant Practice Review Before Final Submission
          </h1>
          <p className="text-blue-100 text-sm lg:text-base leading-relaxed">
            Get multi-dimensional conceptual feedback, detect missing key points, and refine your technical answers against syllabus rubrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submission Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              Submit Practice Answer
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Subject</label>
                <select
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.subject_name}>{s.subject_name}</option>
                  ))}
                  <option value="Database Management Systems">Database Management Systems</option>
                  <option value="Operating Systems">Operating Systems</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Assignment Title / Topic</label>
                  <input
                    type="text"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    placeholder="e.g. Normalization & BCNF"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Unit</label>
                  <input
                    type="number"
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(parseInt(e.target.value))}
                    min="1"
                    max="5"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Assignment Question</label>
                <textarea
                  rows="2"
                  value={questionPrompt}
                  onChange={(e) => setQuestionPrompt(e.target.value)}
                  placeholder="Paste the exact question prompt..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Your Written Answer</label>
                <textarea
                  rows="5"
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Type or paste your complete answer here..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Grading Rubric (Optional)</label>
                <input
                  type="text"
                  value={rubric}
                  onChange={(e) => setRubric(e.target.value)}
                  placeholder="e.g. Accuracy (40%), Technical Depth (40%), Examples (20%)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Reviewing Conceptually...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Evaluate Practice Answer
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Past Submissions History */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Past Submissions</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {history.map(item => (
                <div
                  key={item.id}
                  onClick={() => setEvaluationResult(item)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-slate-800">{item.assignment_title}</div>
                    <div className="text-[10px] text-slate-400">{item.submitted_at}</div>
                  </div>
                  <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {item.estimated_score}%
                  </span>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-xs text-slate-400 text-center py-4">No practice submissions yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Feedback Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {evaluationResult ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* Header with Score */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{evaluationResult.assignment_title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{evaluationResult.subject_name}</p>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-blue-600">{evaluationResult.estimated_score}%</div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Practice Score Estimate</div>
                </div>
              </div>

              {/* Feedback Breakdown Cards */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-blue-200/60 bg-blue-50/40 space-y-1">
                  <div className="font-bold text-xs text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Conceptual Correctness
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {evaluationResult.conceptual_correctness}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200/60 bg-emerald-50/40 space-y-1">
                  <div className="font-bold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Key Points Covered
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {evaluationResult.key_points_covered}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-amber-200/60 bg-amber-50/40 space-y-1">
                  <div className="font-bold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Missing Concepts & Edge Cases
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {evaluationResult.missing_concepts}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <div className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Clarity, Structure & Technical Improvements
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {evaluationResult.clarity_feedback}
                  </p>
                  <p className="text-xs text-blue-700 font-semibold pt-1">
                    <b>Recommendation:</b> {evaluationResult.suggested_improvements}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <b>Disclaimer:</b> {evaluationResult.disclaimer || "This is diagnostic practice feedback for student mastery, not an official academic grade."}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-400">
              <FileCheck className="w-12 h-12 text-blue-500/40 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 mb-1">No Assignment Evaluated Yet</h3>
              <p className="text-xs max-w-sm mx-auto">Fill in the assignment question and your answer on the left to receive instant rubric-aligned feedback.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
