import { useMemo } from 'react';
import { Github, Award, Compass, BarChart3, Zap, Car, Leaf, Activity } from 'lucide-react';
import { CarbonCategory } from '../types';
import { calcDailyKg } from '../hooks/useFootprintHistory';
import { DIET_EMISSION_SCORES } from '../constants/emissions';

interface HeroSectionProps {
  setActiveSection: (sec: string) => void;
  categories: CarbonCategory[];
  trackerValues: Record<string, string | number>;
}

const GLOBAL_DAILY_KG = 4700 / 365; // ≈ 12.88 kg/day global average

/** Per-category daily kg for the mini breakdown bars */
function getCategoryDailyKg(cat: CarbonCategory, values: Record<string, string | number>): number {
  const val = values[cat.id];
  if (cat.category === 'Transport') return (Number(val) || 0) * cat.baseRate;
  if (cat.category === 'Diet') {
    const sel = (val || 'vegetarian') as keyof typeof DIET_EMISSION_SCORES;
    return DIET_EMISSION_SCORES[sel];
  }
  if (cat.category === 'Energy') return ((Number(val) || 0) / 30) * cat.baseRate;
  return (Number(val) || 0) * cat.baseRate;
}

const CATEGORY_META: Record<string, { icon: React.ElementType; color: string }> = {
  Transport: { icon: Car,      color: 'text-blue-400' },
  Diet:      { icon: Leaf,     color: 'text-emerald-400' },
  Energy:    { icon: Zap,      color: 'text-yellow-400' },
  Other:     { icon: Activity, color: 'text-[#b724ff]' },
};

export default function HeroSection({ setActiveSection, categories, trackerValues }: HeroSectionProps) {
  const socials = [
    { name: 'Github', icon: Github, href: 'https://github.com/ClashLex/ValenQuotient.git', label: 'ValenQuotient repository' },
  ];

  const highlights = [
    {
      title: 'GLOBAL CO₂ CAPITA',
      value: '4.7 TONNES',
      sub: 'ANNUAL MEAN PER CAPITA'
    },
    {
      title: 'TARGET COP30',
      value: '-15% REDUCTION',
      sub: '30-DAY MICRO CHALLENGE'
    },
    {
      title: 'PLATFORM',
      value: 'INTELLIGENT FUSION',
      sub: 'AI REDUCTIONS MODULE'
    }
  ];

  // Live daily carbon total
  const dailyKg = useMemo(
    () => calcDailyKg(categories, trackerValues),
    [categories, trackerValues],
  );
  const annualTonnes = (dailyKg * 365) / 1000;
  const vsAvgPct = ((dailyKg / GLOBAL_DAILY_KG) * 100).toFixed(0);
  const belowAvg = dailyKg < GLOBAL_DAILY_KG;

  // Per-category breakdown for mini-bars
  const breakdown = useMemo(
    () => categories.map(cat => ({
      cat,
      kg: getCategoryDailyKg(cat, trackerValues),
    })),
    [categories, trackerValues],
  );
  const maxKg = Math.max(...breakdown.map(b => b.kg), 1);

  return (
    <section id="home" className="relative w-full overflow-hidden rounded-2xl flex flex-col bg-[#010828]/40 select-none border border-white/5 p-4 sm:p-6 md:p-8">
      
      {/* Background Poster */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-10 filter grayscale contrast-125 select-none pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1220&auto=format&fit=crop')`
        }}
      />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(111,255,0,0.015)_0%,transparent_60%)] pointer-events-none" />

      {/* Hero Content */}
      <div className="relative w-full z-20 flex flex-col gap-5">
        
        {/* Title + Accent + Socials row */}
        <div className="w-full flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Accent cursive - inline above heading to avoid z-overflow */}
            <span className="font-condiment text-[22px] sm:text-[30px] md:text-[36px] text-neon glow-text-neon -rotate-2 inline-block mb-1 tracking-wide select-none leading-tight">
              ValenQuotient app
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-neon mb-2 block animate-pulse">
              [ BASELINE EMISSIONS SYSTEM ]
            </span>
            <h1 className="font-grotesk text-[22px] min-[360px]:text-[26px] sm:text-[40px] md:text-[48px] lg:text-[58px] text-cream uppercase leading-[1.05] tracking-normal select-none">
              SYSTEMIC CHANGE <br />
              MULTIPLIED BY ( YOUR ) <br />
              DAILY HABITS
            </h1>
          </div>          {/* Social icons - desktop only */}
          <div className="hidden md:flex gap-3 shrink-0 pt-2">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="liquid-glass w-[40px] h-[40px] rounded-xl flex items-center justify-center text-cream hover:text-neon hover:bg-white/10 transition-all duration-300 border border-white/5"
                title={social.label}
                aria-label={social.label}
              >
                <social.icon size={15} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* ─── LIVE CARBON FOOTPRINT SUMMARY CARD ──────────────────────────── */}
        <div className="w-full liquid-glass border border-white/8 rounded-2xl overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#00041a]/80 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse shadow-[0_0_6px_#6FFF00]" />
              <span className="font-mono text-[9px] text-neon uppercase tracking-widest">Live Carbon Footprint</span>
            </div>
            <span className="font-mono text-[7px] text-cream/30 uppercase tracking-widest">Updated in real-time</span>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left: Big number + vs-average */}
            <div className="flex flex-col gap-3">
              <div className="flex items-end gap-2 flex-wrap">
                <span className={`font-grotesk text-4xl sm:text-5xl font-bold leading-none ${belowAvg ? 'text-neon' : 'text-orange-400'}`}>
                  {dailyKg.toFixed(1)}
                </span>
                <div className="flex flex-col pb-1">
                  <span className="font-mono text-[9px] text-cream/50 uppercase">kg CO₂</span>
                  <span className="font-mono text-[9px] text-cream/50 uppercase">per day</span>
                </div>
              </div>

              {/* Gauge bar */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[8px] text-cream/40 uppercase">
                  <span>0 kg</span>
                  <span>Global avg: {GLOBAL_DAILY_KG.toFixed(1)} kg</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden relative">
                  {/* Global average marker */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-white/20 z-10"
                    style={{ left: '100%' }}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${belowAvg ? 'bg-neon' : 'bg-orange-400'}`}
                    style={{ width: `${Math.min(150, (dailyKg / GLOBAL_DAILY_KG) * 100).toFixed(1)}%` }}
                  />
                </div>
                <div className={`font-mono text-[9px] uppercase font-bold ${belowAvg ? 'text-neon' : 'text-orange-400'}`}>
                  {belowAvg
                    ? `✓ ${(GLOBAL_DAILY_KG - dailyKg).toFixed(1)} kg below global average (${vsAvgPct}%)`
                    : `⚠ ${(dailyKg - GLOBAL_DAILY_KG).toFixed(1)} kg above global average (${vsAvgPct}%)`}
                </div>
              </div>

              {/* Annual projection */}
              <div className="flex gap-3 flex-wrap">
                <div className="flex flex-col bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2">
                  <span className="font-mono text-[7px] text-cream/40 uppercase">Annual projection</span>
                  <span className={`font-grotesk text-lg font-bold ${belowAvg ? 'text-neon' : 'text-orange-400'}`}>
                    {annualTonnes.toFixed(2)}t
                  </span>
                </div>
                <div className="flex flex-col bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2">
                  <span className="font-mono text-[7px] text-cream/40 uppercase">Trackers active</span>
                  <span className="font-grotesk text-lg font-bold text-cream">{categories.length}</span>
                </div>
              </div>
            </div>

            {/* Right: Category mini-bar breakdown */}
            <div className="flex flex-col gap-2.5 justify-center">
              <span className="font-mono text-[8px] text-cream/40 uppercase tracking-widest">Breakdown by source</span>
              {breakdown.map(({ cat, kg }) => {
                const meta = CATEGORY_META[cat.category] ?? CATEGORY_META.Other;
                const Icon = meta.icon;
                const barPct = (kg / maxKg) * 100;
                return (
                  <div key={cat.id} className="flex items-center gap-2 min-w-0">
                    <Icon size={10} className={`${meta.color} shrink-0`} />
                    <span className="font-mono text-[8px] text-cream/50 uppercase w-16 shrink-0 truncate">
                      {cat.category === 'Transport' ? 'Commute' : cat.category === 'Diet' ? 'Diet' : cat.category === 'Energy' ? 'Energy' : cat.title.slice(0, 7)}
                    </span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${meta.color.replace('text-', 'bg-')}`}
                        style={{ width: `${barPct.toFixed(1)}%` }}
                      />
                    </div>
                    <span className={`font-mono text-[9px] shrink-0 font-bold ${meta.color}`}>{kg.toFixed(1)}</span>
                  </div>
                );
              })}
              <button
                onClick={() => setActiveSection('trackers')}
                className="mt-1 text-left font-mono text-[8px] text-neon uppercase tracking-wider hover:underline cursor-pointer"
              >
                → Adjust trackers
              </button>
            </div>
          </div>
        </div>
        {/* ─── END LIVE CARD ────────────────────────────────────────────────── */}

        {/* Highlights cards */}
        <div className="w-full grid grid-cols-3 gap-2 sm:gap-4">
          {highlights.map((item, idx) => (
            <div 
              key={idx} 
              className="liquid-glass bg-white/[0.01] border border-white/5 p-3 sm:p-4 rounded-xl flex flex-col justify-between hover:bg-white/[0.03] hover:border-white/15 transition-all duration-300 min-w-0"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[7px] sm:text-[8px] text-[#9cb4e5]/60 tracking-wider font-bold leading-tight truncate pr-1">
                  [{item.title}]
                </span>
                {idx === 0 ? (
                  <Compass size={11} className="text-neon shrink-0" aria-hidden="true" />
                ) : idx === 1 ? (
                  <Award size={11} className="text-[#b724ff] shrink-0" aria-hidden="true" />
                ) : (
                  <BarChart3 size={11} className="text-blue-400 shrink-0" aria-hidden="true" />
                )}
              </div>
              <div>
                <p className="font-grotesk text-sm sm:text-lg md:text-xl text-cream tracking-wide leading-tight">
                  {item.value}
                </p>
                <p className="font-mono text-[7px] uppercase tracking-widest text-[#9cb4e5]/40 mt-1 leading-tight">
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Carbon Footprint Definition Card */}
        <div className="w-full liquid-glass bg-white/[0.01] border border-white/5 p-4 sm:p-5 rounded-xl flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon animate-pulse shadow-[0_0_6px_#6FFF00]" />
            <span className="font-mono text-[9px] sm:text-[10px] text-neon uppercase tracking-widest">WHAT IS A CARBON FOOTPRINT?</span>
          </div>
          <p className="font-mono text-[10px] sm:text-xs text-[#9cb4e5]/90 uppercase leading-relaxed">
            A carbon footprint is the total volume of greenhouse gases—primarily carbon dioxide (CO₂)—released into the atmosphere by our activities. 
            Every choice we make, from the fuel in our commutes to the food on our plates and the electricity powering our lights, contributes to our personal ecological ledger.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1 pt-3 border-t border-white/5">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[8px] text-[#9cb4e5]/60">🚗 COMMUTE</span>
              <p className="font-grotesk text-xs sm:text-sm text-cream uppercase">Fossil fuel combustion</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[8px] text-[#9cb4e5]/60">🥦 DIET</span>
              <p className="font-grotesk text-xs sm:text-sm text-cream uppercase">Nutritional supply chains</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[8px] text-[#9cb4e5]/60">⚡ ENERGY</span>
              <p className="font-grotesk text-xs sm:text-sm text-cream uppercase">Electrical grid production</p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="font-mono text-[8px] text-neon uppercase tracking-widest block mb-1">LIVE SYSTEM DIRECTIVE</span>
            <p className="text-[10px] text-[#9cb4e5]/80 uppercase leading-relaxed font-mono">
              Synchronize commute, diet and grid data to see real-time carbon offsets.
            </p>
          </div>
          <button 
            onClick={() => setActiveSection('trackers')}
            className="shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-full font-grotesk text-[11px] text-[#010828] bg-cream hover:bg-neon transition-all duration-300 tracking-widest uppercase cursor-pointer"
          >
            ACTIVATE TRACKER
          </button>
        </div>

        {/* Mobile social row */}
        <div className="flex md:hidden justify-center items-center gap-3">
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="liquid-glass w-[40px] h-[40px] rounded-xl flex items-center justify-center text-cream hover:text-neon hover:bg-white/10 transition-all duration-300"
              title={social.label}
              aria-label={social.label}
            >
              <social.icon size={15} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
