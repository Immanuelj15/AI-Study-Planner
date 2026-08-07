import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, ChevronLeft, ChevronRight, CheckCircle2, BookOpen, Sparkles } from 'lucide-react';

export default function FlashcardModal({ topic, bulletPoints = [], onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // If no bullet points provided, use fallback flashcard deck
  const cards = (bulletPoints && bulletPoints.length > 0)
    ? bulletPoints.map((pt, i) => {
        const cleanText = pt.replace(/[\#\*\_`]/g, '').trim();
        const parts = cleanText.split(/:(.+)/);
        return {
          term: parts[0] ? parts[0].trim() : `Concept ${i + 1}`,
          definition: parts[1] ? parts[1].trim() : cleanText
        };
      })
    : [
        { term: 'Core Concept', definition: `${topic || 'Subject'} fundamental operating principles and memory layout.` },
        { term: 'Key Formula / Rule', definition: 'Maintains optimal logarithmic time complexity O(log N).' },
        { term: 'Exam Tip', definition: 'Guard against integer overflow during index calculation.' }
      ];

  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-inter"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2 text-xs font-poppins font-bold text-[#2563EB]">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              <span>3D Active Recall Flashcards</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-inter font-bold text-[#64748B]">
                Card {currentIndex + 1} of {cards.length}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-[#F1F5F9] text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-64 cursor-pointer [perspective:1000px]"
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="w-full h-full relative [transform-style:preserve-3d]"
            >
              {/* Front Side */}
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] text-white p-6 flex flex-col justify-between shadow-lg [backface-visibility:hidden]">
                <div className="flex justify-between items-center text-xs text-blue-100 font-bold">
                  <span>FRONT • KEY TERM</span>
                  <RotateCw className="w-4 h-4 text-blue-100" />
                </div>
                <div className="text-center my-auto space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-blue-200 font-bold block">{topic}</span>
                  <h3 className="font-poppins font-black text-xl text-white">{currentCard.term}</h3>
                </div>
                <div className="text-center text-[11px] text-blue-100 font-medium">
                  Tap card to flip definition 🔄
                </div>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-[#EFF6FF] border-2 border-[#2563EB] text-[#1E293B] p-6 flex flex-col justify-between shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div className="flex justify-between items-center text-xs text-[#2563EB] font-bold">
                  <span>BACK • DEFINITION</span>
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                </div>
                <div className="text-center my-auto">
                  <p className="text-sm font-inter leading-relaxed text-[#1E293B] font-medium">{currentCard.definition}</p>
                </div>
                <div className="text-center text-[11px] text-[#64748B] font-medium">
                  Tap card to view front 🔄
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#1E293B] border border-[#E2E8F0] text-xs font-poppins font-bold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-poppins font-bold flex items-center gap-1.5 shadow-sm"
            >
              <RotateCw className="w-4 h-4" /> Flip Card
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#1E293B] border border-[#E2E8F0] text-xs font-poppins font-bold flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
