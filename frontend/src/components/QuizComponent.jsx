import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';
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
      // Quiz finished
      setQuizFinished(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      
      const correctCount = userAnswers.filter((a) => a.is_correct).length;
      const wrongCount = questions.length - correctCount;
      const scorePct = roundScore((correctCount / questions.length) * 100);

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

  function roundScore(val) {
    return Math.round(val * 10) / 10;
  }

  if (quizFinished) {
    const finalCorrect = userAnswers.filter((a) => a.is_correct).length;
    const finalScore = Math.round((finalCorrect / questions.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-8 border border-slate-800 text-center space-y-6 max-w-xl mx-auto"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-600 via-brand-purple to-brand-cyan mx-auto flex items-center justify-center shadow-xl shadow-brand-500/30">
          <Award className="w-8 h-8 text-white" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-100">Quiz Complete!</h2>
          <p className="text-slate-400 text-xs mt-1">Adaptive feedback loop processed your performance.</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-around">
          <div>
            <div className="text-3xl font-extrabold text-brand-cyan">{finalScore}%</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase mt-1">Score</div>
          </div>
          <div className="w-px h-10 bg-slate-800"></div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-400">{finalCorrect}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase mt-1">Correct</div>
          </div>
          <div className="w-px h-10 bg-slate-800"></div>
          <div>
            <div className="text-3xl font-extrabold text-rose-400">{questions.length - finalCorrect}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase mt-1">Wrong</div>
          </div>
        </div>

        <div className="text-xs text-slate-300 bg-brand-500/10 border border-brand-500/30 p-4 rounded-xl leading-relaxed">
          {finalScore < 60
            ? "⚠️ Weak score detected. Scheduler Agent has automatically allocated extra study hours to your schedule."
            : "🎉 Excellent mastery! Scheduler Agent has optimized your revision frequency for strong concepts."}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6 max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-400">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-cyan border border-brand-500/30">
          {currentQ.difficulty || 'Medium'}
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-brand-cyan transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Text */}
      <h3 className="text-lg font-bold text-slate-100 leading-snug">{currentQ.question}</h3>

      {/* Options List */}
      <div className="space-y-3">
        {currentQ.options && currentQ.options.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = String(option || '').trim().toLowerCase() === String(currentQ.answer || '').trim().toLowerCase();

          let btnStyle = "bg-slate-900/60 border-slate-800 text-slate-200 hover:border-brand-500/50";
          if (isSelected) {
            btnStyle = "bg-brand-600/20 border-brand-500 text-white font-semibold";
          }
          if (isSubmitted) {
            if (isCorrect) {
              btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold";
            } else if (isSelected && !isCorrect) {
              btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-semibold";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(option)}
              className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between ${btnStyle}`}
            >
              <span>{option}</span>
              {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400" />}
            </button>
          );
        })}
      </div>

      {/* Explanation Box when Submitted */}
      {isSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 text-xs space-y-1"
        >
          <div className="font-bold text-brand-cyan flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" /> Explanation
          </div>
          <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
        </motion.div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        {!isSubmitted ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2"
          >
            <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
