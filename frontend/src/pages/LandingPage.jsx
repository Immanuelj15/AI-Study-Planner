import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  FileText, 
  Network, 
  ClipboardCheck, 
  CalendarClock, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  Brain,
  Flame,
  Award,
  Zap,
  BookOpen
} from 'lucide-react';

const featureList = [
  {
    icon: Search,
    title: '1. Autonomous AI Research',
    description: 'Agent 1 extracts definitions, formulas, real-world applications, and interview tips from Groq LLMs.',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#DBEAFE',
  },
  {
    icon: FileText,
    title: '2. Smart Markdown Summaries',
    description: 'Agent 2 structures beginner-friendly bullet points with text-to-speech voice playback and PDF exports.',
    color: '#0EA5E9',
    bg: '#F0F9FF',
    border: '#BAE6FD',
  },
  {
    icon: Network,
    title: '3. Interactive Mind Maps',
    description: 'Agent 2 builds React Flow concept graphs with high-contrast node cards for visual learning.',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
  },
  {
    icon: ClipboardCheck,
    title: '4. Adaptive Practice Quizzes',
    description: 'Agent 3 generates MCQs and Fill-in-the-Blank questions with detailed explanations and instant grading.',
    color: '#EC4899',
    bg: '#FDF2F8',
    border: '#FBCFE8',
  },
  {
    icon: CalendarClock,
    title: '5. Dynamic Timetable Scheduler',
    description: 'Agent 4 allocates study hours based on exam target dates, assigning extra hours to difficult subjects.',
    color: '#22C55E',
    bg: '#F0FDF4',
    border: '#BBF7D0',
  },
  {
    icon: TrendingUp,
    title: '6. Performance Feedback Loop',
    description: 'Quiz scores automatically trigger Agent 4 to recalculate study hours for weak topics (<60%).',
    color: '#F59E0B',
    bg: '#FEF3C7',
    border: '#FDE68A',
  },
];

const stepsList = [
  {
    step: '01',
    title: 'Add Subjects & Target Date',
    desc: 'Enter subject names, difficulty level (Easy/Medium/Hard), target exam date, and daily study hours.',
  },
  {
    step: '02',
    title: 'Supervisor Agent Coordinates AI Workflow',
    desc: 'The Supervisor Agent orchestrates Research, Summarizer, Mind Map, Quiz, and Scheduler agents.',
  },
  {
    step: '03',
    title: 'Study Notes, Mind Maps & Quizzes',
    desc: 'Access structured notes, voice summaries, React Flow concept graphs, and practice quizzes from your dashboard.',
  },
  {
    step: '04',
    title: 'Quiz Feedback Loop Recalculates Schedule',
    desc: 'Quiz scores below 60% automatically increase allocated study hours for weak topics.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FBFF] via-[#FFFFFF] to-[#EFF6FF] text-[#1E293B] flex flex-col justify-between selection:bg-[#2563EB] selection:text-white font-inter">
      {/* 1. Header */}
      <header className="sticky top-0 z-50 px-6 lg:px-12 py-3.5 flex items-center justify-between bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="StudyAgent Logo" className="w-10 h-10 rounded-2xl object-cover shadow-md border border-[#DBEAFE]" />
          <span className="font-poppins font-black text-xl tracking-tight text-[#1E293B]">
            Study<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#38BDF8]">Agent</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-inter font-bold text-[#64748B] hover:text-[#1E293B] transition-colors">
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/register" className="px-5 py-2.5 rounded-2xl btn-gradient-primary text-xs font-inter font-bold shadow-sm shadow-blue-500/20">
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-20 space-y-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-inter font-bold mx-auto shadow-xs"
          >
            <img src="/logo.png" alt="Logo Icon" className="w-5 h-5 rounded-full object-cover" />
            <span>Microsoft AutoGen & Groq LLM Multi-Agent Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-poppins text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-[#1E293B]"
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
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl btn-gradient-primary text-sm font-poppins font-bold flex items-center gap-2 shadow-md shadow-blue-500/25"
              >
                <span>Launch AI Study Planner</span>
                <ArrowRight className="w-[18px] h-[18px]" />
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
        </div>

        {/* 3. Interactive App Showcase Card (Mockup Visual) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="glass-card rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] bg-[#FFFFFF] shadow-soft max-w-5xl mx-auto space-y-6"
        >
          {/* Mockup Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]"></span>
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                <span className="w-3 h-3 rounded-full bg-[#22C55E]"></span>
              </div>
              <span className="text-xs font-mono text-[#64748B] font-bold">StudyAgent Dashboard - AI Feedback Loop</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold border border-[#DBEAFE] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] animate-spin" /> Live AutoGen Pipeline
              </span>
            </div>
          </div>

          {/* Grid Mockup Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch">
            <div className="p-4.5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between font-bold text-xs text-[#2563EB]">
                <span>📖 Today's Plan</span>
                <Clock18 className="w-4 h-4" />
              </div>
              <div className="font-poppins font-bold text-sm text-[#1E293B]">Binary Search & Trees</div>
              <div className="text-[11px] text-[#64748B]">1.5 hrs allocated • High Priority</div>
            </div>

            <div className="p-4.5 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-2">
              <div className="flex items-center justify-between font-bold text-xs text-[#22C55E]">
                <span>🏆 Quiz Score</span>
                <Award className="w-4 h-4" />
              </div>
              <div className="font-poppins font-black text-xl text-[#2563EB]">88% Accuracy</div>
              <div className="text-[11px] text-[#64748B]">Agent 4 updated study frequency</div>
            </div>

            <div className="p-4.5 rounded-2xl bg-[#FEF3C7]/50 border border-[#FDE68A] space-y-2">
              <div className="flex items-center justify-between font-bold text-xs text-[#D97706]">
                <span>🔥 Active Streak</span>
                <Flame className="w-4 h-4 fill-[#F59E0B]" />
              </div>
              <div className="font-poppins font-black text-xl text-[#1E293B]">5 Days Streak</div>
              <div className="text-[11px] text-[#64748B]">Target Exam: 14 Days Away</div>
            </div>
          </div>
        </motion.div>

        {/* 4. Stat Counters Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-5xl mx-auto py-6 items-stretch">
          <div className="glass-card p-6 rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-soft space-y-1">
            <div className="font-poppins text-3xl lg:text-4xl font-black text-[#2563EB]">99.4%</div>
            <div className="text-xs font-inter font-bold text-[#64748B]">AI Note Accuracy</div>
          </div>
          <div className="glass-card p-6 rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-soft space-y-1">
            <div className="font-poppins text-3xl lg:text-4xl font-black text-[#22C55E]">4.9/5</div>
            <div className="text-xs font-inter font-bold text-[#64748B]">Student Rating</div>
          </div>
          <div className="glass-card p-6 rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-soft space-y-1">
            <div className="font-poppins text-3xl lg:text-4xl font-black text-[#38BDF8]">100+</div>
            <div className="text-xs font-inter font-bold text-[#64748B]">Exam Topics Supported</div>
          </div>
          <div className="glass-card p-6 rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-soft space-y-1">
            <div className="font-poppins text-3xl lg:text-4xl font-black text-[#8B5CF6]">4</div>
            <div className="text-xs font-inter font-bold text-[#64748B]">AutoGen AI Agents</div>
          </div>
        </div>

        {/* 5. Features Grid (6 Cards) */}
        <div className="space-y-8 pt-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">Platform Capabilities</span>
            <h2 className="font-poppins text-3xl font-black text-[#1E293B]">Powered by 4 Specialized AI Agents</h2>
            <p className="text-xs text-[#64748B] font-inter max-w-xl mx-auto">
              Every agent handles a single responsibility cleanly in the pipeline for optimal retention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left items-stretch">
            {featureList.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="glass-card glass-card-hover p-6.5 rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] space-y-3.5 shadow-soft flex flex-col justify-between h-full"
                >
                  <div className="space-y-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                      style={{ backgroundColor: item.bg, borderColor: item.border, color: item.color }}
                    >
                      <Icon className="w-[30px] h-[30px]" />
                    </div>
                    <h3 className="font-poppins text-base font-bold text-[#1E293B]">{item.title}</h3>
                    <p className="text-[#64748B] font-inter text-xs leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 6. How It Works (4 Sequential Steps) */}
        <div className="space-y-8 pt-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">Workflow Guide</span>
            <h2 className="font-poppins text-3xl font-black text-[#1E293B]">How the AI Study Planner Works</h2>
            <p className="text-xs text-[#64748B] font-inter max-w-xl mx-auto">
              From subject entry to automated timetable adaptation in 4 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left items-stretch">
            {stepsList.map((st, idx) => (
              <div key={idx} className="glass-card p-6 rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] space-y-3 shadow-soft relative overflow-hidden flex flex-col justify-between h-full">
                <div className="font-poppins font-black text-3xl text-[#2563EB]/20 absolute right-4 top-4">{st.step}</div>
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center font-poppins font-black text-xs">
                    {st.step}
                  </div>
                  <h4 className="font-poppins font-bold text-sm text-[#1E293B]">{st.title}</h4>
                  <p className="text-xs text-[#64748B] font-inter leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Final High-Impact CTA Banner */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="rounded-3xl p-8 lg:p-12 hero-gradient-bg text-white space-y-6 text-center max-w-5xl mx-auto shadow-xl relative overflow-hidden border border-blue-400/30"
        >
          <img src="/logo.png" alt="Logo" className="w-16 h-16 rounded-2xl mx-auto object-cover shadow-md border-2 border-white/40" />
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="font-poppins text-3xl lg:text-4xl font-black text-white">Ready to Master Your Subjects with AI?</h2>
            <p className="font-inter text-blue-50 text-xs sm:text-sm leading-relaxed">
              Join thousands of students optimizing their study schedules with 4 autonomous AutoGen AI Agents.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#2563EB] hover:bg-blue-50 font-poppins font-bold text-sm shadow-lg"
            >
              <span>Start Learning Now</span>
              <ArrowRight className="w-[18px] h-[18px]" />
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* 8. Footer */}
      <footer className="px-6 py-8 border-t border-[#E2E8F0] bg-[#FFFFFF] text-center text-xs font-inter text-[#64748B] space-y-3">
        <div className="flex items-center justify-center gap-2">
          <img src="/logo.png" alt="StudyAgent Logo" className="w-6 h-6 rounded-lg object-cover" />
          <span className="font-poppins font-black text-sm text-[#1E293B]">Study<span className="text-[#2563EB]">Agent</span></span>
        </div>
        <p>© 2026 AI Multi-Agent Study Planner. Modern Educational AI Platform built with React, Vite, Framer Motion, & Tailwind CSS.</p>
      </footer>
    </div>
  );
}

// Helper icon component
function Clock18(props) {
  return (
    <svg className={props.className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
