import React, { useState, useEffect } from 'react';
import { subjectsAPI } from '../services/api';
import SubjectCard from '../components/SubjectCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { Plus, BookOpen, Sparkles } from 'lucide-react';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await subjectsAPI.getSubjects();
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    setSubmitting(true);
    try {
      const res = await subjectsAPI.createSubject({
        subject_name: newSubject.trim(),
        difficulty
      });
      setSubjects((prev) => [...prev, res.data]);
      setNewSubject('');
      addToast(`Subject "${res.data.subject_name}" added successfully!`, 'success');
    } catch (err) {
      addToast('Failed to add subject.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton text="Loading User Subjects..." />;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Add Subject Form */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-cyan" /> Manage Study Subjects
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Add subjects and set difficulty parameters for the Agent Scheduler & Quiz Master.
          </p>
        </div>

        <form onSubmit={handleAddSubject} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            placeholder="Subject Name (e.g. Operating Systems)..."
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="sm:col-span-1 glass-input py-2.5 px-4 rounded-xl text-xs"
          />

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="glass-input py-2.5 px-4 rounded-xl text-xs bg-slate-900"
          >
            <option value="Easy">Difficulty: Easy</option>
            <option value="Medium">Difficulty: Medium</option>
            <option value="Hard">Difficulty: Hard</option>
          </select>

          <button
            type="submit"
            disabled={submitting}
            className="py-2.5 px-5 rounded-xl gradient-btn text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </form>
      </div>

      {/* Grid of Subject Cards */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <SubjectCard key={sub.id} subject={sub} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400 text-xs border border-slate-800 space-y-2">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <p>No subjects added yet. Enter a subject above to get started!</p>
        </div>
      )}
    </div>
  );
}
