import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { agentAPI, subjectsAPI } from '../services/api';
import MindMapComponent from '../components/MindMapComponent';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { GitFork, Search, Sparkles, BookOpen } from 'lucide-react';

export default function MindMapViewer() {
  const [searchParams] = useSearchParams();
  const topicFromUrl = searchParams.get('topic');

  const [topic, setTopic] = useState(topicFromUrl || '');
  const [userSubjects, setUserSubjects] = useState([]);
  const [mindmapData, setMindmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, [topicFromUrl]);

  const loadInitialData = async () => {
    let initialTopic = topicFromUrl;
    try {
      const resSubs = await subjectsAPI.getSubjects();
      const subs = resSubs.data || [];
      setUserSubjects(subs);

      if (!initialTopic && subs.length > 0) {
        initialTopic = subs[0].subject_name;
      }
    } catch (err) {
      console.error(err);
    }

    if (initialTopic) {
      setTopic(initialTopic);
      fetchMindMap(initialTopic);
    }
  };

  const fetchMindMap = async (searchTopic) => {
    if (!searchTopic || !searchTopic.trim()) return;
    setLoading(true);
    try {
      const res = await agentAPI.generateMindmap(searchTopic.trim());
      setMindmapData(res.data.mindmap_json);
    } catch (err) {
      console.error(err);
      addToast('Error generating mind map.', 'error');
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
    fetchMindMap(selectedSubName);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header & Topic Search */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] space-y-4 shadow-soft bg-[#FFFFFF]">
        <div>
          <h1 className="font-poppins text-2xl font-black text-[#1E293B] flex items-center gap-2">
            <GitFork className="w-6 h-6 text-[#2563EB]" /> Agent 2 Visual Mind Map Generator
          </h1>
          <p className="text-[#64748B] font-inter text-xs mt-1">
            Generates React Flow compatible interactive graph representations of core concepts, math complexity, and relationships.
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
            className="px-5 py-2.5 rounded-2xl btn-gradient-primary text-xs font-inter font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Graph</span>
          </motion.button>
        </form>
      </div>

      {/* Mind Map Canvas or Sequential Processing Skeleton */}
      {loading ? (
        <LoadingSkeleton text={`Agent 2 Generating Mind Map for '${topic}'...`} />
      ) : mindmapData ? (
        <MindMapComponent mindmapData={mindmapData} topic={topic} />
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center space-y-3 border border-[#E2E8F0] bg-[#FFFFFF] shadow-soft">
          <BookOpen className="w-12 h-12 text-[#2563EB] mx-auto" />
          <h3 className="font-poppins font-bold text-base text-[#1E293B]">Select or Enter a Topic to Generate Mind Map</h3>
          <p className="text-xs text-[#64748B] font-inter max-w-md mx-auto">
            Choose one of your subjects from the dropdown or type any custom topic name above.
          </p>
        </div>
      )}
    </motion.div>
  );
}
