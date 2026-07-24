import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';

const priorityColors = {
  High: 'bg-[#FEE2E2] text-[#EF4444] border-[#FCA5A5]',
  Medium: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
  Low: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
};

export default function StudyCard({ item, onToggleStatus }) {
  const isCompleted = item.status === 'Completed';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`p-4.5 rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-[#F8FBFF] border-[#E2E8F0] opacity-65'
          : 'glass-card glass-card-hover border-[#E2E8F0] bg-[#FFFFFF]'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-[11px] font-inter font-bold text-[#2563EB] tracking-wider uppercase">
            {item.subject_name || item.subject}
          </span>
          <h4 className={`font-poppins text-sm font-bold text-[#1E293B] mt-0.5 ${isCompleted ? 'line-through' : ''}`}>
            {item.topic}
          </h4>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-poppins font-bold border ${priorityColors[item.priority] || priorityColors.Medium}`}>
          {item.priority} Priority
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E2E8F0]/80 text-xs font-inter">
        <div className="flex items-center gap-1.5 text-[#64748B] font-medium">
          <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{item.hours} hrs allocated</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggleStatus && onToggleStatus(item.id)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            isCompleted
              ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
              : 'bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#1E293B] border border-[#E2E8F0]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isCompleted ? 'Done' : 'Mark Done'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
