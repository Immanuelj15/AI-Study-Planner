import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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
  ShieldCheck,
  Layers,
  Volume2,
  Activity,
  Bot,
  RefreshCw,
  Sparkle,
  ChevronRight,
  MousePointerClick,
  Check
} from 'lucide-react';

// Hero Subheading Typewriter Phrases
const heroPhrases = [
  "Autonomous Multi-Agent AI System",
  "Active Recall 3D Flashcards",
  "15-Question Fresh Anti-Duplication Engine",
  "Spaced Repetition Schedule Synced to Google Calendar"
];

// CountUp Animated Counter Component
function AnimatedCounter({ end, duration = 2, suffix = '+' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Interactive Live Tab Mockups Data for Hero Right Side
const showcaseTabs = [
  {
    id: 'planner',
    label: '📅 Study Planner',
    title: 'Personalized Timetable',
    badge: 'Spaced Repetition',
    content: (
      <div className="space-y-3 font-inter">
        <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#2563EB]" />
            <span className="font-bold text-[#1E293B]">Binary Trees & Algorithms</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold">1.5 Hours</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0EA5E9]" />
            <span className="font-bold text-[#1E293B]">DBMS Normalization</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] text-[10px] font-bold">2.0 Hours</span>
        </div>
        <div className="p-3 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] text-[11px] font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span>Synced directly to Google Calendar & Apple iCal (.ics)</span>
        </div>
      </div>
    )
  },
  {
    id: 'notes',
    label: '📝 Smart Notes',
    title: 'Class Notes & Audio',
    badge: 'Voice AI Reader',
    content: (
      <div className="space-y-3 font-inter text-xs">
        <div className="p-3.5 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] space-y-1.5">
          <div className="flex items-center justify-between text-[#7C3AED] font-bold">
            <span className="flex items-center gap-1.5"><Volume2 className="w-4 h-4 animate-pulse" /> Voice AI Audio Reader</span>
            <span className="text-[10px]">Active Narration</span>
          </div>
          <p className="text-[#4C1D95] text-[11px] leading-relaxed">"Binary Search operates in logarithmic time complexity O(log N) by dividing sorted search space in half..."</p>
        </div>
        <div className="flex justify-between items-center pt-1 text-[11px] font-bold text-[#2563EB]">
          <span>• Bullet Point Summaries</span>
          <span>• Clean PDF Export</span>
        </div>
      </div>
    )
  },
  {
    id: 'mindmap',
    label: '🧠 Mind Map',
    title: 'Concept Map Hub',
    badge: '3 AI Explanation Modes',
    content: (
      <div className="space-y-3 font-inter text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold border border-[#DBEAFE]">ELI5 Mode</span>
          <span className="px-2.5 py-1 rounded-full bg-[#F8FBFF] text-[#64748B] text-[10px] font-bold border border-[#E2E8F0]">Beginner</span>
          <span className="px-2.5 py-1 rounded-full bg-[#F8FBFF] text-[#64748B] text-[10px] font-bold border border-[#E2E8F0]">Interview Prep</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#FDF2F8] border border-[#FBCFE8] space-y-2 text-[#9D174D]">
          <div className="font-poppins font-bold text-xs">Visual Node Relationships</div>
          <p className="text-[11px] leading-relaxed">Imagine a phonebook where you open the middle page every time to find a name twice as fast!</p>
        </div>
      </div>
    )
  },
  {
    id: 'quiz',
    label: '🏆 Practice Quiz',
    title: 'Anti-Duplication Quiz',
    badge: '15 Fresh Questions',
    content: (
      <div className="space-y-3 font-inter text-xs">
        <div className="p-3.5 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] space-y-1.5">
          <div className="flex items-center justify-between text-[#B45309] font-bold">
            <span>Question 1 of 15</span>
            <span className="text-[10px]">Medium Difficulty</span>
          </div>
          <p className="text-[#78350F] font-bold text-[11px]">What is the worst-case time complexity of Binary Search?</p>
        </div>
        <div className="p-2.5 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] font-bold text-[11px] flex items-center justify-between">
          <span>Option B: O(log N)</span>
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
        </div>
      </div>
    )
  }
];

// Product Ecosystem Pipeline Nodes
const ecosystemPipeline = [
  { step: '01', title: 'Student Input', subtitle: 'Target Date & Hours', icon: GraduationCap, color: '#2563EB', bg: '#EFF6FF' },
  { step: '02', title: 'Research Agent', subtitle: 'Deep Web & Formulas', icon: Search, color: '#0EA5E9', bg: '#F0F9FF' },
  { step: '03', title: 'Smart Notes', subtitle: 'Bullet Notes & Voice AI', icon: FileText, color: '#8B5CF6', bg: '#F5F3FF' },
  { step: '04', title: 'Interactive Mind Map', subtitle: '3 AI Explanation Modes', icon: Network, color: '#EC4899', bg: '#FDF2F8' },
  { step: '05', title: 'Adaptive Quiz', subtitle: '15 Fresh Anti-Duplication Qs', icon: ClipboardCheck, color: '#F59E0B', bg: '#FEF3C7' },
  { step: '06', title: 'Analytics Engine', subtitle: 'Weak Spot Detection', icon: BarChart3, color: '#10B981', bg: '#ECFDF5' },
  { step: '07', title: 'AI Scheduler', subtitle: 'Spaced Repetition Schedule', icon: CalendarDays, color: '#6366F1', bg: '#EEF2FF' },
  { step: '08', title: 'Exam Success', subtitle: '98% Score Mastery', icon: Award, color: '#22C55E', bg: '#F0FDF4' }
];

// Statistics Data
const statsList = [
  { end: 1000, suffix: '+', label: 'Active Students Learning', icon: Users, color: '#2563EB' },
  { end: 5000, suffix: '+', label: 'Study Plans Generated', icon: CalendarDays, color: '#0EA5E9' },
  { end: 15000, suffix: '+', label: 'Practice Quizzes Completed', icon: ClipboardCheck, color: '#8B5CF6' },
  { end: 98, suffix: '%', label: 'Exam Mastery & Success Rate', icon: Heart, color: '#22C55E' }
];

// Target Audience Category Cards
const studentCategories = [
  { title: 'School Students', badge: 'K-12 & High School', desc: 'Break down complex math and science concepts into simple ELI5 explanations and visual maps.', icon: GraduationCap, color: '#2563EB', bg: '#EFF6FF' },
  { title: 'College & University', badge: 'Undergrad & Masters', desc: 'Generate structured bullet notes, download clean PDF summaries, and sync study sessions to Google Calendar.', icon: BookOpen, color: '#0EA5E9', bg: '#F0F9FF' },
  { title: 'Competitive Exam Aspirants', badge: 'GATE, GRE, USMLE, SAT', desc: 'Master exam topics with adaptive difficulty scaling, 15-question anti-duplication quizzes, and spaced repetition.', icon: Target, color: '#8B5CF6', bg: '#F5F3FF' },
  { title: 'Self Learners & Professionals', badge: 'Lifetime Learners', desc: 'Listen to AI-generated voice notes while commuting and test active recall with 3D flip flashcards.', icon: Volume2, color: '#22C55E', bg: '#F0FDF4' }
];

// Features List
const featuresList = [
  { icon: CalendarDays, title: 'Personalized Study Planner', description: 'Calculates daily and weekly study schedules tailored to your target exam dates and available daily study time.', color: '#2563EB', bg: '#EFF6FF' },
  { icon: Search, title: 'Deep Research Companion', description: 'Finds definitions, formulas, real-world examples, and key concepts so you never get stuck on a topic.', color: '#0EA5E9', bg: '#F0F9FF' },
  { icon: FileText, title: 'Easy-to-Understand Notes', description: 'Generates beginner-friendly bullet point notes with voice text-to-speech audio reader and downloadable PDFs.', color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: Network, title: 'Visual Concept Maps', description: 'Builds interactive concept maps so visual learners can understand complex relationships effortlessly.', color: '#EC4899', bg: '#FDF2F8' },
  { icon: ClipboardCheck, title: 'Practice What You Learned', description: 'Generates practice questions with encouraging feedback and detailed step-by-step explanations.', color: '#22C55E', bg: '#F0FDF4' },
  { icon: BarChart3, title: 'My Learning Progress', description: 'Track your subject mastery, weekly study hours, and daily learning streaks without stress or pressure.', color: '#F59E0B', bg: '#FEF3C7' }
];

// How It Works Horizontal Timeline Steps
const timelineSteps = [
  { step: '01', title: 'Choose Subject', desc: 'Input target exam date and daily available hours.', icon: GraduationCap, color: '#2563EB' },
  { step: '02', title: 'Research Agent', desc: 'Autonomous crawling for core definitions and formulas.', icon: Search, color: '#0EA5E9' },
  { step: '03', title: 'AI Smart Notes', desc: 'Generates structured bullet points and voice audio.', icon: FileText, color: '#8B5CF6' },
  { step: '04', title: 'Interactive Mind Map', desc: 'Visual node relationships with 3 explanation modes.', icon: Network, color: '#EC4899' },
  { step: '05', title: 'Adaptive Practice Quiz', desc: '15 unique fresh questions with step-by-step solutions.', icon: ClipboardCheck, color: '#F59E0B' },
  { step: '06', title: 'Adaptive Study Plan', desc: 'Spaced repetition schedule synced to Google Calendar.', icon: CalendarDays, color: '#22C55E' }
];

// Multi-Agent Engine Architecture Nodes
const agentNodes = [
  { title: 'Research Agent', role: 'Data Extraction', icon: Search, color: '#2563EB' },
  { title: 'Summarizer Agent', role: 'Note Synthesis', icon: FileText, color: '#0EA5E9' },
  { title: 'Mind Map Generator', role: 'Visual Graph', icon: Network, color: '#8B5CF6' },
  { title: 'Quiz Agent', role: 'Anti-Duplication Qs', icon: ClipboardCheck, color: '#F59E0B' },
  { title: 'Scheduler Agent', role: 'Spaced Repetition', icon: CalendarDays, color: '#22C55E' },
  { title: 'AI Coach / Tutor', role: 'Weak Spot Bridge', icon: Bot, color: '#EC4899' }
];

// Problem vs Solution Comparison Data
const problemVsSolution = [
  {
    problemTitle: 'Static To-Do Lists & Fixed Schedules',
    problemDesc: 'Generic timetables fail when life happens, leading to accumulated backlogs and study stress.',
    solutionTitle: 'Adaptive Multi-Agent Timetables',
    solutionDesc: 'SchedulerAgent automatically redistributes study hours based on your target exam date and quiz results.',
  },
  {
    problemTitle: 'Repetitive Static Quizzes',
    problemDesc: 'Traditional platforms repeat the same static question banks, masking real knowledge gaps.',
    solutionTitle: 'Anti-Duplication 15-Question Engine',
    solutionDesc: 'QuizAgent checks SQLite QuestionHistory to guarantee 100% fresh, non-repeating questions per attempt.',
  },
  {
    problemTitle: 'Overwhelming Walls of Text',
    problemDesc: 'Long textbook chapters trigger cognitive fatigue, making active recall difficult.',
    solutionTitle: '3D Flashcards & Voice AI Reader',
    solutionDesc: 'Listen to notes on your commute or flip active-recall 3D flashcards designed for peak retention.',
  },
  {
    problemTitle: 'One-Size-Fits-All Explanations',
    problemDesc: 'Complex topics are presented identically regardless of whether you are a beginner or preparing for interviews.',
    solutionTitle: '3 AI Explanation Modes',
    solutionDesc: 'Switch effortlessly between ELI5 (Explain Like I\'m 10), Beginner Mode, and Interview Prep Mode inside the Mind Map Hub.',
  }
];

// Testimonials
const testimonialsList = [
  { name: 'Sarah Chen', role: 'Computer Science Student, Stanford', review: 'The easy-to-understand notes and visual concept maps helped me understand Algorithms peacefully. I feel so much more confident!', rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80' },
  { name: 'Marcus Vance', role: 'Competitive Exam Aspirant (GATE)', review: 'The feedback loop is amazing. When I needed extra help on DBMS, my study plan automatically gave me extra revision time!', rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
  { name: 'Elena Rostova', role: 'Medical Student, Oxford', review: 'Listening to notes on my commute with the voice reader makes studying enjoyable. This app truly understands students.', rating: 5, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
  { name: 'David Park', role: 'Electrical Engineering, MIT', review: 'The 3D flip flashcards and Google Calendar export saved my semester. Highly recommend to engineering students!', rating: 5, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80' }
];

// FAQ Accordion List
const faqList = [
  { q: 'How does the AI Study Planner help me learn?', a: 'Simply enter your subjects, target exam date, and daily study hours. Our intelligent study companion creates a step-by-step timetable, clear notes, visual concept maps, and practice quizzes to help you learn peacefully.' },
  { q: 'What makes this different from a static to-do list?', a: 'Static to-do lists do not adapt. If you score low on a practice quiz, our platform automatically adjusts your future timetable to spend more time on topics that need extra attention.' },
  { q: 'Is this suitable for school, university, or competitive exams?', a: 'Yes! It is crafted for school students, college undergraduates, university students, and competitive exam aspirants (GATE, GRE, USMLE, SAT, etc.).' },
  { q: 'Is there a free trial or demo available?', a: 'Yes, you can click "Start Learning" or "See How It Works" to explore the platform with free demo credits.' },
  { q: 'Can I download my notes as PDFs and sync to Google Calendar?', a: 'Yes! You can export your class notes as clean PDFs and export study schedules directly into Google Calendar, Outlook, or Apple iCal (.ics).' }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('planner');

  // Typewriter Loop Logic
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Typewriter Animation Effect
  useEffect(() => {
    const currentPhrase = heroPhrases[phraseIdx];
    let timer;

    if (!isDeleting && typedText.length < currentPhrase.length) {
      timer = setTimeout(() => {
        setTypedText(currentPhrase.substring(0, typedText.length + 1));
      }, 50);
    } else if (!isDeleting && typedText.length === currentPhrase.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && typedText.length > 0) {
      timer = setTimeout(() => {
        setTypedText(currentPhrase.substring(0, typedText.length - 1));
      }, 30);
    } else if (isDeleting && typedText.length === 0) {
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % heroPhrases.length);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, phraseIdx]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const activeMockup = showcaseTabs.find((t) => t.id === activeTab) || showcaseTabs[0];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1E293B] font-inter selection:bg-[#2563EB] selection:text-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-40"></div>
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-[#DBEAFE]/30 blur-3xl pointer-events-none"></div>
      <div className="absolute top-96 right-10 w-96 h-96 rounded-full bg-[#E0F2FE]/40 blur-3xl pointer-events-none"></div>

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

        <nav className="hidden md:flex items-center gap-8 text-xs font-inter font-bold text-[#64748B]">
          <a href="#home" className="hover:text-[#2563EB] transition-colors">Home</a>
          <a href="#ecosystem" className="hover:text-[#2563EB] transition-colors">Ecosystem</a>
          <a href="#market-problem" className="hover:text-[#2563EB] transition-colors">What We Solve</a>
          <a href="#features" className="hover:text-[#2563EB] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#2563EB] transition-colors">How It Works</a>
          <a href="#faq" className="hover:text-[#2563EB] transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login" className="text-xs font-inter font-bold text-[#64748B] hover:text-[#1E293B] px-3 py-2 transition-colors">
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/register" className="px-5 py-2.5 rounded-2xl bg-[#2563EB] text-white text-xs font-poppins font-bold shadow-md hover:bg-[#1D4ED8] transition-all">
              Start Learning
            </Link>
          </motion.div>
        </div>
      </header>

      {/* ==========================================
          2. WORLD-CLASS HERO SECTION (92% WIDTH)
          ========================================== */}
      <section id="home" className="pt-32 pb-24 px-4 sm:px-8 w-[92%] max-w-[1536px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Bold Headline & Typing Sub-Badge (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-inter font-bold shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#2563EB] animate-spin" />
              <span>Designed for Students • Stress-Free Learning</span>
            </motion.div>

            {/* Bold High-Impact Static Headline */}
            <h1 className="font-poppins text-4xl sm:text-6xl lg:text-6xl font-black text-[#1E293B] tracking-tight leading-tight">
              Study Smarter. <br />
              Build Better Habits. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#0EA5E9] to-[#38BDF8]">
                Master Every Subject.
              </span>
            </h1>

            {/* Smooth Dynamic Typewriter Sub-Badge */}
            <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] flex items-center gap-2 text-xs sm:text-sm font-poppins font-bold text-[#2563EB]">
              <Sparkle className="w-4 h-4 text-[#2563EB] fill-[#2563EB]" />
              <span>{typedText}</span>
              <span className="w-0.5 h-4 bg-[#2563EB] animate-pulse"></span>
            </div>

            <p className="text-[#64748B] font-inter text-sm sm:text-base leading-relaxed max-w-2xl">
              Create personalized study plans, interactive 3D concept maps, AI-generated bullet notes, adaptive practice quizzes, and intelligent revision schedules using our Multi-Agent AI system.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-2xl bg-[#2563EB] text-white text-xs sm:text-sm font-poppins font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:bg-[#1D4ED8] transition-all"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a
                  href="#ecosystem"
                  className="px-8 py-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-[#1E293B] text-xs sm:text-sm font-inter font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-[#2563EB] fill-[#2563EB]" />
                  <span>Watch Demo</span>
                </a>
              </motion.div>
            </div>

            {/* User Target Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-2 text-[11px] font-inter font-bold text-[#64748B]">
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB]">🎓 School Students</span>
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB]">🏫 College & Uni</span>
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB]">⚡ Competitive Exams</span>
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB]">💡 Self Learning</span>
            </div>
          </div>

          {/* Right Column: Tabbed Interactive Showcase Card (5 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[460px]">
            <div className="w-full max-w-md bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-2xl space-y-4 relative z-10">
              
              {/* Tab Navigation Controls */}
              <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
                {showcaseTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-poppins font-bold transition-all ${
                      activeTab === t.id
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Active Tab Showcase Content */}
              <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] space-y-3 min-h-[220px] flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="font-poppins font-bold text-xs text-[#1E293B]">{activeMockup.title}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold border border-[#DBEAFE]">
                    {activeMockup.badge}
                  </span>
                </div>

                <div>
                  {activeMockup.content}
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B] font-inter">
                  <span className="flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5 text-[#2563EB]" /> Interactive Preview</span>
                  <span className="text-[#2563EB] font-bold">100% Automated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          3. PRODUCT ECOSYSTEM PIPELINE VISUALIZATION
          ========================================== */}
      <section id="ecosystem" className="py-20 px-4 sm:px-8 w-[92%] max-w-[1536px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-3xl p-8 lg:p-12 border border-[#E2E8F0] bg-[#FFFFFF] shadow-soft space-y-12 text-center"
        >
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-inter font-bold shadow-xs">
              ⚡ End-to-End Multi-Agent Architecture
            </span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">
              How Information Flows Through Our System
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-inter">
              From entering target exam dates to 98% score mastery, witness our autonomous multi-agent pipeline in real time.
            </p>
          </div>

          {/* Interactive Pipeline Nodes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 items-stretch relative">
            {ecosystemPipeline.map((node, idx) => {
              const Icon = node.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  whileHover={{ y: -6, scale: 1.04 }}
                  className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm flex flex-col justify-between items-center text-center space-y-3 relative group hover:border-[#2563EB] transition-all"
                >
                  <div className="text-[10px] font-mono font-bold text-[#64748B]">{node.step}</div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs"
                    style={{ backgroundColor: node.bg, borderColor: '#DBEAFE', color: node.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-poppins font-bold text-xs text-[#1E293B]">{node.title}</div>
                    <div className="text-[10px] text-[#64748B] font-inter mt-0.5 leading-tight">{node.subtitle}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ==========================================
          5. WHAT WE SOLVE IN THE CURRENT MARKET
          ========================================== */}
      <section id="market-problem" className="py-20 px-4 sm:px-8 w-[92%] max-w-[1536px] mx-auto">
        <div className="space-y-12 text-center">
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">Market Innovation</span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">
              Traditional Learning Lacks Personalization. We Solve That.
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-inter">
              See how our Autonomous Multi-Agent AI system transforms static study habits into an active, adaptive learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {problemVsSolution.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="p-8 rounded-3xl bg-[#F8FBFF] border border-[#E2E8F0] shadow-soft space-y-4 flex flex-col justify-between"
              >
                <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-poppins font-bold text-[#DC2626]">
                    <XCircle className="w-4 h-4 text-[#DC2626]" />
                    <span>Traditional Study Methods: {item.problemTitle}</span>
                  </div>
                  <p className="text-xs text-[#7F1D1D] leading-relaxed font-inter">{item.problemDesc}</p>
                </div>

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
          6. FEATURES SECTION (STAGGERED ANIMATIONS)
          ========================================== */}
      <section id="features" className="py-20 px-4 sm:px-8 w-[92%] max-w-[1536px] mx-auto">
        <div className="space-y-12 text-center">
          <div className="space-y-3 max-w-3xl mx-auto">
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
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="p-8 rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-soft hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
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
          7. HOW IT WORKS HORIZONTAL TIMELINE
          ========================================== */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 w-[92%] max-w-[1536px] mx-auto bg-[#EFF6FF] rounded-3xl border border-[#DBEAFE]">
        <div className="space-y-12 text-center">
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-[#FFFFFF] border border-[#DBEAFE] text-[#2563EB] text-xs font-inter font-bold shadow-xs">
              📘 Step-by-Step Learning Timeline
            </span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">How Your Study Companion Works</h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-inter">
              6 clear steps from entering your target subject to generating an adaptive study timetable.
            </p>
          </div>

          {/* Horizontal Timeline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
            {timelineSteps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  whileHover={{ y: -6 }}
                  className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DBEAFE] shadow-sm flex flex-col justify-between items-center text-center space-y-3"
                >
                  <div className="text-[10px] font-mono font-bold text-[#64748B]">{st.step}</div>
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-poppins font-bold text-xs text-[#1E293B]">{st.title}</div>
                    <div className="text-[10px] text-[#64748B] font-inter mt-1 leading-relaxed">{st.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          8. MULTI-AGENT ENGINE ECOSYSTEM SECTION
          ========================================== */}
      <section className="py-20 px-4 sm:px-8 w-[92%] max-w-[1536px] mx-auto">
        <div className="space-y-12 text-center">
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-inter font-bold text-[#2563EB] tracking-wider uppercase">Multi-Agent Coordination</span>
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-[#1E293B]">
              Autonomous AI Agents Working Together
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-inter">
              Every agent specializes in a distinct cognitive task to build your personalized study ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {agentNodes.map((agent, idx) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="p-7 rounded-3xl bg-[#F8FBFF] border border-[#E2E8F0] shadow-soft space-y-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs"
                      style={{ backgroundColor: `${agent.color}15`, borderColor: `${agent.color}40`, color: agent.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-poppins font-bold text-base text-[#1E293B]">{agent.title}</h3>
                      <p className="text-xs text-[#64748B] font-inter">{agent.role}</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          10. FAQ ACCORDION SECTION
          ========================================== */}
      <section id="faq" className="py-20 px-4 sm:px-8 w-[92%] max-w-[1536px] mx-auto bg-[#F8FBFF] rounded-3xl border border-[#E2E8F0]">
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
          11. FINAL LARGE CTA SECTION (SOFT BLUE GRADIENT)
          ========================================== */}
      <section className="py-20 px-4 sm:px-8 w-[92%] max-w-[1536px] mx-auto">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="rounded-3xl p-10 sm:p-16 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white space-y-6 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="space-y-3 max-w-3xl mx-auto">
            <h2 className="font-poppins text-3xl sm:text-5xl font-black text-white leading-tight">
              Ready to Transform Your Study Journey?
            </h2>
            <p className="font-inter text-blue-50 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
              Join thousands of students organizing their study schedules with a peaceful AI study companion.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-4.5 rounded-2xl bg-[#FFFFFF] text-[#2563EB] hover:bg-blue-50 font-poppins font-bold text-sm shadow-xl transition-all"
            >
              <span>Start Learning Today</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ==========================================
          12. MODERN FOOTER
          ========================================== */}
      <footer id="contact" className="py-12 px-6 lg:px-12 bg-[#FFFFFF] border-t border-[#E2E8F0] text-xs font-inter text-[#64748B]">
        <div className="w-[92%] max-w-[1536px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left pb-8 border-b border-[#E2E8F0]">
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
              <li><a href="#ecosystem" className="hover:text-[#2563EB]">Ecosystem</a></li>
              <li><a href="#market-problem" className="hover:text-[#2563EB]">What We Solve</a></li>
              <li><a href="#features" className="hover:text-[#2563EB]">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[#2563EB]">How It Works</a></li>
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

        <div className="w-[92%] max-w-[1536px] mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#64748B]">
          <div>© 2026 AI Study Planner. All rights reserved.</div>
          <div>Built with care for students everywhere.</div>
        </div>
      </footer>
    </div>
  );
}
