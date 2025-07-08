import { Location } from './location';
import { UserProfile } from './user';
import { Activity } from './activity';
import { TripBudget } from './budget';
import { User } from './user';

export type TripDifficulty = 'Facile' | 'Modéré' | 'Difficile';

export interface Trip {
  id: string;
  user: {
    username: string;
    avatar: string;
    level: string;
    trips: number;
  };
  location: string;
  images: string[];
  description: string;
  likes: number;
  comments: number;
  duration: string;
  budget: string;
  tags: string[];
  createdAt: string;
  difficulty: TripDifficulty;
  transport: string[];
  highlights: string[];
  steps: TripStep[];
}

export interface TripStep {
  id: string;
  title: string;
  description?: string;
  duration: string;
  activities: Activity[];
  type: ActivityType;
  order: number;
  icon?: string;
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

export interface TripFilters {
  category?: string;
  difficulty?: TripDifficulty;
  duration?: string;
  budget?: string;
  location?: string;
} 