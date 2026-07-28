import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, CircleHelp, ArrowRight, Trophy, Sparkles, Heart, RefreshCw, BookOpen, Network, Flame, Award, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

export default function QuizComponent({ questions, onCompleteQuiz, onRetakeQuiz, subjectId, topic, attemptCount = 1 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const navigate = useNavigate();

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
    const isFailed = finalScore < 70;
    const isMultipleFailures = isFailed && attemptCount >= 3;

    let nextDifficulty = "Medium";
    if (finalScore >= 90) nextDifficulty = "Hard";
    else if (finalScore < 70) nextDifficulty = "Easy";

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-8 border border-[#E2E8F0] text-center space-y-6 max-w-2xl mx-auto shadow-soft bg-[#FFFFFF] font-inter"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#2563EB] via-[#0EA5E9] to-[#38BDF8] mx-auto flex items-center justify-center shadow-md shadow-blue-500/20">
          <Trophy className="w-[36px] h-[36px] text-white animate-bounce" />
        </div>

        <div>
          <h2 className="font-poppins text-3xl font-black text-[#1E293B]">Quiz Completed 🎉</h2>
          <p className="text-[#64748B] font-inter text-xs mt-1">Attempt {attemptCount} • Topic: {topic || 'General'}</p>
        </div>

        {/* Score Metric Badges */}
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

        {/* Adaptive Feedback Message */}
        <div className={`p-4 rounded-2xl text-xs font-inter leading-relaxed text-left border ${
          isFailed ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]' : 'bg-[#EFF6FF] border-[#DBEAFE] text-[#1E293B]'
        }`}>
          <div className="font-poppins font-bold text-sm mb-1 flex items-center gap-2">
            {isFailed ? '💡 Personalized Tutor Guidance:' : '🌟 Excellent Understanding!'}
          </div>
          {isFailed
            ? "Nice attempt! You need a little more practice on this topic. Next quiz difficulty will adjust to Easy with 15 fresh unique questions."
            : "Awesome work! You mastered this concept. Your study timetable has been updated and next quiz will scale to Hard."}
        </div>

        {/* Failed 3 Times Study Recommendation */}
        {isMultipleFailures && (
          <div className="p-4 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] text-left text-xs text-[#991B1B] space-y-2">
            <div className="font-poppins font-bold text-sm">It looks like you're finding this topic difficult.</div>
            <p>We recommend reviewing the class notes and concept map before attempting another quiz.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => navigate(`/summary?topic=${encodeURIComponent(topic)}`)}
                className="px-3.5 py-1.5 rounded-xl bg-white text-[#991B1B] border border-[#FCA5A5] font-bold text-xs flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" /> Read Class Notes
              </button>
              <button
                onClick={() => navigate(`/mindmap?topic=${encodeURIComponent(topic)}`)}
                className="px-3.5 py-1.5 rounded-xl bg-white text-[#991B1B] border border-[#FCA5A5] font-bold text-xs flex items-center gap-1.5"
              >
                <Network className="w-4 h-4" /> View Concept Map
              </button>
            </div>
          </div>
        )}

        {/* Explainable AI Banner */}
        <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] text-left text-xs space-y-1">
          <div className="font-poppins font-bold text-[#2563EB] flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#2563EB]" /> Why am I getting these questions?
          </div>
          <p className="text-[#64748B] leading-relaxed">
            These 15 questions focus on concepts where your previous performance was lower. Every retake generates 100% NEW questions.
          </p>
        </div>

        {/* Retake Quiz Button */}
        <div className="flex justify-center gap-3 pt-2">
          {onRetakeQuiz && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onRetakeQuiz}
              className="px-6 py-3 rounded-2xl bg-[#2563EB] text-white font-poppins font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake Quiz (15 New Questions)</span>
            </motion.button>
          )}
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

      {/* Options List */}
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
                      <span>Excellent! You understood this concept.</span>
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                    </motion.div>
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5 text-xs text-[#EF4444]">
                      <span>Nice attempt. Review this concept once more.</span>
                      <XCircle className="w-5 h-5 text-[#EF4444]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      ) : (
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
        </div>
      )}

      {/* Detailed Explanation Box */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-xs font-inter space-y-1"
          >
            <div className="font-poppins font-bold text-[#2563EB] flex items-center gap-1.5">
              <CircleHelp className="w-[18px] h-[18px] text-[#2563EB]" /> Detailed Explanation
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
