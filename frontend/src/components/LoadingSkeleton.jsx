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
    color: '#3B82F6',
  },
  {
    id: 'summarizer',
    name: 'Summarizer Agent',
    description: 'Generating Beginner-Friendly Notes & Revision Bullet Points...',
    icon: FileText,
    color: '#06B6D4',
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
    color: '#10B981',
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
      <div className="glass-card rounded-3xl p-6 text-center space-y-3 border border-[#334155] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 animate-pulse"></div>
        <div className="relative z-10 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Bot className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div>
            <h3 className="font-poppins text-lg font-bold text-[#F8FAFC] tracking-tight">{text}</h3>
            <p className="text-xs text-[#94A3B8] font-inter">Executing 4 Microsoft AutoGen AI Agents synchronously</p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden mt-3 relative">
          <motion.div
            className="h-full bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#06B6D4]"
            initial={{ width: '5%' }}
            animate={{ width: `${((activeStep + 1) / agentsList.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Agents Sequential Pipeline Cards */}
      <div className="space-y-3 relative">
        {/* Animated Connecting Line */}
        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-[#334155] z-0">
          <motion.div
            className="w-full bg-gradient-to-b from-[#3B82F6] to-[#10B981]"
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
                  ? 'bg-[#1E293B] border-[#3B82F6] shadow-lg shadow-blue-500/20 ai-glow-shadow'
                  : isCompleted
                  ? 'bg-[#1E293B]/60 border-[#10B981]/40 opacity-90'
                  : 'glass-card border-[#334155]/60 opacity-40'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Icon Container */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    isActive
                      ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#00E5FF] animate-pulse'
                      : isCompleted
                      ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                      : 'bg-[#1E293B] border-[#334155] text-[#94A3B8]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Text Labels */}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-poppins text-sm font-bold text-[#F8FAFC]">{agent.name}</h4>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#3B82F6]/20 text-[#00E5FF] border border-[#3B82F6]/40 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-spin" /> Processing
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#94A3B8] font-inter mt-0.5">{agent.description}</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div>
                {isCompleted ? (
                  <div className="flex items-center gap-1 text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/30">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✔ Completed</span>
                  </div>
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-[#3B82F6] animate-spin" />
                ) : (
                  <span className="text-[11px] font-semibold text-[#94A3B8]">Pending</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
