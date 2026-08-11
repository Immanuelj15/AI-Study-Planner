import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain } from 'lucide-react';

export default function ContentSkeleton({ text = "Structuring content..." }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 max-w-4xl mx-auto p-6 font-inter"
    >
      <div className="glass-card rounded-3xl p-8 border border-[#E2E8F0] bg-white space-y-6 shadow-soft animate-pulse">
        {/* Header Skeleton */}
        <div className="border-b border-[#E2E8F0] pb-4 flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-3 bg-[#DBEAFE] rounded-full w-44" />
            <div className="h-7 bg-[#DBEAFE] rounded-full w-72" />
          </div>
          <div className="px-4 py-2 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-xs border border-[#DBEAFE] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>{text}</span>
          </div>
        </div>

        {/* Paragraph Lines Skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-[#EFF6FF] rounded-full w-full" />
          <div className="h-4 bg-[#EFF6FF] rounded-full w-11/12" />
          <div className="h-4 bg-[#EFF6FF] rounded-full w-4/5" />
        </div>

        {/* Feature Box Skeleton */}
        <div className="p-5 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#2563EB] animate-spin" />
            <div className="h-4 bg-[#DBEAFE] rounded-full w-52" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="h-16 bg-white rounded-xl border border-[#DBEAFE] animate-pulse" />
            <div className="h-16 bg-white rounded-xl border border-[#DBEAFE] animate-pulse" />
            <div className="h-16 bg-white rounded-xl border border-[#DBEAFE] animate-pulse" />
          </div>
        </div>

        {/* Applications List Skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-[#DBEAFE] rounded-full w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-12 bg-[#F8FBFF] rounded-xl border border-[#E2E8F0]" />
            <div className="h-12 bg-[#F8FBFF] rounded-xl border border-[#E2E8F0]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
