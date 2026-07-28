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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 font-poppins font-bold text-[#1E293B] text-base">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center">
            <Award className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <div>Learning Achievements</div>
            <div className="text-[11px] text-[#64748B] font-normal">Earn badges as you complete study goals</div>
          </div>
        </div>
        <span className="text-xs font-inter font-bold text-[#2563EB]">4 of 5 Unlocked</span>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {badgesList.map((b) => {
          const Icon = b.icon;
          return (
            <motion.div
              key={b.id}
              whileHover={{ y: -4 }}
              className={`p-3.5 rounded-2xl border text-center space-y-2 relative transition-all ${
                b.unlocked ? 'shadow-xs' : 'opacity-60 grayscale'
              }`}
              style={{ backgroundColor: b.bg, borderColor: b.border }}
            >
              {b.unlocked && (
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] absolute top-2 right-2" />
              )}
              <div
                className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center border shadow-2xs"
                style={{ backgroundColor: `${b.color}20`, borderColor: b.border, color: b.color }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-poppins font-bold text-xs text-[#1E293B]">{b.title}</div>
                <div className="text-[10px] text-[#64748B] font-medium leading-tight mt-0.5">{b.desc}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
