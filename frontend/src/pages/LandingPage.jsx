import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Brain, 
  CalendarDays, 
  Search, 
  FileText, 
  Network, 
  ClipboardCheck, 
  BarChart3, 
  GraduationCap, 
  Sparkles, 
  Target, 
  TrendingUp,
  ArrowRight,
  Play,
  CheckCircle2,
  ChevronDown,
  Star,
  Users,
  Award,
  Zap,
  Mail,
  Github,
  Twitter,
  Linkedin,
  Clock
} from 'lucide-react';

// Stat items for Section 3
const statsList = [
  { count: '1000+', label: 'Students Learning', icon: Users },
  { count: '500+', label: 'Study Plans Generated', icon: CalendarDays },
  { count: '100+', label: 'Subjects Covered', icon: BookOpen },
  { count: '95%', label: 'Student Satisfaction', icon: Award },
];

// Features list for Section 4
const featuresList = [
  {
    icon: CalendarDays,
    title: 'AI Study Planner',
    description: 'Calculates daily and weekly study schedules tailored to your target exam dates and available study hours.',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    icon: Search,
    title: 'Research Agent',
    description: 'Searches and extracts definitions, formulas, real-world examples, and key concepts using Groq LLMs.',
    color: '#0EA5E9',
    bg: '#F0F9FF',
  },
  {
    icon: FileText,
    title: 'Smart Notes',
    description: 'Generates beginner-friendly bullet point notes with voice text-to-speech audio reader and PDF export.',
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
  {
    icon: Network,
    title: 'Mind Maps',
    description: 'Builds interactive React Flow concept graphs so visual learners can master complex topics effortlessly.',
    color: '#EC4899',
    bg: '#FDF2F8',
  },
  {
    icon: ClipboardCheck,
    title: 'AI Quiz Engine',
    description: 'Generates calibrated MCQs, True/False, and Fill-in-the-Blank questions with detailed explanations.',
    color: '#22C55E',
    bg: '#F0FDF4',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Visual Chart.js breakdown of weak topics (<60%), strong topics (≥80%), and daily study streaks.',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
];

// Workflow Steps for Section 5
const workflowSteps = [
  { step: '01', role: 'Student Input', name: 'Subject & Exam Date', icon: GraduationCap, color: '#2563EB' },
  { step: '02', role: 'Agent 1', name: 'Research Agent', icon: Search, color: '#0EA5E9' },
  { step: '03', role: 'Agent 2', name: 'Summarizer Agent', icon: FileText, color: '#8B5CF6' },
  { step: '04', role: 'Agent 2', name: 'Mind Map Visualizer', icon: Network, color: '#EC4899' },
  { step: '05', role: 'Agent 3', name: 'Quiz Generator', icon: ClipboardCheck, color: '#F59E0B' },
  { step: '06', role: 'Agent 4', name: 'Scheduler Agent', icon: CalendarDays, color: '#22C55E' },
  { step: '07', role: 'Output', name: 'Personalized Study Plan', icon: Target, color: '#2563EB' },
];

// Why Choose Us Cards for Section 6
const whyChooseList = [
  {
    icon: Brain,
    title: 'AI Powered Learning',
    description: 'Autonomous multi-agent system collaborates to research, summarize, structure, and quiz your subjects.',
  },
  {
    icon: Target,
    title: 'Personalized Study Plan',
    description: 'Harder subjects automatically receive higher priority and extra study hours so you stay exam-ready.',
  },
  {
    icon: Network,
    title: 'Visual Learning',
    description: 'Interactive React Flow mind maps convert long text into clear, memorable visual node trees.',
  },
  {
    icon: TrendingUp,
    title: 'Adaptive Learning',
    description: 'Quiz scores below 60% automatically trigger the Scheduler Agent to recalculate future study time.',
  },
];

// Testimonials for Section 8
const testimonialsList = [
  {
    name: 'Sarah Chen',
    role: 'Computer Science Student, Stanford',
    review: 'The interactive mind maps and AI study scheduler helped me master Algorithms in half the time. Truly game-changing!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Marcus Vance',
    role: 'Competitive Exam Aspirant (GATE)',
    review: 'The feedback loop is insane. When I scored low on DBMS indexing, the Scheduler automatically added extra study sessions!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Elena Rostova',
    role: 'Medical Student, Oxford',
    review: 'The smart markdown notes with text-to-speech let me listen to revision summaries on my commute. Highly recommended!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
];

// FAQ Accordion List for Section 9
const faqList = [
  {
    q: 'How does the AI Study Planner work?',
    a: 'Simply enter your subjects, target exam date, and daily available study hours. The Supervisor Agent coordinates 4 AI Agents to research concepts, generate notes, build mind maps, craft practice quizzes, and structure a custom study plan.'
  },
  {
    q: 'What makes this different from a normal to-do list?',
    a: 'Normal to-do lists are static. Our platform uses an AI feedback loop: if you score low (<60%) on a practice quiz, the Scheduler Agent automatically recalculates your timetable and allocates extra study hours to weak topics.'
  },
  {
    q: 'Can I use this for school, university, or competitive exams?',
    a: 'Yes! The platform is engineered for school students, college undergraduates, university postgraduates, and competitive exam aspirants (GATE, GRE, USMLE, SAT, etc.).'
  },
  {
    q: 'Is there a free trial or demo available?',
    a: 'Yes, you can click "Demo Sign In" or "Start Studying Free" to access the full command center instantly with pre-configured demo credits.'
  },
  {
    q: 'Can I export my study notes and mind maps?',
    a: 'Absolutely! You can export your AI-generated notes as formatted PDFs and view interactive React Flow concept graphs anytime.'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1E293B] font-inter selection:bg-[#2563EB] selection:text-white">
      {/* ==========================================
          1. STICKY NAVIGATION BAR (GLASSMORPHISM)
          ========================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 lg:px-12 py-3.5 flex items-center justify-between ${
          isScrolled
            ? 'bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="AI Study Planner Logo"
            className="w-10 h-10 rounded-2xl object-cover shadow-md border border-[#DBEAFE] group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-poppins font-black text-xl tracking-tight text-[#1E293B] leading-none">
              AI Study<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#38BDF8]"> Planner</span>
            </span>
            <span className="text-[10px] text-[#64748B] font-inter font-semibold mt-0.5">Multi-Agent AI SaaS</span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-inter font-bold text-[#64748B]">
          <a href="#home" className="hover:text-[#2563EB] transition-colors">Home</a>
          <a href="#features" className="hover:text-[#2563EB] transition-colors">Features</a>
          <a href="#workflow" className="hover:text-[#2563EB] transition-colors">How It Works</a>
          <a href="#why-choose" className="hover:text-[#2563EB] transition-colors">Benefits</a>
          <a href="#faq" className="hover:text-[#2563EB] transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-[#2563EB] transition-colors">Contact</a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-inter font-bold text-[#64748B] hover:text-[#1E293B] px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white text-xs font-poppins font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </header>

      {/* ==========================================
          2. HERO SECTION WITH 3D/FLOATING ILLUSTRATION
          ========================================== */}
      <section id="home" className="pt-32 pb-20 px-6 lg:px-12 bg-gradient-to-b from-[#F8FBFF] via-[#FFFFFF] to-[#EFF6FF] relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Hero Left Content */}
          <div className="space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-inter font-bold shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#38BDF8] animate-spin" />
              <span>Next-Gen Multi-Agent Educational AI</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-poppins text-4xl sm:text-6xl lg:text-6xl font-black text-[#1E293B] tracking-tight leading-tight"
            >
              Study Smarter with AI, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#0EA5E9] to-[#38BDF8]">
                Not Harder.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-[#64748B] font-inter text-sm sm:text-base leading-relaxed max-w-xl"
            >
              Generate personalized study plans, smart notes, visual mind maps, quizzes, and adaptive learning schedules using AI-powered multi-agent technology.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white text-xs sm:text-sm font-poppins font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl"
                >
                  <span>Start Studying Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-[#1E293B] text-xs sm:text-sm font-inter font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-[#2563EB] fill-[#2563EB]" />
                  <span>Watch Demo</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* User Target Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-2 text-[11px] font-inter font-bold text-[#64748B]">
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB]">🎓 School Students</span>
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB]">🏫 College & Uni</span>
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB]">⚡ Competitive Exams</span>
            </div>
          </div>

          {/* Hero Right: 3D Animated Showcase Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative flex items-center justify-center min-h-[420px]"
          >
            {/* Ambient Background Glow Spheres */}
            <div className="absolute w-72 h-72 rounded-full bg-[#38BDF8]/20 blur-3xl -top-6 -left-6 pointer-events-none"></div>
            <div className="absolute w-72 h-72 rounded-full bg-[#2563EB]/20 blur-3xl -bottom-6 -right-6 pointer-events-none"></div>

            {/* Central 3D Card Platform */}
            <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-2xl space-y-5">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] flex items-center justify-center shadow-md">
                    <Brain className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <div className="font-poppins font-bold text-xs text-[#1E293B]">AI Command Center</div>
                    <div className="text-[10px] text-[#64748B]">Multi-Agent Feedback Active</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-[10px] font-bold border border-[#86EFAC]">
                  ● Operational
                </span>
              </div>

              {/* Central Mock Grid */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
                  <div className="text-[10px] text-[#64748B] font-bold">TODAY'S TARGET</div>
                  <div className="font-poppins font-bold text-xs text-[#1E293B] mt-0.5">Binary Trees & DBMS</div>
                  <div className="text-[10px] text-[#2563EB] font-bold mt-1">1.5 hrs allocated</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE]">
                  <div className="text-[10px] text-[#64748B] font-bold">ACCURACY SCORE</div>
                  <div className="font-poppins font-black text-base text-[#2563EB] mt-0.5">88% Mastery</div>
                  <div className="text-[10px] text-[#22C55E] font-bold mt-1">↑ +12% vs last week</div>
                </div>
              </div>
            </div>

            {/* Floating Card 1: Mind Map Card (Top Left) */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 sm:top-2 sm:-left-6 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xl flex items-center gap-3 backdrop-blur-md"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Network className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-poppins font-bold text-xs text-[#1E293B]">Mind Map Card</div>
                <div className="text-[10px] text-[#64748B]">React Flow Concept Graph</div>
              </div>
            </motion.div>

            {/* Floating Card 2: Quiz Card (Bottom Right) */}
            <motion.div
              animate={{ y: [8, -8, 8] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="absolute -bottom-4 -right-4 sm:bottom-4 sm:-right-6 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xl flex items-center gap-3 backdrop-blur-md"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-poppins font-bold text-xs text-[#1E293B]">AI Quiz Card</div>
                <div className="text-[10px] text-[#64748B]">5 Calibrated Questions</div>
              </div>
            </motion.div>

            {/* Floating Card 3: Schedule Card (Bottom Left) */}
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="absolute bottom-12 -left-6 hidden sm:flex p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xl items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-poppins font-bold text-xs text-[#1E293B]">Schedule Card</div>
                <div className="text-[10px] text-[#64748B]">Auto Timetable Adjustment</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          3. TRUSTED BY / COUNTER STATS SECTION
          ========================================== */}
      <section className="py-12 px-6 lg:px-12 bg-[#FFFFFF] border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 items-stretch text-center">
          {statsList.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-3xl bg-[#F8FBFF] border border-[#E2E8F0] shadow-xs flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-poppins font-black text-3xl sm:text-4xl text-[#1E293B]">{stat.count}</div>
                <div className="text-xs font-inter font-bold text-[#64748B]">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          4. FEATURES SECTION (6 CARDS WITH LUCIDE ICONS)
          ========================================== */}
      <section id="features" className="py-20 px-6 lg:px-12 bg-gradient-to-b from-[#FFFFFF] to-[#F8FBFF]">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">Powerful Features</span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">Everything You Need to Ace Your Exams</h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-inter">
              Six core tools powered by 4 autonomous AI agents working in perfect harmony.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left items-stretch">
            {featuresList.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="p-7 rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-soft hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                      style={{ backgroundColor: feat.bg, borderColor: '#DBEAFE', color: feat.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-poppins text-lg font-bold text-[#1E293B]">{feat.title}</h3>
                    <p className="text-xs text-[#64748B] font-inter leading-relaxed">{feat.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          5. AI WORKFLOW SECTION (HERO HIGHLIGHT SECTION)
          ========================================== */}
      <section id="workflow" className="py-20 px-6 lg:px-12 bg-[#EFF6FF] border-y border-[#DBEAFE] relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12 text-center relative z-10">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-[#FFFFFF] border border-[#DBEAFE] text-[#2563EB] text-xs font-inter font-bold shadow-xs">
              ⚡ Multi-Agent AutoGen Pipeline
            </span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">How the AI Agents Work Together</h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-inter">
              From subject entry to automated schedule optimization in one continuous flow.
            </p>
          </div>

          {/* Horizontal Workflow Track */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 items-stretch relative">
            {workflowSteps.map((wf, idx) => {
              const Icon = wf.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DBEAFE] shadow-md shadow-blue-500/10 flex flex-col justify-between items-center text-center space-y-3 relative group"
                >
                  <div className="text-[10px] font-mono font-bold text-[#64748B]">{wf.step}</div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs"
                    style={{ backgroundColor: `${wf.color}15`, borderColor: `${wf.color}40`, color: wf.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-inter font-bold uppercase tracking-wider text-[#64748B]">{wf.role}</div>
                    <div className="font-poppins font-bold text-xs text-[#1E293B] mt-0.5">{wf.name}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          6. WHY CHOOSE OUR PLATFORM (4 CARDS)
          ========================================== */}
      <section id="why-choose" className="py-20 px-6 lg:px-12 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">Unmatched Advantages</span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">Why Choose Our AI Study Platform?</h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-inter">
              Designed to help students stay motivated, focused, and organized throughout their academic journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left items-stretch">
            {whyChooseList.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="p-6 rounded-3xl bg-[#F8FBFF] border border-[#E2E8F0] shadow-soft space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-poppins text-base font-bold text-[#1E293B]">{item.title}</h3>
                    <p className="text-xs text-[#64748B] font-inter leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          7. DASHBOARD PREVIEW MOCKUP SECTION
          ========================================== */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-b from-[#F8FBFF] to-[#FFFFFF] border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">Interactive Experience</span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">Your All-in-One AI Command Center</h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-inter">
              Manage study plans, interactive mind maps, notes, and quiz analytics from one intuitive dashboard.
            </p>
          </div>

          {/* Slightly Floating Mockup */}
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="max-w-5xl mx-auto rounded-3xl p-6 sm:p-8 bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xl space-y-6 text-left"
          >
            {/* Top Bar Mockup */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#22C55E]"></span>
                </div>
                <span className="text-xs font-mono text-[#64748B] font-bold">StudyAgent Command Center</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold border border-[#DBEAFE]">
                  ⚡ Live Multi-Agent Feedback Loop
                </span>
              </div>
            </div>

            {/* Mockup Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] space-y-2">
                <div className="text-xs font-bold text-[#2563EB]">📅 Study Plan</div>
                <div className="font-poppins font-bold text-sm text-[#1E293B]">Binary Trees & Algorithms</div>
                <div className="text-[11px] text-[#64748B]">1.5 hrs allocated • High Priority</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-2">
                <div className="text-xs font-bold text-[#22C55E]">🧠 Mind Map & Quiz</div>
                <div className="font-poppins font-bold text-sm text-[#1E293B]">React Flow Visual Graph</div>
                <div className="text-[11px] text-[#64748B]">5 Calibrated Practice MCQs</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FEF3C7]/40 border border-[#FDE68A] space-y-2">
                <div className="text-xs font-bold text-[#D97706]">📊 Analytics</div>
                <div className="font-poppins font-bold text-sm text-[#1E293B]">88% Quiz Accuracy</div>
                <div className="text-[11px] text-[#64748B]">5-Day Study Streak Active</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          8. TESTIMONIALS SECTION (STUDENT REVIEWS)
          ========================================== */}
      <section className="py-20 px-6 lg:px-12 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">Student Reviews</span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">Loved by Students Worldwide</h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-inter">
              See how our AI Study Planner is transforming academic performance for learners everywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch">
            {testimonialsList.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="p-7 rounded-3xl bg-[#F8FBFF] border border-[#E2E8F0] shadow-soft space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-[#F59E0B]">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#F59E0B]" />
                    ))}
                  </div>
                  <p className="text-xs text-[#1E293B] font-inter leading-relaxed italic">"{item.review}"</p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[#E2E8F0]">
                  <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                  <div>
                    <div className="font-poppins font-bold text-xs text-[#1E293B]">{item.name}</div>
                    <div className="text-[10px] text-[#64748B] font-inter">{item.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          9. FAQ SECTION (ACCORDION STYLE)
          ========================================== */}
      <section id="faq" className="py-20 px-6 lg:px-12 bg-[#F8FBFF] border-t border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <span className="text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">Got Questions?</span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4 text-left">
            {faqList.map((faq, idx) => (
              <div key={idx} className="rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 flex items-center justify-between gap-4 font-poppins font-bold text-sm text-[#1E293B] text-left hover:text-[#2563EB] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#2563EB] transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-5 text-xs text-[#64748B] font-inter leading-relaxed border-t border-[#F1F5F9] pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          10. FINAL CTA SECTION (SOFT BLUE GRADIENT)
          ========================================== */}
      <section className="py-20 px-6 lg:px-12 bg-[#FFFFFF]">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white space-y-6 text-center shadow-2xl relative overflow-hidden border border-blue-400/30"
        >
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-white leading-tight">
              Start Your AI Learning Journey Today
            </h2>
            <p className="font-inter text-blue-50 text-xs sm:text-sm leading-relaxed">
              Join thousands of students optimizing their study schedules with 4 autonomous AutoGen AI Agents.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl bg-[#FFFFFF] text-[#2563EB] hover:bg-blue-50 font-poppins font-bold text-sm shadow-xl transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ==========================================
          11. FOOTER SECTION
          ========================================== */}
      <footer id="contact" className="py-12 px-6 lg:px-12 bg-[#FFFFFF] border-t border-[#E2E8F0] text-xs font-inter text-[#64748B]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left pb-8 border-b border-[#E2E8F0]">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-xl object-cover" />
              <span className="font-poppins font-black text-base text-[#1E293B]">AI Study<span className="text-[#2563EB]"> Planner</span></span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Autonomous multi-agent educational platform powered by Microsoft AutoGen & Groq LLMs.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <div className="font-poppins font-bold text-xs text-[#1E293B]">Quick Links</div>
            <ul className="space-y-1.5 text-xs text-[#64748B]">
              <li><a href="#home" className="hover:text-[#2563EB]">Home</a></li>
              <li><a href="#features" className="hover:text-[#2563EB]">Features</a></li>
              <li><a href="#workflow" className="hover:text-[#2563EB]">How It Works</a></li>
              <li><a href="#why-choose" className="hover:text-[#2563EB]">Benefits</a></li>
              <li><a href="#faq" className="hover:text-[#2563EB]">FAQ</a></li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-2">
            <div className="font-poppins font-bold text-xs text-[#1E293B]">Resources</div>
            <ul className="space-y-1.5 text-xs text-[#64748B]">
              <li><Link to="/login" className="hover:text-[#2563EB]">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-[#2563EB]">Create Free Account</Link></li>
              <li><Link to="/study-planner" className="hover:text-[#2563EB]">Study Planner</Link></li>
              <li><Link to="/summary" className="hover:text-[#2563EB]">Notes & Research</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Social */}
          <div className="space-y-3">
            <div className="font-poppins font-bold text-xs text-[#1E293B]">Contact & Support</div>
            <p className="text-xs text-[#64748B]">Questions or feedback? Reach out to our team anytime.</p>
            <div className="flex items-center gap-3 text-[#2563EB]">
              <a href="#" className="p-2 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] hover:bg-[#DBEAFE] transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] hover:bg-[#DBEAFE] transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] hover:bg-[#DBEAFE] transition-colors"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#64748B]">
          <div>© 2026 AI Study Planner. All rights reserved.</div>
          <div>Built with React, Vite, Framer Motion, Tailwind CSS, & Lucide Icons.</div>
        </div>
      </footer>
    </div>
  );
}
