import { vi } from 'vitest';
import type { User } from 'firebase/auth';
import type { ReactNode } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Builds a complete AuthContext value for tests.
 *
 * The context exposes signUp/signIn/signInWithGoogle/signOut, so every member
 * must be supplied — a partial mock is a compile error rather than a silent
 * runtime surprise.
 */
export function createAuthContextValue(overrides: {
  user?: User | null;
  loading?: boolean;
} = {}) {
  return {
    user: overrides.user ?? null,
    loading: overrides.loading ?? false,
    signUp: vi.fn().mockResolvedValue(undefined),
    signIn: vi.fn().mockResolvedValue(undefined),
    signInWithGoogle: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
}

/** Wraps `children` in an AuthContext.Provider with a complete mock value. */
export function withAuth(
  children: ReactNode,
  overrides: Parameters<typeof createAuthContextValue>[0] = {}
) {
  return (
    <AuthContext.Provider value={createAuthContextValue(overrides)}>{children}</AuthContext.Provider>
  );
}

/** Minimal Firebase User stand-in for authenticated-view tests. */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    ...overrides,
  } as unknown as User;
}