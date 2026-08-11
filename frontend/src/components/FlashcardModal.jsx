import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, ChevronLeft, ChevronRight, CheckCircle2, BookOpen, Sparkles, Brain, Shuffle, Check, AlertCircle } from 'lucide-react';

export default function FlashcardModal({ topic, bulletPoints = [], onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  // Parse raw bullet points intelligently into clean Term & Definition cards
  const cards = React.useMemo(() => {
    if (bulletPoints && bulletPoints.length > 0) {
      return bulletPoints.map((pt, i) => {
        const cleanText = pt.replace(/[\#\*\_`]/g, '').strip ? pt.replace(/[\#\*\_`]/g, '').trim() : pt.trim();
        
        let term = `Key Concept ${i + 1}`;
        let definition = cleanText;

        if (cleanText.includes(':')) {
          const parts = cleanText.split(':');
          term = parts[0].trim();
          definition = parts.slice(1).join(':').trim();
        } else if (cleanText.includes(' - ')) {
          const parts = cleanText.split(' - ');
          term = parts[0].trim();
          definition = parts.slice(1).join(' - ').trim();
        } else if (cleanText.length < 35) {
          term = cleanText;
          definition = `Key foundational principle and invariant governing ${topic || 'this subject'}.`;
        }

        return {
          id: i,
          term: term,
          definition: definition
        };
      });
    }

    return [
      { id: 0, term: `Core Principles of ${topic || 'Subject'}`, definition: `Understanding memory allocation, execution invariants, and core architecture for ${topic || 'this subject'}.` },
      { id: 1, term: 'Algorithm Time & Space Bounds', definition: 'Maintains logarithmic execution bounds O(log N) with auxiliary space optimization O(1).' },
      { id: 2, term: 'Technical Interview Edge Case', definition: 'Guard against boundary overflow, numerical index errors, and unhandled pointer references.' },
      { id: 3, term: 'Industrial Production Application', definition: 'Widely applied in database engine indexing, operating system kernels, and real-time routing.' }
    ];
  }, [bulletPoints, topic]);

  const currentCard = cards[currentIndex] || cards[0];

  // Keyboard navigation support (Spacebar to flip, Arrow keys to navigate, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards.length]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const randomIndex = Math.floor(Math.random() * cards.length);
    setCurrentIndex(randomIndex);
  };

  const handleMarkMastered = () => {
    setMasteredCount((prev) => prev + 1);
    handleNext();
  };

  const progressPct = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-inter"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-xl bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
                <Brain className="w-4 h-4 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-sm text-[#1E293B] flex items-center gap-2">
                  <span>3D Active Recall Flashcards</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                    Anki Style
                  </span>
                </h3>
                <p className="text-[11px] text-[#64748B]">Tap card or press Spacebar to flip</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                className="p-2 rounded-xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] border border-[#E2E8F0] transition-colors"
                title="Shuffle Deck"
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] border border-[#E2E8F0] transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Progress Tracker Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold text-[#64748B]">
              <span className="truncate max-w-[200px]">Topic: {topic || 'General'}</span>
              <span className="text-[#2563EB] font-bold">Card {currentIndex + 1} of {cards.length} ({progressPct}%)</span>
            </div>
            <div className="w-full h-2 bg-[#EFF6FF] rounded-full overflow-hidden border border-[#DBEAFE]">
              <motion.div
                className="h-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8]"
                initial={{ width: '0%' }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* 3D Flip Card Frame */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-72 cursor-pointer [perspective:1200px]"
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
              className="w-full h-full relative [transform-style:preserve-3d]"
            >
              {/* FRONT SIDE (Sleek Light Glassmorphic Card) */}
              <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-[#EFF6FF] via-[#F8FBFF] to-[#FFFFFF] border-2 border-[#2563EB] text-[#1E293B] p-7 flex flex-col justify-between shadow-xl [backface-visibility:hidden] relative overflow-hidden">
                <div className="flex justify-between items-center text-xs">
                  <span className="px-3 py-1 rounded-full bg-[#2563EB] text-white font-poppins font-bold text-[10px] tracking-wider uppercase shadow-xs">
                    FRONT • KEY TERM
                  </span>
                  <RotateCw className="w-4 h-4 text-[#2563EB]" />
                </div>

                <div className="text-center my-auto space-y-3 px-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#2563EB] font-bold block">
                    {topic || 'CONCEPT RECALL'}
                  </span>
                  <h3 className="font-poppins font-black text-xl lg:text-2xl text-[#1E293B] leading-snug">
                    {currentCard.term}
                  </h3>
                </div>

                <div className="text-center text-[11px] text-[#64748B] font-medium flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Tap card or press Spacebar to reveal definition</span>
                </div>
              </div>

              {/* BACK SIDE (Clean High-Contrast Definition View) */}
              <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-[#F8FBFF] to-[#FFFFFF] border-2 border-[#2563EB] text-[#1E293B] p-7 flex flex-col justify-between shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div className="flex justify-between items-center text-xs">
                  <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] font-poppins font-bold text-[10px] tracking-wider border border-[#DBEAFE] uppercase">
                    BACK • DEFINITION & RECALL
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                </div>

                <div className="text-center my-auto space-y-2 px-2">
                  <h4 className="font-poppins font-bold text-xs text-[#2563EB] uppercase tracking-wider">Definition:</h4>
                  <p className="text-sm font-inter leading-relaxed text-[#1E293B] font-medium">
                    {currentCard.definition}
                  </p>
                </div>

                {/* Self-Rating Feedback Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2E8F0]">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="py-1.5 px-2 rounded-xl bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#991B1B] text-[11px] font-bold transition-all text-center"
                  >
                    🔴 Need Review
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="py-1.5 px-2 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] text-[11px] font-bold transition-all text-center"
                  >
                    🟡 Good
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMarkMastered(); }}
                    className="py-1.5 px-2 rounded-xl bg-[#DCFCE7] hover:bg-[#86EFAC] text-[#15803D] text-[11px] font-bold transition-all text-center"
                  >
                    🟢 Easy / Got It
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-2xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#1E293B] border border-[#E2E8F0] text-xs font-poppins font-bold flex items-center gap-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-[#2563EB]" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-6 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-poppins font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all"
            >
              <RotateCw className="w-4 h-4" />
              <span>{isFlipped ? 'Show Front' : 'Flip Card'}</span>
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-2.5 rounded-2xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#1E293B] border border-[#E2E8F0] text-xs font-poppins font-bold flex items-center gap-1.5 transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 text-[#2563EB]" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
