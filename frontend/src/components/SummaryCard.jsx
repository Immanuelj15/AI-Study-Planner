import React from 'react';
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
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-cyan tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-brand-purple" /> Agent 2 Summarizer Notes
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 mt-1">{topic}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Text to Speech Voice Button */}
          <button
            onClick={() => (speaking ? stop() : speak(summaryText))}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              speaking
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {speaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-brand-cyan" />}
            <span>{speaking ? 'Stop Voice' : 'Voice Summary'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Copy Notes"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* PDF Export Button */}
          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="px-3.5 py-2 rounded-xl gradient-btn text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
          )}
        </div>
      </div>

      {/* Bullet Points Quick Revision Box */}
      {bulletPoints && bulletPoints.length > 0 && (
        <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 space-y-2">
          <h4 className="text-xs font-extrabold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> Quick Revision Bullets
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-200">
            {bulletPoints.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-brand-purple font-bold">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Markdown Content */}
      <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-slate-950/40 p-5 rounded-xl border border-slate-900">
        {summaryText}
      </div>
    </div>
  );
}
