import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Award, 
  Zap, 
  Target, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle, 
  Lock, 
  Sparkles,
  TrendingUp,
  Star
} from 'lucide-react';
import { gamificationAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const ICON_MAP = {
  Award: Award,
  Flame: Flame,
  Zap: Zap,
  Target: Target,
  ShieldCheck: ShieldCheck,
  BookOpen: BookOpen
};

export default function Achievements() {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await gamificationAPI.getOverview();
      setData(res.data);
    } catch (e) {
      addToast('Failed to load achievement milestones.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div 
        className="rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-lg border border-blue-400/20"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #0EA5E9 100%)' }}
      >
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-white">
            <Flame className="w-3.5 h-3.5" />
            Learning Streaks & Motivation Engine
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight font-poppins text-white">
            Celebrate Genuine Learning Milestones
          </h1>
          <p className="text-blue-100 text-sm lg:text-base leading-relaxed">
            Streaks and XP are earned through real academic work: completed diagnostic quizzes, spaced revisions, syllabus study blocks, and focused sessions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium animate-pulse">
          Calculating active streaks, XP awards, and verified badges...
        </div>
      ) : (
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-xs h-full flex items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800">{data?.streak_count || 1} Days</div>
                  <div className="text-xs font-semibold text-slate-500">Current Daily Streak</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-purple-200/60 shadow-xs h-full flex items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800">{data?.longest_streak || 1} Days</div>
                  <div className="text-xs font-semibold text-slate-500">Longest Streak</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-blue-200/60 shadow-xs h-full flex items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800">{data?.xp_points || 100} XP</div>
                  <div className="text-xs font-semibold text-slate-500">Earned Knowledge XP</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200/60 shadow-xs h-full flex items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800">
                    {data?.total_badges_unlocked || 0}/{data?.total_available_badges || 6}
                  </div>
                  <div className="text-xs font-semibold text-slate-500">Badges Unlocked</div>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">Academic Level</span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Level {data?.student_level || 1} Scholar
                </h3>
              </div>
              <div className="text-right text-xs font-bold text-slate-500">
                {data?.xp_points} / {data?.next_level_xp} XP to Level {(data?.student_level || 1) + 1}
              </div>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${data?.level_progress_percentage || 20}%` }}
              />
            </div>
          </div>

          {/* Badges Grid */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              Verified Achievement Badges
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5 items-stretch">
              {data?.badges?.map((b) => {
                const IconComponent = ICON_MAP[b.icon] || Award;
                return (
                  <div
                    key={b.badge_id}
                    className={`p-5 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                      b.unlocked
                        ? 'border-blue-200 bg-gradient-to-br from-white to-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-xl ${
                          b.unlocked ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 text-slate-400'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        {b.unlocked ? (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Unlocked
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="font-extrabold text-sm text-slate-900">{b.title}</div>
                        <p className="text-xs text-slate-500 leading-relaxed">{b.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-600">+{b.xp} XP</span>
                      {b.earned_at && (
                        <span className="text-[10px] text-slate-400 font-semibold">Earned: {b.earned_at}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
