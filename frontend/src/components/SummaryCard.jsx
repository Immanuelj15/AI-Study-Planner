import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Pause,
  Play,
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  ListChecks, 
  Star, 
  BookMarked, 
  Briefcase,
  Network,
  Layers
} from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import FlashcardModal from './FlashcardModal';

function renderCleanSummaryContent(summaryText) {
  if (!summaryText) return null;

  const lines = summaryText.split('\n');

  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={idx} className="h-2"></div>;

    if (trimmed.startsWith('#')) {
      const cleanHeading = trimmed.replace(/^[#\s]+/, '').replace(/[\*\_`]/g, '').trim();
      let IconComponent = Star;
      if (cleanHeading.toLowerCase().includes('example')) IconComponent = BookMarked;
      if (cleanHeading.toLowerCase().includes('interview')) IconComponent = Briefcase;
      if (cleanHeading.toLowerCase().includes('concept')) IconComponent = Star;

      return (
        <h3 key={idx} className="font-poppins text-base sm:text-lg font-extrabold text-[#2563EB] mt-6 mb-3 border-b border-[#E2E8F0] pb-2 flex items-center gap-2">
          <IconComponent className="w-[18px] h-[18px] text-[#2563EB]" />
          <span>{cleanHeading}</span>
        </h3>
      );
    }

    const cleanParagraph = trimmed
      .replace(/[\#\*\_`]/g, '')
      .trim();

    if (line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('•')) {
      return (
        <div key={idx} className="flex items-start gap-2.5 my-2 ml-2 text-xs sm:text-sm leading-relaxed text-[#1E293B]">
          <span className="text-[#2563EB] font-bold text-sm leading-none mt-0.5">•</span>
          <span>{cleanParagraph}</span>
        </div>
      );
    }

    return (
      <p key={idx} className="my-2 text-xs sm:text-sm leading-relaxed text-[#1E293B] font-normal">
        {cleanParagraph}
      </p>
    );
  });
}

export default function SummaryCard({ summaryText, bulletPoints, topic, onExportPDF }) {
  const { isPlaying, isPaused, speak, pause, resume, stop } = useSpeech();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);

  const handleCopy = () => {
    const cleanText = summaryText ? summaryText.replace(/[\#\*\_`]/g, '') : '';
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    addToast('Clean summary copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVoiceToggle = () => {
    if (isPlaying) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(summaryText ? summaryText.replace(/[\#\*\_`]/g, '') : '');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] space-y-6 shadow-soft bg-[#FFFFFF]"
    >
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">
            <Sparkles className="w-[18px] h-[18px] text-[#38BDF8]" /> Agent 2 Summarizer Notes
          </div>
          <h2 className="font-poppins text-2xl font-black text-[#1E293B] mt-1">{topic}</h2>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Flashcards Mode Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFlashcards(true)}
            className="px-3.5 py-2 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] text-xs font-inter font-bold flex items-center gap-1.5 border border-[#86EFAC]"
          >
            <Layers className="w-[18px] h-[18px] text-[#15803D]" /> Flashcards
          </motion.button>

          {/* Mind Map Shortcut */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/mindmap?topic=${encodeURIComponent(topic)}`)}
            className="px-3.5 py-2 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] text-xs font-inter font-bold flex items-center gap-1.5 border border-[#DBEAFE]"
          >
            <Network className="w-[18px] h-[18px] text-[#2563EB]" /> Mind Map
          </motion.button>

          {/* Voice AI Audio Reader Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVoiceToggle}
            className={`px-3.5 py-2 rounded-xl text-xs font-inter font-bold flex items-center gap-1.5 transition-all ${
              isPlaying && !isPaused
                ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB] shadow-xs'
                : 'bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#1E293B] border border-[#E2E8F0]'
            }`}
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="w-4 h-4 text-[#2563EB]" />
                <span>Pause Voice</span>
              </>
            ) : isPaused ? (
              <>
                <Play className="w-4 h-4 text-[#2563EB]" />
                <span>Resume Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#2563EB]" />
                <span>Listen to Notes</span>
              </>
            )}
          </motion.button>

          {isPlaying && (
            <button
              onClick={stop}
              className="px-2.5 py-2 rounded-xl bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5] text-xs font-bold"
              title="Stop Voice"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}

          {/* Copy Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="p-2 rounded-xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#1E293B] border border-[#E2E8F0] transition-colors"
            title="Copy Notes"
          >
            {copied ? <Check className="w-[18px] h-[18px] text-[#22C55E]" /> : <Copy className="w-[18px] h-[18px]" />}
          </motion.button>

          {/* PDF Export Button */}
          {onExportPDF && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExportPDF}
              className="px-4 py-2 rounded-xl btn-gradient-primary text-xs font-inter font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
            >
              <Download className="w-[18px] h-[18px]" /> Export PDF
            </motion.button>
          )}
        </div>
      </div>

      {/* Voice Audio Wave Banner when Playing */}
      {isPlaying && (
        <div className="p-3 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-between text-xs text-[#2563EB] font-poppins font-bold">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#2563EB] animate-pulse" />
            <span>AI Voice Reader Active — Reading '{topic}' Notes...</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-3 bg-[#2563EB] animate-bounce"></span>
            <span className="w-1 h-4 bg-[#2563EB] animate-bounce delay-100"></span>
            <span className="w-1 h-2 bg-[#2563EB] animate-bounce delay-200"></span>
          </div>
        </div>
      )}

      {/* Bullet Points Quick Revision Box */}
      {bulletPoints && bulletPoints.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-3">
          <h4 className="text-xs font-poppins font-extrabold text-[#2563EB] uppercase tracking-wider flex items-center gap-2">
            <ListChecks className="w-[18px] h-[18px] text-[#2563EB]" /> Quick Revision Bullets
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-inter text-[#1E293B]">
            {bulletPoints.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#2563EB] font-bold">•</span>
                <span>{pt.replace(/[\#\*\_`]/g, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Clean Formatted Summary Content */}
      <div className="prose prose-slate max-w-none text-[#1E293B] font-inter bg-[#F8FBFF] p-6 lg:p-8 rounded-2xl border border-[#E2E8F0]">
        {renderCleanSummaryContent(summaryText)}
      </div>

      {/* 3D Flashcards Modal */}
      {showFlashcards && (
        <FlashcardModal
          topic={topic}
          bulletPoints={bulletPoints}
          onClose={() => setShowFlashcards(false)}
        />
      )}
    </motion.div>
  );
}
