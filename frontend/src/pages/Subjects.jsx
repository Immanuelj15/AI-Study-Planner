import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header & Add Subject Form */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#334155] space-y-6 shadow-2xl">
        <div>
          <h1 className="font-poppins text-2xl font-black text-[#F8FAFC] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#06B6D4]" /> Manage Study Subjects
          </h1>
          <p className="text-[#94A3B8] font-inter text-xs mt-1">
            Configure subjects and difficulty parameters for Agent 4 Scheduler & Agent 3 Quiz Master.
          </p>
        </div>

        <form onSubmit={handleAddSubject} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            placeholder="Subject Name (e.g. Operating Systems)..."
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="sm:col-span-1 glass-input py-3 px-4 rounded-2xl text-xs font-inter"
          />

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="glass-input py-3 px-4 rounded-2xl text-xs font-inter bg-[#1E293B]"
          >
            <option value="Easy">Difficulty: Easy</option>
            <option value="Medium">Difficulty: Medium</option>
            <option value="Hard">Difficulty: Hard</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={submitting}
            className="py-3 px-5 rounded-2xl btn-gradient-primary text-xs font-inter font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </motion.button>
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
        <div className="glass-card rounded-3xl p-12 text-center text-[#94A3B8] font-inter text-xs border border-[#334155] space-y-2">
          <BookOpen className="w-8 h-8 text-[#94A3B8]/60 mx-auto" />
          <p>No subjects added yet. Enter a subject above to get started!</p>
        </div>
      )}
    </motion.div>
  );
}
