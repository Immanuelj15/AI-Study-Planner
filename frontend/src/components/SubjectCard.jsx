import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const difficultyColors = {
  Easy: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
  Medium: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
  Hard: 'bg-[#FEE2E2] text-[#EF4444] border-[#FCA5A5]',
};

export default function SubjectCard({ subject }) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card glass-card-hover p-6 rounded-3xl flex flex-col justify-between border border-[#E2E8F0] bg-[#FFFFFF]"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className={`px-3 py-1 rounded-full text-[11px] font-poppins font-bold border ${difficultyColors[subject.difficulty] || difficultyColors.Medium}`}>
            {subject.difficulty || 'Medium'}
          </span>
        </div>
        <h3 className="font-poppins text-lg font-bold text-[#1E293B] mb-1">{subject.subject_name}</h3>
        <p className="text-[#64748B] font-inter text-xs mb-4">Exam Prep & Multi-Agent Adaptive Quizzing</p>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-[#E2E8F0]">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/summary?subject_id=${subject.id}&topic=${encodeURIComponent(subject.subject_name)}`)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#1E293B] text-xs font-inter font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#E2E8F0]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" /> Research Notes
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/quiz?subject_id=${subject.id}&topic=${encodeURIComponent(subject.subject_name)}`)}
          className="py-2.5 px-4 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#DBEAFE] text-xs font-inter font-bold flex items-center justify-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Quiz
        </motion.button>
      </div>
    </motion.div>
  );
}
