import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bot, Sun, Moon, Flame, LogOut, User, Search, Sparkles, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/summary?topic=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 px-4 lg:px-8 py-3.5 flex items-center justify-between ${
        isScrolled
          ? 'glass-card border-b border-[#334155]/80 backdrop-blur-xl shadow-xl'
          : 'bg-transparent border-b border-transparent backdrop-blur-sm'
      }`}
    >
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3B82F6] via-purple-600 to-[#06B6D4] flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-poppins font-black text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#06B6D4]">
              Study<span className="text-[#3B82F6]">Agent</span>
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-[#10B981] font-inter font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              AutoGen Active
            </div>
          </div>
        </Link>
      </div>

      {/* Global Quick Search */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center relative max-w-md w-full mx-6">
        <Search className="w-4 h-4 absolute left-3.5 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Research topic with AI Agents (e.g., Binary Search, B+ Trees)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full glass-input py-2 pl-10 pr-24 rounded-full text-xs font-inter font-medium text-[#F8FAFC] placeholder-[#94A3B8]"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="absolute right-1.5 py-1 px-3 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white rounded-full text-[11px] font-inter font-bold flex items-center gap-1 shadow-md shadow-blue-500/20"
        >
          <Sparkles className="w-3 h-3" /> Research
        </motion.button>
      </form>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* Streak Counter */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-inter font-bold">
          <Flame className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
          <span>5 Day Streak</span>
        </div>

        {/* Dark/Light Toggle */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 rounded-xl glass-card hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#94A3B8]" />}
        </motion.button>

        {/* User Info & Logout */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1E293B] border border-[#334155]">
              <User className="w-4 h-4 text-[#06B6D4]" />
              <span className="text-xs font-inter font-semibold text-[#F8FAFC]">{user.name}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-2 rounded-xl bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/20 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl btn-gradient-primary text-xs font-inter font-bold shadow-md shadow-blue-500/20"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
