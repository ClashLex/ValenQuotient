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

/**
 * Default carbon tracking categories for application onboarding.
 */
export const DEFAULT_CATEGORIES: CarbonCategory[] = [
  {
    id: "eco-01",
    title: "DAILY COMMUTE FOOTPRINT",
    impactScore: "8.7/10",
    videoUrl: "/images/commute.webp", 
    description: "Calculate your transportation emissions based on daily mileage, vehicle combustion class, and passenger travel patterns.",
    category: 'Transport',
    unit: "Miles / Day",
    baseRate: TRANSPORT_BASE_RATE, 
    specs: ["Vehicle: Gasoline Passenger Car", "Type: Ground Urban Commute", "Range: Short/Medium Distance"],
    year: "2026"
  },
  {
    id: "eco-02",
    title: "FOOD & DIET FOOTPRINT",
    impactScore: "9.0/10",
    videoUrl: "/images/diet.webp", 
    description: "Track the environmental impact of your daily dietary profile. Animal proteins have a heavy carbon footprint, while organic plant-based diets approach zero.",
    category: 'Diet',
    unit: "Meal Category",
    baseRate: 1, 
    specs: ["Sourcing: Urban & Conventional Agriculture", "Organic Content: Approx. 40%", "Supply Chain: Local/Regional Sourcing"],
    year: "2026"
  },
  {
    id: "eco-03",
    title: "HOUSEHOLD UTILITIES FOOTPRINT",
    impactScore: "8.2/10",
    videoUrl: "/images/energy.webp", 
    description: "Aggregate your home electricity use, heating metrics, and baseline vampire power leaks to track utility emissions.",
    category: 'Energy',
    unit: "kWh / Month",
    baseRate: ENERGY_BASE_RATE, 
    specs: ["Energy Grid: Mixed Fossil & Clean Fuel", "Renewable Power Ratio: Approx. 15%", "Standby Vampire Loads Included"],
    year: "2026"
  }
];

