import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, Sparkles, BookOpen, HelpCircle, Award, AlertCircle, ArrowRight } from 'lucide-react';

export default function SessionVerificationModal({ sessionData, onConfirm, onClose }) {
  const [answers, setAnswers] = useState({ 0: null, 1: null, 2: null, 3: null, 4: null });
  const [submitted, setSubmitted] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!sessionData) return null;

  const topic = sessionData.topic || 'Study Session';
  const subject = sessionData.subject_name || sessionData.subject || 'General Study';
  const hours = sessionData.hours || 3.5;

  // Dynamic 5-Question Mastery Verification Test generated for topic
  const questions = [
    {
      id: 1,
      question: `Which foundational concept is central to mastering '${topic}'?`,
      options: [
        `Core structural invariants and architectural mechanisms of ${topic}`,
        `Random execution without algorithmic bounds`,
        `Ignoring memory allocation and complexity constraints`
      ],
      correctIndex: 0
    },
    {
      id: 2,
      question: `How does understanding '${topic}' improve system performance?`,
      options: [
        `Increasing unneeded memory allocation overhead`,
        `Optimizing execution time and space complexity bounds over brute-force methods`,
        `Disabling error checking and boundary guards`
      ],
      correctIndex: 1
    },
    {
      id: 3,
      question: `Which critical edge case must be guarded against when working with '${topic}'?`,
      options: [
        `Boundary index limits, empty/null inputs, and numerical overflow`,
        `Excessive code indentation`,
        `Formatting text strings in UI headers`
      ],
      correctIndex: 0
    },
    {
      id: 4,
      question: `Where is '${topic}' applied extensively in real-world software engineering?`,
      options: [
        `Only in static mock design diagrams`,
        `Database indexing engines, OS kernels, and production algorithm pipelines`,
        `Unprocessed raw text documents`
      ],
      correctIndex: 1
    },
    {
      id: 5,
      question: `What is the primary objective of this ${hours}-hour study session on '${topic}'?`,
      options: [
        `Skipping core concepts without active recall`,
        `Memorizing raw sentences without conceptual understanding`,
        `Achieving 100% active recall, formula mastery, and practical problem solving in ${topic}`
      ],
      correctIndex: 2
    }
  ];

  const handleSelectAnswer = (qIndex, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
    setErrorMsg('');
  };

  const handleSubmitVerification = (e) => {
    e.preventDefault();
    
    // Ensure all 5 questions are answered
    for (let i = 0; i < 5; i++) {
      if (answers[i] === null) {
        setErrorMsg(`Please answer Question ${i + 1} before submitting! (All 5 questions required)`);
        return;
      }
    }

    // Verify all 5 correct answers
    const allCorrect = questions.every((q, idx) => answers[idx] === q.correctIndex);
    setSubmitted(true);
    setIsPassed(allCorrect);

    if (allCorrect) {
      setTimeout(() => {
        onConfirm(sessionData.id);
        onClose();
      }, 1400);
    } else {
      setErrorMsg('Some answers were incorrect! Review the core concepts and try again.');
    }
  };

  const answeredCount = Object.values(answers).filter((v) => v !== null).length;

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
          className="w-full max-w-xl bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-poppins font-bold text-sm text-[#1E293B]">5-Question Mastery Verification</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                    Anti-Cheat
                  </span>
                </div>
                <p className="text-xs text-[#64748B]">Answer 5 knowledge check questions to claim +100 XP</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] border border-[#E2E8F0]"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Session Overview Card & Progress Pill */}
          <div className="p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] flex items-center justify-between text-xs shrink-0">
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{subject}</div>
              <div className="font-poppins font-bold text-[#1E293B] text-sm">{topic}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] font-bold border border-[#DBEAFE] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{answeredCount} / 5 Answered</span>
            </div>
          </div>

          {/* Scrollable 5-Questions Form */}
          <form onSubmit={handleSubmitVerification} className="flex-1 overflow-y-auto pr-1 space-y-5 text-xs">
            {questions.map((q, qIdx) => (
              <div key={q.id} className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] space-y-2.5">
                <div className="font-poppins font-bold text-[#1E293B] flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    Q{qIdx + 1}
                  </span>
                  <span className="leading-snug">{q.question}</span>
                </div>

                <div className="space-y-1.5 pl-7">
                  {q.options.map((opt, optIdx) => (
                    <button
                      type="button"
                      key={optIdx}
                      onClick={() => handleSelectAnswer(qIdx, optIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        answers[qIdx] === optIdx
                          ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-bold shadow-xs'
                          : 'bg-white border-[#E2E8F0] text-[#1E293B] hover:border-[#2563EB]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Celebration Alert */}
            {submitted && isPassed && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="p-3.5 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>All 5 Questions Correct! 🎉 +100 XP Earned! Marking session complete...</span>
              </motion.div>
            )}

            {/* Submit Action Buttons (Pinned to bottom of scrollable area) */}
            {!isPassed && (
              <div className="pt-3 flex gap-3 shrink-0">
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
                  <span>Submit 5 Answers & Mark Complete</span>
                </motion.button>
              </div>
            )}
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
