import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CarbonCategory } from '../types';
import { calcDailyKg, calcBreakdown } from '../constants/emissions';
import { STORAGE_KEYS } from '../constants/keys';

// Re-exported so existing imports keep working while the math lives in one place.
export { calcDailyKg } from '../constants/emissions';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyLog {
  /** ISO date string: YYYY-MM-DD */
  date: string;
  /** Total kg CO₂ for that day */
  totalKg: number;
  /** Per-category breakdown { categoryId: kg } */
  breakdown: Record<string, number>;
}

/** Max number of daily snapshots retained in localStorage. */
const MAX_HISTORY_DAYS = 90;
/** How many days of history the trend chart displays. */
const WEEK_WINDOW_DAYS = 7;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Formats a Date as a local-time YYYY-MM-DD key. */
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns today's date as YYYY-MM-DD in local time */
function todayKey(): string {
  return dateKey(new Date());
}

/** Returns the YYYY-MM-DD key for `offset` days before today (0 = today). */
function keyDaysAgo(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return dateKey(d);
}

function loadHistory(): DailyLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? (JSON.parse(raw) as DailyLog[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(logs: DailyLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(logs.slice(-MAX_HISTORY_DAYS)));
  } catch {
    // Quota exceeded — silently ignore
  }
}

/**
 * Compute current streak: consecutive days (walking backwards from today)
 * where totalKg <= goalKg.
 *
 * Today is skipped when it has not been logged yet, so an in-progress day
 * never breaks an otherwise intact streak.
 */
function computeStreak(logs: DailyLog[], goalKg: number): number {
  if (!logs.length || goalKg <= 0) return 0;

  const byDate = new Map(logs.map((l) => [l.date, l]));
  const today = todayKey();
  let streak = 0;

  for (let offset = 0; offset < MAX_HISTORY_DAYS; offset++) {
    const key = keyDaysAgo(offset);
    const log = byDate.get(key);

    if (!log) {
      // Today isn't logged yet — look further back instead of breaking.
      if (key === today) continue;
      break;
    }

    if (log.totalKg > goalKg) break;
    streak++;
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

  // Snapshot today's totals. Idempotent: replaces any existing entry for today.
  const recordToday = useCallback(() => {
    const key = todayKey();
    const newLog: DailyLog = {
      date: key,
      totalKg: calcDailyKg(categories, trackerValues),
      breakdown: calcBreakdown(categories, trackerValues),
    };

    setHistory((prev) => {
      const updated = [...prev.filter((l) => l.date !== key), newLog].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      saveHistory(updated);
      return updated;
    });
  }, [categories, trackerValues]);

  // Skip the initial mount so we never log a day the user hasn't actually
  // entered data for (defaults are placeholders, not real readings).
  const hasRecorded = useRef(false);
  useEffect(() => {
    if (!hasRecorded.current) {
      hasRecorded.current = true;
      return;
    }
    recordToday();
  }, [recordToday]);

  // 7-slot trend window, oldest → today, gaps filled with null.
  const weekHistory = useMemo<(DailyLog | null)[]>(() => {
    const byDate = new Map(history.map((l) => [l.date, l]));
    return Array.from({ length: WEEK_WINDOW_DAYS }, (_, i) => {
      const offset = WEEK_WINDOW_DAYS - 1 - i;
      return byDate.get(keyDaysAgo(offset)) ?? null;
    });
  }, [history]);

  const todayLog = useMemo(() => history.find((l) => l.date === todayKey()) ?? null, [history]);
  const streak = useMemo(() => computeStreak(history, goalKg), [history, goalKg]);

  return { history, weekHistory, streak, todayLog, recordToday };
}