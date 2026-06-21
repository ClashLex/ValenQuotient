import { useState, useEffect, useCallback } from 'react';
import { CarbonCategory } from '../types';
import { DIET_EMISSION_SCORES } from '../constants/emissions';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyLog {
  /** ISO date string: YYYY-MM-DD */
  date: string;
  /** Total kg CO₂ for that day */
  totalKg: number;
  /** Per-category breakdown { categoryId: kg } */
  breakdown: Record<string, number>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD in local time */
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const STORAGE_KEY = 'vq_footprint_history';

function loadHistory(): DailyLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DailyLog[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(logs: DailyLog[]): void {
  try {
    // Keep at most 90 days
    const trimmed = logs.slice(-90);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Quota exceeded — silently ignore
  }
}

/** Calculate total kg CO₂/day from categories + values */
export function calcDailyKg(
  categories: CarbonCategory[],
  values: Record<string, string | number>,
): number {
  return categories.reduce((sum, cat) => {
    const val = values[cat.id];
    if (cat.category === 'Transport') {
      return sum + (Number(val) || 0) * cat.baseRate;
    }
    if (cat.category === 'Diet') {
      const selection = (val || 'vegetarian') as keyof typeof DIET_EMISSION_SCORES;
      return sum + DIET_EMISSION_SCORES[selection];
    }
    if (cat.category === 'Energy') {
      return sum + ((Number(val) || 0) / 30) * cat.baseRate;
    }
    // Custom / Other
    return sum + (Number(val) || 0) * cat.baseRate;
  }, 0);
}

/** Get per-category kg breakdown */
function calcBreakdown(
  categories: CarbonCategory[],
  values: Record<string, string | number>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const cat of categories) {
    const val = values[cat.id];
    if (cat.category === 'Transport') {
      out[cat.id] = (Number(val) || 0) * cat.baseRate;
    } else if (cat.category === 'Diet') {
      const selection = (val || 'vegetarian') as keyof typeof DIET_EMISSION_SCORES;
      out[cat.id] = DIET_EMISSION_SCORES[selection];
    } else if (cat.category === 'Energy') {
      out[cat.id] = ((Number(val) || 0) / 30) * cat.baseRate;
    } else {
      out[cat.id] = (Number(val) || 0) * cat.baseRate;
    }
  }
  return out;
}

/**
 * Compute current streak: consecutive days (going backwards from today)
 * where totalKg <= goalKg.
 */
function computeStreak(logs: DailyLog[], goalKg: number): number {
  if (!logs.length || goalKg <= 0) return 0;
  const today = todayKey();
  let streak = 0;
  let checkDate = new Date();

  for (let i = 0; i < 365; i++) {
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    // If it's today and not yet logged, skip (don't break streak for today)
    if (key === today) {
      const log = logs.find(l => l.date === key);
      if (!log) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      if (log.totalKg <= goalKg) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
    const log = logs.find(l => l.date === key);
    if (!log || log.totalKg > goalKg) break;
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseFootprintHistoryResult {
  /** All stored daily logs */
  history: DailyLog[];
  /** Last 7 days, sorted oldest-first, gaps filled with null */
  weekHistory: (DailyLog | null)[];
  /** Current streak (days below goal) */
  streak: number;
  /** Today's snapshot if already recorded */
  todayLog: DailyLog | null;
  /** Manually record today's snapshot (idempotent) */
  recordToday: () => void;
}

export function useFootprintHistory(
  categories: CarbonCategory[],
  trackerValues: Record<string, string | number>,
  goalKg: number,
): UseFootprintHistoryResult {
  const [history, setHistory] = useState<DailyLog[]>(loadHistory);

  // Auto-record today's snapshot whenever tracker values change (idempotent per day)
  const recordToday = useCallback(() => {
    const key = todayKey();
    const totalKg = calcDailyKg(categories, trackerValues);
    const breakdown = calcBreakdown(categories, trackerValues);
    const newLog: DailyLog = { date: key, totalKg, breakdown };

    setHistory(prev => {
      // Remove existing entry for today (update in place)
      const filtered = prev.filter(l => l.date !== key);
      const updated = [...filtered, newLog].sort((a, b) => a.date.localeCompare(b.date));
      saveHistory(updated);
      return updated;
    });
  }, [categories, trackerValues]);

  // Record today whenever values change
  useEffect(() => {
    recordToday();
  }, [recordToday]);

  // Build the 7-slot week array (oldest → today)
  const weekHistory: (DailyLog | null)[] = (() => {
    const slots: (DailyLog | null)[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      slots.push(history.find(l => l.date === key) ?? null);
    }
    return slots;
  })();

  const todayLog = history.find(l => l.date === todayKey()) ?? null;
  const streak = computeStreak(history, goalKg);

  return { history, weekHistory, streak, todayLog, recordToday };
}
