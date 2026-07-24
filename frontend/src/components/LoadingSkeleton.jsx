import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Brain, 
  HelpCircle, 
  CalendarDays, 
  CheckCircle2, 
  Sparkles, 
  Loader2,
  Bot
} from 'lucide-react';

const agentsList = [
  {
    id: 'research',
    name: 'Research Agent',
    description: 'Searching Learning Resources & Academic Concepts...',
    icon: Search,
    color: '#2563EB',
  },
  {
    id: 'summarizer',
    name: 'Summarizer Agent',
    description: 'Generating Beginner-Friendly Notes & Revision Bullet Points...',
    icon: FileText,
    color: '#0EA5E9',
  },
  {
    id: 'mindmap',
    name: 'Mind Map Generator',
    description: 'Creating Interactive React Flow Visual Graph...',
    icon: Brain,
    color: '#8B5CF6',
  },
  {
    id: 'quiz',
    name: 'Quiz Generator Agent',
    description: 'Calibrating Practice Questions & Answer Explanations...',
    icon: HelpCircle,
    color: '#EC4899',
  },
  {
    id: 'scheduler',
    name: 'Scheduler Agent',
    description: 'Optimizing Adaptive Study Matrix & Allocated Hours...',
    icon: CalendarDays,
    color: '#22C55E',
  },
];

export default function LoadingSkeleton({ text = "Multi-Agent System Processing..." }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < agentsList.length - 1 ? prev + 1 : prev));
    }, 700);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto my-10 space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 text-center space-y-3 border border-[#E2E8F0] relative overflow-hidden bg-[#FFFFFF]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-sky-50/50 to-indigo-50/50 animate-pulse"></div>
        <div className="relative z-10 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] flex items-center justify-center shadow-md shadow-blue-500/20">
            <Bot className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div>
            <h3 className="font-poppins text-lg font-bold text-[#1E293B] tracking-tight">{text}</h3>
            <p className="text-xs text-[#64748B] font-inter">Executing 4 Microsoft AutoGen AI Agents synchronously</p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-1.5 bg-[#EFF6FF] rounded-full overflow-hidden mt-3 relative border border-[#DBEAFE]">
          <motion.div
            className="h-full bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#22C55E]"
            initial={{ width: '5%' }}
            animate={{ width: `${((activeStep + 1) / agentsList.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Agents Sequential Pipeline Cards */}
      <div className="space-y-3 relative">
        {/* Animated Connecting Line */}
        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-[#E2E8F0] z-0">
          <motion.div
            className="w-full bg-gradient-to-b from-[#2563EB] to-[#22C55E]"
            initial={{ height: '0%' }}
            animate={{ height: `${(activeStep / (agentsList.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {agentsList.map((agent, index) => {
          const Icon = agent.icon;
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative z-10 p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                isActive
                  ? 'bg-[#EFF6FF] border-[#2563EB] shadow-md shadow-blue-500/10 ai-glow-shadow'
                  : isCompleted
                  ? 'bg-[#F0FDF4] border-[#22C55E]/40 opacity-95'
                  : 'bg-[#FFFFFF] border-[#E2E8F0] opacity-50'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Icon Container */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    isActive
                      ? 'bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB] animate-pulse'
                      : isCompleted
                      ? 'bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]'
                      : 'bg-[#F8FBFF] border-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Text Labels */}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-poppins text-sm font-bold text-[#1E293B]">{agent.name}</h4>
                    {isActive && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-spin" /> Processing
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] font-inter mt-0.5">{agent.description}</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div>
                {isCompleted ? (
                  <div className="flex items-center gap-1 text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 rounded-full border border-[#22C55E]/30">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✔ Completed</span>
                  </div>
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
                ) : (
                  <span className="text-[11px] font-semibold text-[#64748B]">Pending</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
