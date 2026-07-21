import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

export default function LoadingSkeleton({ text = "Multi-Agent System Processing..." }) {
  return (
    <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col items-center justify-center space-y-4 max-w-md mx-auto text-center my-12">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-purple to-brand-cyan flex items-center justify-center animate-pulse">
          <Bot className="w-8 h-8 text-white animate-bounce" />
        </div>
        <Sparkles className="w-5 h-5 text-brand-cyan absolute -top-1 -right-1 animate-spin" />
      </div>

      <div className="space-y-1">
        <h4 className="text-base font-bold text-slate-100">{text}</h4>
        <p className="text-xs text-slate-400">Researching concepts, structuring notes, and calibrating questions...</p>
      </div>

      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand-600 via-brand-purple to-brand-cyan animate-pulse"></div>
      </div>
    </div>
  );
}
