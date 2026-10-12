import { describe, it, expect } from 'vitest';
import {
  TRANSPORT_BASE_RATE,
  DIET_EMISSION_SCORES,
  ENERGY_BASE_RATE,
  DEFAULT_CATEGORIES,
  calcDailyKg,
  calcAnnualKg,
  calcBreakdown,
  kgPerDayForCategory,
  toDietProfile,
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

  /**
   * The math above is duplicated nowhere — every view routes through these
   * helpers. These cases pin that shared contract.
   */
  describe('Shared calculation helpers', () => {
    const [transport, diet, energy] = DEFAULT_CATEGORIES;

    it('scales transport linearly: miles x rate', () => {
      expect(calcDailyKg([transport], { 'eco-01': 20 })).toBeCloseTo(8.22, 5);
    });

    it('converts monthly kWh into a daily energy figure', () => {
      expect(calcDailyKg([energy], { 'eco-03': 240 })).toBeCloseTo(3.072, 5);
    });

    it('scores each diet profile correctly', () => {
      expect(calcDailyKg([diet], { 'eco-02': 'vegan' })).toBeCloseTo(1.5, 5);
      expect(calcDailyKg([diet], { 'eco-02': 'vegetarian' })).toBeCloseTo(2.8, 5);
      expect(calcDailyKg([diet], { 'eco-02': 'meat' })).toBeCloseTo(7.4, 5);
    });

    it('defaults an unset diet tracker to vegetarian, never vegan', () => {
      expect(calcDailyKg([diet], {})).toBeCloseTo(2.8, 5);
    });

    it('treats an unknown diet profile as vegetarian', () => {
      expect(toDietProfile('carnivore')).toBe('vegetarian');
      expect(calcDailyKg([diet], { 'eco-02': 'carnivore' })).toBeCloseTo(2.8, 5);
    });

    it('annualises the daily total over 365 days', () => {
      const values = { 'eco-01': 20, 'eco-02': 'vegan', 'eco-03': 240 };
      const daily = calcDailyKg(DEFAULT_CATEGORIES, values);
      expect(calcAnnualKg(DEFAULT_CATEGORIES, values)).toBeCloseTo(daily * 365, 5);
    });

    it('produces a breakdown that sums to the daily total', () => {
      const values = { 'eco-01': 20, 'eco-02': 'meat', 'eco-03': 240 };
      const summed = Object.values(calcBreakdown(DEFAULT_CATEGORIES, values)).reduce(
        (a, b) => a + b,
        0
      );
      expect(summed).toBeCloseTo(calcDailyKg(DEFAULT_CATEGORIES, values), 5);
    });

    it('never yields NaN for missing, zero or non-numeric input', () => {
      expect(calcDailyKg([transport], {})).toBe(0);
      expect(calcDailyKg([transport], { 'eco-01': 0 })).toBe(0);
      expect(calcDailyKg([transport], { 'eco-01': 'abc' })).toBe(0);
      expect(calcDailyKg([transport], { 'eco-01': NaN })).toBe(0);
    });

    it('applies a custom category base rate', () => {
      const custom = {
        id: 'custom-1',
        title: 'FLIGHT HOURS',
        impactScore: '9/10',
        videoUrl: '',
        description: '',
        category: 'Other' as const,
        unit: 'Hours',
        baseRate: 0.25,
        specs: [],
        year: '2026',
        isCustom: true,
      };
      expect(kgPerDayForCategory(custom, 10)).toBeCloseTo(2.5, 5);
    });
  });
});