import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  BarChart, 
  BookOpen, 
  Layers, 
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { questionPaperAPI, subjectsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function QuestionPaperAnalyzer() {
  const { addToast } = useToast();
  const [papers, setPapers] = useState([]);
  const [activePaper, setActivePaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [subjects, setSubjects] = useState([]);

  // Upload Form
  const [file, setFile] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('CS8492');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [semester, setSemester] = useState(4);
  const [regulation, setRegulation] = useState('R2021');

  useEffect(() => {
    loadSubjects();
    loadPapers();
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

  const loadPapers = async () => {
    setLoading(true);
    try {
      const res = await questionPaperAPI.getPapers();
      setPapers(res.data || []);
      if (res.data?.length > 0) {
        loadPaperDetails(res.data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPaperDetails = async (paperId) => {
    try {
      const res = await questionPaperAPI.getPaper(paperId);
      setActivePaper(res.data);
    } catch (e) {
      addToast('Failed to load question paper analysis.', 'error');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !subjectName) {
      addToast('Please select a file and subject.', 'error');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject_name', subjectName);
      formData.append('subject_code', subjectCode);
      formData.append('academic_year', academicYear);
      formData.append('semester', semester);
      formData.append('regulation', regulation);

      const res = await questionPaperAPI.uploadPaper(formData);
      addToast('Question paper parsed and mapped to syllabus!', 'success');
      loadPapers();
      setActivePaper(res.data);
      setFile(null);
    } catch (err) {
      addToast('Failed to process question paper.', 'error');
    } finally {
      setUploading(false);
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
            <FileText className="w-3.5 h-3.5" />
            Previous Question Paper Analyzer
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight font-poppins text-white">
            Reverse-Engineer Exam Focus Areas
          </h1>
          <p className="text-blue-100 text-sm lg:text-base leading-relaxed">
            Upload university question papers (PDF, DOCX, TXT) to extract questions, marks, and map past topic frequencies across syllabus units.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Form & Past Papers List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              Upload Question Paper
            </h2>

            <form onSubmit={handleUpload} className="space-y-3.5">
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
                  <option value="Computer Networks">Computer Networks</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Code</label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                    placeholder="e.g. CS8492"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Regulation</label>
                  <input
                    type="text"
                    value={regulation}
                    onChange={(e) => setRegulation(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                    placeholder="R2021"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                    placeholder="2024-2025"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Semester</label>
                  <input
                    type="number"
                    value={semester}
                    onChange={(e) => setSemester(parseInt(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                    min="1"
                    max="8"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">File (PDF, DOCX, TXT)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Extracting Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Paper
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Uploaded Papers History */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Papers Repository</h3>
            <div className="space-y-2">
              {papers.map(p => (
                <div
                  key={p.id}
                  onClick={() => loadPaperDetails(p.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    activePaper?.id === p.id 
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-slate-800">{p.subject_name}</div>
                    <div className="text-[10px] text-slate-500">{p.filename} • {p.academic_year}</div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    Sem {p.semester}
                  </span>
                </div>
              ))}
              {papers.length === 0 && (
                <div className="text-xs text-slate-400 py-3 text-center">No question papers uploaded yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Questions Breakdown & Topic Frequencies */}
        <div className="lg:col-span-8 space-y-6">
          {activePaper ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{activePaper.subject_name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activePaper.filename} • {activePaper.academic_year} • Reg: {activePaper.regulation} • {activePaper.total_questions} Questions Extracted
                  </p>
                </div>
                <div className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                  Past Trend Indicator
                </div>
              </div>

              {/* High-Yield Topics Frequency Badges */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <BarChart className="w-3.5 h-3.5 text-blue-600" />
                  Frequently Appearing Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activePaper.frequent_topics?.map((ft, i) => (
                    <span 
                      key={i} 
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200"
                    >
                      <span>{ft.topic}</span>
                      <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                        {ft.frequency}x
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Extracted Questions List */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                  Extracted Questions with Marks & Syllabus Units
                </h3>
                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                  {activePaper.questions?.map((q, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="font-extrabold text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg shrink-0">
                            Q{q.question_number}
                          </span>
                          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                            {q.question_text}
                          </p>
                        </div>
                        <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                          {q.marks} Marks
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 pl-8">
                        <span>Unit: <b>Unit {q.unit}</b></span>
                        <span>•</span>
                        <span>Inferred Topic: <b>{q.topic}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-400">
              <FileText className="w-12 h-12 text-blue-500/40 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 mb-1">No Question Paper Selected</h3>
              <p className="text-xs max-w-sm mx-auto">Upload a past university paper on the left to extract questions, marks, and view topic distributions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
