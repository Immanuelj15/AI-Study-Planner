import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, BookOpen, AlertCircle } from 'lucide-react';

const priorityColors = {
  High: 'bg-[#FEE2E2] text-[#EF4444] border-[#FCA5A5]',
  Medium: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
  Low: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
};

export default function StudyCard({ item, onToggleStatus }) {
  const isCompleted = item.status === 'Completed';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`p-5 rounded-3xl border transition-all duration-200 h-full flex flex-col justify-between ${
        isCompleted
          ? 'bg-[#F8FBFF] border-[#E2E8F0] opacity-75'
          : 'glass-card glass-card-hover border-[#E2E8F0] bg-[#FFFFFF] shadow-soft'
      }`}
    >
      {/* Top Header Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* Subject Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-[11px] font-inter font-bold tracking-wide uppercase truncate">
            <BookOpen className="w-3 h-3 shrink-0" />
            <span className="truncate">{item.subject_name || item.subject}</span>
          </div>

          {/* Priority Pill (Never Wraps) */}
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-poppins font-extrabold border whitespace-nowrap shrink-0 ${
              priorityColors[item.priority] || priorityColors.Medium
            }`}
          >
            {item.priority} Priority
          </span>
        </div>

        {/* Topic Title */}
        <h4 className={`font-poppins text-sm font-bold text-[#1E293B] leading-snug line-clamp-2 ${isCompleted ? 'line-through text-[#64748B]' : ''}`}>
          {item.topic}
        </h4>
      </div>

      {/* Bottom Footer Row (Pinned to bottom) */}
      <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-[#E2E8F0] text-xs font-inter">
        <div className="flex items-center gap-1.5 text-[#64748B] font-semibold">
          <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{item.hours} {item.hours === 1 ? 'hr' : 'hrs'} allocated</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggleStatus && onToggleStatus(item.id)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            isCompleted
              ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
              : 'bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#1E293B] hover:text-[#2563EB] border border-[#E2E8F0]'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-[#15803D]' : 'text-[#2563EB]'}`} />
          <span>{isCompleted ? 'Done' : 'Mark Done'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
