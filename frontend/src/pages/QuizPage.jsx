import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { agentAPI, quizAPI, subjectsAPI } from '../services/api';
import QuizComponent from '../components/QuizComponent';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { HelpCircle, Search, Sparkles, BookOpen, Heart, Flame, Award, Trophy } from 'lucide-react';

export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const topicFromUrl = searchParams.get('topic');
  const subIdFromUrl = searchParams.get('subject_id') ? parseInt(searchParams.get('subject_id')) : null;

  const [topic, setTopic] = useState(topicFromUrl || '');
  const [subjectId, setSubjectId] = useState(subIdFromUrl || 1);
  const [userSubjects, setUserSubjects] = useState([]);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [currentDifficulty, setCurrentDifficulty] = useState('Medium');
  const { addToast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, [topicFromUrl, subIdFromUrl]);

  const loadInitialData = async () => {
    try {
      const resSubs = await subjectsAPI.getSubjects();
      const subs = resSubs.data || [];
      setUserSubjects(subs);

      if (!topicFromUrl && subs.length > 0) {
        setTopic(subs[0].subject_name);
        setSubjectId(subs[0].id);
      }
    } catch (err) {
      console.error(err);
    }

    // Only auto-fetch if explicit topic parameter was passed in URL!
    if (topicFromUrl) {
      setTopic(topicFromUrl);
      setSubjectId(subIdFromUrl || 1);
      fetchQuiz(topicFromUrl, subIdFromUrl || 1, 'Medium');
    }
  };

  const fetchQuiz = async (searchTopic, subId, diff = 'Medium') => {
    if (!searchTopic || !searchTopic.trim()) return;
    setLoading(true);
    try {
      const res = await agentAPI.generateQuiz({
        subject_id: subId || 1,
        topic: searchTopic.trim(),
        difficulty: diff,
        num_questions: 15
      });
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
      addToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      setAttemptCount(1);
      fetchQuiz(topic.trim(), subjectId, 'Medium');
    }
  };

  const handleSelectSubject = (selectedSub) => {
    setTopic(selectedSub.subject_name);
    setSubjectId(selectedSub.id);
  };

  const handleRetakeQuiz = () => {
    setAttemptCount((prev) => prev + 1);
    fetchQuiz(topic, subjectId, currentDifficulty);
  };

  const handleCompleteQuiz = async (resultData) => {
    try {
      const res = await quizAPI.submitQuiz(resultData);
      
      let nextDiff = 'Medium';
      if (resultData.score >= 90) nextDiff = 'Hard';
      else if (resultData.score < 70) nextDiff = 'Easy';
      
      setCurrentDifficulty(nextDiff);
      addToast(`Quiz Attempt ${attemptCount} Complete! Adaptive difficulty scaled to ${nextDiff}.`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Something went wrong. Please try again.', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 font-inter"
    >
      {/* Gamification Bonus Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FEF3C7] text-[#D97706]">
            <Flame className="w-5 h-5 fill-[#F59E0B]" />
          </div>
          <div>
            <div className="font-poppins font-bold text-sm text-[#1E293B]">5 Day Streak</div>
            <div className="text-[10px] text-[#64748B]">Active Daily Quiz</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="font-poppins font-bold text-sm text-[#1E293B]">100% Best Score</div>
            <div className="text-[10px] text-[#64748B]">Top Score Mastery</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F0FDF4] text-[#15803D]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="font-poppins font-bold text-sm text-[#1E293B]">15 Questions</div>
            <div className="text-[10px] text-[#64748B]">Anti-Duplication Set</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F5F3FF] text-[#7C3AED]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-poppins font-bold text-sm text-[#1E293B]">Adaptive Engine</div>
            <div className="text-[10px] text-[#64748B]">Level: {currentDifficulty}</div>
          </div>
        </div>
      </div>

      {/* Search Header */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] space-y-4 shadow-soft bg-[#FFFFFF]">
        <div>
          <div className="flex items-center gap-2 text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">
            <Heart className="w-4 h-4 text-[#2563EB] fill-[#2563EB]" /> Adaptive AI Quiz Engine
          </div>
          <h1 className="font-poppins text-2xl font-black text-[#1E293B] mt-1 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#2563EB]" /> Interactive Adaptive Quiz Agent
          </h1>
          <p className="text-[#64748B] font-inter text-xs mt-1">
            Enter any topic and click "Generate 15 Questions" to start your 15-question adaptive quiz.
          </p>
        </div>

        {/* Search Bar & Subject Selector */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
          {userSubjects.length > 0 && (
            <div className="relative shrink-0">
              <select
                value={topic}
                onChange={(e) => {
                  const sub = userSubjects.find(s => s.subject_name === e.target.value);
                  if (sub) handleSelectSubject(sub);
                }}
                className="py-2.5 px-3 rounded-2xl text-xs font-inter font-bold bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] focus:outline-none cursor-pointer"
              >
                {userSubjects.map((sub) => (
                  <option key={sub.id} value={sub.subject_name}>
                    📚 {sub.subject_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full glass-input py-2.5 pl-10 pr-4 rounded-2xl text-xs font-inter bg-[#F8FBFF]"
              placeholder="Enter topic for quiz (e.g. Operating Systems)..."
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl bg-[#2563EB] text-white text-xs font-inter font-bold flex items-center justify-center gap-1.5 shadow-sm shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate 15 Questions</span>
          </motion.button>
        </form>
      </div>

      {/* Quiz Interface or Loading Skeleton */}
      {loading ? (
        <LoadingSkeleton text={`Generating 15 fresh unique questions for '${topic}'...`} />
      ) : questions && questions.length > 0 ? (
        <QuizComponent
          questions={questions}
          onCompleteQuiz={handleCompleteQuiz}
          onRetakeQuiz={handleRetakeQuiz}
          subjectId={subjectId}
          topic={topic}
          attemptCount={attemptCount}
        />
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center space-y-3 border border-[#E2E8F0] bg-[#FFFFFF] shadow-soft">
          <BookOpen className="w-12 h-12 text-[#2563EB] mx-auto" />
          <h3 className="font-poppins font-bold text-base text-[#1E293B]">Select a Topic & Click "Generate 15 Questions"</h3>
          <p className="text-xs text-[#64748B] font-inter max-w-md mx-auto">
            Choose one of your subjects or enter a topic above, then click "Generate 15 Questions" to start your practice quiz.
          </p>
        </div>
      )}
    </motion.div>
  );
}
