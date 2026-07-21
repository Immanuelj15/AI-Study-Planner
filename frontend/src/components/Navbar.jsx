import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bot, Sun, Moon, Flame, LogOut, User, Search, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/summary?topic=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-800/80 backdrop-blur-xl px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-purple to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-brand-cyan">
              MultiAgent<span className="text-brand-500">Planner</span>
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              AutoGen Active
            </div>
          </div>
        </Link>
      </div>

      {/* Global Quick Search */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center relative max-w-md w-full mx-6">
        <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Research topic (e.g., Binary Search, B+ Trees)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full glass-input py-2 pl-10 pr-24 rounded-full text-xs font-medium text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          className="absolute right-1.5 py-1 px-3 bg-brand-600 hover:bg-brand-500 text-white rounded-full text-[11px] font-semibold flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-3 h-3" /> Research
        </button>
      </form>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* Streak Counter */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
          <Flame className="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>5 Day Streak</span>
        </div>

        {/* Dark/Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl glass-card hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-400" />}
        </button>

        {/* User Info & Logout */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <User className="w-4 h-4 text-brand-cyan" />
              <span className="text-xs font-semibold text-slate-200">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl gradient-btn text-xs font-bold"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
