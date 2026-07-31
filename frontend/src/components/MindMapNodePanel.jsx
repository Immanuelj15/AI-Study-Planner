import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Bookmark, CheckCircle2, HelpCircle, Bot, BookOpen, Sparkles, MessageSquare, Lightbulb, AlertTriangle, ArrowRight, Award } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function MindMapNodePanel({ nodeData, onClose, onAskAI }) {
  const [expMode, setExpMode] = useState('beginner'); // 'eli5', 'beginner', 'interview'
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [nodeStatus, setNodeStatus] = useState('Learning'); // 'Not Started', 'Learning', 'Completed', 'Needs Revision'
  const [personalNotes, setPersonalNotes] = useState('');
  const [quizAnswer1, setQuizAnswer1] = useState(null);
  const [quizSubmitted1, setQuizSubmitted1] = useState(false);
  const { addToast } = useToast();

  if (!nodeData) return null;

  const headerText = nodeData.header || 'Concept Node';
  const bodyText = nodeData.body || 'Explore concepts and study relationships.';

  // 3 AI Explanation Mode Content Generators
  const explanations = {
    eli5: `Think of ${headerText} like sorting toys into bins! Instead of looking at every toy one by one, you cut the pile in half each step until you find what you want in seconds!`,
    beginner: `${headerText}: ${bodyText} It works by halving the search space on ordered data structures, cutting down operations significantly.`,
    interview: `${headerText} Interview Focus: Evaluate time complexity bounds O(log N) vs O(N). Guard against integer overflow when calculating mid pointer using mid = low + (high-low)/2.`
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    addToast(!isBookmarked ? `Bookmarked '${headerText}'!` : `Removed bookmark for '${headerText}'`, 'info');
  };

  const handleStatusChange = (newStatus) => {
    setNodeStatus(newStatus);
    addToast(`Node status updated to '${newStatus}'! 🎉`, 'success');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end font-inter"
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="w-full max-w-lg bg-[#FFFFFF] h-full shadow-2xl border-l border-[#E2E8F0] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#E2E8F0] bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white flex items-center justify-between shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-blue-100 font-semibold">
                <span className="px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white text-[10px]">
                  3 Mins Read
                </span>
                <span>•</span>
                <span>Learning Status: {nodeStatus}</span>
              </div>
              <h2 className="font-poppins font-black text-xl text-white">{headerText}</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleBookmark}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                title="Bookmark Node"
              >
                <Star className={`w-4 h-4 ${isBookmarked ? 'fill-yellow-300 text-yellow-300' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#FFFFFF]">
            {/* Status Change Selector */}
            <div className="p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] space-y-2">
              <div className="text-xs font-poppins font-bold text-[#1E293B] flex items-center justify-between">
                <span>Update Mastery Status:</span>
                <span className="text-[#2563EB]">{nodeStatus}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                {['Learning', 'Completed', 'Needs Revision', 'Weak Concept'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1 rounded-xl border transition-all ${
                      nodeStatus === st
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                        : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2563EB]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* 3 AI Explanation Mode Tabs */}
            <div className="space-y-2">
              <div className="text-xs font-poppins font-bold text-[#1E293B]">AI Explanation Mode:</div>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] text-xs font-medium">
                <button
                  onClick={() => setExpMode('eli5')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    expMode === 'eli5' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  👦 ELI5
                </button>
                <button
                  onClick={() => setExpMode('beginner')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    expMode === 'beginner' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  🐣 Beginner
                </button>
                <button
                  onClick={() => setExpMode('interview')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    expMode === 'interview' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  💼 Interview
                </button>
              </div>

              {/* Explanation Card */}
              <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-xs text-[#1E293B] leading-relaxed">
                {explanations[expMode]}
              </div>
            </div>

            {/* Important Takeaways & Analogy */}
            <div className="space-y-3">
              <h4 className="font-poppins font-bold text-xs text-[#1E293B] flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-[#D97706]" /> Key Takeaways & Real-World Analogy
              </h4>
              <ul className="space-y-2 text-xs text-[#64748B]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                  <span>Maintains logarithmic complexity O(log N) on sorted inputs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                  <span>Iterative implementation avoids recursion call stack memory overhead.</span>
                </li>
              </ul>
            </div>

            {/* Quick 2-Question Node Practice Quiz */}
            <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] space-y-3">
              <div className="font-poppins font-bold text-xs text-[#1E293B] flex items-center justify-between">
                <span>Quick Concept Check (2 Questions)</span>
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              </div>
              <div className="text-xs text-[#1E293B] font-medium">
                Q1: What is the primary prerequisite condition before applying {headerText}?
              </div>
              <div className="space-y-1.5 text-xs">
                {['Input data must be sorted', 'Input array must be empty', 'Memory must be 100% full'].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuizAnswer1(opt); setQuizSubmitted1(true); }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                      quizSubmitted1 && opt === 'Input data must be sorted'
                        ? 'bg-[#DCFCE7] border-[#22C55E] text-[#15803D] font-bold'
                        : quizAnswer1 === opt
                        ? 'bg-[#FEE2E2] border-[#EF4444] text-[#EF4444]'
                        : 'bg-white border-[#E2E8F0] hover:border-[#2563EB]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {quizSubmitted1 && (
                <div className="text-[11px] text-[#22C55E] font-bold">
                  ✓ Correct! Input elements must satisfy sorted order invariants.
                </div>
              )}
            </div>

            {/* Personal Notes Box */}
            <div className="space-y-2">
              <label className="font-poppins font-bold text-xs text-[#1E293B] block">Personal Notes:</label>
              <textarea
                rows={3}
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                placeholder="Write your personal study notes for this concept..."
                className="w-full glass-input p-3 rounded-2xl text-xs font-inter bg-[#F8FBFF]"
              />
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 border-t border-[#E2E8F0] bg-[#FFFFFF] flex gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAskAI && onAskAI(headerText)}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#2563EB] text-white font-poppins font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Tutor About Node</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
