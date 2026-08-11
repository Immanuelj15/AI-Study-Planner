import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { focusAPI, subjectsAPI, agentAPI } from '../services/api';
import MindMapComponent from './MindMapComponent';
import QuizComponent from './QuizComponent';
import ChatTutor from './ChatTutor';
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
  HelpCircle,
  Network,
  Layers,
  MessageSquare,
  Bot,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function FocusModeContainer({ 
  subjectName: initialSubject = "Operating Systems", 
  topic: initialTopic = "Process Scheduling & Memory Invariants", 
  plannedMinutes: initialMinutes = 25, 
  learningContent = null,
  onClose,
  onTakeQuiz,
  onReviewNotes
}) {
  // Session States: 'NOT_STARTED' | 'FOCUS_ACTIVE' | 'PAUSED_TAB_SWITCH' | 'PAUSED_WINDOW_BLUR' | 'PAUSED_FULLSCREEN_EXIT' | 'COMPLETED' | 'CANCELLED'
  const [sessionState, setSessionState] = useState('NOT_STARTED');
  const [sessionId, setSessionId] = useState(null);

  // Subject & Topic Selector State
  const [subjectName, setSubjectName] = useState(initialSubject);
  const [topic, setTopic] = useState(initialTopic);
  const [plannedMinutes, setPlannedMinutes] = useState(initialMinutes);
  const [subjectsList, setSubjectsList] = useState([]);

  // Active Interactive Tab in Focus Mode: 'notes' | 'mindmap' | 'flashcards' | 'quiz'
  const [activeTab, setActiveTab] = useState('notes');
  const [showAIChat, setShowAIChat] = useState(false);
  const [isReadingAudio, setIsReadingAudio] = useState(false);

  // Flashcard State inside Focus Mode
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  // Quiz State inside Focus Mode
  const [quizScore, setQuizScore] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});

  // Timer State
  const [secondsRemaining, setSecondsRemaining] = useState(initialMinutes * 60);
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

  // Fetch subjects list on mount
  useEffect(() => {
    subjectsAPI.getSubjects()
      .then((res) => setSubjectsList(res.data || []))
      .catch(() => {});
  }, []);

  // Sync timer when plannedMinutes changes
  useEffect(() => {
    setSecondsRemaining(plannedMinutes * 60);
  }, [plannedMinutes]);

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
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }

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
      setSessionState('FOCUS_ACTIVE');
    }
  };

  // Resume Focus Session
  const handleResumeFocus = async () => {
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
    if (window.speechSynthesis) window.speechSynthesis.cancel();

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

  const handleAutoFinishSession = () => {
    handleCompleteSession();
  };

  const handleCancelSession = async () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();

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

  // Web Speech API Voice Narration Toggle
  const toggleSpeechNarration = () => {
    if (!window.speechSynthesis) {
      addToast("Text-to-speech is not supported in this browser.", "error");
      return;
    }

    if (isReadingAudio) {
      window.speechSynthesis.cancel();
      setIsReadingAudio(false);
      addToast("Voice narration paused ⏸️", "info");
    } else {
      const textToRead = `${topic}. Core concepts and principles of ${subjectName}. ${topic} forms a foundational pillar in computer science problem solving.`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setIsReadingAudio(false);
      utterance.onerror = () => setIsReadingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsReadingAudio(true);
      addToast("AI Voice Reader Narration Started 🎧", "success");
    }
  };

  // Time Formatter
  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPct = Math.round((secondsElapsed / (plannedMinutes * 60)) * 100);

  // Dynamic Flashcard Deck for Topic
  const flashcardDeck = [
    { term: `Core Principle of ${topic}`, def: `Foundational operational framework and memory invariants governing ${topic}.` },
    { term: 'Time & Space Bounds', def: `Maintains optimal logarithmic execution complexity bounds O(log N) with O(1) auxiliary space.` },
    { term: 'Critical Edge Case Guard', def: `Prevent numerical boundary overflow, index errors, and null pointer reference crashes.` },
    { term: 'Industrial Production Usage', def: `Applied extensively across database B+ tree engines, OS virtual memory, and distributed systems.` }
  ];

  // Dynamic 5-Question Quiz for Topic
  const quizDeck = [
    { id: 1, q: `What is the core structural mechanism of '${topic}'?`, options: [`Invariants and memory layout of ${topic}`, `Random unindexed lookup`, `Ignoring algorithm bounds`], ans: 0 },
    { id: 2, q: `How does '${topic}' optimize processing efficiency?`, options: [`Reducing time bounds from brute-force to logarithmic execution`, `Increasing call stack memory allocation`, `Disabling boundary safety guards`], ans: 0 },
    { id: 3, q: `Which edge case requires explicit handling in '${topic}'?`, options: [`Boundary overflow and empty/null references`, `Adding unused text comments`, `Changing font size in UI`], ans: 0 },
    { id: 4, q: `Where is '${topic}' deployed in production software systems?`, options: [`Database indexing engines and OS kernel paging`, `Static unrendered documentation`, `Unprocessed plain text files`], ans: 0 },
    { id: 5, q: `What is the key takeaway of this focused study session?`, options: [`Achieving active recall and 100% conceptual mastery of ${topic}`, `Skipping notes without review`, `Memorizing raw words without context`], ans: 0 }
  ];

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
            className="w-full max-w-lg bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-7 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] text-white flex items-center justify-center shadow-md">
                  <Brain className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-poppins font-black text-xl text-[#1E293B]">Ready to focus?</h3>
                  <p className="text-xs text-[#64748B]">Configure your custom study session</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] border border-[#E2E8F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Subject & Topic Selector Form */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-poppins font-bold text-[#1E293B] block">Select Subject:</label>
                <select
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] text-xs font-inter font-bold text-[#1E293B]"
                >
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Database Management Systems">Database Management Systems</option>
                  <option value="Computer Networks">Computer Networks</option>
                  <option value="Machine Learning & AI">Machine Learning & AI</option>
                  {subjectsList.map((s, i) => (
                    <option key={i} value={s.subject_name}>{s.subject_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-poppins font-bold text-[#1E293B] block">Study Topic Name:</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter study topic..."
                  className="w-full p-3 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] text-xs font-inter font-bold text-[#1E293B]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-poppins font-bold text-[#1E293B] block">Focus Duration (Minutes):</label>
                <select
                  value={plannedMinutes}
                  onChange={(e) => setPlannedMinutes(parseInt(e.target.value))}
                  className="w-full p-3 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] text-xs font-inter font-bold text-[#1E293B]"
                >
                  <option value={15}>15 Minutes (Quick Focus)</option>
                  <option value={25}>25 Minutes (Standard Pomodoro)</option>
                  <option value={45}>45 Minutes (Deep Study)</option>
                  <option value={60}>60 Minutes (Exam Intensive)</option>
                </select>
              </div>
            </div>

            {/* Mode Invariants */}
            <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-2 text-xs">
              <div className="font-poppins font-bold text-[#2563EB] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                <span>Strict Mode Features Enabled:</span>
              </div>
              <ul className="space-y-1 text-[#1E293B] text-[11px] font-medium">
                <li>✓ Interactive Study Notes, Mind Maps, 3D Flashcards & Practice Quizzes</li>
                <li>✓ Built-in AI Tutor Chat Drawer without exiting Focus Mode</li>
                <li>✓ Fullscreen & Page Visibility Tab Loss Auto-Pause Detection</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
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
                  <Sparkles className="w-4 h-4" /> Take Full Quiz
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
            <span className="text-[#2563EB] font-bold">{topic}</span>
          </div>
        </div>

        {/* Center Countdown Timer */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-2xl bg-[#1E293B] text-white font-poppins font-black text-lg tracking-wider shadow-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#38BDF8]" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              showAIChat
                ? 'bg-[#2563EB] text-white border border-[#2563EB]'
                : 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] hover:bg-[#DBEAFE]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI Tutor</span>
          </button>

          <button
            onClick={() => setShowExitConfirm(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#F8FBFF] hover:bg-[#FEE2E2] text-[#64748B] hover:text-[#991B1B] border border-[#E2E8F0] text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Focus</span>
          </button>
        </div>
      </header>

      {/* Interactive Content Tab Selector Bar */}
      <div className="bg-[#FFFFFF] border-b border-[#E2E8F0] px-6 py-2 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-poppins font-bold">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-[#F8FBFF] text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-[#E2E8F0]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Study Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('mindmap')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'mindmap'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-[#F8FBFF] text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-[#E2E8F0]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Mind Map</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'flashcards'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-[#F8FBFF] text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-[#E2E8F0]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3D Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-[#F8FBFF] text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-[#E2E8F0]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practice Quiz</span>
          </button>
        </div>

        {/* Text-to-Speech Audio Reader Button */}
        {activeTab === 'notes' && (
          <button
            onClick={toggleSpeechNarration}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isReadingAudio
                ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                : 'bg-[#F8FBFF] text-[#64748B] border-[#E2E8F0] hover:text-[#2563EB]'
            }`}
          >
            {isReadingAudio ? <VolumeX className="w-3.5 h-3.5 text-[#15803D]" /> : <Volume2 className="w-3.5 h-3.5 text-[#2563EB]" />}
            <span>{isReadingAudio ? 'Pause Voice' : 'Listen AI Audio'}</span>
          </button>
        )}
      </div>

      {/* Main Center Content Container */}
      <main className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full relative">
        {/* TAB 1: STUDY NOTES VIEW */}
        {activeTab === 'notes' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass-card rounded-3xl p-8 border border-[#E2E8F0] bg-[#FFFFFF] space-y-6 shadow-soft">
              <div className="border-b border-[#E2E8F0] pb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">{subjectName} • Deep Focus Study Guide</div>
                  <h1 className="font-poppins font-black text-2xl text-[#1E293B] mt-1">{topic}</h1>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-xs border border-[#DBEAFE]">
                  AI Note Generated
                </span>
              </div>

              <div className="space-y-5 text-sm leading-relaxed text-[#1E293B]">
                <div className="space-y-2">
                  <h3 className="font-poppins font-bold text-base text-[#1E293B]">1. Core Concepts & Definitions</h3>
                  <p>
                    {topic} forms a foundational pillar in computer science problem solving. Understanding its underlying invariants allows developers to write optimal algorithms operating within strict time and space bounds.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-xs text-[#2563EB] font-bold space-y-1">
                  <div className="flex items-center gap-1.5 font-poppins text-sm">
                    <Sparkles className="w-4 h-4 text-[#2563EB]" /> Key Invariant Takeaway:
                  </div>
                  <p className="text-[#1E293B] font-medium leading-relaxed">
                    Always maintain logarithmic execution bounds O(log N) while guarding against boundary overflow errors and unhandled reference crashes.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-poppins font-bold text-base text-[#1E293B]">2. Real-World Applications</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#64748B]">
                    <li>Database B+ Tree indexing & logarithmic lookup engines.</li>
                    <li>Operating system kernel virtual memory page routing.</li>
                    <li>Real-time search engine query optimization.</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: INTERACTIVE MIND MAP */}
        {activeTab === 'mindmap' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-[600px] w-full">
            <MindMapComponent topic={topic} />
          </motion.div>
        )}

        {/* TAB 3: 3D FLASHCARDS */}
        {activeTab === 'flashcards' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6 pt-6">
            <div className="text-center space-y-1">
              <h3 className="font-poppins font-bold text-base text-[#1E293B]">3D Active Recall Flashcards</h3>
              <p className="text-xs text-[#64748B]">Card {flashcardIdx + 1} of {flashcardDeck.length}</p>
            </div>

            <div
              onClick={() => setFlashcardFlipped(!flashcardFlipped)}
              className="w-full h-72 cursor-pointer [perspective:1200px]"
            >
              <motion.div
                animate={{ rotateY: flashcardFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="w-full h-full relative [transform-style:preserve-3d]"
              >
                {/* Front */}
                <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#2563EB] text-white p-7 flex flex-col justify-between shadow-xl border border-white/10 [backface-visibility:hidden]">
                  <div className="text-xs font-bold text-blue-200">FRONT • KEY TERM</div>
                  <div className="text-center my-auto">
                    <h3 className="font-poppins font-black text-xl text-white">{flashcardDeck[flashcardIdx].term}</h3>
                  </div>
                  <div className="text-center text-[11px] text-blue-200">Tap card to flip definition 🔄</div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 w-full h-full rounded-3xl bg-white border-2 border-[#2563EB] text-[#1E293B] p-7 flex flex-col justify-between shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div className="text-xs font-bold text-[#2563EB]">BACK • DEFINITION</div>
                  <div className="text-center my-auto">
                    <p className="text-sm font-medium leading-relaxed">{flashcardDeck[flashcardIdx].def}</p>
                  </div>
                  <div className="text-center text-[11px] text-[#64748B]">Tap card to view front 🔄</div>
                </div>
              </motion.div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => { setFlashcardFlipped(false); setFlashcardIdx((prev) => (prev > 0 ? prev - 1 : flashcardDeck.length - 1)); }}
                className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#1E293B]"
              >
                Previous
              </button>
              <button
                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold"
              >
                Flip Card
              </button>
              <button
                onClick={() => { setFlashcardFlipped(false); setFlashcardIdx((prev) => (prev < flashcardDeck.length - 1 ? prev + 1 : 0)); }}
                className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#1E293B]"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 4: PRACTICE QUIZ */}
        {activeTab === 'quiz' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6 pt-4">
            <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-5 shadow-soft">
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
                <div className="font-poppins font-bold text-base text-[#1E293B]">Focus Mode Mastery Check (5 Questions)</div>
                <Sparkles className="w-5 h-5 text-[#2563EB]" />
              </div>

              {quizDeck.map((q, qIdx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] space-y-2 text-xs">
                  <div className="font-poppins font-bold text-[#1E293B]">Q{qIdx + 1}: {q.q}</div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          quizAnswers[qIdx] === optIdx
                            ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-bold'
                            : 'bg-white border-[#E2E8F0] text-[#1E293B]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  const correctCount = quizDeck.filter((q, idx) => quizAnswers[idx] === q.ans).length;
                  const scorePct = Math.round((correctCount / quizDeck.length) * 100);
                  setQuizScore(scorePct);
                  addToast(`Quiz Completed! Score: ${scorePct}% 🎉`, 'success');
                }}
                className="w-full py-3 rounded-2xl bg-[#2563EB] text-white font-poppins font-bold text-xs"
              >
                Submit Quiz & Calculate Score
              </button>

              {quizScore !== null && (
                <div className="p-4 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] text-center text-xs font-bold text-[#15803D]">
                  ✓ Score: {quizScore}% Mastery! Great effort in Focus Mode!
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* AI TUTOR CHAT DRAWER */}
        {showAIChat && (
          <div className="fixed right-6 bottom-20 z-40 w-96 glass-card rounded-3xl border border-[#E2E8F0] bg-white shadow-2xl overflow-hidden h-[480px] flex flex-col font-inter">
            <div className="p-4 bg-[#2563EB] text-white flex justify-between items-center font-poppins font-bold text-sm">
              <span className="flex items-center gap-2"><Bot className="w-4 h-4" /> AI Tutor Assistant</span>
              <button onClick={() => setShowAIChat(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto">
              <ChatTutor topic={topic} />
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
