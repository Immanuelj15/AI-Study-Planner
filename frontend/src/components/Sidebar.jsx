import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  FileText, 
  GitFork, 
  HelpCircle, 
  BarChart3, 
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bot
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/subjects', label: 'Subjects', icon: BookOpen },
  { path: '/study-planner', label: 'Study Planner', icon: CalendarDays },
  { path: '/summary', label: 'Notes & Research', icon: FileText },
  { path: '/mindmap', label: 'Mind Map', icon: GitFork },
  { path: '/quiz', label: 'Quiz Engine', icon: HelpCircle },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`glass-card border-r border-[#E2E8F0] p-3.5 flex flex-col justify-between hidden md:flex transition-all duration-300 min-h-[calc(100vh-65px)] bg-[#FFFFFF] ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="space-y-4">
        {/* Toggle Collapse Header */}
        <div className="flex items-center justify-between px-2 py-1">
          {!collapsed && (
            <span className="text-[10px] font-poppins font-bold tracking-widest text-[#64748B] uppercase">
              Core Platform
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] border border-[#E2E8F0] transition-colors mx-auto"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Links List */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-inter font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] font-bold shadow-sm shadow-blue-500/10 scale-[1.02]'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FBFF]'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Multi-Agent Active Status Box */}
      {!collapsed ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-xs"
        >
          <div className="flex items-center gap-2 text-[#2563EB] font-poppins font-bold mb-1.5">
            <Sparkles className="w-4 h-4 animate-spin text-[#0EA5E9]" />
            <span>4 AI Agents Active</span>
          </div>
          <p className="text-[#64748B] font-inter text-[11px] leading-relaxed">
            Research, Summarizer, Quiz Master, & Adaptive Scheduler running.
          </p>
        </motion.div>
      ) : (
        <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mx-auto">
          <Bot className="w-5 h-5 animate-pulse" />
        </div>
      )}
    </motion.aside>
  );
}
