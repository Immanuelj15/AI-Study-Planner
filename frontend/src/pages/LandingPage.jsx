import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Sparkles, BookOpen, GitFork, HelpCircle, Calendar, ArrowRight, Shield, Zap, Brain, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#3B82F6] selection:text-white font-inter">
      {/* Top Header */}
      <header className="px-6 lg:px-12 py-5 flex items-center justify-between glass-card border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3B82F6] via-purple-600 to-[#06B6D4] flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="font-poppins font-black text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[#06B6D4]">
            Study<span className="text-[#3B82F6]">Agent</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-inter font-bold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/register" className="px-4 py-2.5 rounded-xl btn-gradient-primary text-xs font-inter font-bold shadow-md shadow-blue-500/20">
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20 text-center space-y-8 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#00E5FF] text-xs font-inter font-bold mx-auto shadow-inner"
        >
          <Sparkles className="w-4 h-4 text-[#06B6D4] animate-spin" /> Microsoft AutoGen & Groq LLM Multi-Agent System
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="font-poppins text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto"
        >
          Supercharge Your Learning with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#3B82F6] to-[#7C3AED]">
            4 Autonomous AI Agents
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-[#94A3B8] font-inter text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Research complex topics, structure markdown notes, generate React Flow mind maps, solve adaptive quizzes, and automatically recalculate study schedules based on quiz feedback.
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
              className="px-8 py-4 rounded-2xl btn-gradient-primary text-sm font-poppins font-bold flex items-center gap-2 shadow-xl shadow-cyan-500/25"
            >
              <span>Launch AI Study Planner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/login"
              className="px-8 py-4 rounded-2xl bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-[#F8FAFC] text-sm font-inter font-bold transition-colors"
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
            className="glass-card glass-card-hover p-6 rounded-3xl border border-[#334155] space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#3B82F6] flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-poppins text-base font-bold text-[#F8FAFC]">1. Research Agent</h3>
            <p className="text-[#94A3B8] font-inter text-xs leading-relaxed">
              Extracts concepts, definitions, formulas, and interview points from Groq LLMs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -4 }}
            className="glass-card glass-card-hover p-6 rounded-3xl border border-[#334155] space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
              <GitFork className="w-6 h-6" />
            </div>
            <h3 className="font-poppins text-base font-bold text-[#F8FAFC]">2. Summarizer Agent</h3>
            <p className="text-[#94A3B8] font-inter text-xs leading-relaxed">
              Creates notes, bullet points, and React Flow mind map JSON graph structures.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -4 }}
            className="glass-card glass-card-hover p-6 rounded-3xl border border-[#334155] space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#06B6D4] flex items-center justify-center font-bold">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-poppins text-base font-bold text-[#F8FAFC]">3. Quiz Generator</h3>
            <p className="text-[#94A3B8] font-inter text-xs leading-relaxed">
              Generates MCQ, True/False, and Fill-in-Blank quizzes with detailed explanations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ y: -4 }}
            className="glass-card glass-card-hover p-6 rounded-3xl border border-[#334155] space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-poppins text-base font-bold text-[#F8FAFC]">4. Scheduler Agent</h3>
            <p className="text-[#94A3B8] font-inter text-xs leading-relaxed">
              Recalculates study plans automatically based on quiz score performance.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-[#334155] text-center text-xs font-inter text-[#94A3B8]">
        © 2026 AI Multi-Agent Study Planner. Modern SaaS UI built with React, Vite, Framer Motion, & Tailwind CSS.
      </footer>
    </div>
  );
}
