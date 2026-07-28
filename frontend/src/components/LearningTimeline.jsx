import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Network, ClipboardCheck, Award, RefreshCw, CheckCircle2 } from 'lucide-react';

const timelineSteps = [
  { step: '01', title: 'Learn Topic', desc: 'Day 1 Initial Reading', icon: BookOpen, status: 'completed' },
  { step: '02', title: 'Class Notes', desc: 'Structured Bullet Points', icon: FileText, status: 'completed' },
  { step: '03', title: 'Concept Map', desc: 'Visual Node Graph', icon: Network, status: 'completed' },
  { step: '04', title: 'Practice Quiz', desc: 'Day 2 Assessment', icon: ClipboardCheck, status: 'current' },
  { step: '05', title: 'Spaced Revision', desc: 'Day 5 & 10 Review', icon: RefreshCw, status: 'pending' },
  { step: '06', title: 'Mastered', desc: 'Exam Ready Goal', icon: Award, status: 'pending' },
];

export default function LearningTimeline() {
  return (
    <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft font-inter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 font-poppins font-bold text-[#1E293B] text-base">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <div>Learning Progress Timeline & Spaced Revision</div>
            <div className="text-[11px] text-[#64748B] font-normal">Day 1 Learn → Day 2 Practice → Day 5 & 10 Spaced Revision</div>
          </div>
        </div>
      </div>

      {/* Timeline Steps Track */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-stretch pt-2">
        {timelineSteps.map((st, idx) => {
          const Icon = st.icon;
          const isDone = st.status === 'completed';
          const isCurrent = st.status === 'current';

          let bgStyle = 'bg-[#F8FBFF] border-[#E2E8F0]';
          let iconStyle = 'bg-[#EFF6FF] text-[#64748B]';

          if (isDone) {
            bgStyle = 'bg-[#F0FDF4] border-[#86EFAC]';
            iconStyle = 'bg-[#DCFCE7] text-[#15803D]';
          } else if (isCurrent) {
            bgStyle = 'bg-[#EFF6FF] border-[#2563EB] shadow-xs';
            iconStyle = 'bg-[#2563EB] text-white';
          }

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between items-center text-center space-y-2 relative ${bgStyle}`}
            >
              {isDone && <CheckCircle2 className="w-4 h-4 text-[#22C55E] absolute top-2 right-2" />}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold ${iconStyle}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-poppins font-bold text-xs text-[#1E293B]">{st.title}</div>
                <div className="text-[10px] text-[#64748B] font-medium leading-tight mt-0.5">{st.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
