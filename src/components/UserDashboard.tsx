import { useState, useEffect } from 'react';
import {
  User,
  LogOut,
  Leaf,
  TrendingDown,
  Award,
  Zap,
  Globe,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Edit3,
  Save,
  X,
  LogIn,
  Shield,
  Cloud,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../firebase';
import { CarbonCategory } from '../types';

interface UserDashboardProps {
  categories: CarbonCategory[];
  trackerValues: Record<string, string | number>;
  onOpenAuth: () => void;
}

/** Derive initials from a display name or email */
function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return (email ?? 'EW').slice(0, 2).toUpperCase();
}

/** Calculate total CO₂ from tracker values */
function calcTotalCO2(categories: CarbonCategory[], values: Record<string, string | number>): number {
  let total = 0;
  for (const cat of categories) {
    const val = values[cat.id];
    if (cat.category === 'Diet') continue; // qualitative
    if (typeof val === 'number' && !isNaN(val)) {
      total += val * cat.baseRate;
    }
  }
  return total;
}

const GLOBAL_AVERAGE_KG = 4700; // kg CO₂ per year global mean

const BADGES = [
  { id: 'joined', icon: '🌱', label: 'Eco Pioneer', desc: 'Joined ValenQuotient', unlocked: true },
  { id: 'tracker', icon: '📊', label: 'Data Analyst', desc: 'Tracked 3+ categories', unlocked: true },
  { id: 'low', icon: '🏆', label: 'Climate Champion', desc: 'Below global average CO₂', unlocked: false },
  { id: 'streak', icon: '🔥', label: 'Streak Master', desc: 'Active 7 days in a row', unlocked: false },
];

/** Guest (not signed in) view */
function GuestView({ onOpenAuth }: { onOpenAuth: () => void }) {
  return (
    <section className="relative w-full rounded-2xl flex flex-col bg-[#010828]/40 border border-white/5 p-4 sm:p-6 gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-neon animate-pulse shadow-[0_0_6px_#6FFF00]" />
        <span className="font-mono text-[9px] sm:text-[10px] text-neon uppercase tracking-widest">Personal Dashboard</span>
      </div>

      {/* CTA Card */}
      <div className="liquid-glass rounded-2xl border border-white/8 p-6 sm:p-8 flex flex-col items-center gap-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon/20 to-emerald-500/10 border border-neon/20 flex items-center justify-center">
          <User size={28} className="text-neon/70" />
        </div>
        <div>
          <h2 className="font-grotesk text-xl text-cream uppercase tracking-wider mb-2">Sign In to Unlock</h2>
          <p className="font-mono text-[11px] text-cream/50 leading-relaxed max-w-sm">
            Create a free account to save your carbon data across devices, track your progress over time, and unlock achievements.
          </p>
        </div>

        <button
          id="guest-signin-btn"
          onClick={onOpenAuth}
          className="flex items-center gap-2 px-8 py-3 rounded-full bg-neon text-[#010828] font-grotesk text-[11px] uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-lg shadow-neon/20 cursor-pointer group"
        >
          <LogIn size={14} />
          <span>Sign In / Create Account</span>
        </button>

        <p className="font-mono text-[9px] text-cream/25">Free forever · No credit card required</p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Cloud, title: 'Cloud Sync', desc: 'Access your data on any device', color: 'text-blue-400' },
          { icon: BarChart3, title: 'Progress Tracking', desc: 'Monitor your CO₂ reduction over time', color: 'text-neon' },
          { icon: Shield, title: 'Secure & Private', desc: 'Encrypted with Firebase security', color: 'text-[#b724ff]' },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="liquid-glass border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:border-white/12 transition-all duration-300">
            <Icon size={20} className={color} />
            <span className="font-grotesk text-[11px] text-cream uppercase tracking-wide">{title}</span>
            <span className="font-mono text-[9px] text-cream/40 leading-relaxed">{desc}</span>
          </div>
        ))}
      </div>

      {/* Preview Achievements (locked) */}
      <div className="liquid-glass border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[9px] text-neon uppercase tracking-widest">Achievements Preview</span>
          <span className="font-mono text-[8px] text-cream/30">Sign in to earn</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGES.map(badge => (
            <div key={badge.id} className="rounded-xl border border-white/5 bg-white/[0.01] p-3 flex flex-col items-center gap-1.5 text-center opacity-40 grayscale">
              <span className="text-2xl">{badge.icon}</span>
              <span className="font-grotesk text-[9px] text-cream uppercase tracking-wider leading-tight">{badge.label}</span>
              <span className="font-mono text-[7px] text-cream/40 leading-tight">{badge.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


export default function UserDashboard({ categories, trackerValues, onOpenAuth }: UserDashboardProps) {
  const { user, signOut } = useAuth();
  if (!user) return <GuestView onOpenAuth={onOpenAuth} />;
  const [joinDate, setJoinDate] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName ?? '');
  const [savingName, setSavingName] = useState(false);

  const initials = getInitials(user?.displayName ?? null, user?.email ?? null);
  const totalCO2 = calcTotalCO2(categories, trackerValues);
  const globalAvg = GLOBAL_AVERAGE_KG;
  const pct = Math.min(100, Math.round((totalCO2 / globalAvg) * 100));
  const belowAverage = totalCO2 < globalAvg;
  const reduction = belowAverage ? Math.round(((globalAvg - totalCO2) / globalAvg) * 100) : 0;

  // Update 'Climate Champion' badge if below average
  const badges = BADGES.map(b =>
    b.id === 'low' ? { ...b, unlocked: belowAverage } : b
  );

  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setJoinDate(data.joinDate ?? null);
      }
    });
  }, [user?.uid]);

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return;
    setSavingName(true);
    try {
      await updateProfile(user, { displayName: newName.trim() });
      await updateDoc(doc(db, 'users', user.uid), { displayName: newName.trim() });
      setEditingName(false);
    } catch (_) {
      // silently fail
    } finally {
      setSavingName(false);
    }
  };

  const formattedJoin = joinDate
    ? new Date(joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  // Ring arc calculation
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <section id="profile" className="relative w-full rounded-2xl flex flex-col bg-[#010828]/40 select-none border border-white/5 p-4 sm:p-6 gap-5 overflow-y-auto">
      
      {/* Top Accent Header */}
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-neon animate-pulse shadow-[0_0_6px_#6FFF00]" />
        <span className="font-mono text-[9px] sm:text-[10px] text-neon uppercase tracking-widest">Personal Dashboard</span>
      </div>

      {/* User Profile Header Card */}
      <div className="liquid-glass rounded-2xl p-5 border border-white/8 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-neon/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon/20 to-emerald-500/10 border border-neon/20 flex items-center justify-center font-grotesk text-xl text-neon">
              {initials}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-neon border-2 border-[#010828] shadow-sm" title="Online" />
        </div>

        {/* Name + Email + Join */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            {editingName ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  id="edit-name-input"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="bg-white/5 border border-neon/30 rounded-lg px-3 py-1 font-grotesk text-sm text-cream focus:outline-none focus:border-neon/60 w-48"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                />
                <button onClick={handleSaveName} disabled={savingName} className="text-neon hover:text-white cursor-pointer">
                  <Save size={14} />
                </button>
                <button onClick={() => setEditingName(false)} className="text-cream/40 hover:text-cream cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-grotesk text-lg text-cream uppercase tracking-wider leading-tight">
                  {user?.displayName || 'Eco Warrior'}
                </h2>
                <button
                  id="edit-name-btn"
                  onClick={() => { setEditingName(true); setNewName(user?.displayName ?? ''); }}
                  className="text-cream/30 hover:text-neon transition-colors cursor-pointer"
                  title="Edit name"
                >
                  <Edit3 size={12} />
                </button>
              </>
            )}
          </div>
          <p className="font-mono text-[10px] text-cream/50 mt-0.5">{user?.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2">
            <Calendar size={10} className="text-neon/60" />
            <span className="font-mono text-[9px] text-cream/40 uppercase tracking-wider">Member since {formattedJoin}</span>
          </div>
        </div>

        {/* Sign Out */}
        <button
          id="signout-btn"
          onClick={signOut}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-cream/50 hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/5 transition-all duration-300 font-mono text-[9px] uppercase tracking-widest cursor-pointer"
          title="Sign out"
        >
          <LogOut size={12} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total CO₂',
            value: `${(totalCO2 / 1000).toFixed(2)}t`,
            sub: 'annual tracked',
            icon: Globe,
            color: belowAverage ? 'text-neon' : 'text-orange-400',
          },
          {
            label: 'vs. Global Avg',
            value: belowAverage ? `-${reduction}%` : `+${Math.abs(Math.round(((totalCO2 - globalAvg) / globalAvg) * 100))}%`,
            sub: '4.7t benchmark',
            icon: TrendingDown,
            color: belowAverage ? 'text-neon' : 'text-red-400',
          },
          {
            label: 'Active Trackers',
            value: `${categories.length}`,
            sub: `categories`,
            icon: Zap,
            color: 'text-blue-400',
          },
          {
            label: 'Badges Earned',
            value: `${badges.filter(b => b.unlocked).length}/${badges.length}`,
            sub: 'achievements',
            icon: Award,
            color: 'text-[#b724ff]',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="liquid-glass bg-white/[0.01] border border-white/5 p-3 sm:p-4 rounded-xl flex flex-col justify-between hover:border-white/12 transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[7px] sm:text-[8px] text-cream/50 tracking-wider uppercase">{stat.label}</span>
              <stat.icon size={11} className={stat.color} />
            </div>
            <p className={`font-grotesk text-base sm:text-lg ${stat.color} leading-tight`}>{stat.value}</p>
            <p className="font-mono text-[7px] text-cream/30 uppercase tracking-wider mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* CO₂ Ring Chart + Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Ring Chart */}
        <div className="liquid-glass border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-4">
          <span className="font-mono text-[9px] text-neon uppercase tracking-widest self-start">Carbon Score</span>
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              {/* Background track */}
              <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              {/* Progress arc */}
              <circle
                cx="60" cy="60" r={radius} fill="none"
                stroke={belowAverage ? '#6FFF00' : '#fb923c'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-grotesk text-2xl font-bold ${belowAverage ? 'text-neon' : 'text-orange-400'}`}>{pct}%</span>
              <span className="font-mono text-[8px] text-cream/40 uppercase">of avg</span>
            </div>
          </div>
          <div className="text-center">
            <p className="font-grotesk text-sm text-cream">{(totalCO2 / 1000).toFixed(2)}t CO₂ / year</p>
            <p className={`font-mono text-[9px] mt-0.5 ${belowAverage ? 'text-neon' : 'text-orange-400'}`}>
              {belowAverage ? `✓ ${reduction}% below global average` : '⚠ Above global average'}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="liquid-glass border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
          <span className="font-mono text-[9px] text-neon uppercase tracking-widest">Tracker Breakdown</span>
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-48 no-scrollbar">
            {categories.map(cat => {
              const val = trackerValues[cat.id];
              const kg = cat.category !== 'Diet' && typeof val === 'number' ? val * cat.baseRate : null;
              const barPct = kg !== null ? Math.min(100, (kg / (globalAvg / categories.length)) * 100) : null;
              return (
                <div key={cat.id} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] text-cream/60 truncate pr-2">{cat.title}</span>
                    <span className="font-mono text-[9px] text-cream/80 shrink-0">
                      {kg !== null ? `${kg.toFixed(0)} kg` : typeof val === 'string' ? val : '—'}
                    </span>
                  </div>
                  {barPct !== null && (
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-neon/60 transition-all duration-700"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="liquid-glass border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[9px] text-neon uppercase tracking-widest">Achievements</span>
          <span className="font-mono text-[8px] text-cream/30">{badges.filter(b => b.unlocked).length} / {badges.length} earned</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`rounded-xl border p-3 flex flex-col items-center gap-1.5 text-center transition-all duration-300 ${
                badge.unlocked
                  ? 'border-neon/20 bg-neon/[0.04] hover:bg-neon/[0.07]'
                  : 'border-white/5 bg-white/[0.01] opacity-40 grayscale'
              }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="font-grotesk text-[9px] text-cream uppercase tracking-wider leading-tight">{badge.label}</span>
              <span className="font-mono text-[7px] text-cream/40 leading-tight">{badge.desc}</span>
              {badge.unlocked && (
                <CheckCircle2 size={10} className="text-neon mt-0.5" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Prompts */}
      <div className="liquid-glass border border-white/5 rounded-2xl p-4">
        <span className="font-mono text-[9px] text-neon uppercase tracking-widest block mb-3">Quick Actions</span>
        <div className="flex flex-col gap-1.5">
          {[
            { label: 'View Carbon Gap Matrix', icon: '📊' },
            { label: 'Manage CO₂ Trackers', icon: '🎯' },
            { label: 'Get Eco Directive', icon: '🌿' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-neon/10 transition-all duration-200 group cursor-pointer">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{item.icon}</span>
                <span className="font-mono text-[10px] text-cream/70 group-hover:text-cream transition-colors uppercase tracking-wide">{item.label}</span>
              </div>
              <ChevronRight size={12} className="text-cream/30 group-hover:text-neon transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Attribution */}
      <div className="flex items-center gap-1.5 justify-center pt-1 pb-2">
        <Leaf size={9} className="text-neon/50" />
        <span className="font-mono text-[8px] text-cream/20 uppercase tracking-widest">ValenQuotient · Secured by Firebase</span>
        <User size={9} className="text-neon/50" />
      </div>
    </section>
  );
}
