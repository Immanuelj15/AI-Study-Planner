import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, CheckCircle2, Calendar, BookOpen, Trophy, X, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudyHeatmap({ streak = 1 }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const navigate = useNavigate();

  // Generate 26 weeks x 7 days (182 cells total) with exact real calendar dates
  const totalCells = 182;
  const activeCount = Math.max(1, Math.min(streak, totalCells));
  const activeStartIndex = totalCells - activeCount;

  const today = new Date();

  // Compute dates for all 182 cells
  const cells = Array.from({ length: totalCells }, (_, cellId) => {
    const daysOffset = totalCells - 1 - cellId;
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() - daysOffset);

    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const fullDateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });

    const isActive = cellId >= activeStartIndex;

    const subject = isActive ? 'Operating Systems' : 'Rest Day';
    const topic = isActive ? 'Process Synchronization & Memory Management' : 'No sessions scheduled';
    const hours = isActive ? 2.5 : 0;
    const quizScore = isActive ? '85% (15 Questions)' : 'None';
    const revisionStatus = isActive ? 'Completed & Revision Scheduled' : 'Rest Day';

    const intensity = isActive
      ? 'bg-[#2563EB] shadow-xs'
      : 'bg-[#EFF6FF] border-[#DBEAFE]';

    return {
      id: cellId,
      dateObj,
      dateStr,
      fullDateStr,
      monthShort,
      active: isActive,
      subject,
      topic,
      hours,
      quizScore,
      revisionStatus,
      intensity,
      weekIdx: Math.floor(cellId / 7),
      dayIdx: cellId % 7
    };
  });

  // Group cells into 26 weeks
  const weeks = Array.from({ length: 26 }, (_, wIdx) => {
    return cells.slice(wIdx * 7, wIdx * 7 + 7);
  });

  // Collect unique Month labels for header
  const monthHeaders = [];
  weeks.forEach((w, idx) => {
    const firstDayMonth = w[0].monthShort;
    if (idx === 0 || monthHeaders[monthHeaders.length - 1]?.month !== firstDayMonth) {
      monthHeaders.push({ month: firstDayMonth, weekIndex: idx });
    }
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
            <div className="text-[11px] text-[#64748B] font-normal">Click any day box to inspect exact dates, subjects, and study completion</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{streak} Day Active Streak</span>
        </div>
      </div>

      {/* Heatmap Container */}
      <div className="overflow-x-auto pb-2 pt-1">
        <div className="min-w-[540px]">
          {/* Month Labels Header */}
          <div className="flex text-[10px] font-poppins font-bold text-[#64748B] mb-2 justify-between px-1">
            {monthHeaders.map((m, i) => (
              <span key={i}>{m.month}</span>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="flex gap-1.5 justify-between">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day) => (
                  <motion.div
                    key={day.id}
                    whileHover={{ scale: 1.4, zIndex: 20 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => setSelectedDay(day)}
                    className={`w-3.5 h-3.5 rounded-xs transition-all border border-black/5 cursor-pointer ${day.intensity}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover Tooltip Box */}
      <AnimatePresence>
        {hoveredDay && !selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="p-3 rounded-2xl bg-[#1E293B] text-white text-xs space-y-1 shadow-xl max-w-xs border border-slate-700 pointer-events-none"
          >
            <div className="flex items-center justify-between font-poppins font-bold text-[#38BDF8]">
              <span>{hoveredDay.dateStr}</span>
              <span>{hoveredDay.active ? '⚡ Active Study' : '☕ Rest Day'}</span>
            </div>
            <div className="text-[11px] text-slate-300 font-inter">
              {hoveredDay.active 
                ? `📚 ${hoveredDay.hours} Hrs • 🏆 Quiz: 85% • Click for details`
                : 'No study sessions recorded on this day'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Day Click Modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-inter"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2 text-xs font-poppins font-bold text-[#2563EB]">
                  <Calendar className="w-4 h-4 text-[#2563EB]" />
                  <span>Daily Study Activity Details</span>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-1.5 rounded-xl hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-poppins font-black text-lg text-[#1E293B]">{selectedDay.fullDateStr}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                  selectedDay.active ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]' : 'bg-[#F1F5F9] text-[#64748B]'
                }`}>
                  {selectedDay.active ? '⚡ Active Study Day Completed' : '☕ Rest & Recovery Day'}
                </span>
              </div>

              {selectedDay.active ? (
                <div className="space-y-3 text-xs bg-[#F8FBFF] border border-[#E2E8F0] p-4 rounded-2xl">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">Subject & Topic</div>
                    <div className="font-poppins font-bold text-sm text-[#1E293B]">{selectedDay.subject}</div>
                    <div className="text-[#64748B] font-medium">{selectedDay.topic}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0]">
                    <div>
                      <div className="text-[10px] font-bold text-[#64748B] uppercase">Duration</div>
                      <div className="font-poppins font-bold text-[#2563EB] text-sm">{selectedDay.hours} Hours</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#64748B] uppercase">Practice Quiz</div>
                      <div className="font-poppins font-bold text-[#22C55E] text-sm">{selectedDay.quizScore}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8F0]">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">Revision Status</div>
                    <div className="font-poppins font-bold text-[#7C3AED] text-xs flex items-center gap-1.5 mt-0.5">
                      <RefreshCw className="w-3.5 h-3.5 text-[#7C3AED]" /> {selectedDay.revisionStatus}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] text-xs text-[#64748B] text-center italic">
                  No study sessions recorded for this calendar date. Take practice quizzes or read notes to log study activity!
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setSelectedDay(null); navigate('/summary'); }}
                  className="flex-1 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-poppins font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <BookOpen className="w-4 h-4" /> Open Notes
                </button>
                <button
                  onClick={() => { setSelectedDay(null); navigate('/quiz'); }}
                  className="flex-1 py-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] text-xs font-poppins font-bold flex items-center justify-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" /> Practice Quiz
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] text-[#64748B] font-medium pt-2 border-t border-[#E2E8F0]">
        <span>26 Weeks Activity Tracker</span>
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
