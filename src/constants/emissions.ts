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
