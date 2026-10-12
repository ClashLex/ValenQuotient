import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CarbonCategory } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/emissions';
import { STORAGE_KEYS } from '../constants/keys';
import { safeParse } from '../utils/storage';
import { User } from 'firebase/auth';

/** Debounce window (ms) before pushing local edits to Firestore. */
const SYNC_DEBOUNCE_MS = 800;

type TrackerValues = Record<string, string | number>;

/** Seed values used on a first visit, before anything has been recorded. */
const DEFAULT_TRACKER_VALUES: TrackerValues = {
  'eco-01': 15,
  'eco-02': 'vegetarian',
  'eco-03': 240,
};

/** Firestore document holding a user's synced tracker state. */
const userDocRef = (uid: string) => doc(db, 'userData', uid);

function loadCategories(): CarbonCategory[] {
  const stored = safeParse<CarbonCategory[]>(localStorage.getItem(STORAGE_KEYS.CATEGORIES));
  return stored ?? DEFAULT_CATEGORIES;
}

function loadTrackerValues(): TrackerValues {
  const stored = safeParse<TrackerValues>(localStorage.getItem(STORAGE_KEYS.TRACKER_VALUES));
  return stored ?? DEFAULT_TRACKER_VALUES;
}

/**
 * Persists a value to localStorage immediately and mirrors it to Firestore on a
 * debounce, so dragging a slider doesn't fire a document write per change.
 *
 * Remote writes are suppressed until `enabled` is true, which lets the caller
 * hold off syncing until the initial hydration from Firestore has completed —
 * otherwise the local defaults would clobber server state.
 */
function usePersistedSync(
  value: unknown,
  options: {
    storageKey: string;
    field: string;
    user: User | null;
    enabled: boolean;
  }
) {
  const { storageKey, field, user, enabled } = options;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
    if (!user || !enabled) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDoc(userDocRef(user.uid), { [field]: latest.current }, { merge: true }).catch(() => {
        // Offline or rules rejected — the local copy stands, next change retries
      });
    }, SYNC_DEBOUNCE_MS);
  }, [value, storageKey, field, user, enabled]);

  // Cancel a pending remote write on unmount so it can't fire later.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
}

/**
 * Custom hook to manage application data state, including local storage
 * persistence and Firestore synchronization for logged-in users.
 *
 * @param user The currently authenticated Firebase user, or null.
 * @param selectedCategoryId The ID of the currently selected category (used for cleanup).
 * @param setSelectedCategory Function to clear the selected category if it gets deleted.
 */
export function useAppData(
  user: User | null,
  selectedCategoryId: string | undefined,
  setSelectedCategory: (cat: CarbonCategory | null) => void
) {
  const [dataReady, setDataReady] = useState(false);

  // Categories & tracker values — localStorage first, then overlay Firestore
  const [categories, setCategories] = useState<CarbonCategory[]>(loadCategories);
  const [trackerValues, setTrackerValues] = useState<TrackerValues>(loadTrackerValues);

  // ── Firestore hydration on login ──────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setDataReady(true);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const snap = await getDoc(userDocRef(user.uid));
        if (!cancelled && snap.exists()) {
          const data = snap.data();
          if (data.categories) setCategories(data.categories as CarbonCategory[]);
          if (data.trackerValues) setTrackerValues(data.trackerValues as TrackerValues);
        }
      } catch {
        // Offline or permission denied — fall back to localStorage silently
      } finally {
        if (!cancelled) setDataReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  usePersistedSync(categories, {
    storageKey: STORAGE_KEYS.CATEGORIES,
    field: 'categories',
    user,
    enabled: dataReady,
  });

  usePersistedSync(trackerValues, {
    storageKey: STORAGE_KEYS.TRACKER_VALUES,
    field: 'trackerValues',
    user,
    enabled: dataReady,
  });

  const addCustomCategory = useCallback((newCat: CarbonCategory) => {
    setCategories((prev) => [...prev, newCat]);
    setTrackerValues((prev) => ({
      ...prev,
      [newCat.id]: newCat.category === 'Diet' ? 'vegetarian' : 0,
    }));
  }, []);

  const deleteCustomCategory = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      setTrackerValues((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      if (selectedCategoryId === id) {
        setSelectedCategory(null);
      }
    },
    [selectedCategoryId, setSelectedCategory]
  );

  const updateTrackerValue = useCallback((id: string, value: string | number) => {
    setTrackerValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  return {
    categories,
    trackerValues,
    addCustomCategory,
    deleteCustomCategory,
    updateTrackerValue,
  };
}