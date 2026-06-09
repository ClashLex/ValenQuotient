import { Github, Award, Compass, BarChart3 } from 'lucide-react';

interface HeroSectionProps {
  setActiveSection: (sec: string) => void;
}

export default function HeroSection({ setActiveSection }: HeroSectionProps) {
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
          </div>

          {/* Social icons - desktop only */}
          <div className="hidden md:flex gap-3 shrink-0 pt-2">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="liquid-glass w-[40px] h-[40px] rounded-xl flex items-center justify-center text-cream hover:text-neon hover:bg-white/10 transition-all duration-300 border border-white/5"
                title={social.label}
              >
                <social.icon size={15} />
              </a>
            ))}
          </div>
        </div>

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
                  <Compass size={11} className="text-neon shrink-0" />
                ) : idx === 1 ? (
                  <Award size={11} className="text-[#b724ff] shrink-0" />
                ) : (
                  <BarChart3 size={11} className="text-blue-400 shrink-0" />
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
            >
              <social.icon size={15} />
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
