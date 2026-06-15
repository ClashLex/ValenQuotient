import { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Home, 
  BarChart3, 
  MessageSquare, 
  HelpCircle
} from 'lucide-react';
import HeroSection from './components/HeroSection';
import { Sidebar } from './components/Sidebar';
import AdvisoryModal from './components/AdvisoryModal';
import LoadingSpinner from './components/LoadingSpinner';
import { CarbonCategory } from './types';
import { DEFAULT_CATEGORIES } from './constants/emissions';

const AboutSection = lazy(() => import('./components/AboutSection'));
const CollectionSection = lazy(() => import('./components/CollectionSection'));
const CTASection = lazy(() => import('./components/CTASection'));

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<CarbonCategory | null>(null);
  const [textureUrl, setTextureUrl] = useState<string>('');

  // Loaded categories and tracker values from localStorage if available
  const [categories, setCategories] = useState<CarbonCategory[]>(() => {
    const saved = localStorage.getItem('vq_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [trackerValues, setTrackerValues] = useState<Record<string, string | number>>(() => {
    const saved = localStorage.getItem('vq_tracker_values');
    return saved ? JSON.parse(saved) : {
      'eco-01': 15,
      'eco-02': 'vegetarian',
      'eco-03': 240
    };
  });

  useEffect(() => {
    localStorage.setItem('vq_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('vq_tracker_values', JSON.stringify(trackerValues));
  }, [trackerValues]);

  const addCustomCategory = (newCat: CarbonCategory) => {
    setCategories((prev) => [...prev, newCat]);
    setTrackerValues((prev) => ({
      ...prev,
      [newCat.id]: newCat.category === 'Diet' ? 'vegetarian' : 0,
    }));
  };

  const deleteCustomCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    setTrackerValues((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    if (selectedCategory?.id === id) {
      setSelectedCategory(null);
    }
  };

  const updateTrackerValue = (id: string, value: string | number) => {
    setTrackerValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };


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
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* =========================================================================
          2. MAIN CONTENT WINDOW AREA
          ========================================================================= */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative min-w-0">
        
        {/* Top Status Header Bar */}
        <header className="h-12 sm:h-14 border-b border-white/5 backdrop-blur-md bg-[#00041d]/85 flex items-center justify-between px-3 sm:px-5 shrink-0 z-20">
          
          {/* Logo Brand info */}
          <div className="flex items-center gap-2">
            <h1 className="font-grotesk text-sm sm:text-base tracking-widest uppercase text-cream font-bold leading-none">
              VALENQUOTIENT
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
        <main className="flex-grow overflow-hidden relative flex flex-col min-h-0 p-1 sm:p-3" role="main">
          <div className={`flex-grow rounded-xl border border-white/5 bg-[#010828]/40 flex flex-col min-h-0 ${
            activeSection === 'trackers' ? 'overflow-hidden' : 'overflow-y-auto'
          }`}>
            <div className={`${activeSection === 'trackers' ? 'h-full flex flex-col min-h-0' : 'min-h-full'} p-2 sm:p-3`}>
              <Suspense fallback={<LoadingSpinner />}>
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
                      categories={categories}
                      trackerValues={trackerValues}
                      onUpdateTrackerValue={updateTrackerValue}
                      onAddCategory={addCustomCategory}
                      onDeleteCategory={deleteCustomCategory}
                      onSelectNFT={setSelectedCategory}
                    />
                  </div>
                )}
                {activeSection === 'advisory' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <CTASection />
                  </div>
                )}
              </Suspense>
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
        <nav aria-label="Mobile Navigation" className="md:hidden border-t border-white/5 bg-[#00051e]/95 backdrop-blur-md flex justify-around items-stretch shrink-0 z-30 pb-safe" style={{ minHeight: '56px' }}>
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
      <AdvisoryModal
        categoryItem={selectedCategory}
        onClose={() => setSelectedCategory(null)}
        selectedValue={selectedCategory ? trackerValues[selectedCategory.id] : null}
      />
    </div>
  );
}
