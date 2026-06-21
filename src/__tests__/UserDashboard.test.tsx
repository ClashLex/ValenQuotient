import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserDashboard from '../components/UserDashboard';
import { AuthContext } from '../context/AuthContext';

describe('UserDashboard', () => {
  const mockCategories = [
    { id: '1', name: 'Test Category', icon: 'Leaf', category: 'Energy' as const }
  ];
  const mockTrackerValues = { '1': 100 };

  it('renders guest view when no user is logged in', () => {
    const mockOnOpenAuth = vi.fn();
    render(
      <AuthContext.Provider value={{ user: null, signInWithGoogle: vi.fn(), signOut: vi.fn(), loading: false }}>
        <UserDashboard categories={mockCategories} trackerValues={mockTrackerValues} onOpenAuth={mockOnOpenAuth} />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Anonymous Pilot|Sign In to Unlock/i)).toBeInTheDocument();
  });

  it('renders authenticated view when user is logged in', () => {
    const mockUser = {
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
      toJSON: vi.fn()
    };

    render(
      <AuthContext.Provider value={{ user: mockUser as unknown as import('firebase/auth').User, signInWithGoogle: vi.fn(), signOut: vi.fn(), loading: false }}>
        <UserDashboard categories={mockCategories} trackerValues={mockTrackerValues} onOpenAuth={vi.fn()} />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/Total CO₂/i)).toBeInTheDocument();
  });
});
