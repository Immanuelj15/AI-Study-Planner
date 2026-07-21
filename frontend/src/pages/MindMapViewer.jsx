import React, { useState, useEffect } from 'react';
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
    <div className="space-y-6 pb-12">
      {/* Header & Topic Search */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 space-y-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <GitFork className="w-6 h-6 text-brand-purple" /> Agent 2 Visual Mind Map Generator
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Generates React Flow compatible interactive graph representations of core concepts and relationships.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full glass-input py-2.5 pl-10 pr-4 rounded-xl text-xs"
              placeholder="Enter topic for mind map..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Graph</span>
          </button>
        </form>
      </div>

      {/* Mind Map Canvas or Loading */}
      {loading ? (
        <LoadingSkeleton text={`Agent 2 Generating Mind Map for '${topic}'...`} />
      ) : (
        <MindMapComponent mindmapData={mindmapData} topic={topic} />
      )}
    </div>
  );
}
