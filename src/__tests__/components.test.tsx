import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroSection from '../components/HeroSection';
import CollectionSection from '../components/CollectionSection';
import { DEFAULT_CATEGORIES } from '../constants/emissions';

describe('Component Rendering Smoke Tests', () => {
  describe('HeroSection', () => {
    it('renders header text and brand elements correctly', () => {
      const mockSetActive = vi.fn();
      render(<HeroSection setActiveSection={mockSetActive} />);
      
      // Check for prominent header title text
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toContain('SYSTEMIC CHANGE');
    });
  });

  describe('CollectionSection', () => {
    it('renders the calculators list and layout structures', () => {
      const mockSelectNFT = vi.fn();
      const mockUpdateTracker = vi.fn();
      const mockAddCategory = vi.fn();
      const mockDeleteCategory = vi.fn();

      const mockTrackerValues = {
        'eco-01': 15,
        'eco-02': 'vegetarian',
        'eco-03': 240
      };

      render(
        <CollectionSection
          categories={DEFAULT_CATEGORIES}
          trackerValues={mockTrackerValues}
          onUpdateTrackerValue={mockUpdateTracker}
          onAddCategory={mockAddCategory}
          onDeleteCategory={mockDeleteCategory}
          onSelectNFT={mockSelectNFT}
        />
      );

      // Check that the list side-pane header is rendered
      expect(screen.getByText('CO₂ ASSISTANTS')).toBeInTheDocument();
      
      // Check that the tabs are present
      expect(screen.getByText('💬 Calc')).toBeInTheDocument();
      expect(screen.getByText('📊 Trend')).toBeInTheDocument();
      expect(screen.getByText('🌿 Offsets')).toBeInTheDocument();
    });
  });
});

