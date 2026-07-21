import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Sparkles, BookOpen, GitFork, HelpCircle, Calendar, ArrowRight, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Header */}
      <header className="px-6 lg:px-12 py-5 flex items-center justify-between glass-card border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-purple to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-cyan">
            MultiAgent<span className="text-brand-500">Planner</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-bold text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="px-4 py-2.5 rounded-xl gradient-btn text-xs font-bold shadow-lg shadow-brand-500/20">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20 text-center space-y-8 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-cyan text-xs font-bold mx-auto"
        >
          <Sparkles className="w-4 h-4 text-brand-purple" /> Powered by Microsoft AutoGen & Groq LLMs
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto"
        >
          Transform Your Learning with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-brand-purple to-brand-cyan">
            4 Autonomous AI Agents
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Research topics, summarize notes, generate React Flow mind maps, solve adaptive quizzes, and automatically recalculate study schedules based on quiz performance feedback.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <Link
            to="/register"
            className="px-8 py-4 rounded-2xl gradient-btn text-sm font-extrabold flex items-center gap-2 shadow-xl shadow-brand-500/30"
          >
            <span>Launch Study Planner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold transition-colors"
          >
            Demo Sign In
          </Link>
        </motion.div>

        {/* 4 Agent Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-16 text-left">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">1. Research Agent</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Extracts concepts, definitions, formulas, and interview points from Groq LLMs.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold">
              <GitFork className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">2. Summarizer Agent</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Creates notes, bullet points, and React Flow mind map JSON graph structures.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">3. Quiz Generator</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Generates MCQ, True/False, and Fill-in-Blank quizzes with detailed explanations.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">4. Scheduler Agent</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Recalculates study plans automatically based on quiz score performance.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 AI Multi-Agent Study Planner. Built with FastAPI, AutoGen, React, & Tailwind CSS.
      </footer>
    </div>
  );
}
