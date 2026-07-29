import React from 'react';
import { motion } from 'framer-motion';
import { Award, Flame, Trophy, Network, BookOpen, Star, CheckCircle2 } from 'lucide-react';

const badgesList = [
  {
    id: 1,
    title: 'Study Streak',
    desc: 'Maintained active study streak',
    icon: Flame,
    unlocked: true,
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A'
  },
  {
    id: 2,
    title: 'Quiz Master',
    desc: 'Scored 80%+ on practice quiz',
    icon: Trophy,
    unlocked: true,
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#DBEAFE'
  },
  {
    id: 3,
    title: 'Mind Map Explorer',
    desc: 'Built interactive concept maps',
    icon: Network,
    unlocked: true,
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE'
  },
  {
    id: 4,
    title: 'AI Learner',
    desc: 'Created 5 easy-to-understand notes',
    icon: BookOpen,
    unlocked: true,
    color: '#15803D',
    bg: '#F0FDF4',
    border: '#86EFAC'
  },
  {
    id: 5,
    title: 'Weekly Champion',
    desc: 'Completed all planned sessions',
    icon: Star,
    unlocked: false,
    color: '#64748B',
    bg: '#F8FBFF',
    border: '#E2E8F0'
  }
];

export default function GamificationBadges() {
  return (
    <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] bg-[#FFFFFF] space-y-4 shadow-soft font-inter">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 font-poppins font-bold text-[#1E293B] text-base min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="min-w-0">
            <div className="truncate">Learning Achievements</div>
            <div className="text-[11px] text-[#64748B] font-normal truncate">Earn badges as you complete goals</div>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] text-[11px] font-inter font-bold shrink-0">
          4 of 5 Unlocked
        </span>
      </div>

      {/* Badges List */}
      <div className="space-y-2.5">
        {badgesList.map((b) => {
          const Icon = b.icon;
          return (
            <motion.div
              key={b.id}
              whileHover={{ x: 4 }}
              className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                b.unlocked ? 'shadow-xs' : 'opacity-60 grayscale'
              }`}
              style={{ backgroundColor: b.bg, borderColor: b.border }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 shadow-2xs"
                style={{ backgroundColor: `${b.color}20`, borderColor: b.border, color: b.color }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-poppins font-bold text-xs text-[#1E293B] truncate">{b.title}</div>
                <div className="text-[11px] text-[#64748B] font-medium leading-tight truncate">{b.desc}</div>
              </div>
              {b.unlocked ? (
                <CheckCircle2 className="w-4.5 h-4.5 text-[#22C55E] shrink-0" />
              ) : (
                <span className="text-[10px] text-[#64748B] font-bold shrink-0">Locked</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
