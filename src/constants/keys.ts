/**
 * Local storage keys for ValenQuotient.
 * Centralised so no component hardcodes a raw key string.
 */
export const STORAGE_KEYS = {
  CATEGORIES: 'vq_categories',
  TRACKER_VALUES: 'vq_tracker_values',
  HISTORY: 'vq_footprint_history',
  PLEDGES: 'vq_pledges',
  COMPLETED_CHALLENGES: 'vq_completed_challenges',
  GOAL_KG_DAY: 'vq_goal_kg_day',
  PROFILE_NAME: 'vq_profile_name',
} as const;