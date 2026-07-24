import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { agentAPI, quizAPI, subjectsAPI } from '../services/api';
import QuizComponent from '../components/QuizComponent';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { HelpCircle, Search, Sparkles, BookOpen } from 'lucide-react';

export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const topicFromUrl = searchParams.get('topic');
  const subIdFromUrl = searchParams.get('subject_id') ? parseInt(searchParams.get('subject_id')) : null;

  const [topic, setTopic] = useState(topicFromUrl || '');
  const [subjectId, setSubjectId] = useState(subIdFromUrl || 1);
  const [userSubjects, setUserSubjects] = useState([]);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, [topicFromUrl, subIdFromUrl]);

  const loadInitialData = async () => {
    let initialTopic = topicFromUrl;
    let initialSubId = subIdFromUrl;
    try {
      const resSubs = await subjectsAPI.getSubjects();
      const subs = resSubs.data || [];
      setUserSubjects(subs);

      if (!initialTopic && subs.length > 0) {
        initialTopic = subs[0].subject_name;
        initialSubId = subs[0].id;
      }
    } catch (err) {
      console.error(err);
    }

    if (initialTopic) {
      setTopic(initialTopic);
      setSubjectId(initialSubId || 1);
      fetchQuiz(initialTopic, initialSubId || 1);
    }
  };

  const fetchQuiz = async (searchTopic, subId) => {
    if (!searchTopic || !searchTopic.trim()) return;
    setLoading(true);
    try {
      const res = await agentAPI.generateQuiz({
        subject_id: subId || 1,
        topic: searchTopic.trim(),
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
      fetchQuiz(topic.trim(), subjectId);
    }
  };

  const handleSelectSubject = (selectedSub) => {
    setTopic(selectedSub.subject_name);
    setSubjectId(selectedSub.id);
    fetchQuiz(selectedSub.subject_name, selectedSub.id);
  };

  const handleCompleteQuiz = async (resultData) => {
    try {
      const res = await quizAPI.submitQuiz(resultData);
      addToast(`Quiz submitted! Scheduler Agent updated your study timetable.`, 'success');
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
            Agent 3 generates 5 calibrated questions. Scores automatically trigger Agent 4 to recalculate study hours for weak concepts.
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
            className="px-5 py-2.5 rounded-2xl btn-gradient-primary text-xs font-inter font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20"
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
          subjectId={subjectId}
          topic={topic}
        />
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center space-y-3 border border-[#E2E8F0] bg-[#FFFFFF] shadow-soft">
          <BookOpen className="w-12 h-12 text-[#2563EB] mx-auto" />
          <h3 className="font-poppins font-bold text-base text-[#1E293B]">Select or Enter a Topic to Generate Quiz</h3>
          <p className="text-xs text-[#64748B] font-inter max-w-md mx-auto">
            Choose one of your subjects from the dropdown or type any custom topic name above to generate 5 calibrated practice questions.
          </p>
        </div>
      )}
    </motion.div>
  );
}
