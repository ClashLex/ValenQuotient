import { useState } from 'react';
import { Footprints, TrendingDown, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';

interface AboutSectionProps {
  setActiveSection: (sec: string) => void;
}

export default function AboutSection({ setActiveSection }: AboutSectionProps) {
  const [activeTab, setActiveTab] = useState<'gaps' | 'causes' | 'solution'>('gaps');

  const gaps = [
    {
      id: 'understand',
      title: '1. UNDERSTAND',
      status: 'AWARENESS DEFICIT',
      description: 'Most people do not know what a carbon footprint is or how their daily habits contribute to it.',
      stat: '78%',
      statLabel: 'CARBON LITERACY DEFICIT',
      color: '#6FFF00'
    },
    {
      id: 'track',
      title: '2. TRACK',
      status: 'FRAGMENTED LIFE DATA',
      description: 'There is no simple, unified way for individuals to monitor emissions across lifestyle categories.',
      stat: '0',
      statLabel: 'NO INTEGRATED TRACKERS',
      color: '#b724ff'
    },
    {
      id: 'reduce',
      title: '3. REDUCE',
      status: 'GENERIC RECOMMENDATIONS',
      description: 'Generic advice exists, but personalized, actionable steps based on individual data are rare.',
      stat: '-15%',
      statLabel: 'TARGET DECELERATION GAP',
      color: '#3b82f6'
    }
  ];

  const rootCauses = [
    {
      title: 'AWARENESS DEFICIT',
      desc: 'Climate data is buried in reports and academic papers, completely hidden from everyday consumers.'
    },
    {
      title: 'FRAGMENTED DATA',
      desc: "Carbon impact spans transports, diets, heating fuels, and grocery logs—rendered without a central accumulator."
    },
    {
      title: 'MOTIVATION VOID',
      desc: 'Users know they "should" reduce emissions but lack interactive feedback loops to make changes meaningful.'
    },
    {
      title: 'GENERIC RECTIFICATION',
      desc: 'Existing templates push identical tips to everyone, neglecting personal geolocation and daily habits.'
    }
  ];

  return (
    <section id="gallery" className="relative w-full overflow-hidden rounded-2xl border border-white/5 bg-[#010828]/40 p-4 sm:p-6 md:p-8 text-cream select-none">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-10 filter grayscale scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1220&auto=format&fit=crop')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#010828] via-[#010828]/90 to-[#010828] z-10" />

      <div className="relative w-full z-20 flex flex-col gap-6">
        
        {/* Section Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-neon uppercase tracking-[0.25em] mb-3">
              [ 🔍 PROBLEM STATEMENT ANALYSIS ]
            </span>
            {/* Heading — simplified to avoid overflow on mobile */}
            <h2 className="font-grotesk text-[22px] sm:text-[34px] md:text-[42px] lg:text-[54px] uppercase leading-none tracking-tight">
              WHY VALENQUOTIENT{' '}
              <span className="font-condiment text-[24px] sm:text-[40px] md:text-[48px] lg:text-[62px] text-neon leading-none normal-case glow-text-neon">
                Intercepts
              </span>{' '}
              <span className="text-cream">DECARBONIZATION</span>
            </h2>
          </div>

          {/* Tab selector — full width on mobile */}
          <div className="liquid-glass border border-white/5 bg-white/[0.01] rounded-xl p-1 flex gap-1 w-full sm:w-auto sm:self-start">
            {(['gaps', 'causes', 'solution'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 font-grotesk text-[10px] sm:text-xs tracking-widest uppercase rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-neon text-[#010828] font-medium'
                    : 'text-cream/60 hover:text-cream hover:bg-white/5'
                }`}
              >
                {tab === 'gaps' ? 'Gaps' : tab === 'causes' ? 'Causes' : 'Solution'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content 1: Interconnected Gaps */}
        {activeTab === 'gaps' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {gaps.map((gap, index) => (
              <div
                key={gap.id}
                className="liquid-glass rounded-2xl p-5 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all duration-300 relative group"
              >
                {/* Visual marker */}
                <div className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.02] border border-white/5 group-hover:border-neon/30 group-hover:text-neon transition-all">
                  {index === 0 ? <BookOpen size={13} /> : index === 1 ? <Footprints size={13} /> : <TrendingDown size={13} />}
                </div>

                <div className="pr-8">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#9cb4e5]/60 block">
                    {gap.status}
                  </span>
                  <h3 className="font-grotesk text-xl tracking-wider text-cream mt-2 group-hover:text-neon transition-colors">
                    {gap.title}
                  </h3>
                  <p className="font-mono text-[10px] uppercase tracking-wide leading-relaxed text-cream/60 mt-3">
                    {gap.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-white/5 flex items-baseline gap-3 mt-5">
                  <span 
                    className="font-grotesk text-[36px] leading-none"
                    style={{ textShadow: `0 0 10px ${gap.color}40`, color: gap.color }}
                  >
                    {gap.stat}
                  </span>
                  <div className="flex flex-col font-mono text-[8px] text-[#9cb4e5]/40 uppercase tracking-widest">
                    <span>INDEX LEVEL:</span>
                    <span className="text-cream/50 font-bold">{gap.statLabel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content 2: Root Causes */}
        {activeTab === 'causes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {rootCauses.map((cause, index) => (
              <div
                key={index}
                className="liquid-glass rounded-2xl p-5 border border-white/5 hover:bg-white/[0.02] transition-all"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-[#010828] border border-white/5 text-neon">
                    CAUSE 0{index + 1}
                  </span>
                  <AlertCircle size={14} className="text-cream/20" />
                </div>
                <h4 className="font-grotesk text-base sm:text-lg tracking-wider text-cream uppercase">
                  {cause.title}
                </h4>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#9cb4e5]/50 leading-relaxed mt-3">
                  {cause.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content 3: Proposed Solution */}
        {activeTab === 'solution' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Visual Flow diagram */}
            <div className="liquid-glass rounded-2xl p-5 sm:p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between bg-white/[0.01]">
              <span className="font-mono text-[10px] text-neon uppercase tracking-widest mb-4 block">
                [ VALENQUOTIENT LOGICAL CORE ENGINE ]
              </span>
              
              <div className="space-y-4 relative z-10 w-full">
                {[
                  { step: 'INPUT LAYER', details: 'DAILY COMMUTE HABITS • DIET • HOME KWH METRICS' },
                  { step: 'EMISSIONS ENGINE', details: 'CO₂ QUANTIFICATION VIA IPCC COEFFICIENT DATA' },
                  { step: 'AI DECISION MODULE', details: 'REDUCTION PLANS ADAPTED TO GEOLOCATION HABITS' },
                  { step: 'STREAKS & ACHIEVEMENTS', details: 'GOALS, MICRO-CHALLENGES, BADGE REWARDS' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-6 h-6 rounded-full bg-neon/10 border border-neon/30 text-neon font-mono text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </div>
                      {idx < 3 && <div className="w-px h-8 bg-white/10 my-1" />}
                    </div>
                    <div className="flex flex-col pt-0.5 min-w-0">
                      <span className="font-grotesk text-xs sm:text-sm text-cream tracking-widest leading-tight">{item.step}</span>
                      <span className="font-mono text-[9px] uppercase text-cream/40 tracking-wider mt-0.5 leading-relaxed">{item.details}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative */}
              <div className="absolute right-0 bottom-0 top-0 w-1/4 opacity-15 pointer-events-none hidden sm:block">
                <div className="absolute inset-y-0 right-8 w-px bg-neon/20" />
                <div className="absolute bottom-8 right-0 w-24 h-24 rounded-full border border-neon/10 animate-ping" />
              </div>
            </div>

            {/* Explanatory block */}
            <div className="flex flex-col justify-between gap-5">
              <div>
                <span className="font-mono text-[10px] text-[#b724ff] uppercase tracking-widest">PROPULSIVE REMEDIATION</span>
                <h3 className="font-grotesk text-xl sm:text-3xl text-cream tracking-wide uppercase mt-1 mb-4">
                  ValenQuotient — Carbon Intelligence Protocol
                </h3>
                <p className="font-mono text-[11px] uppercase tracking-wide leading-relaxed text-[#9cb4e5] mb-5">
                  A unified environmental tracking framework. Granular user profiling, instant calculations, and smart goals build accountability loops for a greener planetary balance.
                </p>

                <div className="space-y-3">
                  {[
                    'SIMPLE ONBOARDING IN < 2 SECONDS',
                    'GUILT-FREE FRAMING, MICRO WIN REWARDS',
                    'ANONYMIZED COMMUNITY LEDGER'
                  ].map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon shadow-[0_0_8px_#6FFF00] shrink-0" />
                      <span className="font-mono text-[10px] tracking-widest uppercase text-cream/80">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t border-white/5">
                <button 
                  onClick={() => setActiveSection('trackers')} 
                  className="inline-flex items-center gap-2 group text-neon font-grotesk text-xs tracking-widest uppercase cursor-pointer bg-transparent border-none outline-none"
                >
                  <span>CALCULATE Baseline Footprint</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
