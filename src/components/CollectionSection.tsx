import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronRight, 
  Sparkles, 
  Plus, 
  Heart, 
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { CarbonCategory } from '../types';
import {
  DIET_EMISSION_SCORES,
} from '../constants/emissions';

interface CollectionSectionProps {
  categories: CarbonCategory[];
  trackerValues: Record<string, string | number>;
  onUpdateTrackerValue: (id: string, val: string | number) => void;
  onAddCategory: (cat: CarbonCategory) => void;
  onDeleteCategory: (id: string) => void;
  onSelectNFT: (nft: CarbonCategory) => void;
}


  const challenges = [
    { id: 'ch-01', title: 'WALK THE MILE TODAY', points: 30, cat: 'Transport', impact: 'Reduce travel emissions by walking commutes < 1.5 miles' },
    { id: 'ch-02', title: 'PLANT-BASED HIGH PERFORMANCE', points: 40, cat: 'Diet', impact: 'Swap all bovine ingredients for organic greens for entire day' },
    { id: 'ch-03', title: 'UNPLUG STANDBY TV HUBS', points: 20, cat: 'Energy', impact: 'Turn off entertainment system grids completely at outlet' },
    { id: 'ch-04', title: 'LAUNDRY AT COLD TEMPERATURES', points: 25, cat: 'Energy', impact: 'Set washing machine metrics to cold 30°C to bypass heaters' },
    { id: 'ch-05', title: 'PASSENGER CARPOOL INBOUND', points: 35, cat: 'Transport', impact: 'Rideshare to workplace nodes to split commuter metrics by 50%' }
  ];

export default function CollectionSection({
  categories,
  trackerValues,
  onUpdateTrackerValue,
  onAddCategory,
  onDeleteCategory,
  onSelectNFT,
}: CollectionSectionProps) {
  
  const [activeTabMode, setActiveTabMode] = useState<'chats' | 'status' | 'channels'>('chats');
  const [selectedChatId, setSelectedChatId] = useState<string>(() => {
    return categories[0]?.id || 'eco-01';
  });
  const [pledges, setPledges] = useState<string[]>(() => {
    const saved = localStorage.getItem('vq_pledges');
    return saved ? JSON.parse(saved) : [
      "I PLEDGE TO WALK TO MY LOCAL MARKETPLACE INSTEAD OF DRIVING ON WEEKENDS.",
      "SWAPPING ONE HAMBURGER PER WEEK WITH A ORGANIC LENTIL BOWL.",
      "REDUCING MY HEATING TEMPERATURE BY 2 DEGREES THROUGHOUT WINTER."
    ];
  });
  const [newPledge, setNewPledge] = useState("");
  const [offsetTons, setOffsetTons] = useState(1);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>(() => {
    const saved = localStorage.getItem('vq_completed_challenges');
    return saved ? JSON.parse(saved) : [];
  });
  const [mobShowThread, setMobShowThread] = useState<boolean>(false);

  // Custom Category Add Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newBaseRate, setNewBaseRate] = useState(0.1);
  const [newCatType, setNewCatType] = useState<'Transport' | 'Diet' | 'Energy' | 'Other'>('Other');

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('vq_pledges', JSON.stringify(pledges));
  }, [pledges]);

  useEffect(() => {
    localStorage.setItem('vq_completed_challenges', JSON.stringify(completedChallenges));
  }, [completedChallenges]);

  /**
   * Calculates carbon emissions in kg per day for a specific category.
   * @param {CarbonCategory} category - The carbon category tracker configuration.
   * @returns {string} The formatted carbon emission value in kg.
   */
  const getOutputCo2 = (category: CarbonCategory): string => {
    const val = trackerValues[category.id];
    if (category.category === 'Transport') return ((Number(val) || 0) * category.baseRate).toFixed(1);
    if (category.category === 'Diet') {
      const selection = (val || 'vegetarian') as 'vegan' | 'vegetarian' | 'meat';
      return DIET_EMISSION_SCORES[selection].toFixed(1);
    }
    if (category.category === 'Energy') return (((Number(val) || 0) / 30) * category.baseRate).toFixed(1);
    // Custom category calculations
    return ((Number(val) || 0) * category.baseRate).toFixed(1);
  };

  /**
   * Formats the unit display label for a carbon category.
   * @param {CarbonCategory} category - The carbon category tracker configuration.
   * @returns {string} Text combining the current value and unit.
   */
  const getUnitString = (category: CarbonCategory): string => {
    const val = trackerValues[category.id];
    if (category.category === 'Transport') return `${val ?? 0} ${category.unit}`;
    if (category.category === 'Diet') return (val ?? 'vegetarian').toString().toUpperCase();
    if (category.category === 'Energy') return `${val ?? 0} ${category.unit}`;
    return `${val ?? 0} ${category.unit}`;
  };

  // Memoize total daily carbon baseline computation
  const baseTotalCo2 = useMemo(() => {
    return categories.reduce((sum, cat) => {
      const val = trackerValues[cat.id];
      if (cat.category === 'Transport') return sum + (Number(val) || 0) * cat.baseRate;
      if (cat.category === 'Diet') {
        const selection = (val || 'vegetarian') as 'vegan' | 'vegetarian' | 'meat';
        return sum + DIET_EMISSION_SCORES[selection];
      }
      if (cat.category === 'Energy') return sum + ((Number(val) || 0) / 30) * cat.baseRate;
      // Custom category computation
      return sum + (Number(val) || 0) * cat.baseRate;
    }, 0);
  }, [categories, trackerValues]);

  // Memoize daily active reductions
  const activeReduction = useMemo(() => {
    return completedChallenges.reduce((acc, id) => {
      const ch = challenges.find(c => c.id === id);
      return ch ? acc + ch.points * 0.05 : acc;
    }, 0);
  }, [completedChallenges]);

  // Memoize purchased offsets volume
  const offsetReduction = useMemo(() => {
    return offsetTons * 2.73;
  }, [offsetTons]);

  // Memoize final carbon calculation
  const totalCo2 = useMemo(() => {
    const rawFinalCo2 = baseTotalCo2 - activeReduction - offsetReduction;
    return rawFinalCo2 > 0 ? rawFinalCo2.toFixed(1) : "0.0";
  }, [baseTotalCo2, activeReduction, offsetReduction]);

  /**
   * Sanitizes and adds a new green pledge to the community feed.
   */
  const handleAddPledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPledge.trim()) return;

    // Strip HTML elements to protect against basic XSS injection
    const sanitized = newPledge.replace(/<[^>]*>/g, '').trim();
    if (!sanitized) return;

    setPledges([sanitized.toUpperCase(), ...pledges]);
    setNewPledge("");
  };

  /**
   * Toggles completion status of a daily challenge item.
   */
  const toggleChallenge = (id: string) => {
    setCompletedChallenges(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const currentCategory = categories.find(c => c.id === selectedChatId) || categories[0];

  interface TabModeItem {
    id: 'chats' | 'status' | 'channels';
    label: string;
    fullLabel: string;
  }

  const tabModes: TabModeItem[] = [
    { id: 'chats', label: '💬 Calc', fullLabel: 'Calculators' },
    { id: 'status', label: '📊 Trend', fullLabel: 'Weekly Trend' },
    { id: 'channels', label: '🌿 Offsets', fullLabel: 'Offsets & Goals' },
  ];

  return (
    <section id="collection" className="relative w-full rounded-xl border border-white/5 bg-[#010828]/30 text-cream flex flex-col select-none h-full min-h-0 overflow-hidden">
      
      {/* Header Tabs Row */}
      <div className="w-full flex items-center bg-[#01041d]/80 border-b border-white/5 gap-2 px-3 py-2 shrink-0">
        {/* Tab Buttons */}
        <div className="flex gap-1 flex-1 min-w-0 overflow-x-auto no-scrollbar">
          {tabModes.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabMode(tab.id)}
              className={`px-2.5 py-1.5 rounded-lg text-left transition-all duration-300 whitespace-nowrap shrink-0 ${
                activeTabMode === tab.id
                  ? 'bg-neon/15 text-neon border border-neon/30 shadow-[0_0_8px_rgba(111,255,0,0.1)]'
                  : 'text-cream/50 hover:text-cream/80 border border-transparent'
              }`}
              aria-selected={activeTabMode === tab.id}
              role="tab"
            >
              <span className="font-grotesk text-[10px] sm:text-xs tracking-wider uppercase font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Live CO2 Pill */}
        <div className="flex items-center gap-1.5 bg-[#010828] border border-white/5 px-2.5 py-1.5 rounded-lg shrink-0">
          <div className="flex flex-col text-right">
            <span className="font-mono text-[7px] text-cream/40 uppercase leading-none">LIVE</span>
            <span className="font-grotesk text-xs text-neon font-bold leading-none">{totalCo2} KG</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-neon animate-pulse shadow-[0_0_6px_#6FFF00]" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden min-h-0">
        
        {/* CHATS MODE */}
        {activeTabMode === 'chats' && (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-12 overflow-hidden flex-grow">
            
            {/* List Pane */}
            <div className={`md:col-span-4 border-r border-white/5 flex flex-col h-full bg-[#00051e]/80 overflow-y-auto ${mobShowThread ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-3 border-b border-white/5 bg-[#00041a] flex justify-between items-center shrink-0">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#9cb4e5]/60">CO₂ ASSISTANTS</span>
                <span className="font-mono text-[8px] bg-neon/10 text-neon px-1.5 py-0.5 rounded">ONLINE</span>
              </div>

              <div className="flex-grow divide-y divide-white/5">
                {categories.map((cat) => {
                  const isActive = selectedChatId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => { setSelectedChatId(cat.id); setMobShowThread(true); }}
                      className={`w-full text-left p-3 flex items-center gap-3 transition-colors cursor-pointer relative group/item ${
                        isActive ? 'bg-white/5 border-l-2 border-neon' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full border border-white/10 overflow-hidden relative shrink-0">
                        <img 
                          src={cat.videoUrl} 
                          alt={`${cat.category} footprint icon`}
                          loading="lazy"
                          className="w-full h-full object-cover grayscale"
                          referrerPolicy="no-referrer"
                        />
                        <span className="w-2 h-2 absolute bottom-0 right-0 rounded-full bg-neon border-2 border-[#010828]" />
                      </div>
                      <div className="flex-grow overflow-hidden min-w-0 pr-6">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-grotesk text-[11px] uppercase tracking-wide text-cream truncate font-bold">
                            {cat.category === 'Transport' ? '🚗 Commute' : cat.category === 'Diet' ? '🥦 Diet' : cat.category === 'Energy' ? '⚡ Energy' : '🌿 Custom'}
                          </span>
                          <span className="font-mono text-[7px] text-[#9cb4e5]/40 shrink-0">LIVE</span>
                        </div>
                        <p className="font-mono text-[9px] text-[#9cb4e5]/60 truncate uppercase">
                          {cat.category === 'Transport' && `${trackerValues[cat.id] ?? 0} mi/day`}
                          {cat.category === 'Diet' && `Diet: ${trackerValues[cat.id] ?? 'vegetarian'}`}
                          {cat.category === 'Energy' && `${trackerValues[cat.id] ?? 0} kWh/mo`}
                          {cat.category === 'Other' && `${trackerValues[cat.id] ?? 0} ${cat.unit.toLowerCase()}`}
                        </p>
                        <span className="font-mono text-[8px] text-neon/80 uppercase">✓ {getOutputCo2(cat)} kg CO₂/day</span>
                      </div>
                      
                      {/* Delete icon for custom categories */}
                      {cat.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCategory(cat.id);
                            if (selectedChatId === cat.id) {
                              const remaining = categories.filter((c) => c.id !== cat.id);
                              setSelectedChatId(remaining[0]?.id || 'eco-01');
                            }
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded bg-black/40 border border-white/5 text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors opacity-0 group-hover/item:opacity-100 cursor-pointer z-30"
                          title="Delete Custom Tracker"
                          aria-label="Delete Custom Tracker"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Tracker Inline Section */}
              {!showAddForm ? (
                <div className="p-3 border-t border-white/5 bg-white/[0.01] shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-2 border border-dashed border-white/10 hover:border-neon hover:text-neon rounded-xl font-mono text-[9px] tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                  >
                    <Plus size={12} />
                    <span>+ Add Custom Tracker</span>
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newTitle.trim() || !newUnit.trim()) return;
                    const id = `custom-${Date.now()}`;
                    onAddCategory({
                      id,
                      title: newTitle.toUpperCase(),
                      impactScore: "7.5/10",
                      videoUrl: "/images/energy.webp",
                      description: `Track custom footprint impacts from ${newTitle.toLowerCase()} using real-time ${newUnit.toLowerCase()} inputs.`,
                      category: newCatType,
                      unit: newUnit,
                      baseRate: newBaseRate,
                      specs: [`Rate: ${newBaseRate} kg CO₂ / ${newUnit}`, `Type: User Dynamic Tracker`],
                      year: "2026",
                      isCustom: true
                    });
                    setNewTitle("");
                    setNewUnit("");
                    setNewBaseRate(0.1);
                    setNewCatType('Other');
                    setShowAddForm(false);
                    setSelectedChatId(id);
                  }}
                  className="p-3 border-t border-white/5 bg-[#00041a] space-y-2.5 animate-in slide-in-from-bottom-2 duration-300 shrink-0 text-left"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="font-mono text-[8px] text-neon uppercase font-bold">[ New Custom Tracker ]</span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-cream/50 hover:text-cream font-mono text-[9px] uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="custom-tracker-title" className="font-mono text-[8px] text-cream/40 uppercase block">Tracker Title</label>
                    <input
                      id="custom-tracker-title"
                      type="text" required maxLength={30}
                      value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="E.G. WASTE DISPOSAL"
                      className="w-full bg-[#010828] border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] font-mono text-cream outline-none focus:border-neon uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="custom-tracker-unit" className="font-mono text-[8px] text-cream/40 uppercase block">Unit Label</label>
                      <input
                        id="custom-tracker-unit"
                        type="text" required maxLength={15}
                        value={newUnit} onChange={(e) => setNewUnit(e.target.value)}
                        placeholder="E.G. LBS / WEEK"
                        className="w-full bg-[#010828] border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] font-mono text-cream outline-none focus:border-neon uppercase"
                      />
                    </div>
                    <div>
                      <label htmlFor="custom-tracker-rate" className="font-mono text-[8px] text-cream/40 uppercase block">CO₂ per Unit (kg)</label>
                      <input
                        id="custom-tracker-rate"
                        type="number" required step="0.001" min="0.001" max="1000"
                        value={newBaseRate} onChange={(e) => setNewBaseRate(Number(e.target.value))}
                        className="w-full bg-[#010828] border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] font-mono text-cream outline-none focus:border-neon"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-[8px] text-cream/40 uppercase block" id="category-group-label">Category Group</span>
                    <div className="grid grid-cols-4 gap-1 mt-1" role="group" aria-labelledby="category-group-label">
                      {(['Transport', 'Diet', 'Energy', 'Other'] as const).map((t) => (
                        <button
                          key={t} type="button"
                          onClick={() => setNewCatType(t)}
                          aria-pressed={newCatType === t}
                          className={`py-1.5 rounded-lg text-[7px] font-mono border transition-colors uppercase cursor-pointer ${
                            newCatType === t ? 'bg-neon border-neon text-[#010828] font-bold' : 'bg-[#010828] border-white/10 text-cream/60 hover:bg-white/5'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-neon hover:bg-neon/90 text-[#010828] text-[9px] font-grotesk tracking-widest uppercase rounded-xl transition-all font-bold cursor-pointer shadow-[0_0_8px_rgba(111,255,0,0.1)]"
                  >
                    Create Tracker
                  </button>
                </form>
              )}

              <div className="p-3 bg-white/[0.01] border-t border-white/5 shrink-0 text-left">
                <span className="font-mono text-[8px] text-neon uppercase block mb-1">Quick Tip</span>
                <p className="font-mono text-[9px] text-[#9cb4e5]/65 leading-relaxed uppercase">
                  Select a category above to update your carbon metrics.
                </p>
              </div>
            </div>

            {/* Thread Pane */}
            <div className={`md:col-span-8 flex flex-col h-full bg-[#010724]/30 overflow-hidden ${mobShowThread ? 'flex' : 'hidden md:flex'}`}>
              
              {/* Thread Header */}
              <div className="p-2.5 bg-[#00051d]/90 border-b border-white/5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 text-left min-w-0">
                  <button 
                    type="button"
                    onClick={() => setMobShowThread(false)} 
                    className="md:hidden p-1 rounded hover:bg-white/5 text-[#9cb4e5] hover:text-cream transition-colors cursor-pointer shrink-0"
                    title="Back to chats list"
                    aria-label="Back to chats list"
                  >
                    <ChevronRight className="rotate-180" size={16} aria-hidden="true" />
                  </button>
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-white/5 shrink-0">
                    <img src={currentCategory.videoUrl} alt={currentCategory.title} loading="lazy" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-grotesk text-[11px] font-bold uppercase tracking-wide block truncate">
                      {currentCategory.category === 'Transport' ? '🚗 Commute' : currentCategory.category === 'Diet' ? '🥦 Food & Diet' : currentCategory.category === 'Energy' ? '⚡ Home Utilities' : `🌿 ${currentCategory.title}`}
                    </span>
                    <span className="font-mono text-[8px] text-neon uppercase flex items-center gap-1 animate-pulse">
                      <span className="w-1 h-1 rounded-full bg-neon block shrink-0" />
                      ACTIVE • Impact: {currentCategory.impactScore}
                    </span>
                  </div>
                </div>
                <div className="text-[#9cb4e5]/60 shrink-0">
                  <MoreVertical size={14} />
                </div>
              </div>

              {/* Messages */}
              <div 
                className="flex-grow overflow-y-auto p-3 space-y-3"
                style={{ backgroundImage: `linear-gradient(rgba(1, 8, 40, 0.95), rgba(1, 8, 40, 0.9)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300&auto=format&fit=crop')` }}
              >
                
                {/* Bot message */}
                <div className="flex items-start gap-2 max-w-[90%]">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0 mt-1 font-mono text-[7px]">BOT</div>
                  <div className="bg-[#00041d]/90 border border-white/5 rounded-2xl rounded-tl-sm p-3">
                    <p className="font-mono text-[10px] text-cream/90 uppercase leading-relaxed text-left">
                      {currentCategory.category === 'Transport' && !currentCategory.isCustom && "Hi! I'm your Commute Assistant. Adjust the slider below to set how many miles you travel daily."}
                      {currentCategory.category === 'Diet' && !currentCategory.isCustom && "Hi! I'm your Diet Assistant. Select your eating style below to see its daily carbon impact."}
                      {currentCategory.category === 'Energy' && !currentCategory.isCustom && "Hi! I'm your Energy Assistant. Adjust the slider below to set your monthly electricity usage."}
                      {currentCategory.isCustom && `Hi! I'm your custom ${currentCategory.title.toLowerCase()} assistant. Adjust the slider below to set your daily ${currentCategory.unit.toLowerCase()} metrics.`}
                    </p>
                    <div className="font-mono text-[7px] text-cream/30 uppercase mt-1.5 text-right">Real-time</div>
                  </div>
                </div>

                {/* Calculator widget bubble */}
                <div className="flex items-start justify-end max-w-[95%] ml-auto text-left">
                  <div className="bg-neon/10 border border-neon/30 rounded-2xl rounded-tr-sm p-3 w-full">
                    <div className="flex justify-between items-center mb-2 border-b border-neon/20 pb-1.5">
                      <span className="font-mono text-[9px] text-[#9cb4e5] uppercase font-bold">[ ⚡ Calculator ]</span>
                      <span className="font-mono text-[9px] text-neon font-bold">{getUnitString(currentCategory)}</span>
                    </div>

                    {currentCategory.category === 'Transport' && !currentCategory.isCustom && (
                      <div className="space-y-1.5">
                        <label htmlFor="commute-slider" className="sr-only">Commute Miles per Day</label>
                        <input
                          id="commute-slider"
                          type="range" min="0" max="100" value={trackerValues[currentCategory.id] ?? 0}
                          onChange={(e) => {
                            onUpdateTrackerValue(currentCategory.id, Number(e.target.value));
                          }}
                          className="w-full accent-neon cursor-pointer h-1.5 bg-[#010828] border border-white/15 rounded-lg outline-none"
                        />
                        <div className="flex justify-between font-mono text-[8px] text-cream/40 uppercase">
                          <span>0</span><span>{trackerValues[currentCategory.id] ?? 0} MI</span><span>100</span>
                        </div>
                      </div>
                    )}

                    {currentCategory.category === 'Diet' && !currentCategory.isCustom && (
                      <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Diet selection">
                        {(['vegan', 'vegetarian', 'meat'] as const).map((mode) => {
                          const isActive = (trackerValues[currentCategory.id] ?? 'vegetarian') === mode;
                          return (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => onUpdateTrackerValue(currentCategory.id, mode)}
                              aria-pressed={isActive}
                              className={`py-2 rounded-xl text-[9px] font-mono border transition-all uppercase cursor-pointer ${
                                isActive
                                  ? 'bg-neon text-[#010828] border-neon font-bold'
                                  : 'bg-[#010828]/60 border-white/10 text-cream/60 hover:bg-white/10'
                              }`}
                            >
                              {mode}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {currentCategory.category === 'Energy' && !currentCategory.isCustom && (
                      <div className="space-y-1.5">
                        <label htmlFor="energy-slider" className="sr-only">Household Energy Monthly (kWh)</label>
                        <input
                          id="energy-slider"
                          type="range" min="10" max="600" step="10" value={trackerValues[currentCategory.id] ?? 0}
                          onChange={(e) => {
                            onUpdateTrackerValue(currentCategory.id, Number(e.target.value));
                          }}
                          className="w-full accent-neon cursor-pointer h-1.5 bg-[#010828] border border-white/15 rounded-lg outline-none"
                        />
                        <div className="flex justify-between font-mono text-[8px] text-cream/40 uppercase">
                          <span>10</span><span>{trackerValues[currentCategory.id] ?? 0} KWH</span><span>600</span>
                        </div>
                      </div>
                    )}

                    {(currentCategory.isCustom || currentCategory.category === 'Other') && (
                      <div className="space-y-1.5">
                        <label htmlFor="custom-slider" className="sr-only">{currentCategory.title}</label>
                        <input
                          id="custom-slider"
                          type="range" min="0" max="100" value={trackerValues[currentCategory.id] ?? 0}
                          onChange={(e) => {
                            onUpdateTrackerValue(currentCategory.id, Number(e.target.value));
                          }}
                          className="w-full accent-neon cursor-pointer h-1.5 bg-[#010828] border border-white/15 rounded-lg outline-none"
                        />
                        <div className="flex justify-between font-mono text-[8px] text-cream/40 uppercase">
                          <span>0</span><span>{trackerValues[currentCategory.id] ?? 0} {currentCategory.unit.toUpperCase()}</span><span>100</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="font-mono text-[8px] text-cream/40 uppercase font-bold">Daily Impact:</span>
                        <span className="font-grotesk text-sm text-neon font-bold">{getOutputCo2(currentCategory)} kg CO₂</span>
                      </div>
                      <span className="font-mono text-[8px] text-neon/90 uppercase font-bold">✓ Updated</span>
                    </div>

                    <button 
                      type="button"
                      onClick={() => onSelectNFT(currentCategory)}
                      className="mt-2.5 w-full py-2 bg-neon text-[#010828] hover:bg-neon/90 text-[10px] font-grotesk uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer font-bold shadow-[0_0_12px_rgba(111,255,0,0.2)]"
                    >
                      <Sparkles size={11} className="animate-pulse" />
                      <span>💡 Get AI Recommendations</span>
                    </button>
                  </div>
                </div>

                {/* Confirmation message */}
                <div className="flex items-start justify-end max-w-[80%] ml-auto">
                  <div className="bg-[#000523]/80 border border-white/5 rounded-2xl rounded-tr-sm p-2.5">
                    <p className="font-mono text-[9px] text-[#9cb4e5] uppercase leading-relaxed">
                      Metrics synced with Verra GS standards.
                    </p>
                    <div className="font-mono text-[7px] text-neon/80 uppercase mt-1 flex items-center justify-end gap-1 font-bold">
                      <span>SENT</span><span>✓✓</span>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-neon/10 border border-neon/20 flex items-center justify-center ml-2 shrink-0 font-mono text-[7px] text-neon font-bold">ME</div>
                </div>

              </div>

              {/* Pledge Input */}
              <form onSubmit={handleAddPledge} className="p-2.5 bg-[#00051e] border-t border-white/5 flex gap-2 shrink-0">
                <input 
                  type="text"
                  required
                  maxLength={100}
                  value={newPledge}
                  onChange={(e) => setNewPledge(e.target.value)}
                  placeholder="TYPE A GREEN PLEDGE & SEND..."
                  className="flex-1 bg-[#010828] border border-white/15 rounded-xl px-3 py-2 text-[10px] text-cream outline-none focus:border-neon font-mono uppercase min-w-0"
                />
                <button
                  type="submit"
                  className="bg-neon hover:bg-neon/90 text-[#010828] rounded-xl px-3 flex items-center justify-center hover:scale-105 active:scale-95 transition-all font-bold shrink-0"
                  title="Submit pledge"
                  aria-label="Submit pledge"
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </form>
            </div>

          </div>
        )}

        {/* STATUS MODE */}
        {activeTabMode === 'status' && (
          <div className="w-full h-full overflow-y-auto p-3 sm:p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              <div className="md:col-span-4 space-y-4 text-left">
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                  <span className="font-mono text-[8px] text-[#b724ff] uppercase tracking-widest block">[ TELEMETRY ]</span>
                  <p className="font-grotesk text-base text-cream uppercase mt-1">CARBON STATUS</p>
                  <p className="font-mono text-[10px] text-[#9cb4e5]/60 mt-2 uppercase leading-relaxed">
                    Simulated daily fluctuations based on lifestyle variables mapped against IPCC-2026 limits.
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-cream/55">TOTAL FOOTPRINT:</span>
                      <span className="text-cream font-bold">{baseTotalCo2.toFixed(1)} KG</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neon/80">REDUCTIONS SAVED:</span>
                      <span className="text-neon font-bold">-{activeReduction.toFixed(1)} KG</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#b724ff]">PURCHASED OFFSETS:</span>
                      <span className="text-[#b724ff] font-bold">-{offsetReduction.toFixed(1)} KG</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#00051e] border border-white/5 rounded-2xl p-4 text-xs font-mono text-[#9cb4e5]/80 uppercase">
                  <span className="text-neon block mb-1">✓ Tracker Active</span>
                  Habit changes directly reduce your daily carbon projection.
                </div>
              </div>

              <div className="md:col-span-8 flex flex-col justify-between bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                <div>
                  <span className="font-mono text-[9px] text-[#b724ff] uppercase tracking-widest block">Weekly Emissions Trend</span>
                  <div className="w-full h-40 select-none relative mt-3">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 150">
                      <defs>
                        <linearGradient id="glowMap" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6FFF00" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="#6FFF00" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="75" x2="600" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <text x="5" y="115" className="fill-cream/20 font-mono text-[8px] uppercase">Zero Carbon Baseline</text>
                      <circle cx="600" cy="50" r="3" fill="#6FFF00" />
                      {(() => {
                        const mappedY = Math.max(15, Math.min(135, 135 - (parseFloat(totalCo2) * 4.5)));
                        return (
                          <>
                            <path d={`M0,135 Q100,50 200,90 T400,30 T600,${mappedY} L600,135 Z`} fill="url(#glowMap)" />
                            <path d={`M0,135 Q100,50 200,90 T400,30 T600,${mappedY}`} fill="none" stroke="#6FFF00" strokeWidth="2.5" />
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
                <div className="flex justify-between items-center text-cream/40 font-mono text-[8px] uppercase tracking-widest mt-3">
                  <span>[ MON ]</span>
                  <span>[ WED ]</span>
                  <span>[ Projection ]</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* CHANNELS MODE */}
        {activeTabMode === 'channels' && (
          <div className="w-full h-full overflow-y-auto p-3 sm:p-5 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
              
              <div className="lg:col-span-7 bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                <span className="font-mono text-[9px] text-[#b724ff] uppercase tracking-widest block">[ Actions & Pledges ]</span>
                <span className="font-grotesk text-lg text-cream uppercase mt-1 block mb-4">Offset Your Emissions</span>
                
                <div className="space-y-3 bg-[#010828] border border-white/5 p-4 rounded-xl mb-4">
                  <div className="flex justify-between font-mono text-[10px] text-cream/55 uppercase">
                    <label htmlFor="offset-slider" className="mb-0">Offset Volume:</label>
                    <span className="text-neon">{offsetTons} Tons CO₂</span>
                  </div>
                  <input
                    id="offset-slider"
                    type="range" min="0" max="10" step="1" value={offsetTons}
                    onChange={(e) => setOffsetTons(Number(e.target.value))}
                    className="w-full accent-neon cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none"
                  />
                  <div className="flex justify-between items-center pt-1 font-mono text-[10px] uppercase">
                    <span>Reforestation: <strong className="text-cream">{offsetTons * 40} Saplings</strong></span>
                    <span>Value: <strong className="text-neon">${offsetTons * 15} USD</strong></span>
                  </div>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto no-scrollbar pr-1">
                  {challenges.slice(0, 3).map((ch) => {
                    const isCompleted = completedChallenges.includes(ch.id);
                    return (
                      <button 
                        key={ch.id} 
                        type="button"
                        onClick={() => toggleChallenge(ch.id)}
                        className={`w-full text-left p-2.5 rounded-xl border border-white/5 flex justify-between items-center cursor-pointer font-mono text-[10px] focus:outline-none focus:border-neon ${
                          isCompleted ? 'bg-neon/10 border-neon/30 text-cream' : 'bg-transparent text-cream/60 hover:border-white/15'
                        }`}
                        aria-pressed={isCompleted}
                      >
                        <span className="uppercase truncate pr-4">{ch.title}</span>
                        <span className="text-neon shrink-0">-{(ch.points * 0.05).toFixed(1)} KG</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5 bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                <span className="font-mono text-[9px] text-neon uppercase tracking-widest block">[ Activity Stream ]</span>
                <span className="font-grotesk text-base text-cream uppercase tracking-wide mt-1 block mb-4">Community Pledges</span>
                
                <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
                  {pledges.map((pl, idx) => (
                    <div key={idx} className="bg-[#010828] border border-white/5 rounded-xl p-3 flex gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-neon/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Heart size={10} className="text-neon" />
                      </div>
                      <p className="font-mono text-[9px] uppercase leading-relaxed text-cream/70">{pl}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
