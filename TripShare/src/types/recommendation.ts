import { Location } from './location';
import { Money } from './budget';

export interface AIRecommendation {
  id: string;
  type: 'activity' | 'restaurant' | 'accommodation' | 'transport' | 'route';
  title: string;
  description: string;
  location: Location;
  confidence: number; // 0-1
  reasoning: string[];
  
  // Détails financiers
  estimatedCost?: Money;
  priceRange?: 'budget' | 'mid-range' | 'luxury';
  
  // Détails temporels
  estimatedDuration?: number;
  bestTimeToVisit?: string;
  openingHours?: string;
  
  // Données externes
  rating?: number;
  reviewCount?: number;
  photos?: string[];
  bookingUrl?: string;
  
  // Métadonnées
  source: string;
  lastUpdated: string;
}

export interface AIItineraryRequest {
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
  currency?: string;
  travelStyle: 'luxury' | 'mid-range' | 'budget' | 'backpacker';
  interests: string[];
  groupSize: number;
  groupType: 'solo' | 'couple' | 'family' | 'friends' | 'business';
  accessibility?: string[];
  dietaryRestrictions?: string[];
  avoidances?: string[];
} 