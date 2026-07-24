import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Flame, LogOut, User, Search, Sparkles, Brain, Bot, Command } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/summary?topic=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 px-4 lg:px-8 py-3.5 flex items-center justify-between border-b ${
        isScrolled
          ? 'bg-[#FFFFFF]/95 border-[#E2E8F0] backdrop-blur-md shadow-sm'
          : 'bg-[#FFFFFF]/80 border-[#E2E8F0]/80 backdrop-blur-sm'
      }`}
    >
      {/* 1. Brand Logo & System Status */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] via-[#0EA5E9] to-[#38BDF8] flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform relative">
            <Brain className="w-5 h-5 text-white" />
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
            placeholder="Ask AI to research topics (e.g. Operating Systems, B+ Trees)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-10 pr-28 rounded-full text-xs font-inter font-medium text-[#1E293B] placeholder-[#64748B] bg-[#F8FBFF] border border-[#E2E8F0] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all shadow-inner"
          />
          <div className="absolute right-24 hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#E2E8F0]/60 text-[10px] font-mono font-bold text-[#64748B]">
            <Command className="w-2.5 h-2.5" /> K
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="absolute right-1.5 py-1.5 px-3.5 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white rounded-full text-[11px] font-inter font-bold flex items-center gap-1 shadow-sm shadow-blue-500/20"
          >
            <Sparkles className="w-3 h-3 text-yellow-200" /> Research
          </motion.button>
        </div>
      </form>

      {/* 3. Right Status Controls & User Profile */}
      <div className="flex items-center gap-3">
        {/* Study Streak Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] text-xs font-inter font-bold shadow-xs">
          <Flame className="w-4 h-4 fill-[#F59E0B] text-[#D97706] animate-bounce" />
          <span>5 Day Streak</span>
        </div>

        {/* Theme Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] border border-[#E2E8F0] transition-colors shadow-xs"
          title="Toggle Dark/Light Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#64748B]" />}
        </motion.button>

        {/* User Account / Sign In */}
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
