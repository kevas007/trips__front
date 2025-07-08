// ========== TYPES UTILISATEUR - ALIGNÉS AVEC LE BACKEND GO ==========

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  settings: UserSettings;
  stats: UserStats;
  preferences: UserTravelPreferences;
}

export interface UserSettings {
  biometricEnabled: boolean;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  language: string;
  currency: string;
  timezone: string;
  privacyLevel: 'public' | 'friends' | 'private';
  autoSync: boolean;
  dataCollection: boolean;
}

export interface UserStats {
  tripsCreated: number;
  tripsShared: number;
  tripsLiked: number;
  followers: number;
  following: number;
  totalViews: number;
  totalLikes: number;
  countriesVisited: number;
  citiesVisited: number;
}

export interface UserTravelPreferences {
  activities?: string[];
  accommodation?: string[];
  transport?: string[];
  food?: string[];
  budget?: string[];
  climate?: string[];
  culture?: string[];
}

// ========== PARAMÈTRES DE CONFIDENTIALITÉ ==========
export interface PrivacySettings {
  profile_visibility: 'public' | 'friends' | 'private';
  show_email: boolean;
  show_phone_number: boolean;
  show_date_of_birth: boolean;
  show_trips: 'public' | 'friends' | 'private';
  show_followers: 'public' | 'friends' | 'private';
  show_following: 'public' | 'friends' | 'private';
  show_badges: 'public' | 'friends' | 'private';
  show_stats: 'public' | 'friends' | 'private';
  allow_tagging: boolean;
  allow_messaging: 'everyone' | 'friends' | 'none';
}

// ========== PARAMÈTRES DE NOTIFICATION ==========
export interface NotificationSettings {
  new_follower: boolean;
  new_like: boolean;
  new_comment: boolean;
  new_message: boolean;
  new_badge: boolean;
  trip_reminder: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

// ========== BADGES ==========
export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  created_at: string;
}

export interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  badge: Badge;
  earned_at: string;
  created_at: string;
}

// ========== RELATIONS SOCIALES ==========
export interface UserFollow {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
}

// ========== PROFIL UTILISATEUR ==========
export interface UserProfile {
  id: number;
  user_id: number;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  birthday?: string;
  travel_preferences?: UserTravelPreferences;
  created_at: string;
  updated_at: string;
}

// ========== TYPES POUR LES DONNÉES PUBLIQUES ==========
export interface PublicUserData {
  [key: string]: any; // Le backend renvoie une map[string]interface{}
} 