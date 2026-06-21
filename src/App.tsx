import { useState, useEffect, lazy, Suspense } from 'react';
import {
  Home,
  BarChart3,
  MessageSquare,
  HelpCircle,
  UserCircle2,
  LogIn,
  LogOut,
} from 'lucide-react';
import HeroSection from './components/HeroSection';
import { Sidebar } from './components/Sidebar';
import AdvisoryModal from './components/AdvisoryModal';
import LoadingSpinner from './components/LoadingSpinner';
import AuthModal from './components/AuthPage';
import UserDashboard from './components/UserDashboard';
import { CarbonCategory } from './types';
import { DEFAULT_CATEGORIES } from './constants/emissions';
import { AuthProvider, useAuth } from './context/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const AboutSection = lazy(() => import('./components/AboutSection'));
const CollectionSection = lazy(() => import('./components/CollectionSection'));
const CTASection = lazy(() => import('./components/CTASection'));

// ─── Inner app ────────────────────────────────────────────────────────────────
function AppInner() {
  const { user, signOut } = useAuth();

  const [activeSection, setActiveSection] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<CarbonCategory | null>(null);
  const [textureUrl, setTextureUrl] = useState<string>('');
  const [dataReady, setDataReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Categories & tracker values — localStorage first, then overlay Firestore
  const [categories, setCategories] = useState<CarbonCategory[]>(() => {
    const saved = localStorage.getItem('vq_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [trackerValues, setTrackerValues] = useState<Record<string, string | number>>(() => {
    const saved = localStorage.getItem('vq_tracker_values');
    return saved
      ? JSON.parse(saved)
      : { 'eco-01': 15, 'eco-02': 'vegetarian', 'eco-03': 240 };
  });

  // ── Firestore hydration on login ──────────────────────────────────────────
  useEffect(() => {
    if (!user) { setDataReady(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'userData', user.uid));
        if (!cancelled && snap.exists()) {
          const data = snap.data();
          if (data.categories) setCategories(data.categories);
          if (data.trackerValues) setTrackerValues(data.trackerValues);
        }
      } catch (_) {
        // Fall back to localStorage silently
      } finally {
        if (!cancelled) setDataReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.uid]);

  // ── Sync categories ───────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('vq_categories', JSON.stringify(categories));
    if (user && dataReady) {
      setDoc(doc(db, 'userData', user.uid), { categories }, { merge: true }).catch(() => {});
    }
  }, [categories, user, dataReady]);

  // ── Sync trackerValues ────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('vq_tracker_values', JSON.stringify(trackerValues));
    if (user && dataReady) {
      setDoc(doc(db, 'userData', user.uid), { trackerValues }, { merge: true }).catch(() => {});
    }
  }, [trackerValues, user, dataReady]);

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
    setTrackerValues((prev) => ({ ...prev, [id]: value }));
  };

  // Generate glass noise texture
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
        data[i] = val; data[i + 1] = val; data[i + 2] = val; data[i + 3] = 30;
      }
      ctx.putImageData(imgData, 0, 0);
      setTextureUrl(canvas.toDataURL());
    }
  }, []);

  // Close auth modal when user logs in
  useEffect(() => {
    if (user) setShowAuthModal(false);
  }, [user]);

  const tabs = [
    { id: 'home', label: 'Dashboard', icon: Home, num: '01' },
    { id: 'analysis', label: 'Gap Matrix', icon: BarChart3, num: '02' },
    { id: 'trackers', label: 'CO₂ Trackers', icon: MessageSquare, num: '03' },
    { id: 'advisory', label: 'Eco Directive', icon: HelpCircle, num: '04' },
    { id: 'profile', label: 'Profile', icon: UserCircle2, num: '05' },
  ];

  // User initials for header
  const initials = (() => {
    const name = user?.displayName;
    const email = user?.email ?? '';
    if (name) {
      const parts = name.trim().split(' ');
      return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  })();

  return (
    <div className="relative h-dvh max-h-dvh w-full bg-[#010828] text-cream font-sans selection:bg-neon selection:text-[#010828] flex flex-col md:flex-row overflow-hidden select-none">

      {/* Background nebula effects */}
      <div className="absolute inset-0 bg-nebula pointer-events-none z-0 opacity-70" />

      {/* Grain Texture Overlay */}
      <div
        id="texture-grain"
        className="fixed inset-0 z-50 pointer-events-none mix-blend-lighten opacity-40 bg-repeat"
        style={{ backgroundImage: textureUrl ? `url(${textureUrl})` : 'none', backgroundSize: '128px 128px' }}
      />

      {/* Cyber Grid Lines */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* 1. SIDEBAR */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* 2. MAIN CONTENT */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative min-w-0">

        {/* Top Header */}
        <header className="h-12 sm:h-14 border-b border-white/5 backdrop-blur-md bg-[#00041d]/85 flex items-center justify-between px-3 sm:px-5 shrink-0 z-20">
          <div className="flex items-center gap-2">
            <h1 className="font-grotesk text-sm sm:text-base tracking-widest uppercase text-cream font-bold leading-none">
              VALENQUOTIENT
            </h1>
            <span className="hidden sm:inline-block font-mono text-[7px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded px-1.5 py-0.5 tracking-wider font-bold whitespace-nowrap">
              VERIFIED CARBON DATA
            </span>
          </div>

          {/* Right: Auth controls */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[8px] text-cream/40 uppercase tracking-widest mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              Live
            </span>

            {user ? (
              // Signed-in: avatar + sign out
              <>
                <button
                  id="header-user-avatar"
                  onClick={() => setActiveSection('profile')}
                  title={user.displayName || user.email || 'Profile'}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-neon/20 transition-all duration-200 cursor-pointer"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="user" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-neon/20 border border-neon/30 flex items-center justify-center font-grotesk text-[8px] text-neon font-bold">
                      {initials}
                    </div>
                  )}
                  <span className="hidden sm:block font-mono text-[9px] text-cream/60 max-w-[100px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>
                <button
                  id="header-signout-btn"
                  onClick={signOut}
                  title="Sign out"
                  className="flex items-center justify-center w-7 h-7 rounded-lg border border-white/8 text-cream/40 hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/5 transition-all duration-200 cursor-pointer"
                >
                  <LogOut size={13} />
                </button>
              </>
            ) : (
              // Guest: Sign In button
              <button
                id="header-signin-btn"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neon/30 bg-neon/5 text-neon hover:bg-neon/10 hover:border-neon/50 transition-all duration-200 font-mono text-[9px] uppercase tracking-widest cursor-pointer"
              >
                <LogIn size={12} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-grow overflow-hidden relative flex flex-col min-h-0 p-1 sm:p-3" role="main">
          <div className={`flex-grow rounded-xl border border-white/5 bg-[#010828]/40 flex flex-col min-h-0 ${
            activeSection === 'trackers' ? 'overflow-hidden' : 'overflow-y-auto'
          }`}>
            <div className={`${activeSection === 'trackers' ? 'h-full flex flex-col min-h-0' : 'min-h-full'} p-2 sm:p-3`}>
              <Suspense fallback={<LoadingSpinner />}>
                {activeSection === 'home' && (
                  <div className="animate-in fade-in zoom-in-98 duration-300">
                    <HeroSection
                      setActiveSection={setActiveSection}
                      categories={categories}
                      trackerValues={trackerValues}
                    />
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
                {activeSection === 'profile' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <UserDashboard
                      categories={categories}
                      trackerValues={trackerValues}
                      onOpenAuth={() => setShowAuthModal(true)}
                    />
                  </div>
                )}
              </Suspense>
            </div>
          </div>
        </main>

        {/* Footer - desktop only */}
        <footer className="hidden md:flex h-7 border-t border-white/5 bg-[#00041c] px-6 items-center justify-between text-cream/20 font-mono text-[7px] uppercase tracking-widest shrink-0 overflow-hidden">
          <span className="truncate">VERIFICATION SECURED BY GOLD STANDARD ACCREDITATION &amp; VOLUNTARY CARBON CONTRACTS</span>
          <span className="shrink-0 ml-4">EST. 2026 // PUBLIC INTEGRITY LEDGER</span>
        </footer>

        {/* 3. MOBILE BOTTOM NAV */}
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

      {/* Auth Modal (optional, non-blocking) */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

// ─── Root app wrapped in AuthProvider ────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
