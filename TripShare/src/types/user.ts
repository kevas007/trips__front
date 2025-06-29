// ========== TYPES UTILISATEUR - ALIGNÉS AVEC LE BACKEND GO ==========

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  
  // Champs optionnels du backend Go
  preferred_currency?: string;
  language?: string;
  timezone?: string;
  email_verified: boolean;
  is_active: boolean;
  is_admin: boolean;
  last_login_at?: string;
  
  // Relations/Propriétés complexes (JSONB dans le backend)
  preferences?: UserPreferences;
  privacy_settings?: PrivacySettings;
  notification_settings?: NotificationSettings;
  stats?: UserStats;
  badges?: UserBadge[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ========== PRÉFÉRENCES UTILISATEUR ==========
export interface UserPreferences {
  theme?: string;
  notifications?: boolean;
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

// ========== STATISTIQUES UTILISATEUR ==========
export interface UserStats {
  trips_created: number;
  countries_visited: number;
  followers: number;
  following: number;
  total_likes: number;
  total_comments: number;
  total_photos: number;
  total_distance: number; // en kilomètres
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

// ========== PRÉFÉRENCES DE VOYAGE ==========
export interface UserTravelPreferences {
  // Structure à définir selon les besoins du backend
  [key: string]: any;
}

// ========== TYPES POUR LES DONNÉES PUBLIQUES ==========
export interface PublicUserData {
  [key: string]: any; // Le backend renvoie une map[string]interface{}
} 