import { describe, it, expect } from 'vitest';
import {
  TRANSPORT_BASE_RATE,
  DIET_EMISSION_SCORES,
  ENERGY_BASE_RATE,
} from '../constants/emissions';

describe('Carbon Calculator Logic & Constants', () => {
  describe('IPCC Constants Parity', () => {
    it('should match the exact transport emission coefficient', () => {
      expect(TRANSPORT_BASE_RATE).toBe(0.411);
    });

    it('should map diet selections to correct emission scores', () => {
      expect(DIET_EMISSION_SCORES.vegan).toBe(1.5);
      expect(DIET_EMISSION_SCORES.vegetarian).toBe(2.8);
      expect(DIET_EMISSION_SCORES.meat).toBe(7.4);
    });

    it('should match the exact grid energy coefficient', () => {
      expect(ENERGY_BASE_RATE).toBe(0.384);
    });
  });

  describe('Calculation Formulas', () => {
    it('computes transport footprint cleanly', () => {
      const commuteMiles = 15;
      const result = commuteMiles * TRANSPORT_BASE_RATE;
      expect(result).toBeCloseTo(6.165, 3);
      expect(result.toFixed(1)).toBe('6.2');
    });

    it('computes diet footprint cleanly', () => {
      const selection = 'vegetarian';
      const result = DIET_EMISSION_SCORES[selection];
      expect(result).toBe(2.8);
      expect(result.toFixed(1)).toBe('2.8');
    });

    it('computes energy footprint cleanly', () => {
      const energyKwh = 240;
      const result = (energyKwh / 30) * ENERGY_BASE_RATE;
      expect(result).toBeCloseTo(3.072, 3);
      expect(result.toFixed(1)).toBe('3.1');
    });

    it('computes total integrated footprint cleanly', () => {
      const commuteMiles = 20; // 20 * 0.411 = 8.22
      const diet = 'vegan'; // 1.5
      const energyKwh = 300; // (300 / 30) * 0.384 = 3.84

      const total =
        commuteMiles * TRANSPORT_BASE_RATE +
        DIET_EMISSION_SCORES[diet] +
        (energyKwh / 30) * ENERGY_BASE_RATE;

      expect(total).toBeCloseTo(13.56, 2);
      expect(total.toFixed(1)).toBe('13.6');
    });
  });
});
