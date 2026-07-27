import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, CircleHelp, ArrowRight, Trophy, Sparkles, Heart } from 'lucide-react';
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
        className="glass-card rounded-3xl p-8 border border-[#E2E8F0] text-center space-y-6 max-w-xl mx-auto shadow-soft bg-[#FFFFFF] font-inter"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#2563EB] via-[#0EA5E9] to-[#38BDF8] mx-auto flex items-center justify-center shadow-md shadow-blue-500/20">
          <Trophy className="w-[36px] h-[36px] text-white animate-bounce" />
        </div>

        <div>
          <h2 className="font-poppins text-3xl font-black text-[#1E293B]">Quiz Completed 🎉</h2>
          <p className="text-[#64748B] font-inter text-xs mt-1">You're improving every day!</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] flex items-center justify-around">
          <div>
            <div className="font-poppins text-4xl font-extrabold text-[#2563EB]">{finalScore}%</div>
            <div className="text-[10px] font-inter font-bold text-[#64748B] uppercase mt-1">Score</div>
          </div>
          <div className="w-px h-10 bg-[#E2E8F0]"></div>
          <div>
            <div className="font-poppins text-4xl font-extrabold text-[#22C55E] flex items-center justify-center gap-1">
              <CheckCircle2 className="w-6 h-6 text-[#22C55E]" />
              <span>{finalCorrect}</span>
            </div>
            <div className="text-[10px] font-inter font-bold text-[#64748B] uppercase mt-1">Correct</div>
          </div>
          <div className="w-px h-10 bg-[#E2E8F0]"></div>
          <div>
            <div className="font-poppins text-4xl font-extrabold text-[#EF4444] flex items-center justify-center gap-1">
              <XCircle className="w-6 h-6 text-[#EF4444]" />
              <span>{questions.length - finalCorrect}</span>
            </div>
            <div className="text-[10px] font-inter font-bold text-[#64748B] uppercase mt-1">Review</div>
          </div>
        </div>

        <div className="text-xs font-inter text-[#1E293B] bg-[#EFF6FF] border border-[#DBEAFE] p-4 rounded-2xl leading-relaxed">
          {finalScore < 60
            ? "You're improving! Spend a little more time on these topics. We've added extra practice time to your study plan to help you master them."
            : "Great Job! You understood this concept exceptionally well. We've updated your revision schedule."}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] space-y-6 max-w-2xl mx-auto shadow-soft bg-[#FFFFFF] font-inter"
    >
      {/* Progress Header */}
      <div className="flex items-center justify-between text-xs font-inter font-bold text-[#64748B]">
        <span className="flex items-center gap-1.5">
          <CircleHelp className="w-[18px] h-[18px] text-[#2563EB]" />
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] font-poppins">
          {currentQ.difficulty || 'Medium'}
        </span>
      </div>
      <div className="w-full h-2 bg-[#EFF6FF] rounded-full overflow-hidden border border-[#DBEAFE]">
        <motion.div
          className="h-full bg-[#2563EB]"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Title */}
      <h3 className="font-poppins text-lg font-bold text-[#1E293B] leading-snug">{currentQ.question}</h3>

      {/* Options List (MCQ) or Text Input */}
      {Array.isArray(currentQ.options) && currentQ.options.length > 0 ? (
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = String(option || '').trim().toLowerCase() === String(currentQ.answer || '').trim().toLowerCase();

            let cardStyle = "bg-[#F8FBFF] border-[#E2E8F0] text-[#1E293B] hover:border-[#2563EB]";
            if (isSelected) {
              cardStyle = "bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-bold shadow-xs";
            }
            if (isSubmitted) {
              if (isCorrect) {
                cardStyle = "bg-[#DCFCE7] border-[#22C55E] text-[#15803D] font-bold shadow-sm scale-[1.01]";
              } else if (isSelected && !isCorrect) {
                cardStyle = "bg-[#FEE2E2] border-[#EF4444] text-[#EF4444] font-bold";
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
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5 text-xs text-[#15803D]">
                      <span>Great Job!</span>
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                    </motion.div>
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5 text-xs text-[#EF4444]">
                      <span>Not quite. Let's review this concept.</span>
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
          <label className="text-xs font-inter font-bold text-[#2563EB] flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-[#2563EB] fill-[#2563EB]" /> Type your answer in the box below:
          </label>
          <input
            type="text"
            disabled={isSubmitted}
            value={selectedAnswer || ''}
            onChange={(e) => handleSelectOption(e.target.value)}
            placeholder="Type answer here..."
            className={`w-full glass-input py-3.5 px-4 rounded-2xl text-sm font-inter transition-all ${
              isSubmitted
                ? String(selectedAnswer || '').trim().toLowerCase() === String(currentQ.answer || '').trim().toLowerCase()
                  ? 'border-[#22C55E] bg-[#DCFCE7] text-[#15803D] font-bold'
                  : 'border-[#EF4444] bg-[#FEE2E2] text-[#EF4444] font-bold'
                : 'focus:border-[#2563EB]'
            }`}
          />
          {isSubmitted && (
            <div className="text-xs font-inter font-semibold text-[#64748B] pt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> Answer: <span className="text-[#22C55E] font-bold">{currentQ.answer}</span>
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
            className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-xs font-inter space-y-1"
          >
            <div className="font-poppins font-bold text-[#2563EB] flex items-center gap-1.5">
              <CircleHelp className="w-[18px] h-[18px] text-[#2563EB]" /> Explanation
            </div>
            <p className="text-[#1E293B] leading-relaxed">{currentQ.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
        {!isSubmitted ? (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer || !String(selectedAnswer).trim()}
            className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-inter font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            Check Answer
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-inter font-bold flex items-center gap-2 shadow-xs"
          >
            <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
            <ArrowRight className="w-[18px] h-[18px]" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
