import { Location } from './location';
import { UserProfile } from './user';
import { Activity } from './activity';
import { TripBudget } from './budget';
import { User } from './user';

export type TripDifficulty = 'Facile' | 'Modéré' | 'Difficile';

// Types pour les statuts et visibilités (correspondant au backend)
export type TripStatus = 'planned' | 'ongoing' | 'completed' | 'cancelled';
export type TripVisibility = 'public' | 'private';

// Interface pour la localisation JSON (correspondant au backend)
export interface LocationJSON {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Interface principale Trip (correspondant au backend)
export interface Trip {
  id: string;
  createdBy: string;
  title: string;
  description?: string;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  location: LocationJSON;
  budget?: number;
  mapCategories?: string[];
  travelCategories?: string[];
  tripType?: string;
  duration?: string; // Calculé automatiquement
  status: TripStatus; // Calculé automatiquement
  visibility: TripVisibility;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optionnelles selon le contexte)
  members?: TripMember[];
  expenses?: any[];
  activities?: Activity[];
  photos?: TripPhoto[];
  steps?: TripStep[];
  likes?: TripLike[];
  
  // Champs calculés (non persistés)
  memberCount?: number;
  expenseCount?: number;
  recommendationScore?: number;
  
  // Informations utilisateur (récupérées via JOIN)
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarURL?: string;
  
  // Lieux visités (champ calculé)
  placesVisited?: any[];
  
  // Champs legacy pour compatibilité
  user?: {
    username: string;
    avatar: string;
    level: string;
    trips: number;
  };
  images?: string[];
  likesCount?: number;
  comments?: number;
  tags?: string[];
  difficulty?: TripDifficulty;
  transport?: string[];
  highlights?: string[];
}

// Interface pour les membres d'un voyage
export interface TripMember {
  id: string;
  tripId: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string;
  user?: UserProfile;
}

// Interface pour les likes d'un voyage
export interface TripLike {
  id: string;
  tripId: string;
  userId: string;
  createdAt: string;
  user?: User;
}

// Interface pour les photos d'un voyage
export interface TripPhoto {
  id: string;
  tripId: string;
  userId: string;
  url: string;
  caption?: string;
  createdAt: string;
}

export interface TripStep {
  id: string;
  tripId: string;
  title: string;
  description: string;
  location?: any;
  city?: string;
  date?: string;
  latitude?: number;
  longitude?: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  stepType?: string;
  estimatedCost?: number;
  currency?: string;
  notes?: string;
  tips?: string[];
  photos?: string[];
  order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 
  | 'transport'
  | 'accommodation' 
  | 'restaurant'
  | 'activity'
  | 'sightseeing'
  | 'shopping'
  | 'entertainment'
  | 'meeting'
  | 'break'
  | 'other';

export interface Collaborator {
  user: UserProfile;
  role: 'owner' | 'editor' | 'viewer';
  permissions: string[];
  joinedAt: string;
  invitedBy: string;
}

export interface TripDay {
  id: string;
  date: string;
  title?: string;
  description?: string;
  activities: Activity[];
  notes?: string;
  estimatedBudget?: number;
  actualSpent?: number;
  weather?: WeatherInfo;
}

export interface WeatherInfo {
  temperature: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  icon: string;
}

export interface TripStats {
  views: number;
  uniqueViews: number;
  likes: number;
  saves: number;
  shares: number;
  comments: number;
  forks: number;
  rating: {
    average: number;
    count: number;
    distribution: Record<number, number>;
  };
}

// Interface pour les statistiques calculées d'un voyage
export interface TripCalculatedStats {
  status: TripStatus;
  statusDisplay: string;
  duration: string;
  durationDays: number;
  isOverdue: boolean;
  progressPercentage: number;
  daysUntilStart?: number;
  daysUntilStartDisplay?: string;
  daysUntilEnd?: number;
  daysUntilEndDisplay?: string;
}

export interface TripFilters {
  category?: string;
  difficulty?: TripDifficulty;
  duration?: string;
  budget?: string;
  location?: string;
  status?: TripStatus;
}

// Utilitaires pour les statuts
export const TRIP_STATUS_DISPLAY_NAMES: Record<TripStatus, string> = {
  planned: 'Planifié',
  ongoing: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export const TRIP_VISIBILITY_DISPLAY_NAMES: Record<TripVisibility, string> = {
  public: 'Public',
  private: 'Privé',
};

// Couleurs pour les statuts
export const TRIP_STATUS_COLORS: Record<TripStatus, string> = {
  planned: '#3B82F6', // Bleu
  ongoing: '#10B981', // Vert
  completed: '#6B7280', // Gris
  cancelled: '#EF4444', // Rouge
};

// Icônes pour les statuts
export const TRIP_STATUS_ICONS: Record<TripStatus, string> = {
  planned: 'calendar-outline',
  ongoing: 'rocket-outline',
  completed: 'checkmark-circle-outline',
  cancelled: 'close-circle-outline',
}; 