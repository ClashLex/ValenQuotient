export interface CarbonCategory {
  id: string;
  title: string;
  impactScore: string;
  videoUrl: string;
  description: string;
  category: 'Transport' | 'Diet' | 'Energy' | 'Other';
  unit: string;
  baseRate: number;
  specs: string[];
  year: string;
  isCustom?: boolean;
}

export type NavItem = 'Homepage' | 'About' | 'Trackers' | 'Advisory' | 'Contact';

// Re-export Firebase User for convenience
export type { User } from 'firebase/auth';


