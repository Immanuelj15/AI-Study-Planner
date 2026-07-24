import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Download, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { useToast } from '../context/ToastContext';

function renderCleanSummaryContent(summaryText) {
  if (!summaryText) return null;

  const lines = summaryText.split('\n');

  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={idx} className="h-2"></div>;

    // Headings starting with #, ##, ###
    if (trimmed.startsWith('#')) {
      const cleanHeading = trimmed.replace(/^[#\s]+/, '').replace(/[\*\_`]/g, '').trim();
      return (
        <h3 key={idx} className="font-poppins text-base sm:text-lg font-extrabold text-[#2563EB] mt-5 mb-2.5 border-b border-[#E2E8F0] pb-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#38BDF8]"></span>
          <span>{cleanHeading}</span>
        </h3>
      );
    }

    // Clean inline markdown special characters (#, *, _, `) from regular paragraph text
    const cleanParagraph = trimmed
      .replace(/[\#\*\_`]/g, '') // Strip literal #, *, _, and ` characters!
      .trim();

    // Bullet point items starting with -, *, •
    if (line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('•')) {
      return (
        <div key={idx} className="flex items-start gap-2.5 my-1.5 ml-2 text-xs sm:text-sm leading-relaxed text-[#1E293B]">
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
  const { speak, stop, speaking } = useSpeech();
  const { addToast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    // Copy clean text without raw # or markdown special characters
    const cleanText = summaryText ? summaryText.replace(/[\#\*\_`]/g, '') : '';
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    addToast('Clean summary copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
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
            <Sparkles className="w-4 h-4 text-[#38BDF8]" /> Agent 2 Summarizer Notes
          </div>
          <h2 className="font-poppins text-2xl font-black text-[#1E293B] mt-1">{topic}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Text to Speech Voice Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (speaking ? stop() : speak(summaryText ? summaryText.replace(/[\#\*\_`]/g, '') : ''))}
            className={`px-4 py-2 rounded-xl text-xs font-inter font-bold flex items-center gap-2 transition-all ${
              speaking
                ? 'bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5] animate-pulse'
                : 'bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#1E293B] border border-[#E2E8F0]'
            }`}
          >
            {speaking ? <VolumeX className="w-4 h-4 text-[#EF4444]" /> : <Volume2 className="w-4 h-4 text-[#2563EB]" />}
            <span>{speaking ? 'Stop Voice' : 'Voice Summary'}</span>
          </motion.button>

          {/* Copy Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="p-2 rounded-xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#1E293B] border border-[#E2E8F0] transition-colors"
            title="Copy Clean Notes"
          >
            {copied ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
          </motion.button>

          {/* PDF Export Button */}
          {onExportPDF && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExportPDF}
              className="px-4 py-2 rounded-xl btn-gradient-primary text-xs font-inter font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
            >
              <Download className="w-4 h-4" /> Export PDF
            </motion.button>
          )}
        </div>
      </div>

      {/* Bullet Points Quick Revision Box */}
      {bulletPoints && bulletPoints.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-3">
          <h4 className="text-xs font-poppins font-extrabold text-[#2563EB] uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#2563EB]" /> Quick Revision Bullets
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs font-inter text-[#1E293B]">
            {bulletPoints.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#2563EB] font-bold">•</span>
                <span>{pt.replace(/[\#\*\_`]/g, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Clean Formatted Summary Content (Zero # or special characters) */}
      <div className="prose prose-slate max-w-none text-[#1E293B] font-inter bg-[#F8FBFF] p-6 lg:p-8 rounded-2xl border border-[#E2E8F0]">
        {renderCleanSummaryContent(summaryText)}
      </div>
    </motion.div>
  );
}
