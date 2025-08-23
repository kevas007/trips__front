// Types unifiés pour éviter les conflits entre les différents services

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  avatarUrl?: string;
  bio?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  settings: UserSettings;
  stats: UserStats;
  preferences: UserTravelPreferences;
  profile?: UserProfile;
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
  transportation?: string[];
  food?: string[];
  budget?: string[];
  climate?: string[];
  culture?: string[];
}

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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
  phone_number?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
