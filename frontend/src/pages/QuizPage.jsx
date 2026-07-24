import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { agentAPI, quizAPI } from '../services/api';
import QuizComponent from '../components/QuizComponent';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { HelpCircle, Search, Sparkles } from 'lucide-react';

export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const topicParam = searchParams.get('topic') || 'Binary Search';
  const subjectIdParam = parseInt(searchParams.get('subject_id') || '1');

  const [topic, setTopic] = useState(topicParam);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchQuiz(topicParam, subjectIdParam);
  }, [topicParam, subjectIdParam]);

  const fetchQuiz = async (searchTopic, subId) => {
    setLoading(true);
    try {
      const res = await agentAPI.generateQuiz({
        subject_id: subId,
        topic: searchTopic,
        difficulty: 'Medium',
        num_questions: 5
      });
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
      addToast('Error generating practice quiz.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      fetchQuiz(topic.trim(), subjectIdParam);
    }
  };

  const handleCompleteQuiz = async (resultData) => {
    try {
      const res = await quizAPI.submitQuiz(resultData);
      addToast(`Quiz submitted! Scheduler Agent updated your plan: ${res.data.scheduler_feedback}`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to record quiz submission.', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Search Header */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] space-y-4 shadow-soft bg-[#FFFFFF]">
        <div>
          <h1 className="font-poppins text-2xl font-black text-[#1E293B] flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#2563EB]" /> Agent 3 Practice Quiz Engine
          </h1>
          <p className="text-[#64748B] font-inter text-xs mt-1">
            Agent 3 generates 5 calibrated MCQs. Scores automatically trigger Agent 4 to recalculate study hours for weak concepts.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full glass-input py-2.5 pl-10 pr-4 rounded-2xl text-xs font-inter bg-[#F8FBFF]"
              placeholder="Enter topic for quiz (e.g., Binary Search)..."
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl btn-gradient-primary text-xs font-inter font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Quiz</span>
          </motion.button>
        </form>
      </div>

      {/* Quiz Interface or Sequential Processing Skeleton */}
      {loading ? (
        <LoadingSkeleton text={`Agent 3 Calibrating Practice Questions for '${topic}'...`} />
      ) : questions && questions.length > 0 ? (
        <QuizComponent
          questions={questions}
          onCompleteQuiz={handleCompleteQuiz}
          subjectId={subjectIdParam}
          topic={topic}
        />
      ) : null}
    </motion.div>
  );
}
