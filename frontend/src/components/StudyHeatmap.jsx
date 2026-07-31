import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, CheckCircle2 } from 'lucide-react';

export default function StudyHeatmap({ streak = 1 }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate 26 weeks x 7 days grid (182 cells total)
  const totalCells = 182;
  const activeCount = Math.max(1, Math.min(streak, totalCells));
  const activeStartIndex = totalCells - activeCount;

  const weeks = Array.from({ length: 26 }, (_, weekIdx) => {
    return Array.from({ length: 7 }, (_, dayIdx) => {
      const cellId = weekIdx * 7 + dayIdx;
      const isActive = cellId >= activeStartIndex;

      const studyHours = isActive ? 2.5 : 0;
      const quizDone = isActive ? '1 Quiz (85%)' : 'None';
      const revisionStatus = isActive ? 'Completed' : 'Rest Day';

      const intensity = isActive
        ? 'bg-[#2563EB] shadow-xs'
        : 'bg-[#EFF6FF] border-[#DBEAFE]';

      return {
        id: cellId,
        week: weekIdx + 1,
        dayNum: dayIdx + 1,
        active: isActive,
        hours: studyHours,
        quiz: quizDone,
        revision: revisionStatus,
        intensity
      };
    });
  });

  return (
    <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft font-inter relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 font-poppins font-bold text-[#1E293B] text-base">
          <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#D97706] fill-[#F59E0B]" />
          </div>
          <div>
            <div>Study Consistency Heatmap</div>
            <div className="text-[11px] text-[#64748B] font-normal">Hover over any day box to inspect daily study metrics</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{streak} Day Active Streak</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 pt-1">
        <div className="flex gap-1.5 min-w-[520px] justify-between">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <motion.div
                  key={day.id}
                  whileHover={{ scale: 1.4, zIndex: 20 }}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-3.5 h-3.5 rounded-xs transition-all border border-black/5 cursor-pointer ${day.intensity}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Active Day Hover Tooltip Detail Box */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="p-3 rounded-2xl bg-[#1E293B] text-white text-xs space-y-1 shadow-xl max-w-xs border border-slate-700"
          >
            <div className="flex items-center justify-between font-poppins font-bold text-[#38BDF8]">
              <span>Week {hoveredDay.week}, Day {hoveredDay.dayNum}</span>
              <span>{hoveredDay.active ? '⚡ Active Study Day' : '☕ Rest Day'}</span>
            </div>
            <div className="text-[11px] text-slate-300 grid grid-cols-2 gap-2 pt-1 font-inter">
              <div>📚 Study: <span className="font-bold text-white">{hoveredDay.hours} Hrs</span></div>
              <div>🏆 Quiz: <span className="font-bold text-white">{hoveredDay.quiz}</span></div>
              <div>🔄 Status: <span className="font-bold text-white">{hoveredDay.revision}</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] text-[#64748B] font-medium pt-2 border-t border-[#E2E8F0]">
        <span>26 Weeks Daily Activity Tracker</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <span className="w-3 h-3 rounded-xs bg-[#EFF6FF] border border-[#E2E8F0]"></span>
          <span className="w-3 h-3 rounded-xs bg-[#38BDF8]/70"></span>
          <span className="w-3 h-3 rounded-xs bg-[#2563EB]"></span>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
