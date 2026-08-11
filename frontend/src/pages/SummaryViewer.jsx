import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { agentAPI, adaptiveAPI } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { FileText, Search, Sparkles, Heart, BookOpen } from 'lucide-react';
import jsPDF from 'jspdf';

export default function SummaryViewer() {
  const [searchParams] = useSearchParams();
  const topicParam = searchParams.get('topic') || '';
  const subjectIdParam = parseInt(searchParams.get('subject_id') || '1');

  const [topic, setTopic] = useState(topicParam);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (topicParam) {
      setTopic(topicParam);
      fetchSummary(topicParam, subjectIdParam);
    }
  }, [topicParam, subjectIdParam]);

  const fetchSummary = async (searchTopic, subId) => {
    if (!searchTopic || !searchTopic.trim()) return;
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
      adaptiveAPI.trackEvent({ event_type: 'reading', duration_seconds: 120 }).catch(() => {});
      addToast('Class Notes Ready 📘 Happy Learning!', 'success');
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
      fetchSummary(topic.trim(), subjectIdParam);
    }
  };

  const handleExportPDF = () => {
    if (!summaryData) return;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Class Notes: ${summaryData.topic}`, 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const cleanText = summaryData.summary ? summaryData.summary.replace(/[\#\*\_`]/g, '') : '';
    const splitText = doc.splitTextToSize(cleanText, 180);
    
    let y = 30;
    const pageHeight = 275;
    for (let i = 0; i < splitText.length; i++) {
      if (y > pageHeight) {
        doc.addPage();
        y = 20;
      }
      doc.text(splitText[i], 14, y);
      y += 6;
    }
    
    const cleanFilename = (summaryData.topic || 'Study_Notes').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`${cleanFilename}_Notes.pdf`);
    addToast('PDF downloaded successfully!', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 font-inter"
    >
      {/* Search Header */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] space-y-4 shadow-soft bg-[#FFFFFF]">
        <div>
          <div className="flex items-center gap-2 text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">
            <Heart className="w-4 h-4 text-[#2563EB] fill-[#2563EB]" /> AI Research & Notes Agent
          </div>
          <h1 className="font-poppins text-2xl font-black text-[#1E293B] mt-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#2563EB]" /> Easy-to-Understand Class Notes
          </h1>
          <p className="text-[#64748B] font-inter text-xs mt-1">
            Enter any topic name and click "Generate Notes" to create structured bullet points, definitions, and interview tips.
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
              placeholder="Enter topic (e.g. Operating Systems)..."
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl bg-[#2563EB] text-white text-xs font-inter font-bold flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Notes</span>
          </motion.button>
        </form>
      </div>

      {/* Main Content Card or Sequential Processing Skeleton */}
      {loading ? (
        <LoadingSkeleton text={`Writing Easy-to-Understand Notes for '${topic}'...`} />
      ) : summaryData ? (
        <SummaryCard
          summaryText={summaryData.summary}
          bulletPoints={summaryData.bullet_points}
          topic={summaryData.topic}
          onExportPDF={handleExportPDF}
        />
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center space-y-3 border border-[#E2E8F0] bg-[#FFFFFF] shadow-soft">
          <BookOpen className="w-12 h-12 text-[#2563EB] mx-auto" />
          <h3 className="font-poppins font-bold text-base text-[#1E293B]">Enter a Topic to Generate Class Notes</h3>
          <p className="text-xs text-[#64748B] font-inter max-w-md mx-auto">
            Type any topic above and click "Generate Notes" to trigger the AI Research Agent.
          </p>
        </div>
      )}
    </motion.div>
  );
}
