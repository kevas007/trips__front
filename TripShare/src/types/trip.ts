// Types pour les voyages
import { 
  TripStatus, 
  Activity, 
  Expense, 
  TripStats,
  TripFilters 
} from './common';

export interface Trip {
  id: string;
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  budget: number;
  currency: string;
  participants: string[];
  activities: Activity[];
  expenses: Expense[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
  // Propriétés étendues pour la compatibilité
  visibility?: 'public' | 'private' | 'friends';
  tags?: string[];
  difficulty?: 'easy' | 'moderate' | 'hard';
  places_visited?: any[];
  stats?: TripStats;
  user?: any;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_by?: string;
  travel_categories?: string[];
  category?: string;
  tripInfo?: {
    tags?: string[];
  };
}

export interface CreateTripData {
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  participants: string[];
}

export interface UpdateTripData {
  title?: string;
  description?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  participants?: string[];
}

// Ré-export des types depuis common.ts pour la compatibilité
export type { 
  TripStatus, 
  Activity, 
  ActivityCategory, 
  Expense, 
  ExpenseCategory, 
  TripStats,
  TripFilters 
} from './common'; 