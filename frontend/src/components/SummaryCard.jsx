import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Download, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { useToast } from '../context/ToastContext';

export default function SummaryCard({ summaryText, bulletPoints, topic, onExportPDF }) {
  const { speak, stop, speaking } = useSpeech();
  const { addToast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    addToast('Summary copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 lg:p-8 border border-[#334155] space-y-6 shadow-2xl"
    >
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#334155]">
        <div>
          <div className="flex items-center gap-2 text-xs font-inter font-bold text-[#06B6D4] tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-[#3B82F6]" /> Agent 2 Summarizer Notes
          </div>
          <h2 className="font-poppins text-2xl font-black text-[#F8FAFC] mt-1">{topic}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Text to Speech Voice Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (speaking ? stop() : speak(summaryText))}
            className={`px-4 py-2 rounded-xl text-xs font-inter font-bold flex items-center gap-2 transition-all ${
              speaking
                ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 animate-pulse'
                : 'bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155]'
            }`}
          >
            {speaking ? <VolumeX className="w-4 h-4 text-[#EF4444]" /> : <Volume2 className="w-4 h-4 text-[#06B6D4]" />}
            <span>{speaking ? 'Stop Voice' : 'Voice Summary'}</span>
          </motion.button>

          {/* Copy Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="p-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155] transition-colors"
            title="Copy Notes"
          >
            {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
          </motion.button>

          {/* PDF Export Button */}
          {onExportPDF && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExportPDF}
              className="px-4 py-2 rounded-xl btn-gradient-primary text-xs font-inter font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Download className="w-4 h-4" /> Export PDF
            </motion.button>
          )}
        </div>
      </div>

      {/* Bullet Points Quick Revision Box */}
      {bulletPoints && bulletPoints.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 space-y-3">
          <h4 className="text-xs font-poppins font-extrabold text-[#06B6D4] uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#3B82F6]" /> Quick Revision Bullets
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs font-inter text-[#F8FAFC]">
            {bulletPoints.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#3B82F6] font-bold">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Markdown Content */}
      <div className="prose prose-invert max-w-none text-[#F8FAFC] text-sm leading-relaxed whitespace-pre-wrap font-inter bg-[#0F172A]/70 p-6 rounded-2xl border border-[#334155]">
        {summaryText}
      </div>
    </motion.div>
  );
}
