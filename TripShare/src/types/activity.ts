import { Location } from './location';
import { Money } from './budget';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  type: ActivityType;
  startTime?: string;
  endTime?: string;
  duration?: number; // en minutes
  location?: Location;
  cost?: Money;
  priority: 'high' | 'medium' | 'low' | 'optional';
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  
  // Détails
  notes?: string;
  photos: string[];
  bookingInfo?: BookingInfo;
  contacts?: Contact[];
  
  // Métadonnées
  createdBy: string;
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

export interface BookingInfo {
  confirmationNumber?: string;
  provider: string;
  bookingUrl?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'expired';
  cancellationPolicy?: string;
  contact?: Contact;
}

export interface Contact {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
} 