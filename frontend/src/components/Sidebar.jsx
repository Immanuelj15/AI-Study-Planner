import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  FileText, 
  Network, 
  ClipboardCheck, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  Brain
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/subjects', label: 'Subjects', icon: BookOpen },
  { path: '/study-planner', label: 'Study Planner', icon: Calendar },
  { path: '/summary', label: 'Notes & Research', icon: FileText },
  { path: '/mindmap', label: 'Mind Map', icon: Network },
  { path: '/quiz', label: 'Quiz Engine', icon: ClipboardCheck },
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
      className={`glass-card border-r border-[#E2E8F0] p-4 flex flex-col justify-between hidden md:flex transition-all duration-300 min-h-[calc(100vh-65px)] bg-[#FFFFFF] ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="space-y-4">
        {/* Toggle Collapse Header */}
        <div className="flex items-center justify-between px-2 py-1">
          {!collapsed && (
            <span className="text-[11px] font-poppins font-extrabold tracking-widest text-[#64748B] uppercase">
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

        {/* Nav Links List (Exact 22px Icons) */}
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-inter transition-all duration-200 ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] font-bold shadow-xs scale-[1.02]'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FBFF] font-medium'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                <Icon className="w-[22px] h-[22px] shrink-0 text-[#2563EB] group-hover:scale-110 transition-transform" />
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
          className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-xs space-y-1.5"
        >
          <div className="flex items-center gap-2 text-[#2563EB] font-poppins font-bold">
            <Brain className="w-[18px] h-[18px] text-[#2563EB] animate-pulse" />
            <span>4 AI Agents Active</span>
          </div>
          <p className="text-[#64748B] font-inter text-[11px] leading-relaxed">
            Research, Summarizer, Quiz Master, & Scheduler running synchronously.
          </p>
        </motion.div>
      ) : (
        <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mx-auto">
          <Bot className="w-5 h-5 animate-pulse text-[#2563EB]" />
        </div>
      )}
    </motion.aside>
  );
}
