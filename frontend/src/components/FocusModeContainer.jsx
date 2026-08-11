import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { focusAPI } from '../services/api';
import { 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  RotateCw, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Clock, 
  BookOpen, 
  AlertTriangle,
  ArrowRight,
  Brain,
  Award,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function FocusModeContainer({ 
  subjectName = "DSA", 
  topic = "Binary Search", 
  plannedMinutes = 25, 
  learningContent = null,
  onClose,
  onTakeQuiz,
  onReviewNotes
}) {
  // Session States: 'NOT_STARTED' | 'FOCUS_ACTIVE' | 'PAUSED_TAB_SWITCH' | 'PAUSED_WINDOW_BLUR' | 'PAUSED_FULLSCREEN_EXIT' | 'COMPLETED' | 'CANCELLED'
  const [sessionState, setSessionState] = useState('NOT_STARTED');
  const [sessionId, setSessionId] = useState(null);

  // Timer State
  const [secondsRemaining, setSecondsRemaining] = useState(plannedMinutes * 60);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Interruption Counters
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [blurCount, setBlurCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [totalInterruptions, setTotalInterruptions] = useState(0);

  // Exit Modal State
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const { addToast } = useToast();
  const timerRef = useRef(null);

  // 1. Timer Effect (Only ticks during FOCUS_ACTIVE)
  useEffect(() => {
    if (sessionState === 'FOCUS_ACTIVE') {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoFinishSession();
            return 0;
          }
          return prev - 1;
        });
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState]);

  // 2. Focus Loss Detection (Page Visibility API, Blur Event, Fullscreen Change API)
  useEffect(() => {
    if (sessionState !== 'FOCUS_ACTIVE') return;

    // Page Visibility Handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        recordInterruption('tab_switch', 'PAUSED_TAB_SWITCH');
      }
    };

    // Window Blur Handler
    const handleWindowBlur = () => {
      if (sessionState === 'FOCUS_ACTIVE') {
        recordInterruption('blur', 'PAUSED_WINDOW_BLUR');
      }
    };

    // Fullscreen Change Handler
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && sessionState === 'FOCUS_ACTIVE') {
        recordInterruption('fullscreen_exit', 'PAUSED_FULLSCREEN_EXIT');
      }
    };

    // Page Unload / Navigation Lock Handler
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Your focus session is still active. Are you sure you want to leave?";
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionState, sessionId]);

  const recordInterruption = async (type, newPauseState) => {
    setSessionState(newPauseState);
    setTotalInterruptions((prev) => prev + 1);

    if (type === 'tab_switch') setTabSwitchCount((prev) => prev + 1);
    if (type === 'blur') setBlurCount((prev) => prev + 1);
    if (type === 'fullscreen_exit') setFullscreenExitCount((prev) => prev + 1);

    if (sessionId) {
      try {
        await focusAPI.interruption(sessionId, type);
      } catch (err) {
        console.error("Failed to record focus interruption:", err);
      }
    }
  };

  // Start Focus Session
  const handleStartSession = async () => {
    try {
      // 1. Request Browser Fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          // Graceful fallback for mobile or restricted browsers
        });
      }

      // 2. Call backend to start FocusSession
      const res = await focusAPI.start({
        subject_name: subjectName,
        topic: topic,
        planned_duration_minutes: plannedMinutes
      });

      setSessionId(res.data.id);
      setSessionState('FOCUS_ACTIVE');
      addToast("Focus Mode Active! Deep study in progress 🎯", "success");
    } catch (err) {
      console.error("Error starting focus session:", err);
      // Fallback local start
      setSessionState('FOCUS_ACTIVE');
    }
  };

  // Resume Focus Session from Warning Screen
  const handleResumeFocus = async () => {
    // Re-request Fullscreen if needed
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    if (sessionId) {
      try {
        await focusAPI.resume(sessionId);
      } catch (err) {
        console.error("Error resuming focus session:", err);
      }
    }

    setSessionState('FOCUS_ACTIVE');
    addToast("Welcome back! Resuming focus session ⚡", "info");
  };

  // Complete Focus Session
  const handleCompleteSession = async () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    if (sessionId) {
      try {
        await focusAPI.complete(sessionId, {
          actual_duration_seconds: secondsElapsed,
          completed: true
        });
      } catch (err) {
        console.error("Error completing focus session:", err);
      }
    }

    setSessionState('COMPLETED');
    addToast("Great Work! 🎉 Focus Session Completed!", "success");
  };

  // Auto finish when timer hits zero
  const handleAutoFinishSession = () => {
    handleCompleteSession();
  };

  // Cancel / Exit Focus Session
  const handleCancelSession = async () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    if (sessionId) {
      try {
        await focusAPI.cancel(sessionId);
      } catch (err) {
        console.error("Error cancelling focus session:", err);
      }
    }

    setSessionState('CANCELLED');
    if (onClose) onClose();
  };

  // Time Formatter
  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPct = Math.round((secondsElapsed / (plannedMinutes * 60)) * 100);

  // ----------------------------------------------------------------------
  // RENDER STATE 1: NOT_STARTED Confirmation Modal ("Ready to Focus?")
  // ----------------------------------------------------------------------
  if (sessionState === 'NOT_STARTED') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 font-inter"
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            className="w-full max-w-lg bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-7 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] text-white flex items-center justify-center shadow-md">
                  <Brain className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-poppins font-black text-xl text-[#1E293B]">Ready to focus?</h3>
                  <p className="text-xs text-[#64748B]">Strict Exam & Focus Mode Confirmation</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] border border-[#E2E8F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Today's Session Details */}
            <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] space-y-3">
              <div className="text-xs font-poppins font-bold text-[#1E293B] uppercase tracking-wider">
                Today's Focus Session
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                  <div className="text-[10px] text-[#64748B] font-bold uppercase">Subject</div>
                  <div className="font-poppins font-bold text-[#2563EB] mt-0.5 truncate">{subjectName}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                  <div className="text-[10px] text-[#64748B] font-bold uppercase">Topic</div>
                  <div className="font-poppins font-bold text-[#1E293B] mt-0.5 truncate">{topic}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                  <div className="text-[10px] text-[#64748B] font-bold uppercase">Duration</div>
                  <div className="font-poppins font-bold text-[#22C55E] mt-0.5">{plannedMinutes} Mins</div>
                </div>
              </div>
            </div>

            {/* Mode Invariants */}
            <div className="space-y-2 text-xs text-[#1E293B]">
              <div className="font-poppins font-bold text-[#1E293B]">During Focus Mode:</div>
              <ul className="space-y-2 text-[#64748B]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Countdown timer runs & preserves your progress</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Full study content remains visible & interactive</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Distractions, navigation & sidebar widgets are hidden</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Tab switches & window blur events are detected</span>
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#1E293B] border border-[#E2E8F0] font-poppins font-bold text-xs"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartSession}
                className="flex-1 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-poppins font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Focus Session</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER STATE 2: SUPPORTIVE WARNING SCREEN (PAUSED ON TAB/BLUR/FULLSCREEN)
  // ----------------------------------------------------------------------
  if (sessionState.startsWith('PAUSED_')) {
    let warningTitle = "Focus Session Paused";
    let warningSub = "You left the study session.";
    if (sessionState === 'PAUSED_WINDOW_BLUR') {
      warningTitle = "Welcome Back";
      warningSub = "Window focus was lost temporarily.";
    } else if (sessionState === 'PAUSED_FULLSCREEN_EXIT') {
      warningTitle = "Focus Mode Interrupted";
      warningSub = "Fullscreen mode was exited.";
    }

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-lg flex items-center justify-center p-4 font-inter text-white"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-[#1E293B] border border-slate-700 rounded-3xl p-7 shadow-2xl space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="font-poppins font-black text-2xl text-white">{warningTitle}</h2>
              <p className="text-sm text-slate-300">{warningSub}</p>
              <p className="text-xs text-slate-400">
                Your timer was paused to protect your study time. Your progress is safe!
              </p>
            </div>

            {/* Interruption Stats Summary */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Time Spent</div>
                <div className="font-poppins font-bold text-blue-400 text-base mt-1">{formatTime(secondsElapsed)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Interruptions</div>
                <div className="font-poppins font-bold text-amber-400 text-base mt-1">{totalInterruptions}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Progress</div>
                <div className="font-poppins font-bold text-emerald-400 text-base mt-1">{progressPct}%</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancelSession}
                className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-poppins font-bold text-xs border border-slate-700"
              >
                End Session
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResumeFocus}
                className="flex-1 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-600 text-white font-poppins font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume Focus</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER STATE 3: COMPLETED SESSION SUMMARY SCREEN
  // ----------------------------------------------------------------------
  if (sessionState === 'COMPLETED') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 font-inter"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-7 shadow-2xl space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#22C55E] to-[#86EFAC] text-white flex items-center justify-center mx-auto shadow-lg">
              <Award className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h2 className="font-poppins font-black text-2xl text-[#1E293B]">Great Work! 🎉</h2>
              <p className="text-sm font-bold text-[#2563EB]">Focus Session Complete</p>
            </div>

            {/* Session Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center p-4 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
              <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B] font-bold uppercase">Planned</div>
                <div className="font-poppins font-bold text-[#1E293B] mt-0.5">{plannedMinutes} mins</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B] font-bold uppercase">Focused</div>
                <div className="font-poppins font-bold text-[#2563EB] mt-0.5">{formatTime(secondsElapsed)}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B] font-bold uppercase">Interruptions</div>
                <div className="font-poppins font-bold text-[#D97706] mt-0.5">{totalInterruptions}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B] font-bold uppercase">Completion</div>
                <div className="font-poppins font-bold text-[#22C55E] mt-0.5">{Math.min(100, Math.round((secondsElapsed / (plannedMinutes * 60)) * 100))}%</div>
              </div>
            </div>

            {/* Action Options */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {onTakeQuiz && (
                <button
                  onClick={() => { onClose && onClose(); onTakeQuiz(); }}
                  className="py-3 px-4 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-poppins font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" /> Take Quiz
                </button>
              )}
              {onReviewNotes && (
                <button
                  onClick={() => { onClose && onClose(); onReviewNotes(); }}
                  className="py-3 px-4 rounded-2xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] font-poppins font-bold text-xs border border-[#DBEAFE] flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" /> Review Notes
                </button>
              )}
            </div>

            <button
              onClick={() => onClose && onClose()}
              className="w-full py-3 rounded-2xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#1E293B] border border-[#E2E8F0] font-poppins font-bold text-xs"
            >
              Back to Dashboard
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER STATE 4: FOCUS_ACTIVE (MAIN DISTRACTION-FREE FULLSCREEN LAYOUT)
  // ----------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 bg-[#F8FBFF] font-inter flex flex-col overflow-hidden text-[#1E293B]">
      {/* Top Header Bar */}
      <header className="h-16 px-6 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between shadow-xs shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-poppins font-black border border-[#DBEAFE] flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
            FOCUS MODE ACTIVE
          </span>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#64748B]">
            <span className="text-[#1E293B] font-poppins">{subjectName}</span>
            <span>•</span>
            <span>{topic}</span>
          </div>
        </div>

        {/* Center Countdown Timer */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-2xl bg-[#1E293B] text-white font-poppins font-black text-lg tracking-wider shadow-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#38BDF8]" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>
        </div>

        {/* Right Exit Button */}
        <button
          onClick={() => setShowExitConfirm(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#F8FBFF] hover:bg-[#FEE2E2] text-[#64748B] hover:text-[#991B1B] border border-[#E2E8F0] text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Focus</span>
        </button>
      </header>

      {/* Main Center Content Body (Distraction Free Container) */}
      <main className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
        {learningContent ? (
          learningContent
        ) : (
          <div className="glass-card rounded-3xl p-8 border border-[#E2E8F0] bg-[#FFFFFF] space-y-6 shadow-soft">
            <div className="border-b border-[#E2E8F0] pb-4">
              <div className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">{subjectName} • Study Material</div>
              <h1 className="font-poppins font-black text-2xl text-[#1E293B] mt-1">{topic}</h1>
              <p className="text-xs text-[#64748B] mt-1">Deep focus study guide and active recall notes.</p>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-[#1E293B]">
              <h3 className="font-poppins font-bold text-base text-[#1E293B]">1. Core Concepts & Definitions</h3>
              <p>
                {topic} forms a foundational pillar in computer science problem solving. Understanding its underlying invariants allows developers to write optimal algorithms operating within strict time and space bounds.
              </p>
              <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-xs text-[#2563EB] font-bold">
                💡 Key Takeaway: Maintain logarithmic execution bounds O(log N) while guarding against boundary overflow.
              </div>

              <h3 className="font-poppins font-bold text-base text-[#1E293B]">2. Real-World Applications</h3>
              <ul className="list-disc pl-5 space-y-1 text-xs text-[#64748B]">
                <li>Database B+ Tree indexing & logarithmic lookup engines.</li>
                <li>Operating system kernel virtual memory page routing.</li>
                <li>Real-time search engine query optimization.</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Footer Bar */}
      <footer className="h-16 px-6 bg-[#FFFFFF] border-t border-[#E2E8F0] flex items-center justify-between shadow-xs shrink-0 z-20">
        <div className="text-xs font-bold text-[#64748B]">
          Progress: <span className="text-[#2563EB] font-poppins">{progressPct}%</span>
        </div>

        <button
          onClick={handleCompleteSession}
          className="px-6 py-2.5 rounded-2xl bg-[#22C55E] hover:bg-emerald-600 text-white font-poppins font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Complete Session</span>
        </button>
      </footer>

      {/* Exit Focus Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-inter">
          <div className="w-full max-w-sm bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <h3 className="font-poppins font-bold text-base text-[#1E293B]">End Focus Session?</h3>
            <p className="text-xs text-[#64748B]">Are you sure you want to leave Focus Mode?</p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] font-bold text-xs border border-[#DBEAFE]"
              >
                Continue Studying
              </button>
              <button
                onClick={handleCancelSession}
                className="flex-1 py-2.5 rounded-xl bg-[#FEE2E2] text-[#991B1B] font-bold text-xs border border-[#FCA5A5]"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
