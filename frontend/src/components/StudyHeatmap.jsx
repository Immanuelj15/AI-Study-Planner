import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, CheckCircle2 } from 'lucide-react';

export default function StudyHeatmap({ streak = 5 }) {
  // Generate 52 weeks x 7 days grid (364 cells)
  const weeks = Array.from({ length: 26 }, (_, weekIdx) => {
    return Array.from({ length: 7 }, (_, dayIdx) => {
      // Simulate active days based on student activity
      const cellId = weekIdx * 7 + dayIdx;
      const isRecentActive = cellId >= 175 && cellId < 175 + streak;
      const isRandomActive = (cellId * 13) % 7 === 0 || (cellId * 17) % 11 === 0;
      const isActive = isRecentActive || isRandomActive;
      const intensity = isRecentActive ? 'bg-[#2563EB]' : isActive ? 'bg-[#38BDF8]/60' : 'bg-[#EFF6FF]';
      return { id: cellId, active: isActive, intensity };
    });
  });

  return (
    <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft font-inter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 font-poppins font-bold text-[#1E293B] text-base">
          <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#D97706] fill-[#F59E0B]" />
          </div>
          <div>
            <div>Study Consistency Heatmap</div>
            <div className="text-[11px] text-[#64748B] font-normal">GitHub-style Daily Contribution Tracker</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{streak} Day Active Streak</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1.5 min-w-[500px]">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div
                  key={day.id}
                  title={`Day ${day.id}: ${day.active ? 'Study session completed' : 'Rest day'}`}
                  className={`w-3 h-3 rounded-xs transition-colors border border-black/5 ${day.intensity}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] text-[#64748B] font-medium pt-2 border-t border-[#E2E8F0]">
        <span>26 Weeks Activity Tracker</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-[#EFF6FF] border border-[#E2E8F0]"></span>
          <span className="w-2.5 h-2.5 rounded-xs bg-[#38BDF8]/60"></span>
          <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]"></span>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
