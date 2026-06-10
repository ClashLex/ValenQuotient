import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroSection from '../components/HeroSection';
import CollectionSection from '../components/CollectionSection';

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
      const mockSetCommute = vi.fn();
      const mockSetDiet = vi.fn();
      const mockSetEnergy = vi.fn();

      render(
        <CollectionSection
          onSelectNFT={mockSelectNFT}
          commuteMiles={15}
          setCommuteMiles={mockSetCommute}
          dietSelection="vegetarian"
          setDietSelection={mockSetDiet}
          energyKwh={240}
          setEnergyKwh={mockSetEnergy}
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
