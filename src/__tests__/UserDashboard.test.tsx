import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UserDashboard from '../components/UserDashboard';
import { AuthContext } from '../context/AuthContext';
import { createAuthContextValue, createMockUser } from './testUtils';
import { CarbonCategory } from '../types';

describe('UserDashboard', () => {
  const mockCategories: CarbonCategory[] = [
    {
      id: '1',
      title: 'Test Category',
      impactScore: '5/10',
      videoUrl: '/images/energy.webp',
      description: 'Test energy category',
      category: 'Energy',
      unit: 'kWh / Month',
      baseRate: 0.384,
      specs: [],
      year: '2026',
    },
  ];
  const mockTrackerValues = { '1': 100 };

  it('renders guest view when no user is logged in', () => {
    render(
      <AuthContext.Provider value={createAuthContextValue()}>
        <UserDashboard
          categories={mockCategories}
          trackerValues={mockTrackerValues}
          onOpenAuth={() => {}}
        />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Anonymous Pilot|Sign In to Unlock/i)).toBeInTheDocument();
  });

  it('renders authenticated view when user is logged in', () => {
    render(
      <AuthContext.Provider
        value={createAuthContextValue({ user: createMockUser() })}
      >
        <UserDashboard
          categories={mockCategories}
          trackerValues={mockTrackerValues}
          onOpenAuth={() => {}}
        />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/Total CO₂/i)).toBeInTheDocument();
  });
});