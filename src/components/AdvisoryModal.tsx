import { useState, useEffect } from 'react';
import { X, ShieldCheck, RotateCcw, Check, Sparkles, Footprints } from 'lucide-react';
import { CarbonCategory } from '../types';
import {
  TRANSPORT_BASE_RATE,
  DIET_EMISSION_SCORES,
  ENERGY_BASE_RATE,
} from '../constants/emissions';

interface AdvisoryModalProps {
  categoryItem: CarbonCategory | null;
  onClose: () => void;
  selectedValue: string | number | null;
}

type DiagnosticStep = 'idle' | 'analyzing' | 'calculating' | 'personalizing' | 'success';

interface DynamicTip {
  title: string;
  tip: string;
}

/**
 * AdvisoryModal component presenting detailed AI carbon footprints and personalized action directives.
 * Replaces the template NFTModal. Supports real-time diagnostics, keyboard accessibility, and screen reader announcements.
 */
export default function AdvisoryModal({
  categoryItem,
  onClose,
  selectedValue,
}: AdvisoryModalProps) {
  const [step, setStep] = useState<DiagnosticStep>('idle');
  const [progress, setProgress] = useState(0);
  const [runTrigger, setRunTrigger] = useState(0);

  // Automatically start the diagnostic calculation when opened!
  useEffect(() => {
    if (!categoryItem) {
      setStep('idle');
      setProgress(0);
      return;
    }

    setStep('analyzing');
    setProgress(5);

    const steps: { step: DiagnosticStep; start: number; end: number; delay: number }[] = [
      { step: 'analyzing', start: 5, end: 30, delay: 400 },
      { step: 'calculating', start: 30, end: 65, delay: 500 },
      { step: 'personalizing', start: 65, end: 90, delay: 500 },
      { step: 'success', start: 90, end: 100, delay: 300 },
    ];

    let isMounted = true;
    let currentIdx = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const runSim = () => {
      if (!isMounted || currentIdx >= steps.length) return;
      const current = steps[currentIdx];
      setStep(current.step);
      let p = current.start;

      const stepsCount = (current.end - current.start) / 5;
      const stepDelay = current.delay / stepsCount;

      intervalId = setInterval(() => {
        if (!isMounted) {
          if (intervalId) clearInterval(intervalId);
          return;
        }
        p += 5;
        if (p >= current.end) {
          if (intervalId) clearInterval(intervalId);
          currentIdx++;
          if (currentIdx < steps.length) {
            runSim();
          } else {
            setStep('success');
            setProgress(100);
          }
        } else {
          setProgress(p);
        }
      }, stepDelay);
    };

    runSim();

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [categoryItem, runTrigger]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (categoryItem) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [categoryItem, onClose]);

  if (!categoryItem) return null;

  /**
   * Computes the daily carbon emission score based on category and habit parameters.
   * Uses values from IPCC-accredited emissions constants.
   * @returns {string} Structured numeric text representing kg CO2 per day.
   */
  const calculateResult = (): string => {
    if (categoryItem.category === 'Transport') {
      const commuteMiles = Number(selectedValue) || 0;
      return (commuteMiles * TRANSPORT_BASE_RATE).toFixed(1);
    }
    if (categoryItem.category === 'Diet') {
      const selection = (selectedValue || 'vegetarian') as 'vegan' | 'vegetarian' | 'meat';
      return DIET_EMISSION_SCORES[selection].toFixed(1);
    }
    if (categoryItem.category === 'Energy') {
      const energyKwh = Number(selectedValue) || 0;
      return ((energyKwh / 30) * ENERGY_BASE_RATE).toFixed(1);
    }
    // Custom category calculations
    const val = Number(selectedValue) || 0;
    return (val * categoryItem.baseRate).toFixed(1);
  };

  /**
   * Resolves personalized action items tailored to the user's current carbon inputs.
   * @returns {DynamicTip[]} Array of title & description items for optimization.
   */
  const getDynamicTips = (): DynamicTip[] => {
    if (categoryItem.category === 'Transport') {
      const commuteMiles = Number(selectedValue) || 0;
      if (commuteMiles > 40) {
        return [
          {
            title: 'TRANSIT CONGRUENCE',
            tip: 'High commuting miles detected. Transitioning just 20% of trips to electric light rail cuts emission intensity by up to 86%.',
          },
          {
            title: 'VEHICLE DECARBONIZATION',
            tip: 'Maintaining accurate tire pressure and driving under 65 mph yields up to 7% combustion fuel optimization.',
          },
          {
            title: 'COMPRESSION PLAN',
            tip: 'Negotiate remote workspace protocols for at least one day per week, shrinking your travel footprint by 20%.',
          },
        ];
      } else if (commuteMiles > 15) {
        return [
          {
            title: 'CARPOOL RE-ROUTING',
            tip: 'Utilize high-occupancy transit (HOV) channels. Ridesharing splits the carbon cost of urban commutes.',
          },
          {
            title: 'MICRO-MOBILITY TRANSIT',
            tip: 'Swap short commutes (< 3 miles) with e-scooters or electric micro-mobility to bypass stop-and-go fuel penalties.',
          },
          {
            title: 'TIRE FRICTION OFFSET',
            tip: 'Using high-mileage energy efficient tires decreases total emissions by 3% MoM.',
          },
        ];
      } else {
        return [
          {
            title: 'ZERO EMISSION HABIT',
            tip: 'Your commute is beautifully compact. Prioritize human power (walking, bicycling) to achieve zero carbon commute scores.',
          },
          {
            title: 'AUTO IDLE INTERCEPT',
            tip: 'Turn off combustion engines for stopping intervals longer than 10 seconds to bypass unnecessary exhaust emissions.',
          },
          {
            title: 'ELECTRIC VEHICLE TRIAL',
            tip: 'Your short range makes EV options highly practical, rendering high charging efficiency on standard grid rates.',
          },
        ];
      }
    }

    if (categoryItem.category === 'Diet') {
      const dietSelection = (selectedValue || 'vegetarian') as 'vegan' | 'vegetarian' | 'meat';
      if (dietSelection === 'meat') {
        return [
          {
            title: 'PLANT-BASED TRANSITION',
            tip: 'Transitioning just two main courses per week to plant ingredients reduces dietary emissions by more than 40%.',
          },
          {
            title: 'RED MEAT REDUCTION',
            tip: 'Substituting beef and lamb with poultry drops the nutritional emission scale by a massive 5x factor immediately.',
          },
          {
            title: 'ORGANIC FOOD AUDITS',
            tip: 'Purchase locally grown, in-season assets to minimize emissions tied to maritime food transportation channels.',
          },
        ];
      } else if (dietSelection === 'vegetarian') {
        return [
          {
            title: 'DAIRY LOAD ADJUSTMENT',
            tip: 'High consumption of cheese and butter indexes close to high carbon ranges. Swap with organic oat or almond fats.',
          },
          {
            title: 'COMPOSTING PROTOCOL',
            tip: 'Organize food scraps for local soil compost systems. Decomposing green waste in oxygenated composting cuts methane to zero.',
          },
          {
            title: 'BULK PURCHASE SYSTEMS',
            tip: 'Choose dry storage ingredients (beans, rice, lentils) in bulk sizes, lowering packaging-related footprint by 24%.',
          },
        ];
      } else {
        return [
          {
            title: 'NUTRITIONAL OPTIMIZATION',
            tip: 'Exceptional low-footprint diet index! You are operating at peak dietary efficiency (> 80% below standard averages).',
          },
          {
            title: 'TERRAIN DISTANCE MILES',
            tip: 'Enhance your vegan score by purchasing food exclusively sourced within a 50-mile radius for absolute zero transport emissions.',
          },
          {
            title: 'LOW IMPACT PACKAGING',
            tip: 'Refuse single-use plastics during groceries to keep upstream manufacturing carbon off your household ledger.',
          },
        ];
      }
    }

    if (categoryItem.category === 'Energy') {
      const energyKwh = Number(selectedValue) || 0;
      if (energyKwh > 300) {
        return [
          {
            title: 'SMART THERMOSTAT TUNING',
            tip: 'Lowering household climate systems by just 2°F during winter cuts heat consumption ratios by up to 10% annually.',
          },
          {
            title: 'LED APPLIANCE OVERHAUL',
            tip: 'Swap to high-efficiency LEDs to save up to 75% on daily room illumination draw vs incandescent bulbs.',
          },
          {
            title: 'STANDBY DRAIN INTERCEPT',
            tip: 'Vampire energy draw from plugged entertainment hubs accounts for 10% of electric bills. Use smart switches to kill idle load.',
          },
        ];
      } else {
        return [
          {
            title: 'ENERGY CONSERVATION METER',
            tip: 'Your electricity budget is incredibly tight. Continue using energy efficient cooling configurations to keep indices lean.',
          },
          {
            title: 'RENEWABLE SUBSCRIPTION',
            tip: 'Subscribe to residential community solar programs, matching your electrical load directly with regional solar generation grids.',
          },
          {
            title: 'COLD TEMPERATURE WASHES',
            tip: "Perform laundry wash cycles at 30°C/Cold. Heating water draws up to 90% of a washing machine's absolute power capacity.",
          },
        ];
      }
    }

    // Default custom category tips
    const baseVal = Number(selectedValue) || 0;
    const reducedVal = (baseVal * 0.8).toFixed(1);
    const co2SavedAnnually = (baseVal * categoryItem.baseRate * 0.2 * 365).toFixed(0);
    return [
      {
        title: 'EFFICIENCY TARGET',
        tip: `Aim to reduce your daily ${categoryItem.title.toLowerCase()} from ${baseVal} to ${reducedVal} ${categoryItem.unit.toLowerCase()} (a 20% drop) to eliminate up to ${co2SavedAnnually} kg CO₂ annually.`,
      },
      {
        title: 'BASELINE AUDIT',
        tip: `Analyze the lifecycle inputs of your custom ${categoryItem.title.toLowerCase()} footprint to identify alternative low-emission routes.`,
      },
      {
        title: 'HABIT REDUCTIONS',
        tip: `Ensure corresponding active challenges are completed weekly to compensate for remaining ${categoryItem.title.toLowerCase()} loads.`,
      },
    ];
  };

  /**
   * Resolves textual description for each phase of the diagnostic loop.
   */
  const getStepText = (): string => {
    switch (step) {
      case 'analyzing':
        return 'Analyzing your daily habits...';
      case 'calculating':
        return 'Calculating footprint metrics...';
      case 'personalizing':
        return 'Creating personalized recommendations...';
      case 'success':
        return 'Action plan generated successfully!';
      default:
        return '';
    }
  };

  const dynamicTips = getDynamicTips();

  return (
    <div
      className="fixed inset-0 bg-[#010828]/95 backdrop-blur-md flex items-end sm:items-center justify-center z-50 animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="liquid-glass bg-[#010828] border border-white/10 w-full sm:max-w-2xl lg:max-w-4xl sm:rounded-[28px] rounded-t-[28px] overflow-hidden flex flex-col lg:flex-row relative h-[92dvh] sm:h-auto max-h-[92dvh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-white/10 text-cream hover:text-neon transition-colors z-30 border border-white/5 cursor-pointer"
          aria-label="Close details"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* Left Side: Image Panel */}
        <div className="w-full lg:w-5/12 relative bg-black/50 h-40 sm:h-48 lg:h-auto shrink-0">
          <img
            src={categoryItem.videoUrl}
            alt={`Visual background representation of ${categoryItem.title}`}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover opacity-60 grayscale brightness-75 filter contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-[#010828]/10 to-[#010828] pointer-events-none" />

          {/* Emission overlay */}
          <div className="absolute bottom-3 left-3 right-3 liquid-glass rounded-xl p-3 border border-white/10 z-10">
            <span className="font-mono text-[9px] text-[#9cb4e5] uppercase">
              Live Emission Index
            </span>
            <div className="flex justify-between items-end mt-1">
              <div className="flex items-center gap-1.5">
                <Footprints size={13} className="text-neon" aria-hidden="true" />
                <span className="font-grotesk text-lg text-neon glow-text-neon uppercase leading-none">
                  {calculateResult()} kg CO₂
                </span>
              </div>
              <span className="font-mono text-[9px] text-cream/50 uppercase">Per day</span>
            </div>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="flex-grow flex-1 flex flex-col overflow-y-auto p-5 sm:p-7 min-h-0 bg-[#010828]/40">
          <div className="space-y-4">
            <div>
              <span className="font-mono text-[9px] sm:text-[10px] text-neon uppercase tracking-[0.3em]">
                AI FOOTPRINT DIAGNOSTIC
              </span>
              <h3
                id="modal-title"
                className="font-grotesk text-xl sm:text-2xl lg:text-3xl text-cream tracking-wide uppercase mt-1 mb-2 select-none leading-tight"
              >
                {categoryItem.title}
              </h3>

              <p className="font-mono text-[10px] sm:text-xs uppercase tracking-wide leading-relaxed text-[#9cb4e5]">
                {categoryItem.description}
              </p>
            </div>

            {/* Specs or Tips */}
            {step !== 'success' ? (
              <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="font-mono text-[9px] text-cream/40 uppercase tracking-widest block">
                  CATEGORY SPECS
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {categoryItem.specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 font-mono text-[10px] sm:text-[11px] uppercase text-cream/80"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-neon shrink-0 animate-pulse" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <span className="font-mono text-[9px] text-neon uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={10} className="text-neon" aria-hidden="true" /> AI RECOMMENDATIONS
                </span>
                <div className="space-y-2.5">
                  {dynamicTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white/[0.02] border border-neon/15 rounded-xl p-3.5 flex flex-col gap-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-grotesk text-[11px] text-neon uppercase tracking-wider">
                          {tip.title}
                        </span>
                        <span className="font-mono text-[8px] text-cream/40 font-bold">
                          [ CO₂ REDUCE ]
                        </span>
                      </div>
                      <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wide text-cream/80 leading-relaxed">
                        {tip.tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parameters */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-4 my-2">
              <div>
                <span className="font-mono text-[9px] text-[#9cb4e5]/60 uppercase">
                  Impact Rating
                </span>
                <p className="font-grotesk text-base text-cream tracking-widest uppercase mt-0.5">
                  {categoryItem.impactScore}
                </p>
              </div>
              <div>
                <span className="font-mono text-[9px] text-[#9cb4e5]/60 uppercase">
                  Data Accuracy
                </span>
                <p className="font-grotesk text-base text-neon tracking-widest uppercase mt-0.5">
                  High
                </p>
              </div>
            </div>
          </div>

          {/* Action area */}
          <div className="mt-5 pt-2">
            {step === 'idle' ? (
              <div className="space-y-3">
                <button
                  onClick={() => setRunTrigger((prev) => prev + 1)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#b724ff] to-[#7c3aed] text-cream font-grotesk text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_24px_rgba(183,36,255,0.3)] flex items-center justify-center gap-2 cursor-pointer font-bold"
                >
                  <Sparkles size={15} aria-hidden="true" />
                  <span>Generate Action Plan</span>
                </button>
                <div className="flex justify-center items-center gap-2 text-cream/40 font-mono text-[9px] uppercase">
                  <ShieldCheck size={12} className="text-neon animate-pulse" aria-hidden="true" />
                  <span>AI Diagnostic Engine Active</span>
                </div>
              </div>
            ) : step !== 'success' ? (
              <div
                className="space-y-3 bg-white/[0.01] border border-white/10 rounded-xl p-4"
                aria-live="polite"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] text-neon uppercase tracking-wide">
                    Running AI Diagnostic
                  </span>
                  <span className="font-mono text-xs text-cream font-bold">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#010828] rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-neon via-[#b724ff] to-[#7c3aed] transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="font-mono text-[10px] uppercase text-cream/70 tracking-widest text-center leading-tight flex items-center justify-center min-h-[24px]">
                  {getStepText()}
                </p>
              </div>
            ) : (
              <div
                className="space-y-3.5 bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl animate-in fade-in duration-300"
                aria-live="polite"
              >
                <div className="flex items-center gap-2 text-emerald-400">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                    <Check size={12} className="stroke-[3px]" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wide font-bold">
                    AI Diagnostic Saved
                  </span>
                </div>
                <p className="font-mono text-[11px] uppercase text-cream/60 leading-normal">
                  Your action plan can reduce your carbon footprint by up to{' '}
                  <span className="text-neon font-bold">
                    {categoryItem.category === 'Transport'
                      ? '1.8 Tons'
                      : categoryItem.category === 'Diet'
                        ? '2.4 Tons'
                        : categoryItem.category === 'Energy'
                          ? '1.2 Tons'
                          : '0.8 Tons'}{' '}
                    of CO₂ / year
                  </span>
                  .
                </p>
                <div className="flex justify-end gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      setStep('idle');
                      setProgress(0);
                    }}
                    className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 text-cream text-[10px] font-mono uppercase transition flex items-center gap-1.5 cursor-pointer font-bold"
                  >
                    <RotateCcw size={12} aria-hidden="true" />
                    <span>RESET</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-lg bg-neon text-[#010828] font-grotesk text-[11px] tracking-wider uppercase transition flex items-center gap-1 hover:brightness-110 cursor-pointer font-bold"
                  >
                    <span>Close Plan</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
