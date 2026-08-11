import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, Coffee, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import FocusModeContainer from './FocusModeContainer';

export default function PomodoroTimer() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      if (!isBreak) {
        setIsBreak(true);
        setSecondsLeft(5 * 60);
        setSessionCount((prev) => prev + 1);
        addToast("Great focus! 25 min study session complete 🎉 Take a 5-minute break!", "success");
      } else {
        setIsBreak(false);
        setSecondsLeft(25 * 60);
        addToast("Break complete! Ready to start your next focus session? 📚", "info");
      }
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, isBreak]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setSecondsLeft(25 * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft font-inter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 font-poppins font-bold text-[#1E293B] text-base">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center">
            {isBreak ? <Coffee className="w-5 h-5 text-[#2563EB]" /> : <Timer className="w-5 h-5 text-[#2563EB]" />}
          </div>
          <div>
            <div>Pomodoro Focus Timer</div>
            <div className="text-[11px] text-[#64748B] font-normal">
              {isBreak ? '☕ 5-Min Break Time' : '📚 25-Min Focused Study Session'}
            </div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-bold">
          {sessionCount} Sessions Done
        </span>
      </div>

      {/* Timer Circle Showcase */}
      <div className="p-6 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] text-center space-y-4">
        <div className="font-poppins font-black text-5xl tracking-wider text-[#2563EB]">
          {formattedTime}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className={`px-5 py-2.5 rounded-xl font-poppins font-bold text-xs flex items-center gap-2 shadow-xs ${
              isActive ? 'bg-[#EF4444] text-white' : 'bg-[#2563EB] text-white'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pause Timer' : 'Quick Timer'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFocusMode(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white font-poppins font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Strict Focus Mode</span>
          </motion.button>

          <button
            onClick={resetTimer}
            className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EFF6FF] text-[#64748B] border border-[#E2E8F0] transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Strict Focus Mode Modal */}
      {showFocusMode && (
        <FocusModeContainer
          onClose={() => setShowFocusMode(false)}
        />
      )}
    </div>
  );
}
