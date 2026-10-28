import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  RotateCw, 
  Search, 
  Sparkles, 
  GraduationCap, 
  HelpCircle, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  ShieldCheck, 
  UserCheck, 
  BookMarked,
  Filter
} from 'lucide-react';
import { ragAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CollegeMaterials() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('repository'); // 'repository' | 'upload' | 'query'
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');

  // Upload Form State
  const [file, setFile] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [unitNumber, setUnitNumber] = useState('1');
  const [collegeId, setCollegeId] = useState(user?.college_id || 'Anna University');
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [courseName, setCourseName] = useState('B.Tech Information Technology');
  const [semester, setSemester] = useState(user?.semester || '3');
  const [documentType, setDocumentType] = useState('Syllabus');
  const [isOfficial, setIsOfficial] = useState(user?.role === 'Faculty' || user?.role === 'College Admin');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // RAG Query State
  const [querySubject, setQuerySubject] = useState('');
  const [queryUnit, setQueryUnit] = useState('1');
  const [queryDifficulty, setQueryDifficulty] = useState('Medium');
  const [questionText, setQuestionText] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Load documents
  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await ragAPI.getDocuments();
      setDocuments(res.data || []);
      // Extract unique subjects
      const subjs = Array.from(new Set((res.data || []).map(d => d.subject_name).filter(Boolean)));
      setAvailableSubjects(subjs);
      if (subjs.length > 0 && !querySubject) {
        setQuerySubject(subjs[0]);
      }
    } catch (err) {
      addToast('Failed to load study materials. Please check your network connection.', 'error');
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle Document Upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      addToast('Please select a PDF, DOCX, or TXT file to upload.', 'warning');
      return;
    }
    if (!subjectName.trim()) {
      addToast('Please enter the Subject Name.', 'warning');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject_name', subjectName.trim());
    formData.append('college_id', collegeId);
    formData.append('department', department);
    formData.append('course_name', courseName);
    formData.append('semester', semester);
    formData.append('unit_number', unitNumber);
    formData.append('document_type', documentType);
    formData.append('is_official', isOfficial ? 'true' : 'false');

    try {
      const res = await ragAPI.uploadDocument(formData);
      addToast(`🎉 ${res.data.filename} uploaded & ${res.data.total_chunks} chunks indexed!`, 'success');
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';
      fetchDocuments();
      setActiveTab('repository');
    } catch (err) {
      const errorDetail = err.response?.data?.detail || err.message || 'Failed to process document.';
      addToast(errorDetail, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Handle Document Deletion
  const handleDelete = async (docId, filename) => {
    if (!window.confirm(`Are you sure you want to delete '${filename}' and its vector index?`)) return;
    try {
      await ragAPI.deleteDocument(docId);
      addToast(`Document '${filename}' deleted successfully.`, 'info');
      fetchDocuments();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to delete document.', 'error');
    }
  };

  // Handle Document Reprocessing
  const handleReprocess = async (docId, filename) => {
    try {
      addToast(`Reprocessing '${filename}'...`, 'info');
      await ragAPI.reprocessDocument(docId);
      addToast(`Document '${filename}' reprocessed successfully!`, 'success');
      fetchDocuments();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Reprocessing failed.', 'error');
    }
  };

  // Handle Grounded RAG Query
  const handleQuery = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) {
      addToast('Please enter a question to ask from your syllabus.', 'warning');
      return;
    }

    setQueryLoading(true);
    setQueryResult(null);

    try {
      const res = await ragAPI.query({
        question: questionText.trim(),
        subject_name: querySubject || undefined,
        unit_number: queryUnit ? parseInt(queryUnit) : undefined,
        difficulty: queryDifficulty
      });
      setQueryResult(res.data);
    } catch (err) {
      addToast(err.response?.data?.detail || 'Query failed. Please try again.', 'error');
    } finally {
      setQueryLoading(false);
    }
  };

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.department && doc.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubj = selectedSubjectFilter === 'ALL' || doc.subject_name.toLowerCase() === selectedSubjectFilter.toLowerCase();
    return matchesSearch && matchesSubj;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-inter text-[#1E293B]">
      {/* Top Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-poppins font-bold tracking-wide uppercase text-blue-100">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>College Isolation Active • {user?.college_id || 'College_Main'}</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold font-poppins tracking-tight">
            College Syllabus & Study Material RAG Hub
          </h1>
          <p className="text-blue-100 text-xs md:text-sm max-w-3xl leading-relaxed">
            Upload official university syllabus, faculty lecture notes, and unit modules. The Multi-Agent AI directly grounds study notes, mind maps, and tutor answers strictly in your verified course curriculum.
          </p>

          {/* Navigation Tab Bar */}
          <div className="pt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('repository')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'repository'
                  ? 'bg-white text-blue-800 shadow-md font-bold'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Material Repository ({documents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-800 shadow-md font-bold'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Syllabus / Material</span>
            </button>
            <button
              onClick={() => setActiveTab('query')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'query'
                  ? 'bg-amber-400 text-slate-900 shadow-md font-bold'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask from Syllabus (RAG)</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* TAB 1: REPOSITORY VIEW */}
      {activeTab === 'repository' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Filter and Search Bar */}
          <div className="glass-card p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by file name, subject, department..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none"
              >
                <option value="ALL">All Subjects</option>
                {availableSubjects.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>

              <button
                onClick={fetchDocuments}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Refresh materials"
              >
                <RotateCw className={`w-4 h-4 ${loadingDocs ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Document Grid */}
          {loadingDocs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-5 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                  <div className="h-8 bg-slate-100 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-poppins font-bold text-base text-slate-800">No Study Materials Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No documents found for {user?.college_id || 'your college'}. Upload your college syllabus, lecture notes, or unit materials to start grounded AI learning.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                + Upload First Syllabus Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => {
                const isReady = doc.processing_status === 'Ready';
                const isFailed = doc.processing_status === 'Failed';
                const isProcessing = doc.processing_status === 'Processing' || doc.processing_status === 'Uploaded';
                const isMyDoc = doc.owner_id === user?.id;

                return (
                  <motion.div
                    key={doc.document_id}
                    layout
                    className="glass-card p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-200 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {doc.is_official === 1 ? (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-indigo-600" />
                              Official Syllabus
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-slate-500" />
                              Personal Notes
                            </span>
                          )}

                          {doc.unit_number && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                              Unit {doc.unit_number}
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        {isReady && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Ready
                          </span>
                        )}
                        {isProcessing && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 animate-spin" />
                            Indexing
                          </span>
                        )}
                        {isFailed && (
                          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold flex items-center gap-1" title={doc.error_message || ''}>
                            <AlertCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </div>

                      {/* Title & Subject */}
                      <div>
                        <h4 className="font-poppins font-bold text-sm text-slate-800 line-clamp-1" title={doc.filename}>
                          {doc.filename}
                        </h4>
                        <div className="text-xs font-semibold text-blue-600 mt-0.5">
                          {doc.subject_name}
                        </div>
                      </div>

                      {/* Metadata Details */}
                      <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex justify-between">
                          <span>College:</span>
                          <span className="font-medium text-slate-700">{doc.college_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Department:</span>
                          <span className="font-medium text-slate-700">{doc.department || 'CSE'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Indexed Chunks:</span>
                          <span className="font-bold text-slate-800">{doc.total_chunks} Chunks</span>
                        </div>
                        <div className="flex justify-between">
                          <span>File Size:</span>
                          <span className="font-medium text-slate-700">{(doc.file_size_bytes / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>

                      {isFailed && doc.error_message && (
                        <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-[10px] text-red-700">
                          <strong>Error:</strong> {doc.error_message}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setQuerySubject(doc.subject_name);
                          if (doc.unit_number) setQueryUnit(doc.unit_number.toString());
                          setActiveTab('query');
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Query This Unit</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {isFailed && (
                          <button
                            onClick={() => handleReprocess(doc.document_id, doc.filename)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Retry document processing"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(isMyDoc || user?.role === 'College Admin') && (
                          <button
                            onClick={() => handleDelete(doc.document_id, doc.filename)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete document and vectors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 2: UPLOAD VIEW */}
      {activeTab === 'upload' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="glass-card p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-poppins font-bold text-slate-800 flex items-center gap-2">
                <UploadCloud className="w-6 h-6 text-blue-600" />
                Upload Official Syllabus & Study Materials
              </h2>
              <p className="text-xs text-slate-500">
                Uploaded materials are automatically validated, parsed, chunked, and embedded into ChromaDB with strict college isolation.
              </p>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              {/* File Dropzone */}
              <div className="p-6 border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 rounded-2xl text-center space-y-2 cursor-pointer transition-colors relative">
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-700">Click to upload file</span>
                  <span className="text-xs text-slate-500"> or drag and drop</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Supported formats: PDF (Searchable), DOCX, TXT • Max 25 MB
                </p>
                {file && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Subject Name *</label>
                  <input
                    type="text"
                    required
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. Database Management Systems"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Unit / Module Number</label>
                  <select
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="1">Unit 1</option>
                    <option value="2">Unit 2</option>
                    <option value="3">Unit 3</option>
                    <option value="4">Unit 4</option>
                    <option value="5">Unit 5</option>
                    <option value="0">General Syllabus / Whole Course</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">College / Institution</label>
                  <input
                    type="text"
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    placeholder="e.g. Anna University"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Document Type</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="Syllabus">Official College Syllabus</option>
                    <option value="Subject Notes">Subject Lecture Notes</option>
                    <option value="Unit Material">Unit-wise Study Material</option>
                    <option value="Question Paper">Previous Year Question Paper</option>
                    <option value="Faculty Resource">Faculty Resource Guide</option>
                  </select>
                </div>
              </div>

              {/* Official Permission Checkbox */}
              {(user?.role === 'Faculty' || user?.role === 'College Admin') && (
                <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="is-official-check"
                    checked={isOfficial}
                    onChange={(e) => setIsOfficial(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <label htmlFor="is-official-check" className="text-xs text-indigo-900 cursor-pointer">
                    <span className="font-bold">Publish as Official College Material</span>
                    <span className="block text-[11px] text-indigo-700">
                      When enabled, this syllabus will be accessible to all students enrolled in {collegeId}.
                    </span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading || !file || !subjectName.trim()}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Processing & Indexing Document Chunks...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload & Ingest into Vector Store</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* TAB 3: GROUNDED RAG QUERY VIEW */}
      {activeTab === 'query' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Query Formulation Card */}
          <div className="glass-card p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-1">
                <h2 className="text-xl font-poppins font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Ask from My Syllabus (RAG Query)
                </h2>
                <p className="text-xs text-slate-500">
                  Retrieves authorized syllabus chunks from your college and grounds the Groq LLM answer strictly in your uploaded materials.
                </p>
              </div>

              {/* Difficulty Selector Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setQueryDifficulty(diff)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      queryDifficulty === diff
                        ? diff === 'Easy'
                          ? 'bg-emerald-600 text-white shadow-xs font-bold'
                          : diff === 'Medium'
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'bg-rose-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Subject</label>
                <input
                  type="text"
                  value={querySubject}
                  onChange={(e) => setQuerySubject(e.target.value)}
                  placeholder="e.g. Database Management Systems"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Unit Number</label>
                <select
                  value={queryUnit}
                  onChange={(e) => setQueryUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="1">Unit 1</option>
                  <option value="2">Unit 2</option>
                  <option value="3">Unit 3</option>
                  <option value="4">Unit 4</option>
                  <option value="5">Unit 5</option>
                  <option value="">Any / All Units</option>
                </select>
              </div>
            </div>

            {/* Suggested Prompt Buttons */}
            <div className="flex gap-2 overflow-x-auto text-[11px] font-medium pt-1">
              <button
                type="button"
                onClick={() => setQuestionText(`Explain the core concepts of Unit ${queryUnit || 1} in simple terms`)}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 whitespace-nowrap transition-colors"
              >
                💡 Explain Unit {queryUnit || 1} Concepts
              </button>
              <button
                type="button"
                onClick={() => setQuestionText(`What are the key exam and interview questions for Unit ${queryUnit || 1}?`)}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 whitespace-nowrap transition-colors"
              >
                📝 Exam & Interview Focus
              </button>
              <button
                type="button"
                onClick={() => setQuestionText(`Provide practical real-world examples and code patterns for this topic`)}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 whitespace-nowrap transition-colors"
              >
                💻 Real-World Code Examples
              </button>
            </div>

            {/* Question Input Form */}
            <form onSubmit={handleQuery} className="space-y-3">
              <div className="relative">
                <textarea
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. Explain Unit 3 of DBMS in easy level with real-world examples..."
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-inter resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={queryLoading || !questionText.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                {queryLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Searching ChromaDB & Generating Grounded Answer...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Grounded Answer from Syllabus</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RAG Answer Display */}
          {queryResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-5"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    queryResult.is_grounded
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {queryResult.is_grounded ? 'Grounded in College Material' : 'Notice: Unfound in Uploaded Materials'}
                  </span>

                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                    Target: {queryResult.difficulty} Level
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Engine: Groq LLM + Local Vector Chunks
                </div>
              </div>

              {/* Answer Content */}
              <div className="prose prose-slate max-w-none text-xs md:text-sm leading-relaxed whitespace-pre-wrap text-slate-800">
                {queryResult.answer}
              </div>

              {/* Source Citations Section */}
              {queryResult.sources && queryResult.sources.length > 0 && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-poppins font-bold text-xs text-slate-800">
                      <BookMarked className="w-4 h-4 text-amber-600" />
                      <span>Verified Source Citations ({queryResult.sources.length})</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Strictly non-fabricated</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {queryResult.sources.map((src, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-slate-800 truncate" title={src.document_name}>
                            📄 {src.document_name}
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold shrink-0">
                            Unit {src.unit_number || 'General'}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 space-y-0.5">
                          <div><strong>Section:</strong> {src.section_heading || 'Course Outline'}</div>
                          <div><strong>Page Number:</strong> {src.page_number || '1'}</div>
                        </div>

                        <div className="p-2 rounded-xl bg-white border border-slate-200 text-[10px] text-slate-700 italic font-mono leading-relaxed">
                          "{src.excerpt}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
