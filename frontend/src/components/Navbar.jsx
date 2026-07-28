import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { dashboardAPI } from '../services/api';
import { Sun, Moon, Flame, LogOut, Search, Sparkles, Bot, Command } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

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
      dashboardAPI.getDashboard()
        .then((res) => {
          if (res.data && typeof res.data.study_streak_days === 'number') {
            setStreakCount(res.data.study_streak_days);
          }
        })
        .catch((err) => console.error("Streak fetch error:", err));
    }
  }, [user]);

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
      {/* 1. Brand Logo with Custom Logo Image */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative group-hover:scale-105 transition-transform">
            <img 
              src="/logo.png" 
              alt="StudyAgent Logo" 
              className="w-10 h-10 rounded-2xl object-cover shadow-md border border-[#DBEAFE]" 
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-white animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-poppins font-black text-lg tracking-tight text-[#1E293B] leading-none">
              Study<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#38BDF8]">Agent</span>
            </span>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-[#64748B] font-inter font-semibold">
              <Bot className="w-3 h-3 text-[#2563EB]" />
              <span>Multi-Agent Educational AI</span>
            </div>
          </div>
        </Link>
      </div>

      {/* 2. Global AI Research Search Bar */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center relative max-w-lg w-full mx-6">
        <div className="relative w-full flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-[#64748B] pointer-events-none" />
          <input
            type="text"
            placeholder="Ask AI to research topics (e.g. Operating Systems)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-10 pr-36 rounded-full text-xs font-inter font-medium text-[#1E293B] placeholder-[#64748B] bg-[#F8FBFF] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all shadow-inner"
          />
          <div className="absolute right-28 hidden lg:flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-[#E2E8F0]/80 border border-[#CBD5E1]/60 text-[10px] font-mono font-bold text-[#475569] shadow-2xs">
            <Command className="w-2.5 h-2.5" /> K
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="absolute right-1.5 py-1.5 px-4 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white rounded-full text-[11px] font-inter font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" /> Research
          </motion.button>
        </div>
      </form>

      {/* 3. Right Status Controls & User Profile */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] text-xs font-inter font-bold shadow-xs">
          <Flame className="w-4 h-4 fill-[#F59E0B] text-[#D97706] animate-bounce" />
          <span>{streakCount} Day Streak</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] border border-[#E2E8F0] transition-colors shadow-xs"
          title="Toggle Dark/Light Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#64748B]" />}
        </motion.button>

        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] shadow-xs">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] text-white flex items-center justify-center font-poppins text-xs font-extrabold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-inter font-bold text-[#1E293B] max-w-[110px] truncate">{user.name}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-2.5 rounded-2xl bg-[#FEE2E2] hover:bg-[#FCA5A5]/40 text-[#EF4444] border border-[#FCA5A5] transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-2xl btn-gradient-primary text-xs font-inter font-bold shadow-sm shadow-blue-500/20"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
