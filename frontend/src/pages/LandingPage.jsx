import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Network, ClipboardCheck, Calendar, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-grid-pattern text-[#1E293B] flex flex-col justify-between selection:bg-[#2563EB] selection:text-white font-inter">
      {/* Top Header */}
      <header className="px-6 lg:px-12 py-4 flex items-center justify-between bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="StudyAgent Logo" className="w-10 h-10 rounded-2xl object-cover shadow-md border border-[#DBEAFE]" />
          <span className="font-poppins font-black text-xl tracking-tight text-[#1E293B]">
            Study<span className="text-[#2563EB]">Agent</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-inter font-bold text-[#64748B] hover:text-[#1E293B] transition-colors">
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/register" className="px-4.5 py-2.5 rounded-2xl btn-gradient-primary text-xs font-inter font-bold shadow-sm shadow-blue-500/20">
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 text-center space-y-8 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-inter font-bold mx-auto shadow-sm"
        >
          <img src="/logo.png" alt="Logo Icon" className="w-5 h-5 rounded-full object-cover" />
          <span>Microsoft AutoGen & Groq LLM Multi-Agent System</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="font-poppins text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-[#1E293B]"
        >
          Supercharge Your Learning with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#0EA5E9] to-[#38BDF8]">
            4 Autonomous AI Agents
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-[#64748B] font-inter text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Research complex topics, structure markdown notes, generate interactive mind maps, solve adaptive quizzes, and automatically recalculate study schedules based on quiz performance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/register"
              className="px-8 py-4 rounded-2xl btn-gradient-primary text-sm font-poppins font-bold flex items-center gap-2 shadow-md shadow-blue-500/25"
            >
              <span>Launch AI Study Planner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/login"
              className="px-8 py-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-[#1E293B] text-sm font-inter font-bold transition-colors shadow-sm"
            >
              Demo Sign In
            </Link>
          </motion.div>
        </motion.div>

        {/* 4 Agent Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-16 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -4 }}
            className="glass-card glass-card-hover p-6 rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] space-y-3 shadow-soft"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-poppins text-base font-bold text-[#1E293B]">1. Research Agent</h3>
            <p className="text-[#64748B] font-inter text-xs leading-relaxed">
              Extracts concepts, definitions, formulas, and interview points from Groq LLMs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -4 }}
            className="glass-card glass-card-hover p-6 rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] space-y-3 shadow-soft"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="font-poppins text-base font-bold text-[#1E293B]">2. Summarizer Agent</h3>
            <p className="text-[#64748B] font-inter text-xs leading-relaxed">
              Creates notes, bullet points, and React Flow mind map JSON graph structures.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -4 }}
            className="glass-card glass-card-hover p-6 rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] space-y-3 shadow-soft"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-bold">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="font-poppins text-base font-bold text-[#1E293B]">3. Quiz Generator</h3>
            <p className="text-[#64748B] font-inter text-xs leading-relaxed">
              Generates MCQ, True/False, and Fill-in-Blank quizzes with detailed explanations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ y: -4 }}
            className="glass-card glass-card-hover p-6 rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] space-y-3 shadow-soft"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-poppins text-base font-bold text-[#1E293B]">4. Scheduler Agent</h3>
            <p className="text-[#64748B] font-inter text-xs leading-relaxed">
              Recalculates study plans automatically based on quiz score performance.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-[#E2E8F0] bg-[#FFFFFF] text-center text-xs font-inter text-[#64748B]">
        © 2026 AI Multi-Agent Study Planner. Educational AI Platform built with React, Vite, Framer Motion, & Tailwind CSS.
      </footer>
    </div>
  );
}
