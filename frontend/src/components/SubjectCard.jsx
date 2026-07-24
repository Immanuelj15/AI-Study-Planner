import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const difficultyColors = {
  Easy: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30',
  Medium: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
  Hard: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30',
};

export default function SubjectCard({ subject }) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card glass-card-hover p-6 rounded-3xl flex flex-col justify-between border border-[#334155]"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#06B6D4]">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className={`px-3 py-1 rounded-full text-[11px] font-poppins font-bold border ${difficultyColors[subject.difficulty] || difficultyColors.Medium}`}>
            {subject.difficulty || 'Medium'}
          </span>
        </div>
        <h3 className="font-poppins text-lg font-bold text-[#F8FAFC] mb-1">{subject.subject_name}</h3>
        <p className="text-[#94A3B8] font-inter text-xs mb-4">Exam Prep & Multi-Agent Adaptive Quizzing</p>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-[#334155]">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/summary?subject_id=${subject.id}&topic=${encodeURIComponent(subject.subject_name)}`)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] text-xs font-inter font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#334155]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" /> Research Notes
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/quiz?subject_id=${subject.id}&topic=${encodeURIComponent(subject.subject_name)}`)}
          className="py-2.5 px-4 rounded-xl bg-[#3B82F6]/20 hover:bg-[#3B82F6]/30 text-[#00E5FF] border border-[#3B82F6]/40 text-xs font-inter font-bold flex items-center justify-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Quiz
        </motion.button>
      </div>
    </motion.div>
  );
}
