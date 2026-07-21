import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { agentAPI, quizAPI } from '../services/api';
import QuizComponent from '../components/QuizComponent';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { HelpCircle, Sparkles } from 'lucide-react';

export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const topicParam = searchParams.get('topic') || 'Binary Search';
  const subjectIdParam = parseInt(searchParams.get('subject_id') || '1');

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('Medium');
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuiz(topicParam, difficulty);
  }, [topicParam, difficulty]);

  const fetchQuiz = async (topicName, diff) => {
    setLoading(true);
    try {
      const res = await agentAPI.generateQuiz({
        subject_id: subjectIdParam,
        topic: topicName,
        difficulty: diff,
        num_questions: 5
      });
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
      addToast('Error generating quiz.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuiz = async (resultData) => {
    try {
      const res = await quizAPI.submitQuiz(resultData);
      addToast(res.data.updated_schedule_summary || 'Quiz submitted!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Error saving quiz results.', 'error');
    }
  };

  if (loading) return <LoadingSkeleton text={`Agent 3 Generating Quiz for '${topicParam}'...`} />;

  return (
    <div className="space-y-6 pb-12">
      {/* Quiz Configuration Header */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-cyan" /> Agent 3 Quiz Master
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Topic: <span className="text-slate-200 font-bold">{topicParam}</span></p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400">Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="glass-input py-1.5 px-3 rounded-xl text-xs bg-slate-900"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Main Solver Component */}
      <QuizComponent
        questions={questions}
        onCompleteQuiz={handleCompleteQuiz}
        subjectId={subjectIdParam}
        topic={topicParam}
      />
    </div>
  );
}
