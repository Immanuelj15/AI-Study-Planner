import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { agentAPI } from '../services/api';
import MindMapComponent from '../components/MindMapComponent';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { GitFork, Search, Sparkles } from 'lucide-react';

export default function MindMapViewer() {
  const [searchParams] = useSearchParams();
  const topicParam = searchParams.get('topic') || 'Binary Search';

  const [topic, setTopic] = useState(topicParam);
  const [mindmapData, setMindmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchMindMap(topicParam);
  }, [topicParam]);

  const fetchMindMap = async (searchTopic) => {
    setLoading(true);
    try {
      const res = await agentAPI.generateMindmap(searchTopic);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header & Topic Search */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#334155] space-y-4 shadow-2xl">
        <div>
          <h1 className="font-poppins text-2xl font-black text-[#F8FAFC] flex items-center gap-2">
            <GitFork className="w-6 h-6 text-[#8B5CF6]" /> Agent 2 Visual Mind Map Generator
          </h1>
          <p className="text-[#94A3B8] font-inter text-xs mt-1">
            Generates React Flow compatible interactive graph representations of core concepts, math complexity, and relationships.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full glass-input py-2.5 pl-10 pr-4 rounded-2xl text-xs font-inter"
              placeholder="Enter topic for mind map (e.g., Binary Search)..."
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl btn-gradient-primary text-xs font-inter font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Graph</span>
          </motion.button>
        </form>
      </div>

      {/* Mind Map Canvas or Sequential Processing Skeleton */}
      {loading ? (
        <LoadingSkeleton text={`Agent 2 Generating Mind Map for '${topic}'...`} />
      ) : (
        <MindMapComponent mindmapData={mindmapData} topic={topic} />
      )}
    </motion.div>
  );
}
