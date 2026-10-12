import { CarbonCategory } from '../types';

/**
 * IPCC and Our World In Data accredited Carbon Emission Factors for 2026.
 */

/**
 * Transport emission factor: kg CO₂ per mile commuted.
 * Based on a gasoline passenger car ground urban commute.
 */
export const TRANSPORT_BASE_RATE = 0.411;

/**
 * Dietary carbon footprint metrics: kg CO₂ per day.
 * Based on global average supply chains for vegan, vegetarian, and meat nutritional profiles.
 */
export const DIET_EMISSION_SCORES = {
  vegan: 1.5,
  vegetarian: 2.8,
  meat: 7.4,
} as const;

/**
 * Household utilities emission factor: kg CO₂ per kWh.
 * Based on mixed fossil & clean energy regional electrical grids.
 */
export const ENERGY_BASE_RATE = 0.384;

/** Days per billing cycle used to annualise monthly energy readings. */
export const DAYS_PER_MONTH = 30;

/** Days per year, used for annualised projections. */
export const DAYS_PER_YEAR = 365;

/**
 * Global mean CO₂ footprint per capita in kg CO₂ / year.
 * Used as the benchmark for goals, streaks and comparative scoring.
 */
export const GLOBAL_AVERAGE_KG_YEAR = 4700;

/** Daily equivalent of the global average, in kg CO₂ / day (≈ 12.9). */
export const GLOBAL_AVERAGE_KG_DAY = GLOBAL_AVERAGE_KG_YEAR / DAYS_PER_YEAR;

/** Default daily carbon goal, rounded to 1 decimal (≈ 12.9 kg/day). */
export const DEFAULT_GOAL_KG_DAY = Math.round(GLOBAL_AVERAGE_KG_DAY * 10) / 10;

/**
 * Resolve a diet tracker's stored value into a diet profile key.
 * Defaults to 'vegetarian' so incomplete data never silently scores as vegan.
 */
export function toDietProfile(
  value: string | number | null | undefined
): keyof typeof DIET_EMISSION_SCORES {
  const key = typeof value === 'string' ? value : 'vegetarian';
  return key in DIET_EMISSION_SCORES ? (key as keyof typeof DIET_EMISSION_SCORES) : 'vegetarian';
}

/**
 * Single source of truth for emissions math.
 *
 * Returns the daily kg CO₂ for one category + its tracked value. Every
 * consumer (HeroSection, CollectionSection, AdvisoryModal, UserDashboard and
 * the useFootprintHistory hook) must go through this so the numbers can never
 * drift between views.
 *
 * - Transport: miles/day × TRANSPORT_BASE_RATE
 * - Diet: fixed daily footprint for the selected profile
 * - Energy: (kWh/month ÷ 30) × ENERGY_BASE_RATE
 * - Other/custom: value × the category's own baseRate
 */
export function kgPerDayForCategory(
  category: CarbonCategory,
  value: string | number | null | undefined
): number {
  if (category.category === 'Diet') {
    return DIET_EMISSION_SCORES[toDietProfile(value)];
  }

  const numeric = Number(value) || 0;

  if (category.category === 'Energy') {
    return (numeric / DAYS_PER_MONTH) * category.baseRate;
  }

  // Transport and Other/custom both scale linearly by the category base rate.
  return numeric * category.baseRate;
}

/** Annualised kg CO₂ for one category + tracked value. */
export function kgPerYearForCategory(
  category: CarbonCategory,
  value: string | number | null | undefined
): number {
  return kgPerDayForCategory(category, value) * DAYS_PER_YEAR;
}

/** Total daily kg CO₂ across every tracked category. */
export function calcDailyKg(
  categories: CarbonCategory[],
  values: Record<string, string | number>
): number {
  return categories.reduce((sum, cat) => sum + kgPerDayForCategory(cat, values[cat.id]), 0);
}

/** Total annualised kg CO₂ across every tracked category. */
export function calcAnnualKg(
  categories: CarbonCategory[],
  values: Record<string, string | number>
): number {
  return calcDailyKg(categories, values) * DAYS_PER_YEAR;
}

/** Per-category daily kg CO₂ breakdown, keyed by category id. */
export function calcBreakdown(
  categories: CarbonCategory[],
  values: Record<string, string | number>
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const cat of categories) {
    out[cat.id] = kgPerDayForCategory(cat, values[cat.id]);
  }
  return out;
}

/**
 * Default carbon tracking categories for application onboarding.
 */
export const DEFAULT_CATEGORIES: CarbonCategory[] = [
  {
    id: 'eco-01',
    title: 'DAILY COMMUTE FOOTPRINT',
    impactScore: '8.7/10',
    videoUrl: '/images/commute.webp',
    description:
      'Calculate your transportation emissions based on daily mileage, vehicle combustion class, and passenger travel patterns.',
    category: 'Transport',
    unit: 'Miles / Day',
    baseRate: TRANSPORT_BASE_RATE,
    specs: [
      'Vehicle: Gasoline Passenger Car',
      'Type: Ground Urban Commute',
      'Range: Short/Medium Distance',
    ],
    year: '2026',
  },
  {
    id: 'eco-02',
    title: 'FOOD & DIET FOOTPRINT',
    impactScore: '9.0/10',
    videoUrl: '/images/diet.webp',
    description:
      'Track the environmental impact of your daily dietary profile. Animal proteins have a heavy carbon footprint, while organic plant-based diets approach zero.',
    category: 'Diet',
    unit: 'Meal Category',
    baseRate: 1,
    specs: [
      'Sourcing: Urban & Conventional Agriculture',
      'Organic Content: Approx. 40%',
      'Supply Chain: Local/Regional Sourcing',
    ],
    year: '2026',
  },
  {
    id: 'eco-03',
    title: 'HOUSEHOLD UTILITIES FOOTPRINT',
    impactScore: '8.2/10',
    videoUrl: '/images/energy.webp',
    description:
      'Aggregate your home electricity use, heating metrics, and baseline vampire power leaks to track utility emissions.',
    category: 'Energy',
    unit: 'kWh / Month',
    baseRate: ENERGY_BASE_RATE,
    specs: [
      'Energy Grid: Mixed Fossil & Clean Fuel',
      'Renewable Power Ratio: Approx. 15%',
      'Standby Vampire Loads Included',
    ],
    year: '2026',
  },
];
