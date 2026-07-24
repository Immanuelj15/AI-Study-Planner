import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Network, 
  ClipboardCheck, 
  CalendarClock, 
  CheckCircle2, 
  Sparkles, 
  Loader2,
  Brain
} from 'lucide-react';

const agentsList = [
  {
    id: 'research',
    name: 'Research Agent',
    description: 'Searching Learning Resources...',
    icon: Search,
  },
  {
    id: 'summarizer',
    name: 'Summarizer Agent',
    description: 'Generating Bullet Point Notes...',
    icon: FileText,
  },
  {
    id: 'mindmap',
    name: 'Mind Map Generator',
    description: 'Building Interactive Mind Map...',
    icon: Network,
  },
  {
    id: 'quiz',
    name: 'Quiz Generator',
    description: 'Creating Practice Questions...',
    icon: ClipboardCheck,
  },
  {
    id: 'scheduler',
    name: 'Scheduler Agent',
    description: 'Preparing Personalized Study Plan...',
    icon: CalendarClock,
  },
];

export default function LoadingSkeleton({ text = "Multi-Agent System Processing..." }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < agentsList.length - 1 ? prev + 1 : prev));
    }, 750);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto my-10 space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 text-center space-y-3 border border-[#E2E8F0] relative overflow-hidden bg-[#FFFFFF] shadow-soft">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] flex items-center justify-center shadow-md shadow-blue-500/20">
            <Brain className="w-7 h-7 text-white animate-bounce" />
          </div>
          <div className="text-left">
            <h3 className="font-poppins text-lg font-black text-[#1E293B] tracking-tight">{text}</h3>
            <p className="text-xs text-[#64748B] font-inter">Autonomous AI Workflow Processing Step-by-Step</p>
          </div>
        </div>

        {/* Global Progress Line */}
        <div className="w-full h-2 bg-[#EFF6FF] rounded-full overflow-hidden mt-4 relative border border-[#DBEAFE]">
          <motion.div
            className="h-full bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#22C55E]"
            initial={{ width: '10%' }}
            animate={{ width: `${((activeStep + 1) / agentsList.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Agents Sequential Pipeline Cards */}
      <div className="space-y-4 relative">
        {/* Animated Connecting Line */}
        <div className="absolute left-[35px] top-8 bottom-8 w-0.5 bg-[#E2E8F0] z-0">
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
              className={`relative z-10 p-4.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                isActive
                  ? 'bg-[#EFF6FF] border-[#2563EB] shadow-md shadow-blue-500/10 ring-2 ring-[#2563EB]/20 scale-[1.01]'
                  : isCompleted
                  ? 'bg-[#F0FDF4] border-[#22C55E]/40 opacity-95'
                  : 'bg-[#FFFFFF] border-[#E2E8F0] opacity-50'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* 36px Icon Container */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB] animate-pulse'
                      : isCompleted
                      ? 'bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]'
                      : 'bg-[#F8FBFF] border-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  <Icon className="w-[36px] h-[36px]" />
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
                  <p className="text-xs text-[#64748B] font-inter mt-0.5 font-medium">{agent.description}</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="shrink-0">
                {isCompleted ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-3.5 py-1.5 rounded-full border border-[#22C55E]/30">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
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
