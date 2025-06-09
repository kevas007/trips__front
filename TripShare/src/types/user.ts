export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  bio?: string;
  phone_number?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  is_premium: boolean;
  preferences: UserPreferences;
  privacy_settings: PrivacySettings;
  notification_settings: NotificationSettings;
  stats?: UserStats;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  currency: string;
  timezone: string;
  measurement_system: 'metric' | 'imperial';
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'friends';
  show_email: boolean;
  show_phone: boolean;
  show_birth_date: boolean;
  allow_friend_requests: boolean;
  allow_messages: boolean;
  show_activity_status: boolean;
  show_location: boolean;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  friend_requests: boolean;
  messages: boolean;
  comments: boolean;
  likes: boolean;
  shares: boolean;
  new_followers: boolean;
  trip_updates: boolean;
  marketing_emails: boolean;
}

export interface UserStats {
  total_trips: number;
  total_followers: number;
  total_following: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_views: number;
  average_rating: number;
  badges: Badge[];
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  earned_at: string;
  category: 'achievement' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
} 