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
  Clock,
  Heart,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Layers,
  Volume2
} from 'lucide-react';

// Stat items for Section 3
const statsList = [
  { count: '1,000+', label: 'Happy Students Learning', icon: Users },
  { count: '500+', label: 'Study Plans Built', icon: CalendarDays },
  { count: '100+', label: 'Subjects Covered', icon: BookOpen },
  { count: '95%', label: 'Student Confidence Boost', icon: Heart },
];

// Problem vs Solution Comparison Data
const problemVsSolution = [
  {
    problemTitle: 'Static To-Do Lists & Fixed Schedules',
    problemDesc: 'Generic timetables fail when life happens, leading to accumulated backlogs and study stress.',
    solutionTitle: 'Adaptive Multi-Agent Timetables',
    solutionDesc: 'SchedulerAgent automatically redistributes study hours based on your target exam date and quiz results.',
    color: '#2563EB'
  },
  {
    problemTitle: 'Repetitive Static Quizzes',
    problemDesc: 'Traditional platforms repeat the same static question banks, masking real knowledge gaps.',
    solutionTitle: 'Anti-Duplication 15-Question Engine',
    solutionDesc: 'QuizAgent checks SQLite QuestionHistory to guarantee 100% fresh, non-repeating questions per attempt.',
    color: '#0EA5E9'
  },
  {
    problemTitle: 'Overwhelming Walls of Text',
    problemDesc: 'Long textbook chapters trigger cognitive fatigue, making active recall difficult.',
    solutionTitle: '3D Flashcards & Voice AI Reader',
    solutionDesc: 'Listen to notes on your commute or flip active-recall 3D flashcards designed for peak retention.',
    color: '#8B5CF6'
  },
  {
    problemTitle: 'One-Size-Fits-All Explanations',
    problemDesc: 'Complex topics are presented identically regardless of whether you are a beginner or preparing for interviews.',
    solutionTitle: '3 AI Explanation Modes',
    solutionDesc: 'Switch effortlessly between ELI5 (Explain Like I\'m 10), Beginner Mode, and Interview Prep Mode inside the Mind Map Hub.',
    color: '#22C55E'
  }
];

// Target Audience Category Cards
const studentCategories = [
  {
    title: 'School Students',
    badge: 'K-12 & High School',
    desc: 'Break down complex math and science concepts into simple ELI5 explanations and fun visual maps.',
    icon: GraduationCap,
    color: '#2563EB',
    bg: '#EFF6FF'
  },
  {
    title: 'College & University',
    badge: 'Undergrad & Masters',
    desc: 'Generate structured bullet notes, download clean PDF summaries, and sync study sessions to Google Calendar.',
    icon: BookOpen,
    color: '#0EA5E9',
    bg: '#F0F9FF'
  },
  {
    title: 'Competitive Exam Aspirants',
    badge: 'GATE, GRE, USMLE, SAT',
    desc: 'Master exam topics with adaptive difficulty scaling, 15-question anti-duplication quizzes, and spaced repetition.',
    icon: Target,
    color: '#8B5CF6',
    bg: '#F5F3FF'
  },
  {
    title: 'Self Learners & Professionals',
    badge: 'Lifetime Learners',
    desc: 'Listen to AI-generated voice notes while commuting and test active recall with 3D flip flashcards.',
    icon: Volume2,
    color: '#22C55E',
    bg: '#F0FDF4'
  }
];

// Features list for Section 4
const featuresList = [
  {
    icon: CalendarDays,
    title: 'Personalized Study Planner',
    description: 'Calculates daily and weekly study schedules tailored to your target exam dates and available daily study time.',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    icon: Search,
    title: 'Deep Research Companion',
    description: 'Finds definitions, formulas, real-world examples, and key concepts so you never get stuck on a topic.',
    color: '#0EA5E9',
    bg: '#F0F9FF',
  },
  {
    icon: FileText,
    title: 'Easy-to-Understand Notes',
    description: 'Generates beginner-friendly bullet point notes with voice text-to-speech audio reader and downloadable PDFs.',
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
  {
    icon: Network,
    title: 'Visual Concept Maps',
    description: 'Builds interactive concept maps so visual learners can understand complex relationships effortlessly.',
    color: '#EC4899',
    bg: '#FDF2F8',
  },
  {
    icon: ClipboardCheck,
    title: 'Practice What You Learned',
    description: 'Generates practice questions with encouraging feedback and detailed step-by-step explanations.',
    color: '#22C55E',
    bg: '#F0FDF4',
  },
  {
    icon: BarChart3,
    title: 'My Learning Progress',
    description: 'Track your subject mastery, weekly study hours, and daily learning streaks without stress or pressure.',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
];

// Workflow Steps for Section 5
const workflowSteps = [
  { step: '01', role: 'Student Goal', name: 'Subject & Exam Date', icon: GraduationCap, color: '#2563EB' },
  { step: '02', role: 'Step 1', name: 'Gather Resources', icon: Search, color: '#0EA5E9' },
  { step: '03', role: 'Step 2', name: 'Write Clear Notes', icon: FileText, color: '#8B5CF6' },
  { step: '04', role: 'Step 3', name: 'Build Concept Map', icon: Network, color: '#EC4899' },
  { step: '05', role: 'Step 4', name: 'Practice Questions', icon: ClipboardCheck, color: '#F59E0B' },
  { step: '06', role: 'Step 5', name: 'Structure Schedule', icon: CalendarDays, color: '#22C55E' },
  { step: '07', role: 'Result', name: 'My Study Plan', icon: Target, color: '#2563EB' },
];

// Why Choose Us Cards for Section 6
const whyChooseList = [
  {
    icon: Heart,
    title: 'Student-Centered Design',
    description: 'Built by people who understand students. Reduces study anxiety and helps you focus comfortably.',
  },
  {
    icon: Target,
    title: 'Personalized Study Time',
    description: 'Challenging subjects automatically receive extra time so you stay confident and exam-ready.',
  },
  {
    icon: Network,
    title: 'Visual Learning Support',
    description: 'Interactive concept maps convert long textbook paragraphs into clear, memorable visual diagrams.',
  },
  {
    icon: TrendingUp,
    title: 'Adaptive Learning Feedback',
    description: 'Practice quiz results automatically update future study plans to strengthen topics you need help with.',
  },
];

// Testimonials for Section 8
const testimonialsList = [
  {
    name: 'Sarah Chen',
    role: 'Computer Science Student, Stanford',
    review: 'The easy-to-understand notes and visual concept maps helped me understand Algorithms peacefully. I feel so much more confident!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Marcus Vance',
    role: 'Competitive Exam Aspirant (GATE)',
    review: 'The feedback loop is amazing. When I needed extra help on DBMS, my study plan automatically gave me extra revision time!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Elena Rostova',
    role: 'Medical Student, Oxford',
    review: 'Listening to notes on my commute with the voice reader makes studying enjoyable. This app truly understands students.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
];

// FAQ Accordion List for Section 9
const faqList = [
  {
    q: 'How does the AI Study Planner help me learn?',
    a: 'Simply enter your subjects, target exam date, and daily study hours. Our intelligent study companion creates a step-by-step timetable, clear notes, visual concept maps, and practice quizzes to help you learn peacefully.'
  },
  {
    q: 'What makes this different from a static to-do list?',
    a: 'Static to-do lists do not adapt. If you score low on a practice quiz, our platform automatically adjusts your future timetable to spend more time on topics that need extra attention.'
  },
  {
    q: 'Is this suitable for school, university, or competitive exams?',
    a: 'Yes! It is crafted for school students, college undergraduates, university students, and competitive exam aspirants (GATE, GRE, USMLE, SAT, etc.).'
  },
  {
    q: 'Is there a free trial or demo available?',
    a: 'Yes, you can click "Start Your Learning Journey" or "See How It Works" to explore the platform with free demo credits.'
  },
  {
    q: 'Can I download my notes as PDFs?',
    a: 'Yes! You can export your class notes as clean PDFs and view interactive concept maps whenever you want to revise.'
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
            ? 'bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs'
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
            <span className="text-[10px] text-[#64748B] font-inter font-semibold mt-0.5">Your AI Study Companion</span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-inter font-bold text-[#64748B]">
          <a href="#home" className="hover:text-[#2563EB] transition-colors">Home</a>
          <a href="#market-problem" className="hover:text-[#2563EB] transition-colors">What We Solve</a>
          <a href="#features" className="hover:text-[#2563EB] transition-colors">Features</a>
          <a href="#students" className="hover:text-[#2563EB] transition-colors">For Students</a>
          <a href="#workflow" className="hover:text-[#2563EB] transition-colors">How It Works</a>
          <a href="#faq" className="hover:text-[#2563EB] transition-colors">FAQ</a>
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
              className="px-5 py-2.5 rounded-2xl bg-[#2563EB] text-white text-xs font-poppins font-bold shadow-md hover:bg-[#1D4ED8] transition-all"
            >
              Start Learning
            </Link>
          </motion.div>
        </div>
      </header>

      {/* ==========================================
          2. HERO SECTION WITH HUMAN STUDENT COPYWRITING
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
              <Heart className="w-4 h-4 text-[#2563EB] fill-[#2563EB]" />
              <span>Designed for Students • Stress-Free Learning</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-poppins text-4xl sm:text-6xl lg:text-6xl font-black text-[#1E293B] tracking-tight leading-tight"
            >
              Study Smarter. <br />
              Learn Better. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#0EA5E9] to-[#38BDF8]">
                Reach Your Goals.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-[#64748B] font-inter text-sm sm:text-base leading-relaxed max-w-xl"
            >
              Create a personalized study plan, understand difficult topics with simple notes, practice quizzes, and improve every day with an AI study companion designed for students.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-2xl bg-[#2563EB] text-white text-xs sm:text-sm font-poppins font-bold flex items-center gap-2 shadow-md hover:bg-[#1D4ED8] transition-all"
                >
                  <span>Start Your Learning Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <a
                  href="#market-problem"
                  className="px-8 py-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-[#1E293B] text-xs sm:text-sm font-inter font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-[#2563EB] fill-[#2563EB]" />
                  <span>What We Solve</span>
                </a>
              </motion.div>
            </motion.div>

            {/* User Target Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-2 text-[11px] font-inter font-bold text-[#64748B]">
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB]">🎓 School Students</span>
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB]">🏫 College & Uni</span>
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB]">⚡ Competitive Exams</span>
            </div>
          </div>

          {/* Hero Right: Educational Paper Notebook Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative flex items-center justify-center min-h-[420px]"
          >
            <div className="absolute w-72 h-72 rounded-full bg-[#DBEAFE] blur-3xl -top-6 -left-6 pointer-events-none"></div>

            <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-lg space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div>
                    <div className="font-poppins font-bold text-xs text-[#1E293B]">My Study Companion</div>
                    <div className="text-[10px] text-[#64748B]">Peaceful Learning Space</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold border border-[#DBEAFE]">
                  Ready to Help
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
                  <div className="text-[10px] text-[#64748B] font-bold uppercase">Today's Goal</div>
                  <div className="font-poppins font-bold text-xs text-[#1E293B] mt-0.5">Binary Trees & Algorithms</div>
                  <div className="text-[10px] text-[#2563EB] font-bold mt-1">1.5 hours planned</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE]">
                  <div className="text-[10px] text-[#64748B] font-bold uppercase">Learning Progress</div>
                  <div className="font-poppins font-black text-base text-[#2563EB] mt-0.5">Steady Improvement</div>
                  <div className="text-[10px] text-[#22C55E] font-bold mt-1">Great work! Keep going!</div>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 sm:top-2 sm:-left-6 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-md flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Network className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-poppins font-bold text-xs text-[#1E293B]">Visual Concept Map</div>
                <div className="text-[10px] text-[#64748B]">Clear Relationship Diagram</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [8, -8, 8] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="absolute -bottom-4 -right-4 sm:bottom-4 sm:-right-6 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-md flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-poppins font-bold text-xs text-[#1E293B]">Practice Quiz</div>
                <div className="text-[10px] text-[#64748B]">Encouraging Questions</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          NEW SECTION: WHAT WE SOLVE IN THE CURRENT MARKET
          ========================================== */}
      <section id="market-problem" className="py-20 px-6 lg:px-12 bg-[#FFFFFF] border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">Market Innovation</span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">Traditional Learning Lacks Personalization. We Solve That.</h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-inter">
              See how our Autonomous Multi-Agent AI system transforms static study habits into an active, adaptive learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {problemVsSolution.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-7 rounded-3xl bg-[#F8FBFF] border border-[#E2E8F0] shadow-soft space-y-4 flex flex-col justify-between"
              >
                {/* Traditional Problem Box */}
                <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-poppins font-bold text-[#DC2626]">
                    <XCircle className="w-4 h-4 text-[#DC2626]" />
                    <span>Traditional Study Methods: {item.problemTitle}</span>
                  </div>
                  <p className="text-xs text-[#7F1D1D] leading-relaxed font-inter">{item.problemDesc}</p>
                </div>

                {/* Our Multi-Agent Solution Box */}
                <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-poppins font-bold text-[#15803D]">
                    <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                    <span>What We Solve: {item.solutionTitle}</span>
                  </div>
                  <p className="text-xs text-[#14532D] leading-relaxed font-inter">{item.solutionDesc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          NEW SECTION: TAILORED FOR EVERY TYPE OF STUDENT
          ========================================== */}
      <section id="students" className="py-20 px-6 lg:px-12 bg-gradient-to-b from-[#F8FBFF] to-[#FFFFFF]">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">Student Profiles</span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">Crafted for Every Type of Student</h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-inter">
              Whether you are preparing for high school exams, college finals, or competitive entrance tests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {studentCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-soft space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                        style={{ backgroundColor: cat.bg, borderColor: '#DBEAFE', color: cat.color }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                        {cat.badge}
                      </span>
                    </div>
                    <h3 className="font-poppins text-lg font-bold text-[#1E293B]">{cat.title}</h3>
                    <p className="text-xs text-[#64748B] font-inter leading-relaxed">{cat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
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
          4. FEATURES SECTION (HUMAN EDUCATIONAL CARDS)
          ========================================== */}
      <section id="features" className="py-20 px-6 lg:px-12 bg-gradient-to-b from-[#FFFFFF] to-[#F8FBFF]">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">Built for Students</span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">Tools Designed for Stress-Free Learning</h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-inter">
              Everything you need to organize your study schedule, understand hard topics, and practice with confidence.
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
                  className="p-7 rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-soft hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
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
          5. AI WORKFLOW SECTION (HUMAN WORKFLOW GUIDE)
          ========================================== */}
      <section id="workflow" className="py-20 px-6 lg:px-12 bg-[#EFF6FF] border-y border-[#DBEAFE] relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12 text-center relative z-10">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-[#FFFFFF] border border-[#DBEAFE] text-[#2563EB] text-xs font-inter font-bold shadow-xs">
              📘 Step-by-Step Learning Process
            </span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">How Your Study Companion Works</h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-inter">
              From entering your subjects to receiving a personalized, stress-free study plan.
            </p>
          </div>

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
                  whileHover={{ scale: 1.04 }}
                  className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DBEAFE] shadow-sm flex flex-col justify-between items-center text-center space-y-3 relative group"
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
          8. TESTIMONIALS SECTION (STUDENT REVIEWS)
          ========================================== */}
      <section className="py-20 px-6 lg:px-12 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">Student Experiences</span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">Loved by Students Everywhere</h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-inter">
              Hear from students who use our study companion to stay focused and reach their academic goals.
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
          10. FINAL CTA SECTION (CALM BLUE GRADIENT)
          ========================================== */}
      <section className="py-20 px-6 lg:px-12 bg-[#FFFFFF]">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white space-y-6 text-center shadow-xl relative overflow-hidden"
        >
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-white leading-tight">
              Start Your Learning Journey Today
            </h2>
            <p className="font-inter text-blue-50 text-xs sm:text-sm leading-relaxed">
              Join thousands of students organizing their study schedules with a peaceful AI study companion.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl bg-[#FFFFFF] text-[#2563EB] hover:bg-blue-50 font-poppins font-bold text-sm shadow-md transition-all"
            >
              <span>Start Your Learning Journey</span>
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
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-xl object-cover" />
              <span className="font-poppins font-black text-base text-[#1E293B]">AI Study<span className="text-[#2563EB]"> Planner</span></span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Your peaceful AI study companion designed to help students study smarter, feel motivated, and reach their goals.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-poppins font-bold text-xs text-[#1E293B]">Quick Links</div>
            <ul className="space-y-1.5 text-xs text-[#64748B]">
              <li><a href="#home" className="hover:text-[#2563EB]">Home</a></li>
              <li><a href="#market-problem" className="hover:text-[#2563EB]">What We Solve</a></li>
              <li><a href="#features" className="hover:text-[#2563EB]">Features</a></li>
              <li><a href="#students" className="hover:text-[#2563EB]">For Students</a></li>
              <li><a href="#faq" className="hover:text-[#2563EB]">FAQ</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-poppins font-bold text-xs text-[#1E293B]">Resources</div>
            <ul className="space-y-1.5 text-xs text-[#64748B]">
              <li><Link to="/login" className="hover:text-[#2563EB]">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-[#2563EB]">Start Learning</Link></li>
              <li><Link to="/study-planner" className="hover:text-[#2563EB]">Study Planner</Link></li>
              <li><Link to="/summary" className="hover:text-[#2563EB]">Class Notes</Link></li>
            </ul>
          </div>

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
          <div>Built with care for students everywhere.</div>
        </div>
      </footer>
    </div>
  );
}
