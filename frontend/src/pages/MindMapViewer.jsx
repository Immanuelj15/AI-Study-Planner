import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { agentAPI, subjectsAPI } from '../services/api';
import MindMapComponent from '../components/MindMapComponent';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ChatTutor from '../components/ChatTutor';
import { useToast } from '../context/ToastContext';
import { GitFork, Search, Sparkles, BookOpen, Heart, Award, Trophy } from 'lucide-react';

export default function MindMapViewer() {
  const [searchParams] = useSearchParams();
  const topicFromUrl = searchParams.get('topic');

  const [topic, setTopic] = useState(topicFromUrl || '');
  const [userSubjects, setUserSubjects] = useState([]);
  const [mindmapData, setMindmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiTutorTopic, setAiTutorTopic] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, [topicFromUrl]);

  const loadInitialData = async () => {
    try {
      const resSubs = await subjectsAPI.getSubjects();
      const subs = resSubs.data || [];
      setUserSubjects(subs);

      if (!topicFromUrl && subs.length > 0) {
        setTopic(subs[0].subject_name);
      }
    } catch (err) {
      console.error(err);
    }

    // Only auto-fetch if explicit topic query parameter was passed in URL!
    if (topicFromUrl) {
      setTopic(topicFromUrl);
      fetchMindMap(topicFromUrl);
    }
  };

  const fetchMindMap = async (searchTopic) => {
    if (!searchTopic || !searchTopic.trim()) return;
    setLoading(true);
    try {
      const res = await agentAPI.generateMindmap(searchTopic.trim());
      setMindmapData(res.data.mindmap_json);
      addToast('Interactive Learning Hub Ready! Click any node to study! 🧠', 'success');
    } catch (err) {
      console.error(err);
      addToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      fetchMindMap(topic.trim());
    }
  };

  const handleSelectSubject = (selectedSubName) => {
    setTopic(selectedSubName);
  };

  const handleAskAITutor = (nodeTitle) => {
    setAiTutorTopic(`${topic} - ${nodeTitle}`);
    addToast(`AI Tutor pre-loaded for '${nodeTitle}'!`, 'info');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 font-inter relative"
    >
      {/* Gamification Badges Track */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#EFF6FF] text-[#2563EB]">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <div className="font-poppins font-bold text-xs text-[#1E293B]">Mind Map Explorer</div>
            <div className="text-[10px] text-[#64748B]">Badge Unlocked</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#F0FDF4] text-[#15803D]">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="font-poppins font-bold text-xs text-[#1E293B]">Concept Master</div>
            <div className="text-[10px] text-[#64748B]">80% Mastery</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FEF3C7] text-[#D97706]">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="font-poppins font-bold text-xs text-[#1E293B]">Fast Learner</div>
            <div className="text-[10px] text-[#64748B]">3 Mins / Node</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#F5F3FF] text-[#7C3AED]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-poppins font-bold text-xs text-[#1E293B]">Revision Expert</div>
            <div className="text-[10px] text-[#64748B]">Spaced Review</div>
          </div>
        </div>
      </div>

      {/* Header & Topic Search */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] space-y-4 shadow-soft bg-[#FFFFFF]">
        <div>
          <div className="flex items-center gap-2 text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">
            <Heart className="w-4 h-4 text-[#2563EB] fill-[#2563EB]" /> Interactive Learning Hub
          </div>
          <h1 className="font-poppins text-2xl font-black text-[#1E293B] mt-1 flex items-center gap-2">
            <GitFork className="w-6 h-6 text-[#2563EB]" /> Central AI Visual Learning Hub
          </h1>
          <p className="text-[#64748B] font-inter text-xs mt-1">
            Enter any topic name and click "Generate Mind Map" to build your interactive concept hub.
          </p>
        </div>

        {/* Search Bar & Subject Selector */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
          {userSubjects.length > 0 && (
            <div className="relative shrink-0">
              <select
                value={topic}
                onChange={(e) => handleSelectSubject(e.target.value)}
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
              placeholder="Enter topic for mind map (e.g. Operating Systems)..."
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
            <span>Generate Mind Map</span>
          </motion.button>
        </form>
      </div>

      {/* Mind Map Canvas or Skeleton */}
      {loading ? (
        <LoadingSkeleton text={`Building Interactive Learning Hub for '${topic}'...`} />
      ) : mindmapData ? (
        <MindMapComponent
          mindmapData={mindmapData}
          topic={topic}
          onAskAITutor={handleAskAITutor}
        />
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center space-y-3 border border-[#E2E8F0] bg-[#FFFFFF] shadow-soft">
          <BookOpen className="w-12 h-12 text-[#2563EB] mx-auto" />
          <h3 className="font-poppins font-bold text-base text-[#1E293B]">Select or Enter a Topic & Click "Generate Mind Map"</h3>
          <p className="text-xs text-[#64748B] font-inter max-w-md mx-auto">
            Choose one of your subjects or enter a topic name above, then click "Generate Mind Map" to create your visual study graph.
          </p>
        </div>
      )}

      {/* Floating AI Chat Tutor */}
      <ChatTutor topic={aiTutorTopic || topic || "Computer Science"} />
    </motion.div>
  );
}
