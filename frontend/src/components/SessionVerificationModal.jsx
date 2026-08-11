import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, Sparkles, BookOpen, HelpCircle, Award, AlertCircle, ArrowRight } from 'lucide-react';

export default function SessionVerificationModal({ sessionData, onConfirm, onClose }) {
  const [q1Selected, setQ1Selected] = useState(null);
  const [q2Selected, setQ2Selected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!sessionData) return null;

  const topic = sessionData.topic || 'Study Session';
  const subject = sessionData.subject_name || sessionData.subject || 'General Study';

  // Dynamic 2-Question Verification Quiz generated for topic
  const questions = [
    {
      id: 1,
      question: `Which fundamental principle is central to understanding '${topic}'?`,
      options: [
        `Core structural invariants and problem-solving mechanisms of ${topic}`,
        `Random guessing without algorithmic analysis`,
        `Ignoring time & space complexity constraints`
      ],
      correctIndex: 0
    },
    {
      id: 2,
      question: `What is the primary objective of completing this ${sessionData.hours || 3.5}-hour session on '${topic}'?`,
      options: [
        `Skipping core concepts without active recall`,
        `Mastering key definitions, formulas, and real-world applications of ${topic}`,
        `Memorizing raw text without conceptual understanding`
      ],
      correctIndex: 1
    }
  ];

  const handleSubmitVerification = (e) => {
    e.preventDefault();
    if (q1Selected === null || q2Selected === null) {
      setErrorMsg('Please answer both verification questions before marking this session complete!');
      return;
    }

    const passed = q1Selected === questions[0].correctIndex && q2Selected === questions[1].correctIndex;
    setSubmitted(true);
    setIsPassed(passed);

    if (passed) {
      setTimeout(() => {
        onConfirm(sessionData.id);
        onClose();
      }, 1400);
    } else {
      setErrorMsg('Incorrect selection! Please review the concept and try again.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-inter"
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          className="w-full max-w-lg bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-poppins font-bold text-sm text-[#1E293B]">Session Mastery Checkpoint</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                    Anti-Cheat
                  </span>
                </div>
                <p className="text-xs text-[#64748B]">Verify your understanding to claim +100 XP</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] border border-[#E2E8F0]"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Session Overview Card */}
          <div className="p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{subject}</div>
              <div className="font-poppins font-bold text-[#1E293B] text-sm">{topic}</div>
            </div>
            <div className="px-3 py-1 rounded-xl bg-[#EFF6FF] text-[#2563EB] font-bold border border-[#DBEAFE]">
              {sessionData.hours || 3.5} hrs allocated
            </div>
          </div>

          {/* Verification Questions Form */}
          <form onSubmit={handleSubmitVerification} className="space-y-4 text-xs">
            {/* Question 1 */}
            <div className="space-y-2">
              <div className="font-poppins font-bold text-[#1E293B] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Q1: {questions[0].question}</span>
              </div>
              <div className="space-y-1.5">
                {questions[0].options.map((opt, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => { setQ1Selected(idx); setErrorMsg(''); }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      q1Selected === idx
                        ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-bold shadow-xs'
                        : 'bg-white border-[#E2E8F0] text-[#1E293B] hover:border-[#2563EB]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="space-y-2">
              <div className="font-poppins font-bold text-[#1E293B] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Q2: {questions[1].question}</span>
              </div>
              <div className="space-y-1.5">
                {questions[1].options.map((opt, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => { setQ2Selected(idx); setErrorMsg(''); }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      q2Selected === idx
                        ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-bold shadow-xs'
                        : 'bg-white border-[#E2E8F0] text-[#1E293B] hover:border-[#2563EB]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Celebration Alert */}
            {submitted && isPassed && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="p-3 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Verification Passed! 🎉 +100 XP Earned! Marking session complete...</span>
              </motion.div>
            )}

            {/* Submit Action Button */}
            {!isPassed && (
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#1E293B] border border-[#E2E8F0] font-poppins font-bold text-xs"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-poppins font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Verify & Mark Complete</span>
                </motion.button>
              </div>
            )}
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
