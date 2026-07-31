import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Network, ClipboardCheck, Award, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';

const timelineSteps = [
  { step: '01', title: 'Study Plan', desc: 'Day 1 Schedule', icon: BookOpen, status: 'completed', path: '/study-planner' },
  { step: '02', title: 'Class Notes', desc: 'Bullet Notes', icon: FileText, status: 'completed', path: '/summary' },
  { step: '03', title: 'Concept Map', desc: 'Visual Nodes', icon: Network, status: 'completed', path: '/mindmap' },
  { step: '04', title: 'Practice Quiz', desc: '15 Questions', icon: ClipboardCheck, status: 'current', path: '/quiz' },
  { step: '05', title: 'Spaced Review', desc: 'Day 5 & 10', icon: RefreshCw, status: 'pending', path: '/summary' },
  { step: '06', title: 'Mastery', desc: 'Exam Ready', icon: Award, status: 'pending', path: '/analytics' },
];

export default function LearningTimeline() {
  const navigate = useNavigate();

  return (
    <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft font-inter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 font-poppins font-bold text-[#1E293B] text-base">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <div>Interactive Learning Journey</div>
            <div className="text-[11px] text-[#64748B] font-normal">Click any step to open your study materials</div>
          </div>
        </div>
        <span className="text-xs font-inter font-bold text-[#2563EB] flex items-center gap-1">
          Step 4 of 6 Active <ChevronRight className="w-4 h-4" />
        </span>
      </div>

      {/* Timeline Steps Track */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-stretch pt-1">
        {timelineSteps.map((st, idx) => {
          const Icon = st.icon;
          const isDone = st.status === 'completed';
          const isCurrent = st.status === 'current';

          let bgStyle = 'bg-[#F8FBFF] border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]';
          let iconStyle = 'bg-[#E2E8F0]/60 text-[#64748B]';

          if (isDone) {
            bgStyle = 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D] hover:border-[#4ADE80] shadow-xs';
            iconStyle = 'bg-[#DCFCE7] text-[#15803D]';
          } else if (isCurrent) {
            bgStyle = 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] shadow-md ring-2 ring-[#2563EB]/20';
            iconStyle = 'bg-[#2563EB] text-white animate-pulse';
          }

          return (
            <motion.button
              key={idx}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(st.path)}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between items-center text-center space-y-2 relative transition-all duration-200 cursor-pointer ${bgStyle}`}
            >
              {isDone && <CheckCircle2 className="w-4 h-4 text-[#22C55E] absolute top-2 right-2" />}
              {isCurrent && (
                <span className="absolute -top-2 px-2 py-0.5 rounded-full bg-[#2563EB] text-white text-[9px] font-bold tracking-wider uppercase shadow-xs">
                  Active
                </span>
              )}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold ${iconStyle}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-poppins font-bold text-xs text-[#1E293B]">{st.title}</div>
                <div className="text-[10px] text-[#64748B] font-medium leading-tight mt-0.5">{st.desc}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
