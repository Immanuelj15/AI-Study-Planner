import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Layers, 
  Clock, 
  Sparkles, 
  HelpCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { revisionAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function SmartRevision() {
  const { addToast } = useToast();
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('due'); // due, upcoming, overdue
  const [activeCardTopic, setActiveCardTopic] = useState(null);
  const [activeCardSubject, setActiveCardSubject] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeScheduleId, setActiveScheduleId] = useState(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const res = await revisionAPI.getSchedule();
      setScheduleData(res.data);
      if (res.data?.due_today?.length > 0) {
        openFlashcards(res.data.due_today[0]);
      } else if (res.data?.upcoming?.length > 0) {
        openFlashcards(res.data.upcoming[0]);
      }
    } catch (e) {
      addToast('Failed to load revision schedule.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openFlashcards = async (item) => {
    setActiveCardTopic(item.topic);
    setActiveCardSubject(item.subject_name);
    setActiveScheduleId(item.id);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    try {
      const res = await revisionAPI.getFlashcards(item.topic, item.subject_name);
      setFlashcards(res.data?.flashcards || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewFeedback = async (success) => {
    if (!activeScheduleId) return;
    try {
      await revisionAPI.reviewTopic({
        schedule_id: activeScheduleId,
        success: success
      });
      addToast(
        success 
          ? 'Great recall! Spaced repetition interval increased.' 
          : 'Topic marked for earlier review tomorrow.',
        success ? 'success' : 'info'
      );
      loadSchedule();
    } catch (e) {
      addToast('Failed to update revision status.', 'error');
    }
  };

  const activeList = activeTab === 'due' 
    ? scheduleData?.due_today 
    : (activeTab === 'overdue' ? scheduleData?.overdue : scheduleData?.upcoming);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div 
        className="rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-lg border border-blue-400/20"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #0EA5E9 100%)' }}
      >
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-white">
            <RotateCcw className="w-3.5 h-3.5" />
            Smart Revision & Spaced Repetition
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight font-poppins text-white">
            Cement Knowledge at Proven Spaced Intervals
          </h1>
          <p className="text-blue-100 text-sm lg:text-base leading-relaxed">
            SuperMemo-2 spaced intervals (Day 1, 3, 7, 14). Correct recall increases intervals, while memory struggles reset for rapid reinforcement.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium animate-pulse">
          Computing spaced repetition intervals and memory recall schedules...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Revision Schedule List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setActiveTab('due')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === 'due' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Due Today ({scheduleData?.summary?.due_today || 0})
                </button>
                <button
                  onClick={() => setActiveTab('overdue')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === 'overdue' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Overdue ({scheduleData?.summary?.overdue || 0})
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === 'upcoming' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Upcoming ({scheduleData?.summary?.upcoming || 0})
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {activeList?.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openFlashcards(item)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      activeScheduleId === item.id 
                        ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-slate-800">{item.topic}</div>
                      <div className="text-xs text-slate-500">{item.subject_name} • Unit {item.unit_number}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Stage {item.interval_stage}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">{item.next_review_date}</div>
                    </div>
                  </div>
                ))}
                {(!activeList || activeList.length === 0) && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No items in this category. All revisions up to date!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Flashcard Practice Deck */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs font-bold uppercase text-blue-600 tracking-wider">
                    Interactive Memory Recall Deck
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {activeCardTopic || 'Select a topic to start revision'}
                  </h2>
                </div>
                {flashcards.length > 0 && (
                  <span className="text-xs font-bold text-slate-400">
                    Card {currentCardIndex + 1} of {flashcards.length}
                  </span>
                )}
              </div>

              {flashcards.length > 0 ? (
                <div className="space-y-6">
                  {/* Flippable Card Container */}
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="min-h-[220px] p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 hover:border-blue-300 cursor-pointer transition shadow-xs flex flex-col justify-between"
                  >
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>{isFlipped ? 'Answer & Explanation' : 'Question / Prompt'}</span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-500">
                        Click to Flip
                      </span>
                    </div>

                    <div className="py-4">
                      <p className="text-base lg:text-lg font-bold text-slate-800 leading-relaxed whitespace-pre-line">
                        {isFlipped 
                          ? flashcards[currentCardIndex].back 
                          : flashcards[currentCardIndex].front}
                      </p>
                    </div>

                    <div className="text-[11px] text-blue-600 font-semibold">
                      Subject: {activeCardSubject}
                    </div>
                  </div>

                  {/* Recall Feedback Buttons */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-600 text-center uppercase">
                      How was your recall of this concept?
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleReviewFeedback(false)}
                        className="py-3 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <XCircle className="w-4 h-4" />
                        Struggled / Forgot (Reset to Day 1)
                      </button>

                      <button
                        onClick={() => handleReviewFeedback(true)}
                        className="py-3 px-4 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Recalled Confidently (Increase Interval)
                      </button>
                    </div>
                  </div>

                  {/* Card Navigation */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex(prev => Math.max(0, prev - 1));
                      }}
                      disabled={currentCardIndex === 0}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-100 rounded-lg transition"
                    >
                      Previous Card
                    </button>
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex(prev => Math.min(flashcards.length - 1, prev + 1));
                      }}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-100 rounded-lg transition"
                    >
                      Next Card
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 text-sm">
                  <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  Select a topic on the left to start active recall flashcard review.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
