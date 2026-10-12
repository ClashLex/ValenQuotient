/**
 * Small, defensive helpers for reading JSON out of localStorage.
 * Returns `null` instead of throwing when the key is missing or corrupt.
 */
export function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}