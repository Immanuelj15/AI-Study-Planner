import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { agentAPI } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { FileText, Search, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';

export default function SummaryViewer() {
  const [searchParams] = useSearchParams();
  const topicParam = searchParams.get('topic') || 'Binary Search';
  const subjectIdParam = parseInt(searchParams.get('subject_id') || '1');

  const [topic, setTopic] = useState(topicParam);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchSummary(topicParam, subjectIdParam);
  }, [topicParam, subjectIdParam]);

  const fetchSummary = async (searchTopic, subId) => {
    setLoading(true);
    try {
      // Step 1: Agent 1 Research
      const researchRes = await agentAPI.research(searchTopic);
      // Step 2: Agent 2 Summarizer
      const summarizeRes = await agentAPI.summarize({
        subject_id: subId,
        topic: searchTopic,
        research_content: researchRes.data
      });
      setSummaryData(summarizeRes.data);
    } catch (err) {
      console.error(err);
      addToast('Error generating topic summary.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      fetchSummary(topic.trim(), subjectIdParam);
    }
  };

  const handleExportPDF = () => {
    if (!summaryData) return;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`AI Study Notes: ${summaryData.topic}`, 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(summaryData.summary, 180);
    doc.text(splitText, 14, 30);
    doc.save(`${summaryData.topic}_Study_Notes.pdf`);
    addToast('PDF downloaded successfully!', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search Header */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 space-y-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-cyan" /> Agent 1 & 2 Note Summarizer
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Research any topic to generate structured notes, definitions, interview tips, and voice summaries.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full glass-input py-2.5 pl-10 pr-4 rounded-xl text-xs"
              placeholder="Enter topic (e.g. B+ Tree Indexing)..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate</span>
          </button>
        </form>
      </div>

      {/* Main Content Card or Skeleton */}
      {loading ? (
        <LoadingSkeleton text={`Agents 1 & 2 Researching '${topic}'...`} />
      ) : summaryData ? (
        <SummaryCard
          summaryText={summaryData.summary}
          bulletPoints={summaryData.bullet_points}
          topic={summaryData.topic}
          onExportPDF={handleExportPDF}
        />
      ) : null}
    </div>
  );
}
