import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Brain, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Users, 
  Award, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Bot, 
  Search, 
  HelpCircle, 
  FileText, 
  BarChart3, 
  AlertCircle, 
  Menu, 
  X, 
  Check, 
  Star, 
  GraduationCap, 
  Languages, 
  FileCheck, 
  HardDrive,
  MessageSquare,
  Activity,
  Flame,
  RotateCcw
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('progress'); // progress, schedule, weakness, tutor

  // Smooth scroll handler
  const scrollToSection = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFF] text-[#1E293B] font-inter selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* =========================================================
          SECTION 1: STICKY FLOATING GLASS NAVBAR
          ========================================================= */}
      <header className="sticky top-0 z-50 pt-3 px-4 sm:px-6 lg:px-8 transition-all">
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-xl border border-slate-200/90 shadow-sm shadow-slate-200/60 rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Left: Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-700 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/25 group-hover:scale-105 group-hover:shadow-md transition-all">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-poppins font-black text-xl text-slate-900 tracking-tight leading-none">
                Study<span className="text-blue-600">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200/80 uppercase tracking-wider">
                Platform
              </span>
            </div>
          </Link>

          {/* Center: Desktop Refined Navigation Pill Cluster */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-600">
            <a 
              href="#home" 
              onClick={(e) => scrollToSection(e, 'home')} 
              className="px-3.5 py-1.5 rounded-lg hover:text-blue-600 hover:bg-white hover:shadow-xs transition-all"
            >
              Home
            </a>
            <a 
              href="#features" 
              onClick={(e) => scrollToSection(e, 'features')} 
              className="px-3.5 py-1.5 rounded-lg hover:text-blue-600 hover:bg-white hover:shadow-xs transition-all"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => scrollToSection(e, 'how-it-works')} 
              className="px-3.5 py-1.5 rounded-lg hover:text-blue-600 hover:bg-white hover:shadow-xs transition-all"
            >
              How It Works
            </a>
            <a 
              href="#multi-agent" 
              onClick={(e) => scrollToSection(e, 'multi-agent')} 
              className="px-3.5 py-1.5 rounded-lg hover:text-blue-600 hover:bg-white hover:shadow-xs transition-all"
            >
              Multi-Agent AI
            </a>
            <a 
              href="#about" 
              onClick={(e) => scrollToSection(e, 'about')} 
              className="px-3.5 py-1.5 rounded-lg hover:text-blue-600 hover:bg-white hover:shadow-xs transition-all"
            >
              About
            </a>
          </nav>

          {/* Right: Auth Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition-all"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm shadow-blue-500/25 hover:shadow-md hover:shadow-blue-500/35 transition-all flex items-center gap-1.5 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden mt-2 max-w-6xl mx-auto rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl px-4 py-5 space-y-4 shadow-xl overflow-hidden"
            >
              <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
                <a 
                  href="#home" 
                  onClick={(e) => scrollToSection(e, 'home')} 
                  className="px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  Home
                </a>
                <a 
                  href="#features" 
                  onClick={(e) => scrollToSection(e, 'features')} 
                  className="px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  onClick={(e) => scrollToSection(e, 'how-it-works')} 
                  className="px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  How It Works
                </a>
                <a 
                  href="#multi-agent" 
                  onClick={(e) => scrollToSection(e, 'multi-agent')} 
                  className="px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  Multi-Agent AI
                </a>
                <a 
                  href="#about" 
                  onClick={(e) => scrollToSection(e, 'about')} 
                  className="px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  About
                </a>
              </nav>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-700 rounded-xl bg-slate-50 border border-slate-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="w-full py-2.5 text-center text-xs font-bold text-white rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                >
                  Get Started for Free
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>


      {/* =========================================================
          SECTION 2: HERO SECTION
          ========================================================= */}
      <section id="home" className="pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Next-Gen College Syllabus Intelligence</span>
            </div>

            <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Study Smarter.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
                Learn Better.
              </span><br />
              Achieve More.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-inter leading-relaxed max-w-xl">
              Your personalized AI learning companion that transforms your college syllabus into smart study plans, interactive learning, and exam preparation.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-poppins font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg transition flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-poppins font-bold text-sm border border-slate-200 shadow-xs hover:border-slate-300 transition"
              >
                Explore Features
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>AI-Powered Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Personalized Study Plans</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Syllabus-Based Learning</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Interactive Dashboard Preview Mockup */}
          <div className="lg:col-span-6">
            <div className="relative">
              {/* Subtle background glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600/20 to-sky-500/20 rounded-3xl blur-xl -z-10" />

              {/* Main Preview Container */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-5 sm:p-6 space-y-4">
                
                {/* Mockup Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs font-bold text-slate-400 font-mono">studyai.dashboard.preview</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Learning Feed
                  </span>
                </div>

                {/* Mockup Tab Selector */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setActivePreviewTab('progress')}
                    className={`py-1.5 px-1 rounded-lg transition text-center truncate ${
                      activePreviewTab === 'progress' 
                        ? 'bg-white text-blue-600 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Progress
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('schedule')}
                    className={`py-1.5 px-1 rounded-lg transition text-center truncate ${
                      activePreviewTab === 'schedule' 
                        ? 'bg-white text-blue-600 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Study Plan
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('weakness')}
                    className={`py-1.5 px-1 rounded-lg transition text-center truncate ${
                      activePreviewTab === 'weakness' 
                        ? 'bg-white text-blue-600 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Weak Topics
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('tutor')}
                    className={`py-1.5 px-1 rounded-lg transition text-center truncate ${
                      activePreviewTab === 'tutor' 
                        ? 'bg-white text-blue-600 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    AI Tutor
                  </button>
                </div>

                {/* Mockup Active Content Views */}
                <div className="space-y-4 pt-1">
                  {/* VIEW 1: PROGRESS */}
                  {activePreviewTab === 'progress' && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
                          <span className="text-[10px] font-bold uppercase text-blue-600">Syllabus Mastery</span>
                          <div className="text-2xl font-black text-slate-800 mt-0.5">84%</div>
                          <div className="w-full h-1.5 bg-blue-200/60 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full w-[84%]" />
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                          <span className="text-[10px] font-bold uppercase text-emerald-700">Recent Quiz Score</span>
                          <div className="text-2xl font-black text-slate-800 mt-0.5">92%</div>
                          <span className="text-[10px] font-bold text-emerald-600">Adaptive Hard Level</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">Active Course: Database Management Systems</span>
                          <span className="text-[10px] font-bold text-blue-600">Unit 3 of 5</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>12 Practice Quizzes Completed • 4 Spaced Revisions Active</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* VIEW 2: STUDY PLAN */}
                  {activePreviewTab === 'schedule' && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5">
                      <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-800">Unit 3: Normalization & BCNF</div>
                          <div className="text-[10px] text-slate-500">Today's Focus • 2.0 hrs allocated</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white">
                          High Priority
                        </span>
                      </div>

                      <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-800">Operating Systems: CPU Scheduling</div>
                          <div className="text-[10px] text-slate-500">Spaced Review Day 3 • 1.5 hrs</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Medium
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 text-center border border-slate-100">
                        Exam Countdown: <b>14 Days Remaining</b> • All syllabus units scheduled
                      </div>
                    </motion.div>
                  )}

                  {/* VIEW 3: WEAKNESS */}
                  {activePreviewTab === 'weakness' && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5">
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            Concurrency Control & 2PL
                          </span>
                          <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            48% Accuracy
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-snug">
                          Struggled on multi-version concurrency control questions. Flashcards scheduled for reinforcement.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Target Revision Recommended</span>
                          <span className="text-[10px] font-bold text-blue-600">Stage 1 Interval</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Review SuperMemo-2 flashcards: 6 concepts ready for active recall.
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* VIEW 4: TUTOR */}
                  {activePreviewTab === 'tutor' && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-600">
                        <span className="font-bold text-slate-800">Student Question:</span>
                        <p>"Can you explain the exact difference between 3NF and BCNF with a quick example?"</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs space-y-1.5 text-blue-950">
                        <div className="flex items-center gap-1.5 font-bold text-blue-700">
                          <Bot className="w-3.5 h-3.5 text-blue-600" />
                          <span>AI Tutor Agent:</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          "In 3NF, transitive functional dependencies are eliminated. BCNF is stricter: every determinant (X in X → Y) must strictly be a candidate key..."
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Mockup Footer Banner */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Adaptive Learning Profile Active
                  </span>
                  <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                    <span>Try it live</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================
          SECTION 3: PROBLEM STATEMENT
          ========================================================= */}
      <section id="about" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
              The Academic Challenge
            </span>
            <h2 className="font-poppins text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Every Student Learns Differently.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Students often struggle to manage their syllabus, identify weak topics, and prepare for exams effectively. StudyAI brings personalized learning tools together in one platform.
            </p>
          </div>

          {/* 3 Problems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Problem 1 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs hover:border-blue-300 transition flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100/80 text-red-600 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-bold text-lg text-slate-900">
                  1. Difficulty Managing a Large Syllabus
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  College course curriculums are vast, textbook chapters are heavy, and notes are scattered. Without structured topic-by-topic tracking, students lose track of essential syllabus units.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-bold text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Overwhelming Curriculum Volume</span>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs hover:border-blue-300 transition flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-600 flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-bold text-lg text-slate-900">
                  2. Lack of Personalized Learning Guidance
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Traditional classroom lectures treat all students identically. When a student struggles with a specific concept, there is no personalized system to detect the weakness or explain it at their pace.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-bold text-amber-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Undetected Conceptual Blindspots</span>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs hover:border-blue-300 transition flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-bold text-lg text-slate-900">
                  3. Poor Exam Preparation & Revision Planning
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Cramming the night before leads to rapid forgetting. Students lack structured daily milestones, spaced review intervals, and previous exam question paper analysis.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-bold text-blue-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Last-Minute Revision Stress</span>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          SECTION 4: CORE FEATURES
          ========================================================= */}
      <section id="features" className="py-20 lg:py-28 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Intelligent Platform Capabilities
          </span>
          <h2 className="font-poppins text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Learn Smarter.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Discover powerful AI tools designed to support your entire learning journey.
          </p>
        </div>

        {/* 8 Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* Feature 1 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-poppins font-bold text-base text-slate-900">
                College Syllabus AI
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload and learn from your college syllabus using AI-powered notes, quizzes, and explanations.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-bold text-blue-600 flex items-center gap-1">
              <span>Syllabus RAG Assistant</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-poppins font-bold text-base text-slate-900">
                Personalized Learning
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Identify weak topics and receive customized recommendations based on your performance.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-bold text-purple-600 flex items-center gap-1">
              <span>Adaptive Profiles</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-poppins font-bold text-base text-slate-900">
                Smart Exam Preparation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create personalized daily study plans based on your exam date and available study hours.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-bold text-amber-600 flex items-center gap-1">
              <span>Exam Sprint Mode</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-poppins font-bold text-base text-slate-900">
                AI Doubt Solver
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Understand difficult concepts through simple explanations and step-by-step examples.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-bold text-sky-600 flex items-center gap-1">
              <span>24/7 Contextual Tutor</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="font-poppins font-bold text-base text-slate-900">
                Smart Revision
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Revise topics at the right time using adaptive revision schedules.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <span>SuperMemo-2 Intervals</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-poppins font-bold text-base text-slate-900">
                Learning Analytics
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track your learning progress, quiz scores, and topic mastery.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-bold text-indigo-600 flex items-center gap-1">
              <span>Mastery Breakdown</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Feature 7 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-poppins font-bold text-base text-slate-900">
                Question Paper Analyzer
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Analyze previous question papers and identify frequently appearing topics.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-bold text-rose-600 flex items-center gap-1">
              <span>Past Trends Extractor</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Feature 8 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="font-poppins font-bold text-base text-slate-900">
                Multilingual Learning
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Learn in English and Tamil with AI-powered explanations.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-bold text-teal-600 flex items-center gap-1">
              <span>English & தமிழ்</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================
          SECTION 5: HOW IT WORKS
          ========================================================= */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white border-y border-slate-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
              Clear Step-by-Step Flow
            </span>
            <h2 className="font-poppins text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Your Learning Journey, Simplified.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              From syllabus onboarding to continuous mastery in four simple steps.
            </p>
          </div>

          {/* 4-Step Process Timeline */}
          <div className="relative">
            {/* Horizontal Connecting Line on Desktop */}
            <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-0.5 bg-blue-100 -translate-y-6 -z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 items-stretch">
              
              {/* Step 1 */}
              <div className="bg-slate-50/80 border border-slate-200 p-6 rounded-3xl flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-poppins font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                    1
                  </div>
                  <h3 className="font-poppins font-bold text-base text-slate-900">
                    Choose Your Subject
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Select your college, semester, and subject.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-slate-400">
                  Step 01 • Syllabus Selection
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50/80 border border-slate-200 p-6 rounded-3xl flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-poppins font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                    2
                  </div>
                  <h3 className="font-poppins font-bold text-base text-slate-900">
                    Understand Your Learning Needs
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    AI analyzes your syllabus and learning progress.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-slate-400">
                  Step 02 • AI Diagnosis
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50/80 border border-slate-200 p-6 rounded-3xl flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-poppins font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                    3
                  </div>
                  <h3 className="font-poppins font-bold text-base text-slate-900">
                    Get Your Personalized Plan
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Receive notes, quizzes, revision tasks, and study plans.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-slate-400">
                  Step 03 • Action Milestones
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-50/80 border border-slate-200 p-6 rounded-3xl flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-poppins font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                    4
                  </div>
                  <h3 className="font-poppins font-bold text-base text-slate-900">
                    Track Your Progress
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Improve your knowledge through continuous personalized learning.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-slate-400">
                  Step 04 • Continuous Mastery
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          SECTION 6: MULTI-AGENT AI
          ========================================================= */}
      <section id="multi-agent" className="py-20 lg:py-28 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Autonomous Collaboration Architecture
          </span>
          <h2 className="font-poppins text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Powered by Intelligent AI Agents.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Multiple AI agents work together to support your learning journey.
          </p>
        </div>

        {/* 6 AI Agents Grid / Connected Workflow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Agent 1 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Agent 1
                </span>
              </div>
              <h3 className="font-poppins font-bold text-base text-slate-900">
                Research Agent
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Explores and explains concepts. Conducts structured technical analysis across your syllabus topics.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
              Output: Deep Explanations & References
            </div>
          </div>

          {/* Agent 2 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                  Agent 2
                </span>
              </div>
              <h3 className="font-poppins font-bold text-base text-slate-900">
                Summarizer Agent
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Converts topics into concise notes. Formats key points, technical formulas, and unit summaries.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
              Output: Concise Revision Notes
            </div>
          </div>

          {/* Agent 3 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Agent 3
                </span>
              </div>
              <h3 className="font-poppins font-bold text-base text-slate-900">
                Quiz Agent
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates personalized practice questions. Creates adaptive 15-question sets matching student difficulty.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
              Output: Diagnostic & Adaptive Quizzes
            </div>
          </div>

          {/* Agent 4 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  Agent 4
                </span>
              </div>
              <h3 className="font-poppins font-bold text-base text-slate-900">
                Scheduler Agent
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Creates adaptive study plans. Distributes syllabus milestones according to target exam dates and available hours.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
              Output: Day-by-Day Study Timetable
            </div>
          </div>

          {/* Agent 5 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Agent 5
                </span>
              </div>
              <h3 className="font-poppins font-bold text-base text-slate-900">
                AI Tutor Agent
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Answers student doubts. Provides step-by-step guidance, code breakdowns, and contextual clarifications.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
              Output: Real-Time Socratic Dialogue
            </div>
          </div>

          {/* Agent 6 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  Agent 6
                </span>
              </div>
              <h3 className="font-poppins font-bold text-base text-slate-900">
                Learning Profile Agent
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Analyzes learning performance. Tracks mastery percentages, detects weakness areas, and updates student profiles.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
              Output: Longitudinal Academic Profile
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================
          SECTION 7: PERSONALIZED LEARNING
          ========================================================= */}
      <section className="py-20 lg:py-28 bg-white border-y border-slate-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                Continuous Adaptation Engine
              </span>
              <h2 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Your Learning.<br />
                Your Pace.<br />
                Your Progress.
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                The platform continuously monitors how you interact with your syllabus and automatically adapts based on five critical dimensions:
              </p>

              {/* 5 Adaptive Criteria Badges */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Learning Performance</div>
                    <div className="text-[11px] text-slate-500">Adapts content pace to your comprehension velocity</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Quiz Scores & Accuracy</div>
                    <div className="text-[11px] text-slate-500">Dynamically scales difficulty (Easy → Medium → Hard)</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Topic Difficulty & Weightage</div>
                    <div className="text-[11px] text-slate-500">Prioritizes high-yield syllabus units and challenging topics</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Study Activity & Time Blocks</div>
                    <div className="text-[11px] text-slate-500">Tailors tasks to your peak focus periods and daily capacity</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Revision Needs & Forgetting Curves</div>
                    <div className="text-[11px] text-slate-500">Schedules active recall exactly before memory decay occurs</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Learning Progress Interactive Visual Preview */}
            <div className="lg:col-span-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Student Profile Snapshot</span>
                    <h3 className="font-poppins font-black text-lg text-slate-900">CS8492 • Database Systems</h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Active Adaptive Mode
                  </span>
                </div>

                {/* Topic Mastery Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Topic Mastery Breakdown</span>
                    <span className="text-blue-600">82% Verified</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full w-[82%]" />
                  </div>
                </div>

                {/* Detected Weak Topics */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-amber-700">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Detected Weak Topics
                    </span>
                    <span className="text-[10px] text-slate-400">Diagnostic Engine</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                      B-Tree Index Splitting
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                      Lossless Join Decomposition
                    </span>
                  </div>
                </div>

                {/* Recommended Next Activity */}
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1.5">
                  <div className="text-xs font-bold text-blue-900 flex items-center justify-between">
                    <span>Recommended Next Activity</span>
                    <span className="text-[10px] font-bold uppercase bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      Immediate
                    </span>
                  </div>
                  <p className="text-xs text-blue-800 leading-snug">
                    Complete 5-card Spaced Repetition flashcards on <b>BCNF Proof Conditions</b> before advancing to Unit 4.
                  </p>
                </div>

                {/* Study Progress Trajectory */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200">
                    <div className="font-poppins font-black text-lg text-slate-900">4.5h</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Study Hours</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200">
                    <div className="font-poppins font-black text-lg text-emerald-600">6 Days</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Active Streak</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200">
                    <div className="font-poppins font-black text-lg text-blue-600">Level 2</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Scholar Rank</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          SECTION 8: FINAL CTA (MODERN LUXURY AI STUDIO AESTHETIC)
          ========================================================= */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-3xl p-10 sm:p-16 lg:p-20 bg-[#0B0F19] text-white text-center space-y-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          
          {/* Ambient Ethereal Glow & Technical Grid */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-600/30 via-indigo-600/15 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-25 pointer-events-none" />

          {/* Badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Start Learning for Free Today</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4 max-w-2xl mx-auto relative z-10">
            <h2 className="font-poppins text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Ready to Transform the<br className="hidden sm:inline" />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                Way You Learn?
              </span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Start your personalized learning journey with AI-powered study tools designed for your academic success.
            </p>
          </div>

          {/* Trust Checkmarks */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-300 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>Free syllabus onboarding</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>6 Autonomous AI agents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>No credit card required</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 relative z-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-poppins font-bold text-sm shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center gap-2 group"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-poppins font-semibold text-sm border border-slate-700/80 backdrop-blur-md transition-all"
            >
              Sign In to Account
            </Link>
          </div>

        </div>
      </section>


      {/* =========================================================
          SECTION 9: MINIMAL PROFESSIONAL FOOTER
          ========================================================= */}
      <footer className="py-12 bg-white border-t border-slate-200 text-xs font-inter text-slate-500">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
            
            {/* Col 1: Brand & Description */}
            <div className="space-y-3">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-poppins font-black text-lg text-slate-900 tracking-tight">
                  Study<span className="text-blue-600">AI</span>
                </span>
              </Link>
              <p className="text-xs text-slate-500 leading-relaxed">
                An AI-powered personalized learning platform that helps students learn from their college syllabus, identify weak topics, prepare for exams, and improve academic performance.
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="space-y-2">
              <div className="font-poppins font-bold text-xs text-slate-900 uppercase tracking-wider">
                Platform
              </div>
              <ul className="space-y-2 text-xs">
                <li><a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="hover:text-blue-600 transition">Home</a></li>
                <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-blue-600 transition">Features</a></li>
                <li><a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="hover:text-blue-600 transition">How It Works</a></li>
                <li><a href="#multi-agent" onClick={(e) => scrollToSection(e, 'multi-agent')} className="hover:text-blue-600 transition">Multi-Agent AI</a></li>
                <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-blue-600 transition">About</a></li>
              </ul>
            </div>

            {/* Col 3: Academic Features */}
            <div className="space-y-2">
              <div className="font-poppins font-bold text-xs text-slate-900 uppercase tracking-wider">
                Core Capabilities
              </div>
              <ul className="space-y-2 text-xs">
                <li><Link to="/register" className="hover:text-blue-600 transition">Syllabus RAG Assistant</Link></li>
                <li><Link to="/register" className="hover:text-blue-600 transition">Weakness Detection</Link></li>
                <li><Link to="/register" className="hover:text-blue-600 transition">Exam Preparation Mode</Link></li>
                <li><Link to="/register" className="hover:text-blue-600 transition">Smart Revision (SM-2)</Link></li>
                <li><Link to="/register" className="hover:text-blue-600 transition">Question Paper Analyzer</Link></li>
              </ul>
            </div>

            {/* Col 4: Account Actions */}
            <div className="space-y-2">
              <div className="font-poppins font-bold text-xs text-slate-900 uppercase tracking-wider">
                Account
              </div>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-blue-600 transition">Login</Link></li>
                <li><Link to="/register" className="hover:text-blue-600 transition">Get Started</Link></li>
              </ul>
              <div className="pt-2 text-[11px] text-slate-400">
                Built for engineering and university students.
              </div>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>© {new Date().getFullYear()} StudyAI • AI Multi-Agent Study Planner & Adaptive Learning Platform.</div>
            <div>All rights reserved.</div>
          </div>

        </div>
      </footer>

    </div>
  );
}
