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
  Brain,
  Sparkles
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/subjects', label: 'Subjects', icon: BookOpen },
  { path: '/study-planner', label: 'Study Planner', icon: Calendar },
  { path: '/summary', label: 'Notes & Research', icon: FileText },
  { path: '/mindmap', label: 'Mind Map Hub', icon: Network },
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
      className={`glass-card border-r border-[#E2E8F0] p-3.5 flex flex-col justify-between hidden md:flex transition-all duration-300 min-h-[calc(100vh-65px)] bg-[#FFFFFF] ${
        collapsed ? 'w-18' : 'w-60'
      }`}
    >
      <div className="space-y-4">
        {/* Toggle Header & Section Label */}
        <div className="flex items-center justify-between px-2 py-1">
          {!collapsed && (
            <div className="flex items-center gap-1.5 text-[11px] font-poppins font-extrabold tracking-wider text-[#2563EB] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Study Platform</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] border border-[#E2E8F0] transition-colors mx-auto"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-inter transition-all duration-200 ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] font-bold shadow-xs'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FBFF] font-medium'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Route Left Pill Marker */}
                    {isActive && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute left-0 w-1 h-5 bg-[#2563EB] rounded-r-full"
                      />
                    )}
                    <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#2563EB]' : 'text-[#64748B] group-hover:text-[#2563EB]'
                    }`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </>
                )}
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
          className="p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0] text-xs space-y-1.5"
        >
          <div className="flex items-center gap-2 text-[#2563EB] font-poppins font-bold">
            <Brain className="w-4 h-4 text-[#2563EB] animate-pulse" />
            <span>4 AI Agents Synced</span>
          </div>
          <p className="text-[#64748B] font-inter text-[10px] leading-relaxed">
            Research, Summarizer, Quiz Master & Scheduler active.
          </p>
        </motion.div>
      ) : (
        <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mx-auto" title="4 AI Agents Synced">
          <Bot className="w-5 h-5 animate-pulse text-[#2563EB]" />
        </div>
      )}
    </motion.aside>
  );
}
