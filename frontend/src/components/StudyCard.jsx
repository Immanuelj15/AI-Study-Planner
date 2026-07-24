import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';

const priorityColors = {
  High: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
  Medium: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
  Low: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
};

export default function StudyCard({ item, onToggleStatus }) {
  const isCompleted = item.status === 'Completed';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`p-4 rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-[#1E293B]/40 border-[#334155]/40 opacity-60'
          : 'glass-card border-[#334155] hover:border-[#3B82F6]/50 shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-[11px] font-inter font-bold text-[#06B6D4] tracking-wider uppercase">
            {item.subject_name || item.subject}
          </span>
          <h4 className={`font-poppins text-sm font-bold text-[#F8FAFC] mt-0.5 ${isCompleted ? 'line-through' : ''}`}>
            {item.topic}
          </h4>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-poppins font-bold border ${priorityColors[item.priority] || priorityColors.Medium}`}>
          {item.priority} Priority
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#334155]/60 text-xs font-inter">
        <div className="flex items-center gap-1.5 text-[#94A3B8] font-medium">
          <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>{item.hours} hrs allocated</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggleStatus && onToggleStatus(item.id)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            isCompleted
              ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
              : 'bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isCompleted ? 'Done' : 'Mark Done'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
