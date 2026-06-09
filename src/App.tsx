import { useState, useEffect } from 'react';
import { 
  Home, 
  BarChart3, 
  MessageSquare, 
  HelpCircle, 
  Radio
} from 'lucide-react';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import CollectionSection from './components/CollectionSection';
import CTASection from './components/CTASection';
import NFTModal from './components/NFTModal';
import { CarbonCategory } from './types';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<CarbonCategory | null>(null);
  const [textureUrl, setTextureUrl] = useState<string>('');

  // Daily tracker state values to sync live across layouts
  const [commuteMiles, setCommuteMiles] = useState<number>(15);
  const [dietSelection, setDietSelection] = useState<'vegan' | 'vegetarian' | 'meat'>('vegetarian');
  const [energyKwh, setEnergyKwh] = useState<number>(240);

  // Generate ultra-premium background glass noise
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imgData = ctx.createImageData(128, 128);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 30;
      }
      ctx.putImageData(imgData, 0, 0);
      setTextureUrl(canvas.toDataURL());
    }
  }, []);

  const tabs = [
    { id: 'home', label: 'Dashboard', icon: Home, num: '01' },
    { id: 'analysis', label: 'Gap Matrix', icon: BarChart3, num: '02' },
    { id: 'trackers', label: 'CO₂ Trackers', icon: MessageSquare, num: '03' },
    { id: 'advisory', label: 'Eco Directive', icon: HelpCircle, num: '04' }
  ];

  return (
    <div className="relative h-dvh max-h-dvh w-full bg-[#010828] text-cream font-sans selection:bg-neon selection:text-[#010828] flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* Background static nebula effects */}
      <div className="absolute inset-0 bg-nebula pointer-events-none z-0 opacity-70" />
      
      {/* Grain Texture Overlay */}
      <div
        id="texture-grain"
        className="fixed inset-0 z-50 pointer-events-none mix-blend-lighten opacity-40 bg-repeat"
        style={{
          backgroundImage: textureUrl ? `url(${textureUrl})` : 'none',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Cyber Grid Lines */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* =========================================================================
          1. PERSISTENT LEFT SIDE NAVIGATION RAIL (Desktop mode)
          ========================================================================= */}
      <aside className="hidden md:flex flex-col w-[72px] lg:w-[84px] h-full bg-[#00041d] border-r border-white/5 py-5 justify-between items-center shrink-0 z-30 relative shadow-2xl">
        
        {/* Top App Avatar / Logo Badge */}
        <div className="flex flex-col items-center gap-1.5 focus:outline-none">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-neon to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-neon/10 hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-xl bg-[#010828] flex items-center justify-center font-bold font-grotesk text-neon text-sm">
              VQ
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-neon animate-pulse shadow-[0_0_8px_#6FFF00]" />
        </div>

        {/* Mid Navigation Tab Icons Stack */}
        <nav className="flex flex-col gap-4 w-full px-3">
          {tabs.map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 cursor-pointer relative group ${
                  isActive
                    ? 'bg-neon/10 border border-neon/30 text-neon shadow-[0_0_12px_rgba(111,255,0,0.15)]'
                    : 'text-[#9cb4e5]/70 hover:bg-white/5 hover:text-cream border border-transparent'
                }`}
                title={tab.label}
              >
                <tab.icon size={18} className={isActive ? 'scale-110 text-neon' : 'group-hover:scale-105 transition-transform'} />
                <span className="font-mono text-[7px] uppercase tracking-widest leading-none mt-0.5 scale-90">{isActive ? 'OPEN' : tab.num}</span>

                {/* Cyber Hover Tooltip */}
                <span className="absolute left-[80px] bg-[#00041d] border border-white/10 text-neon font-mono text-[8px] uppercase tracking-widest px-2.5 py-1 rounded shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-40">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Panel Status Indicators */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-1 font-mono text-[8.5px] text-[#9cb4e5]/40 uppercase tracking-widest">
            <Radio size={14} className="text-neon/50 animate-pulse" />
            <span>NODE</span>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. MAIN CONTENT WINDOW AREA
          ========================================================================= */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative min-w-0">
        
        {/* Top Status Header Bar */}
        <header className="h-12 sm:h-14 border-b border-white/5 backdrop-blur-md bg-[#00041d]/85 flex items-center justify-between px-3 sm:px-5 shrink-0 z-20">
          
          {/* Logo Brand info */}
          <div className="flex items-center gap-2">
            <h1 className="font-grotesk text-sm sm:text-base tracking-widest uppercase text-cream font-bold leading-none">
              VALENTQUOTIENT
            </h1>
            <span className="hidden sm:inline-block font-mono text-[7px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded px-1.5 py-0.5 tracking-wider font-bold whitespace-nowrap">
              VERIFIED CARBON DATA
            </span>
          </div>

          {/* Right sync status indicator */}
          <span className="inline-flex items-center gap-1.5 font-mono text-[8px] text-cream/40 uppercase tracking-widest whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="hidden sm:inline">Real-time Updates</span>
            <span className="sm:hidden">LIVE</span>
          </span>
        </header>

        {/* Global Active Screen Workspace */}
        <main className="flex-grow overflow-hidden relative flex flex-col min-h-0 p-1 sm:p-3">
          <div className={`flex-grow rounded-xl border border-white/5 bg-[#010828]/40 flex flex-col min-h-0 ${
            activeSection === 'trackers' ? 'overflow-hidden' : 'overflow-y-auto'
          }`}>
            <div className={`${activeSection === 'trackers' ? 'h-full flex flex-col min-h-0' : 'min-h-full'} p-2 sm:p-3`}>
              {activeSection === 'home' && (
                <div className="animate-in fade-in zoom-in-98 duration-300">
                  <HeroSection setActiveSection={setActiveSection} />
                </div>
              )}
              {activeSection === 'analysis' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <AboutSection setActiveSection={setActiveSection} />
                </div>
              )}
              {activeSection === 'trackers' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 h-full flex flex-col min-h-0">
                  <CollectionSection 
                    onSelectNFT={setSelectedCategory}
                    commuteMiles={commuteMiles}
                    setCommuteMiles={setCommuteMiles}
                    dietSelection={dietSelection}
                    setDietSelection={setDietSelection}
                    energyKwh={energyKwh}
                    setEnergyKwh={setEnergyKwh}
                  />
                </div>
              )}
              {activeSection === 'advisory' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <CTASection setActiveSection={setActiveSection} />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* System telemetry ticker info footer - desktop only */}
        <footer className="hidden md:flex h-7 border-t border-white/5 bg-[#00041c] px-6 items-center justify-between text-cream/20 font-mono text-[7px] uppercase tracking-widest shrink-0 overflow-hidden">
          <span className="truncate">VERIFICATION SECURED BY GOLD STANDARD ACCREDITATION &amp; VOLUNTARY CARBON CONTRACTS</span>
          <span className="shrink-0 ml-4">EST. 2026 // PUBLIC INTEGRITY LEDGER</span>
        </footer>

        {/* =========================================================================
            3. MOBILE STICKY BOTTOM TAB NAVIGATION BAR
            ========================================================================= */}
        <nav className="md:hidden border-t border-white/5 bg-[#00051e]/95 backdrop-blur-md flex justify-around items-stretch shrink-0 z-30 pb-safe" style={{ minHeight: '56px' }}>
          {tabs.map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex-1 py-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 cursor-pointer min-w-0 ${
                  isActive ? 'text-neon' : 'text-[#9cb4e5]/60 hover:text-cream'
                }`}
                aria-label={`Switch to ${tab.label}`}
              >
                <tab.icon size={20} className={isActive ? 'scale-110 stroke-[2.5px]' : ''} />
                <span className="font-mono text-[8px] uppercase tracking-wide leading-none truncate max-w-full px-1">
                  {tab.label.split(' ')[0]}
                </span>
                {isActive && <span className="w-1 h-1 rounded-full bg-neon mt-0.5" />}
              </button>
            );
          })}
        </nav>

      </div>

      {/* Dynamic Interaction Modals */}
      <NFTModal
        categoryItem={selectedCategory}
        onClose={() => setSelectedCategory(null)}
        commuteMiles={commuteMiles}
        dietSelection={dietSelection}
        energyKwh={energyKwh}
      />
    </div>
  );
}
