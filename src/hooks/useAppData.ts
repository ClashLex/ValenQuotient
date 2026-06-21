import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CarbonCategory } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/emissions';
import { STORAGE_KEYS } from '../constants/keys';
import { User } from 'firebase/auth';

/**
 * Custom hook to manage application data state, including local storage persistence
 * and Firestore synchronization for logged-in users.
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
  const [categories, setCategories] = useState<CarbonCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [trackerValues, setTrackerValues] = useState<Record<string, string | number>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRACKER_VALUES);
    return saved
      ? JSON.parse(saved)
      : { 'eco-01': 15, 'eco-02': 'vegetarian', 'eco-03': 240 };
  });

  // ── Firestore hydration on login ──────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setDataReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'userData', user.uid));
        if (!cancelled && snap.exists()) {
          const data = snap.data();
          if (data.categories) setCategories(data.categories);
          if (data.trackerValues) setTrackerValues(data.trackerValues);
        }
      } catch {
        // Fall back to localStorage silently
      } finally {
        if (!cancelled) setDataReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Sync categories ───────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    if (user && dataReady) {
      setDoc(doc(db, 'userData', user.uid), { categories }, { merge: true }).catch(() => {});
    }
  }, [categories, user, dataReady]);

  // ── Sync trackerValues ────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRACKER_VALUES, JSON.stringify(trackerValues));
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
    if (selectedCategoryId === id) {
      setSelectedCategory(null);
    }
  };

  const updateTrackerValue = (id: string, value: string | number) => {
    setTrackerValues((prev) => ({ ...prev, [id]: value }));
  };

  return {
    categories,
    trackerValues,
    addCustomCategory,
    deleteCustomCategory,
    updateTrackerValue,
  };
}
