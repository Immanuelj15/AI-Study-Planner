import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, 
  LogOut, 
  Search, 
  Sparkles, 
  Bot, 
  Command, 
  Languages, 
  Menu, 
  X,
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Network,
  ClipboardCheck,
  BarChart3,
  Settings,
  GraduationCap,
  AlertTriangle,
  RotateCcw,
  FileCheck,
  Users,
  HardDrive,
  Award,
  BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI, dashboardAPI } from '../services/api';

const mobileNavLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/materials', label: 'College Syllabus (RAG)', icon: GraduationCap },
  { path: '/weakness', label: 'My Weak Topics', icon: AlertTriangle },
  { path: '/exam-prep', label: 'Exam Preparation', icon: Flame },
  { path: '/revision', label: 'Smart Revision', icon: RotateCcw },
  { path: '/question-papers', label: 'Question Papers', icon: FileText },
  { path: '/assignments', label: 'Assignment Review', icon: FileCheck },
  { path: '/study-groups', label: 'Peer Study Groups', icon: Users },
  { path: '/offline-study', label: 'Offline Vault', icon: HardDrive },
  { path: '/achievements', label: 'Achievements', icon: Award },
  { path: '/faculty-analytics', label: 'Faculty Analytics', icon: BarChart2 },
  { path: '/subjects', label: 'Subjects', icon: BookOpen },
  { path: '/study-planner', label: 'Study Planner', icon: Calendar },
  { path: '/mindmap', label: 'Mind Map Hub', icon: Network },
  { path: '/quiz', label: 'Quiz Engine', icon: ClipboardCheck },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('preferred_language') || 'en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.preferred_language) {
        setCurrentLang(user.preferred_language);
      }
      dashboardAPI.getDashboard()
        .then((res) => {
          if (res.data && typeof res.data.study_streak_days === 'number') {
            setStreakCount(res.data.study_streak_days);
          }
        })
        .catch((err) => console.error("Streak fetch error:", err));
    }
  }, [user]);

  const toggleLanguage = async () => {
    const nextLang = currentLang === 'en' ? 'ta' : 'en';
    setCurrentLang(nextLang);
    localStorage.setItem('preferred_language', nextLang);
    if (user) {
      try {
        await authAPI.updateLanguage(nextLang);
      } catch (e) {
        console.error("Language update error:", e);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/summary?topic=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 px-4 lg:px-8 py-3 flex items-center justify-between border-b ${
        isScrolled
          ? 'bg-[#FFFFFF]/95 border-[#E2E8F0] backdrop-blur-md shadow-sm'
          : 'bg-[#FFFFFF]/80 border-[#E2E8F0]/80 backdrop-blur-sm'
      }`}
    >
      {/* 1. Brand Logo & Mobile Toggle */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 md:hidden transition"
          title="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative group-hover:scale-105 transition-transform">
            <img 
              src="/logo.png" 
              alt="StudyAgent Logo" 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover shadow-md border border-[#DBEAFE]" 
            />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-white animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-poppins font-black text-base sm:text-lg tracking-tight text-[#1E293B] leading-none">
              Study<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#38BDF8]">Agent</span>
            </span>
            <div className="flex items-center gap-1 mt-1 text-[9px] sm:text-[10px] text-[#64748B] font-inter font-semibold">
              <Bot className="w-3 h-3 text-[#2563EB]" />
              <span className="hidden sm:inline">Multi-Agent Educational AI</span>
              <span className="sm:hidden">AI Study</span>
            </div>
          </div>
        </Link>
      </div>

      {/* 2. Global AI Research Search Bar */}
      <form onSubmit={handleSearch} className="hidden lg:flex items-center relative max-w-md xl:max-w-lg w-full mx-4">
        <div className="relative w-full flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-[#64748B] pointer-events-none" />
          <input
            type="text"
            placeholder="Ask AI to research topics (e.g. Operating Systems)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-10 pr-32 rounded-full text-xs font-inter font-medium text-[#1E293B] placeholder-[#64748B] bg-[#F8FBFF] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all shadow-inner"
          />
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="absolute right-1.5 py-1.5 px-3.5 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white rounded-full text-[11px] font-inter font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" /> Research
          </motion.button>
        </div>
      </form>

      {/* 3. Right Status Controls & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Multilingual Switcher: English / Tamil */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] sm:text-xs font-inter font-bold hover:bg-blue-100 transition shadow-2xs"
          title="Toggle Language: English / தமிழ்"
        >
          <Languages className="w-3.5 h-3.5 text-blue-600" />
          <span>{currentLang === 'ta' ? 'தமிழ்' : 'English'}</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] text-xs font-inter font-bold shadow-xs">
          <Flame className="w-4 h-4 fill-[#F59E0B] text-[#D97706] animate-bounce" />
          <span>{streakCount}d</span>
        </div>

        {user ? (
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] shadow-xs">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] text-white flex items-center justify-center font-poppins text-[10px] sm:text-xs font-extrabold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-inter font-bold text-[#1E293B] max-w-[80px] sm:max-w-[110px] truncate">{user.name}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-2 sm:p-2.5 rounded-2xl bg-[#FEE2E2] hover:bg-[#FCA5A5]/40 text-[#EF4444] border border-[#FCA5A5] transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 rounded-2xl btn-gradient-primary text-xs font-inter font-bold shadow-sm shadow-blue-500/20"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* 4. Mobile Navigation Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl p-4 md:hidden z-50 max-h-[80vh] overflow-y-auto space-y-2"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
              Platform Navigation
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {mobileNavLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-xs font-semibold text-slate-700 transition"
                  >
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
