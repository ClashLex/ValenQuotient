import { useState } from 'react';
import { Github, ChevronRight } from 'lucide-react';

export default function CTASection() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const socials = [
    { name: 'Github', icon: Github, href: 'https://github.com/ClashLex/ValenQuotient.git' },
  ];

  const faqs = [
    {
      q: "HOW ARE EMISSION CALCULATIONS DETERMINED?",
      a: "ALL EMISSION COEFFICIENTS RELY ON ACCREDITED IPCC (INTERGOVERNMENTAL PANEL ON CLIMATE CHANGE) AND OUR WORLD IN DATA CALCULATORS TO ENFORCE REALITY PARITY."
    },
    {
      q: "WHAT IS THE 30-DAY CHALLENGE?",
      a: "WE PREPARE GRADUAL DAILY GOALS DESIGNED TO SYSTEMATICALLY DECELERATE INDIVIDUAL HABITS BENEATH REGIONAL AVERAGES, REDUCING PERSONAL METRICS BY -15% WITHIN A MONTH."
    },
    {
      q: "HOW DOES OFFSET DECARBONIZATION WORK?",
      a: "FOR EMISSIONS YOU CANNOT YET ELIMINATE, EXTEND FUNDING TO SECURE GOLD STANDARD REFORESTATION OR VERRA SOLAR UTILITIES—COMPENSATING FOR INTENSITY DEFICITS."
    },
    {
      q: "IS MY DATA PRIVATE?",
      a: "YES. ALL CALCULATIONS HAPPEN LOCALLY IN YOUR BROWSER. NO PERSONAL DATA IS STORED OR TRANSMITTED TO EXTERNAL SERVERS. COMMUNITY METRICS ARE FULLY ANONYMIZED."
    }
  ];

  return (
    <section id="cta" className="relative w-full overflow-hidden rounded-2xl border border-white/5 bg-[#010828]/40 p-4 sm:p-6 md:p-8 text-cream select-none">
      
      {/* Background Poster */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-10 filter grayscale contrast-125 select-none pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1220&auto=format&fit=crop')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#010828]/95 via-[#010828]/70 to-[#010828]/95 z-10" />

      {/* Content */}
      <div className="relative w-full z-20 flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col gap-1">
          {/* Cursive accent — now inline, not absolute */}
          <span className="font-condiment text-[26px] sm:text-[34px] text-neon glow-text-neon -rotate-2 inline-block tracking-wider select-none leading-tight mb-1">
            Go greener
          </span>
          <span className="font-mono text-[9px] text-[#9cb4e5]/60 uppercase tracking-[0.3em] block">
            CARBON INTELLIGENCE ADVISORY
          </span>
          <h2 className="font-grotesk text-[22px] sm:text-[32px] md:text-[40px] uppercase leading-tight tracking-wide text-cream">
            <span className="block text-neon glow-text-neon">JOIN VALENQUOTIENT</span>
            REPAIR WHAT IS BROKEN.
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-wide leading-relaxed text-[#9cb4e5]/80 mt-2 max-w-md">
            We coordinate real-time carbon calculations with Gold Standard offsetting protocols, reducing personal footprints to reality parity.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Left: Social + accreditation */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/[0.02] hover:bg-neon hover:text-[#010828] border border-white/10 flex items-center justify-center text-cream transition-colors"
                  title={social.name}
                >
                  <social.icon size={14} />
                </a>
              ))}
            </div>
            <div className="text-[9px] font-mono text-[#9cb4e5]/40 uppercase tracking-widest">
              ACCREDITATION: CLIMATE.IO GS-VERRA • EST. 2026
            </div>

            {/* Quick stat pills */}
            <div className="grid grid-cols-2 gap-3 lg:hidden">
              {[
                { label: 'Global Avg CO₂', value: '4.7T', sub: 'Per capita / year' },
                { label: 'Target Reduction', value: '-15%', sub: '30-day challenge' },
              ].map((stat, i) => (
                <div key={i} className="liquid-glass rounded-xl p-3 border border-white/5">
                  <span className="font-mono text-[8px] text-[#9cb4e5]/60 uppercase block">{stat.label}</span>
                  <span className="font-grotesk text-xl text-neon block mt-0.5">{stat.value}</span>
                  <span className="font-mono text-[8px] text-cream/40 uppercase">{stat.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: FAQ Accordion */}
          <div className="liquid-glass rounded-2xl border border-white/5 bg-[#010828]/50 p-4 sm:p-5">
            <div className="mb-4">
              <span className="font-mono text-[8px] text-neon uppercase tracking-widest block">[ INTERACTIVE DIRECTIVES ]</span>
              <span className="font-grotesk text-base text-cream tracking-wider uppercase">EFFICACY NAVIGATION FAQ</span>
            </div>

            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border-b border-white/5 pb-2 last:border-0"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full text-left font-grotesk text-xs sm:text-sm tracking-wide flex justify-between items-start gap-3 text-cream hover:text-neon transition-colors py-1.5 cursor-pointer"
                  >
                    <span className="leading-snug">{faq.q}</span>
                    <ChevronRight
                      size={14}
                      className={`text-[#9cb4e5] transition-transform duration-300 shrink-0 mt-0.5 ${activeFaq === idx ? 'rotate-90 text-neon' : ''}`}
                    />
                  </button>
                  
                  {activeFaq === idx && (
                    <div className="mt-1.5 text-[10px] font-mono text-cream/70 uppercase tracking-wider leading-relaxed pr-4 animate-in slide-in-from-top-1 duration-200 pb-1">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <p className="font-mono text-[8px] text-neon/60 uppercase tracking-widest">
                VERIFIED PROTOCOL: IPCC-2026-SHA256-EMISSION-STABLE
              </p>
            </div>
          </div>

        </div>

        {/* Fine-print footer */}
        <div className="w-full border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[#9cb4e5]/30 text-[8px] font-mono tracking-widest">
          <span>© 2026 VALENQUOTIENT GLOBAL ADVISORY CO. ALL RIGHTS RESERVED</span>
          <span>STANDARDS ACCREDITATION: CLIMATE.IO GS-VERRA</span>
        </div>
      </div>
    </section>
  );
}
