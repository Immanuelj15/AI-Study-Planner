import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Flame, LogOut, User, Search, Sparkles, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
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
      className={`sticky top-0 z-40 w-full transition-all duration-300 px-4 lg:px-8 py-3 flex items-center justify-between ${
        isScrolled
          ? 'bg-[#FFFFFF]/90 border-b border-[#E2E8F0] backdrop-blur-md shadow-sm'
          : 'bg-[#FFFFFF]/70 border-b border-[#E2E8F0]/60 backdrop-blur-xs'
      }`}
    >
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-poppins font-black text-lg tracking-tight text-[#1E293B]">
              Study<span className="text-[#2563EB]">Agent</span>
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-[#22C55E] font-inter font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
              AutoGen Active
            </div>
          </div>
        </Link>
      </div>

      {/* Global Quick Search */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center relative max-w-md w-full mx-6">
        <Search className="w-4 h-4 absolute left-3.5 text-[#64748B]" />
        <input
          type="text"
          placeholder="Search learning topics (e.g. Binary Search, Operating Systems)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full glass-input py-2 pl-10 pr-24 rounded-full text-xs font-inter font-medium text-[#1E293B] placeholder-[#64748B] bg-[#F8FBFF]"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="absolute right-1.5 py-1 px-3 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white rounded-full text-[11px] font-inter font-bold flex items-center gap-1 shadow-sm shadow-blue-500/20"
        >
          <Sparkles className="w-3 h-3" /> Research
        </motion.button>
      </form>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* Study Streak Counter */}
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] text-xs font-inter font-bold">
          <Flame className="w-4 h-4 fill-[#F59E0B] text-[#D97706]" />
          <span>5 Day Streak</span>
        </div>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 rounded-2xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] border border-[#E2E8F0] transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#64748B]" />}
        </motion.button>

        {/* User Info & Logout */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
              <User className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-inter font-semibold text-[#1E293B]">{user.name}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-2 rounded-2xl bg-[#FEE2E2] hover:bg-[#FCA5A5]/40 text-[#EF4444] border border-[#FCA5A5] transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
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
    </header>
  );
}
