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

  // Node-Specific Content Generator for ELI5, Beginner, Interview, Takeaways & Quiz
  const normHeader = (headerText || '').toLowerCase();
  
  let nodeContent;
  if (normHeader.includes('def') || normHeader.includes('core') || normHeader.includes('intro')) {
    nodeContent = {
      eli5: `Think of Core Definition like the foundation of a building. Before building rooms or adding furniture, you must understand what the building is made of and how it stands strong!`,
      beginner: `Core Definition: ${bodyText || 'Establishes the fundamental operational framework and state representation.'} It defines the mandatory rules and initial parameters.`,
      interview: `Core Definition Interview Focus: In technical interviews, define exact invariants, memory layout assumptions, and state parameters before writing code.`,
      takeaways: [
        'Establishes foundational operational invariants and state parameters.',
        'Defines initial boundary conditions to prevent null and overflow errors.'
      ],
      quizQ: `What is the primary purpose of the Core Definition phase?`,
      quizOpts: ['To establish foundational invariants and initial boundaries', 'To bypass input validation', 'To increase memory fragmentation'],
      quizAns: 'To establish foundational invariants and initial boundaries',
      quizExp: 'Correct! The Core Definition establishes mandatory state invariants and initial boundary conditions.'
    };
  } else if (normHeader.includes('principle') || normHeader.includes('concept') || normHeader.includes('key')) {
    nodeContent = {
      eli5: `Imagine the rules of a board game! If you follow the rules step-by-step, every turn is predictable and you play without making mistakes!`,
      beginner: `Key Principles: ${bodyText || 'Governs how data flows and state transitions occur.'} It ensures every operation preserves invariant properties throughout runtime execution.`,
      interview: `Key Principles Interview Focus: Be ready to explain how invariant preservation prevents race conditions, concurrency bugs, and state corruption under load.`,
      takeaways: [
        'Preserves invariant properties throughout state mutations.',
        'Guarantees consistent, predictable system execution under all workloads.'
      ],
      quizQ: `What do Key Principles ensure during system execution?`,
      quizOpts: ['Preserving state invariants and predictable execution', 'Deleting data randomly', 'Ignoring runtime complexity bounds'],
      quizAns: 'Preserving state invariants and predictable execution',
      quizExp: 'Correct! Key principles guarantee that state invariants remain unbroken during operations.'
    };
  } else if (normHeader.includes('app') || normHeader.includes('real') || normHeader.includes('usage') || normHeader.includes('world')) {
    nodeContent = {
      eli5: `Think of how a bicycle is used to deliver pizzas or ride to school! This is how real engineering systems deploy this concept in production apps!`,
      beginner: `Real-World Applications: ${bodyText || 'Applied in production database indexing, OS kernels, and distributed search clusters.'} It enables high-throughput data processing.`,
      interview: `Applications System Design Focus: Discuss trade-offs between memory footprint vs throughput when deploying at production scale.`,
      takeaways: [
        'Powers high-throughput database B+ tree indexing and OS kernel dispatchers.',
        'Deploys in real-time distributed search clusters and routing engines.'
      ],
      quizQ: `Why is this concept widely deployed in enterprise software systems?`,
      quizOpts: ['It enables high-throughput data processing and optimal indexing', 'It requires zero CPU cycles', 'It replaces all databases'],
      quizAns: 'It enables high-throughput data processing and optimal indexing',
      quizExp: 'Correct! Enterprise applications rely on it for fast indexing, memory tables, and query routing.'
    };
  } else if (normHeader.includes('math') || normHeader.includes('complex') || normHeader.includes('metric') || normHeader.includes('bound')) {
    nodeContent = {
      eli5: `Imagine counting steps! Instead of taking 1,000 small steps one by one, math helps us skip steps so we reach the finish line in just 10 big jumps!`,
      beginner: `Math & Complexity: ${bodyText || 'Analyzes asymptotic time and space complexity bounds.'} Most efficient operations execute in logarithmic O(log N) or linearithmic O(N log N) bounds.`,
      interview: `Math Formal Proof: Derive the asymptotic bounds using Master Theorem or recurrence relations, comparing worst-case vs amortized average-case bounds.`,
      takeaways: [
        'Average-case time complexity: O(log N) or O(N log N) logarithmic bound.',
        'Auxiliary space complexity: O(1) in-place or O(N) auxiliary memory bound.'
      ],
      quizQ: `What is the typical optimal time complexity bound for this operation?`,
      quizOpts: ['O(log N) or O(N log N) logarithmic execution', 'O(N^3) cubic time', 'O(2^N) exponential time'],
      quizAns: 'O(log N) or O(N log N) logarithmic execution',
      quizExp: 'Correct! Logarithmic and linearithmic bounds provide scalable sub-linear performance.'
    };
  } else if (normHeader.includes('interview') || normHeader.includes('question') || normHeader.includes('trade') || normHeader.includes('focus')) {
    nodeContent = {
      eli5: `Imagine a trick question on a test! The teacher tests if you notice hidden traps before writing your final answer!`,
      beginner: `Interview Focus: ${bodyText || 'Highlights top technical interview questions, common student pitfalls, and boundary edge cases.'}`,
      interview: `Senior Engineering Tip: Always check for empty inputs, integer overflow (e.g. mid = low + (high-low)/2), and single-element boundary conditions.`,
      takeaways: [
        'Guard against boundary edge cases: empty inputs and integer pointer overflow.',
        'Demonstrate clear trade-off analysis between execution time vs space memory.'
      ],
      quizQ: `Which edge case should ALWAYS be verified first during implementation?`,
      quizOpts: ['Empty input arrays and boundary pointer overflow', 'Hardware fan speed', 'Screen resolution'],
      quizAns: 'Empty input arrays and boundary pointer overflow',
      quizExp: 'Correct! Checking boundary edge cases prevents null pointers and buffer overflow crashes.'
    };
  } else {
    nodeContent = {
      eli5: `Think of ${headerText} like an engine under the hood of a car. When it works smoothly, everything runs fast and without glitches!`,
      beginner: `${headerText}: ${bodyText || 'Key concept component.'} Explores core mechanisms, architecture, and operational invariants.`,
      interview: `${headerText} Interview Focus: Evaluate performance trade-offs, space complexity bounds, and boundary edge cases.`,
      takeaways: [
        `Key operational concept for ${headerText}.`,
        `Optimizes runtime execution and system correctness.`
      ],
      quizQ: `What is the key objective of studying ${headerText}?`,
      quizOpts: [`To master core invariants and system performance`, `To slow down system execution`, `To increase memory leaks`],
      quizAns: `To master core invariants and system performance`,
      quizExp: `Correct! Studying ${headerText} builds deep domain mastery and system optimization skills.`
    };
  }

  const explanations = {
    eli5: nodeContent.eli5,
    beginner: nodeContent.beginner,
    interview: nodeContent.interview
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
                {nodeContent.takeaways.map((tk, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span>{tk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Node Practice Quiz */}
            <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] space-y-3">
              <div className="font-poppins font-bold text-xs text-[#1E293B] flex items-center justify-between">
                <span>Quick Concept Check (1 Question)</span>
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              </div>
              <div className="text-xs text-[#1E293B] font-medium">
                Q1: {nodeContent.quizQ}
              </div>
              <div className="space-y-1.5 text-xs">
                {nodeContent.quizOpts.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuizAnswer1(opt); setQuizSubmitted1(true); }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                      quizSubmitted1 && opt === nodeContent.quizAns
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
                  ✓ {nodeContent.quizExp}
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
