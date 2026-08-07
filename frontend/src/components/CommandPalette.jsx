import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  FileText, 
  Network, 
  ClipboardCheck, 
  BarChart3, 
  Settings,
  X,
  ArrowRight
} from 'lucide-react';

const searchItems = [
  { id: 'dashboard', title: 'Dashboard', desc: 'Overview, timetable, and study streak', path: '/dashboard', icon: LayoutDashboard },
  { id: 'subjects', title: 'Subjects', desc: 'Manage your enrolled study subjects', path: '/subjects', icon: BookOpen },
  { id: 'planner', title: 'Study Planner', desc: 'Automated study schedule generator', path: '/study-planner', icon: Calendar },
  { id: 'summary', title: 'Class Notes & Research', desc: 'Structured bullet notes & definitions', path: '/summary', icon: FileText },
  { id: 'mindmap', title: 'Interactive Mind Map Hub', desc: 'Visual node graphs with 3 AI explanation modes', path: '/mindmap', icon: Network },
  { id: 'quiz', title: 'Adaptive Quiz Engine', desc: '15 non-repeating practice questions', path: '/quiz', icon: ClipboardCheck },
  { id: 'analytics', title: 'Analytics', desc: 'Heatmap & weekly progress charts', path: '/analytics', icon: BarChart3 },
  { id: 'settings', title: 'Settings', desc: 'Account profile & preferences', path: '/settings', icon: Settings },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredItems = searchItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4 font-inter"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl shadow-2xl overflow-hidden space-y-0"
          >
            {/* Search Input Bar */}
            <div className="p-4 border-b border-[#E2E8F0] flex items-center gap-3">
              <Search className="w-5 h-5 text-[#2563EB]" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or jump to page (Ctrl + K)..."
                className="w-full text-sm font-inter text-[#1E293B] placeholder-[#94A3B8] focus:outline-none bg-transparent"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-xl hover:bg-[#F1F5F9] text-[#94A3B8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="p-2 max-h-80 overflow-y-auto space-y-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.path)}
                      className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all ${
                        idx === selectedIndex ? 'bg-[#EFF6FF] border border-[#DBEAFE]' : 'hover:bg-[#F8FBFF]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-poppins font-bold text-xs text-[#1E293B]">{item.title}</div>
                          <div className="text-[11px] text-[#64748B] font-normal">{item.desc}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#2563EB] opacity-60" />
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-[#64748B]">
                  No matching page or command found for "{query}".
                </div>
              )}
            </div>

            {/* Footer Shortcut Instructions */}
            <div className="p-3 bg-[#F8FBFF] border-t border-[#E2E8F0] text-[11px] text-[#64748B] flex items-center justify-between font-inter">
              <span>Navigation Command Palette</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-white border border-[#E2E8F0] font-bold">ESC to close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
