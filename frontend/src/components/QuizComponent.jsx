import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, Award, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizComponent({ questions, onCompleteQuiz, subjectId, topic }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = questions[currentIndex] || {};

  const handleSelectOption = (option) => {
    if (isSubmitted) return;
    setSelectedAnswer(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    setIsSubmitted(true);
    
    const isCorrect = String(selectedAnswer || '').trim().toLowerCase() === String(currentQ.answer || '').trim().toLowerCase();
    setUserAnswers((prev) => [
      ...prev,
      {
        question_id: currentQ.id || currentIndex,
        user_answer: selectedAnswer,
        correct_answer: currentQ.answer,
        is_correct: isCorrect,
        topic: topic || 'General'
      }
    ]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    } else {
      setQuizFinished(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      
      const correctCount = userAnswers.filter((a) => a.is_correct).length;
      const wrongCount = questions.length - correctCount;
      const scorePct = Math.round((correctCount / questions.length) * 100);

      if (onCompleteQuiz) {
        onCompleteQuiz({
          subject_id: subjectId || 1,
          score: scorePct,
          total_questions: questions.length,
          correct_count: correctCount,
          wrong_count: wrongCount,
          answers: userAnswers
        });
      }
    }
  };

  if (quizFinished) {
    const finalCorrect = userAnswers.filter((a) => a.is_correct).length;
    const finalScore = Math.round((finalCorrect / questions.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-8 border border-[#334155] text-center space-y-6 max-w-xl mx-auto shadow-2xl"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#3B82F6] via-purple-600 to-[#06B6D4] mx-auto flex items-center justify-center shadow-xl shadow-blue-500/30">
          <Award className="w-10 h-10 text-white animate-bounce" />
        </div>

        <div>
          <h2 className="font-poppins text-3xl font-black text-[#F8FAFC]">Quiz Completed!</h2>
          <p className="text-[#94A3B8] font-inter text-xs mt-1">Multi-Agent feedback loop processed your results.</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] flex items-center justify-around">
          <div>
            <div className="font-poppins text-4xl font-extrabold text-[#06B6D4]">{finalScore}%</div>
            <div className="text-[10px] font-inter font-bold text-[#94A3B8] uppercase mt-1">Score</div>
          </div>
          <div className="w-px h-10 bg-[#334155]"></div>
          <div>
            <div className="font-poppins text-4xl font-extrabold text-[#10B981]">{finalCorrect}</div>
            <div className="text-[10px] font-inter font-bold text-[#94A3B8] uppercase mt-1">Correct</div>
          </div>
          <div className="w-px h-10 bg-[#334155]"></div>
          <div>
            <div className="font-poppins text-4xl font-extrabold text-[#EF4444]">{questions.length - finalCorrect}</div>
            <div className="text-[10px] font-inter font-bold text-[#94A3B8] uppercase mt-1">Wrong</div>
          </div>
        </div>

        <div className="text-xs font-inter text-[#F8FAFC] bg-[#3B82F6]/10 border border-[#3B82F6]/30 p-4 rounded-2xl leading-relaxed">
          {finalScore < 60
            ? "⚠️ Weak score detected. Scheduler Agent has automatically allocated +50% extra study time to your schedule."
            : "🎉 Excellent mastery! Scheduler Agent has optimized your revision frequency for strong concepts."}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 lg:p-8 border border-[#334155] space-y-6 max-w-2xl mx-auto shadow-2xl"
    >
      {/* Progress Header */}
      <div className="flex items-center justify-between text-xs font-inter font-bold text-[#94A3B8]">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span className="px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#06B6D4] border border-[#3B82F6]/30 font-poppins">
          {currentQ.difficulty || 'Medium'}
        </span>
      </div>
      <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#3B82F6] to-[#06B6D4]"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Title */}
      <h3 className="font-poppins text-lg font-bold text-[#F8FAFC] leading-snug">{currentQ.question}</h3>

      {/* Options List (MCQ) or Text Input (Fill-in-the-blank) */}
      {Array.isArray(currentQ.options) && currentQ.options.length > 0 ? (
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = String(option || '').trim().toLowerCase() === String(currentQ.answer || '').trim().toLowerCase();

            let cardStyle = "bg-[#1E293B]/70 border-[#334155] text-[#F8FAFC] hover:border-[#3B82F6]/60";
            if (isSelected) {
              cardStyle = "bg-[#3B82F6]/20 border-[#3B82F6] text-white font-semibold shadow-md shadow-blue-500/20";
            }
            if (isSubmitted) {
              if (isCorrect) {
                cardStyle = "bg-[#10B981]/20 border-[#10B981] text-[#10B981] font-bold shadow-lg shadow-emerald-500/30 scale-[1.01]";
              } else if (isSelected && !isCorrect) {
                cardStyle = "bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444] font-bold animate-shake";
              }
            }

            return (
              <motion.button
                key={idx}
                whileHover={{ scale: isSubmitted ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitted ? 1 : 0.98 }}
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left p-4 rounded-2xl border text-sm font-inter transition-all duration-200 flex items-center justify-between ${cardStyle}`}
              >
                <span>{option}</span>
                <AnimatePresence>
                  {isSubmitted && isCorrect && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    </motion.div>
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <XCircle className="w-5 h-5 text-[#EF4444]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      ) : (
        /* Fill-in-the-blank / Short Answer Text Input Box */
        <div className="space-y-3">
          <label className="text-xs font-inter font-bold text-[#06B6D4] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#3B82F6]" /> Type your answer in the box below:
          </label>
          <input
            type="text"
            disabled={isSubmitted}
            value={selectedAnswer || ''}
            onChange={(e) => handleSelectOption(e.target.value)}
            placeholder="Type answer here (e.g. DBMS)..."
            className={`w-full glass-input py-3.5 px-4 rounded-2xl text-sm font-inter transition-all ${
              isSubmitted
                ? String(selectedAnswer || '').trim().toLowerCase() === String(currentQ.answer || '').trim().toLowerCase()
                  ? 'border-[#10B981] bg-[#10B981]/15 text-[#10B981] font-bold'
                  : 'border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444] font-bold animate-shake'
                : 'focus:border-[#3B82F6]'
            }`}
          />
          {isSubmitted && (
            <div className="text-xs font-inter font-semibold text-[#94A3B8] pt-1">
              Correct Answer: <span className="text-[#10B981] font-bold">{currentQ.answer}</span>
            </div>
          )}
        </div>
      )}

      {/* Explanation Box */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-2xl bg-[#1E293B] border border-[#334155] text-xs font-inter space-y-1"
          >
            <div className="font-poppins font-bold text-[#06B6D4] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#3B82F6]" /> Answer Explanation
            </div>
            <p className="text-[#94A3B8] leading-relaxed">{currentQ.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#334155]">
        {!isSubmitted ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer || !String(selectedAnswer).trim()}
            className="px-6 py-2.5 rounded-xl btn-gradient-primary text-xs font-inter font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
          >
            Submit Answer
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl btn-gradient-primary text-xs font-inter font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
          >
            <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
