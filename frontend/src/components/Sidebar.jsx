import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  FileText, 
  GitFork, 
  HelpCircle, 
  BarChart3, 
  Settings,
  Sparkles
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
  return (
    <aside className="w-64 glass-card border-r border-slate-800/80 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600/90 to-brand-purple/90 text-white shadow-lg shadow-brand-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Multi-Agent System Banner Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-600/20 via-brand-purple/20 to-brand-cyan/10 border border-brand-500/30 text-xs">
        <div className="flex items-center gap-2 text-brand-cyan font-bold mb-1.5">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>4 AI Agents Active</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          Research, Summarizer, Quiz Master, & Adaptive Scheduler working synchronously.
        </p>
      </div>
    </aside>
  );
}
