// === services/api.ts - SERVICE API MODERNE ET ROBUSTE ===
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ========== TYPES ET INTERFACES ==========

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Types d'authentification
export interface LoginCredentials {
  email: string;
  password: string;
  biometric?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  enableNotifications?: boolean;
  referralCode?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  isFirstLogin: boolean;
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  version: string;
  deviceId: string;
  pushToken?: string;
  appVersion: string;
  timezone: string;
}

// Types utilisateur
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
  preferences: UserPreferences;
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

export interface UserPreferences {
  travelStyle: 'luxury' | 'mid-range' | 'budget' | 'backpacker';
  interests: string[];
  favoriteDestinations: string[];
  avoidedActivities: string[];
  dietaryRestrictions: string[];
  accessibility: string[];
}

// Types voyage
export interface Trip {
  id: string;
  title: string;
  description?: string;
  destination: Location;
  startDate: string;
  endDate: string;
  duration: number; // en jours
  isPublic: boolean;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  coverImage?: string;
  images: string[];
  tags: string[];
  category: 'leisure' | 'business' | 'adventure' | 'cultural' | 'romantic';
  
  // Métadonnées
  author: UserProfile;
  collaborators: Collaborator[];
  itinerary: TripDay[];
  budget?: TripBudget;
  stats: TripStats;
  
  // Paramètres
  allowComments: boolean;
  allowForks: boolean;
  requireApproval: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  verified: boolean;
  isFollowing?: boolean;
}

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

export interface Location {
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  googlePlaceId?: string;
  foursquareId?: string;
  timezone?: string;
  photos?: string[];
}

export interface Money {
  amount: number;
  currency: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  exchangeRate?: number;
}

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
  phone?: string;
  email?: string;
  website?: string;
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

// Budget et finances
export interface TripBudget {
  totalBudget?: number;
  currency: string;
  categories: BudgetCategory[];
  expenses: Expense[];
  sharedExpenses: SharedExpense[];
  summary: BudgetSummary;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  currency: string;
  color: string;
  icon: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  description?: string;
  date: string;
  location?: Location;
  paidBy: string;
  splitWith: ExpenseSplit[];
  receipt?: string;
  tags: string[];
  createdAt: string;
}

export interface SharedExpense {
  id: string;
  expense: Expense;
  splits: ExpenseSplit[];
  settlements: Settlement[];
  status: 'pending' | 'settled' | 'disputed';
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'accepted' | 'disputed';
}

export interface Settlement {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  method: 'cash' | 'transfer' | 'paypal' | 'venmo' | 'other';
  status: 'pending' | 'completed' | 'failed';
  date: string;
}

export interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  remaining: number;
  overBudget: boolean;
  byCategory: Record<string, { allocated: number; spent: number }>;
  byUser: Record<string, { spent: number; owes: number; owed: number }>;
}

// Statistiques et engagement
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

// IA et recommandations
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

// Recherche et découverte
export interface SearchFilters {
  destination?: string;
  duration?: {
    min?: number;
    max?: number;
  };
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  tags?: string[];
  category?: string;
  rating?: number;
  dateRange?: {
    start?: string;
    end?: string;
  };
  sortBy?: 'relevance' | 'popularity' | 'rating' | 'recent' | 'duration' | 'budget';
  sortOrder?: 'asc' | 'desc';
}

// ========== CONFIGURATION API ==========

const API_CONFIG = {
  baseURL: __DEV__ 
    ? Platform.select({
        ios: 'http://localhost:8083/api/v1',
        android: 'http://10.0.2.2:8083/api/v1', // Émulateur Android
        web: 'http://localhost:8083/api/v1',
      })
    : 'https://api.tripshare.app/v1',
  
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  maxRetryDelay: 10000,
  
  // Headers par défaut
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Platform': Platform.OS,
    'X-Client-Version': '1.0.0',
  }
};

// ========== CLASSE API SERVICE ==========

class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;
  private requestQueue: Array<() => void> = [];
  private isRefreshing = false;

  constructor() {
    this.client = this.createAxiosInstance();
    this.setupInterceptors();
    this.loadStoredTokens();
  }

  // ========== CONFIGURATION AXIOS ==========

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });
  }

  private setupInterceptors(): void {
    // Intercepteur de requête
    this.client.interceptors.request.use(
      async (config) => {
        // Ajouter le token d'authentification
        if (this.authToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Ajouter les métadonnées de l'appareil
        config.headers['X-Device-ID'] = await this.getDeviceId();
        config.headers['X-Request-ID'] = this.generateRequestId();
        config.headers['X-Timestamp'] = new Date().toISOString();

        // Logging en développement
        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
          if (config.data) {
            console.log('📤 Request Data:', JSON.stringify(config.data, null, 2));
          }
        }

        return config;
      },
      (error) => {
        console.error('❌ Request Interceptor Error:', error);
        return Promise.reject(this.normalizeError(error));
      }
    );

    // Intercepteur de réponse
    this.client.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`);
          console.log('📥 Response Data:', JSON.stringify(response.data, null, 2));
        }

        // Validation de la structure de réponse
        if (!this.isValidApiResponse(response.data)) {
          console.warn('⚠️ Invalid API response structure:', response.data);
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (__DEV__) {
          console.error(`❌ API Error: ${error.response?.status} ${originalRequest?.url}`);
          console.error('Error Details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
        }

        // Gestion de l'expiration du token (401)
        if (error.response?.status === 401 && !originalRequest._retry) {
          return this.handleTokenExpiration(originalRequest);
        }

        // Gestion des erreurs de réseau avec retry
        if (this.shouldRetry(error)) {
          return this.retryRequest(originalRequest);
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  // ========== GESTION DE L'AUTHENTIFICATION ==========

  private async handleTokenExpiration(originalRequest: AxiosRequestConfig & { _retry?: boolean }): Promise<AxiosResponse> {
    if (this.isRefreshing) {
      // Attendre que le refresh en cours se termine
      return new Promise((resolve, reject) => {
        this.requestQueue.push(() => {
          if (this.authToken) {
            originalRequest.headers!.Authorization = `Bearer ${this.authToken}`;
            resolve(this.client(originalRequest));
          } else {
            reject(new Error('Token refresh failed'));
          }
        });
      });
    }

    originalRequest._retry = true;
    this.isRefreshing = true;

    try {
      await this.refreshAuthToken();
      
      // Traiter la queue de requêtes en attente
      this.requestQueue.forEach(callback => callback());
      this.requestQueue = [];
      
      // Retry la requête originale
      if (this.authToken) {
        originalRequest.headers!.Authorization = `Bearer ${this.authToken}`;
        return this.client(originalRequest);
      } else {
        throw new Error('No auth token after refresh');
      }
    } catch (refreshError) {
      // Échec du refresh, déconnecter l'utilisateur
      this.requestQueue.forEach(callback => callback());
      this.requestQueue = [];
      await this.handleAuthFailure();
      throw new Error('Session expirée, veuillez vous reconnecter');
    } finally {
      this.isRefreshing = false;
    }
  }

  private async refreshAuthToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<void> {
    const response = await axios.post<ApiResponse<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }>>(`${API_CONFIG.baseURL}/auth/refresh`, {
      refreshToken: this.refreshToken,
      deviceInfo: await this.getDeviceInfo(),
    });

    if (response.data.success && response.data.data) {
      await this.storeTokens(
        response.data.data.accessToken,
        response.data.data.refreshToken
      );
    } else {
      throw new Error('Token refresh failed');
    }
  }

  private async handleAuthFailure(): Promise<void> {
    await this.clearTokens();
    // Émettre un événement pour notifier l'app de la déconnexion
    // EventEmitter.emit('auth:logout');
  }

  // ========== GESTION DES TOKENS ==========

  private async loadStoredTokens(): Promise<void> {
    try {
      const [authToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync('tripshare_auth_token'),
        SecureStore.getItemAsync('tripshare_refresh_token'),
      ]);

      this.authToken = authToken;
      this.refreshToken = refreshToken;

      if (__DEV__ && authToken) {
        console.log('🔑 Tokens loaded from secure storage');
      }
    } catch (error) {
      console.warn('⚠️ Failed to load stored tokens:', error);
      await this.clearTokens();
    }
  }

  private async storeTokens(authToken: string, refreshToken: string): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync('tripshare_auth_token', authToken),
        SecureStore.setItemAsync('tripshare_refresh_token', refreshToken),
      ]);

      this.authToken = authToken;
      this.refreshToken = refreshToken;

      if (__DEV__) {
        console.log('🔑 Tokens stored securely');
      }
    } catch (error) {
      console.error('❌ Failed to store tokens:', error);
      throw new Error('Erreur de stockage sécurisé');
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync('tripshare_auth_token'),
        SecureStore.deleteItemAsync('tripshare_refresh_token'),
      ]);

      this.authToken = null;
      this.refreshToken = null;

      if (__DEV__) {
        console.log('🔑 Tokens cleared');
      }
    } catch (error) {
      console.warn('⚠️ Failed to clear tokens:', error);
    }
  }

  // ========== MÉTHODES D'AUTHENTIFICATION ==========

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/login', {
        ...credentials,
        deviceInfo: await this.getDeviceInfo(),
      });

      if (response.data.success && response.data.data) {
        await this.storeTokens(
          response.data.data.tokens.accessToken,
          response.data.data.tokens.refreshToken
        );
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/register', {
        ...data,
        deviceInfo: await this.getDeviceInfo(),
      });

      if (response.data.success && response.data.data) {
        await this.storeTokens(
          response.data.data.tokens.accessToken,
          response.data.data.tokens.refreshToken
        );
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      // Notifier le serveur de la déconnexion
      if (this.authToken) {
        await this.client.post('/auth/logout', {
          refreshToken: this.refreshToken,
        });
      }

      return { success: true, message: 'Déconnexion réussie' };
    } catch (error) {
      console.warn('⚠️ Logout request failed:', error);
      return { success: true, message: 'Déconnexion locale réussie' };
    } finally {
      await this.clearTokens();
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post<ApiResponse>('/auth/forgot-password', {
        email,
        deviceInfo: await this.getDeviceInfo(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post<ApiResponse>('/auth/reset-password', {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post<ApiResponse>('/auth/verify-email', {
        token,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== MÉTHODES UTILISATEUR ==========

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.get<ApiResponse<User>>('/users/me');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.put<ApiResponse<User>>('/users/me', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    try {
      const response = await this.client.put<ApiResponse<UserSettings>>('/users/me/settings', settings);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await this.client.put<ApiResponse<UserPreferences>>('/users/me/preferences', preferences);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async uploadAvatar(imageUri: string): Promise<ApiResponse<{ avatarUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      const response = await this.client.post<ApiResponse<{ avatarUrl: string }>>(
        '/users/me/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // Upload plus long
        }
      );

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteAccount(): Promise<ApiResponse> {
    try {
      const response = await this.client.delete<ApiResponse>('/users/me');
      
      if (response.data.success) {
        await this.clearTokens();
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== MÉTHODES VOYAGES ==========

  async getTrips(page = 1, limit = 20, filters?: SearchFilters): Promise<ApiResponse<PaginatedResponse<Trip>>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...this.serializeFilters(filters),
      });

      const response = await this.client.get<ApiResponse<PaginatedResponse<Trip>>>(
        `/trips?${params}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTripById(tripId: string): Promise<ApiResponse<Trip>> {
    try {
      const response = await this.client.get<ApiResponse<Trip>>(`/trips/${tripId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createTrip(trip: Partial<Trip>): Promise<ApiResponse<Trip>> {
    try {
      const response = await this.client.post<ApiResponse<Trip>>('/trips', trip);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateTrip(tripId: string, trip: Partial<Trip>): Promise<ApiResponse<Trip>> {
    try {
      const response = await this.client.put<ApiResponse<Trip>>(`/trips/${tripId}`, trip);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteTrip(tripId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.delete<ApiResponse>(`/trips/${tripId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async duplicateTrip(tripId: string, title?: string): Promise<ApiResponse<Trip>> {
    try {
      const response = await this.client.post<ApiResponse<Trip>>(`/trips/${tripId}/duplicate`, {
        title,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async publishTrip(tripId: string): Promise<ApiResponse<Trip>> {
    try {
      const response = await this.client.post<ApiResponse<Trip>>(`/trips/${tripId}/publish`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async unpublishTrip(tripId: string): Promise<ApiResponse<Trip>> {
    try {
      const response = await this.client.post<ApiResponse<Trip>>(`/trips/${tripId}/unpublish`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== COLLABORATION ==========

  async inviteCollaborator(tripId: string, email: string, role: 'editor' | 'viewer'): Promise<ApiResponse> {
    try {
      const response = await this.client.post<ApiResponse>(`/trips/${tripId}/collaborators`, {
        email,
        role,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async removeCollaborator(tripId: string, userId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.delete<ApiResponse>(
        `/trips/${tripId}/collaborators/${userId}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateCollaboratorRole(tripId: string, userId: string, role: 'editor' | 'viewer'): Promise<ApiResponse> {
    try {
      const response = await this.client.put<ApiResponse>(
        `/trips/${tripId}/collaborators/${userId}`,
        { role }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== ENGAGEMENT SOCIAL ==========

  async likeTrip(tripId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post<ApiResponse>(`/trips/${tripId}/like`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async unlikeTrip(tripId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.delete<ApiResponse>(`/trips/${tripId}/like`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async saveTrip(tripId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post<ApiResponse>(`/trips/${tripId}/save`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async unsaveTrip(tripId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.delete<ApiResponse>(`/trips/${tripId}/save`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async shareTrip(tripId: string, platform: string): Promise<ApiResponse<{ shareUrl: string }>> {
    try {
      const response = await this.client.post<ApiResponse<{ shareUrl: string }>>(
        `/trips/${tripId}/share`,
        { platform }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async rateTrip(tripId: string, rating: number, review?: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post<ApiResponse>(`/trips/${tripId}/rate`, {
        rating,
        review,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== DÉCOUVERTE ET RECHERCHE ==========

  async getFeaturedTrips(category: 'discover' | 'trending' | 'nearby' = 'discover', page = 1): Promise<ApiResponse<PaginatedResponse<Trip>>> {
    try {
      const response = await this.client.get<ApiResponse<PaginatedResponse<Trip>>>(
        `/discover/trips?category=${category}&page=${page}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async searchTrips(query: string, filters?: SearchFilters, page = 1): Promise<ApiResponse<PaginatedResponse<Trip>>> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        ...this.serializeFilters(filters),
      });

      const response = await this.client.get<ApiResponse<PaginatedResponse<Trip>>>(
        `/search/trips?${params}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getPopularDestinations(): Promise<ApiResponse<Array<{ destination: string; count: number; image: string }>>> {
    try {
      const response = await this.client.get<ApiResponse<Array<{ destination: string; count: number; image: string }>>>(
        '/discover/destinations'
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTrendingTags(): Promise<ApiResponse<Array<{ tag: string; count: number }>>> {
    try {
      const response = await this.client.get<ApiResponse<Array<{ tag: string; count: number }>>>(
        '/discover/tags'
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSuggestedUsers(): Promise<ApiResponse<UserProfile[]>> {
    try {
      const response = await this.client.get<ApiResponse<UserProfile[]>>('/discover/users');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== INTELLIGENCE ARTIFICIELLE ==========

  async generateItinerary(request: AIItineraryRequest): Promise<ApiResponse<Trip>> {
    try {
      const response = await this.client.post<ApiResponse<Trip>>('/ai/generate-itinerary', request);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getRecommendations(tripId: string, preferences?: {
    budget?: string;
    interests?: string[];
    travelStyle?: string;
  }): Promise<ApiResponse<AIRecommendation[]>> {
    try {
      const response = await this.client.post<ApiResponse<AIRecommendation[]>>(
        `/ai/recommendations/${tripId}`,
        preferences
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async optimizeItinerary(tripId: string, constraints?: {
    maxDailyDistance?: number;
    preferredTransport?: string[];
    budgetLimits?: boolean;
  }): Promise<ApiResponse<Trip>> {
    try {
      const response = await this.client.post<ApiResponse<Trip>>(
        `/ai/optimize/${tripId}`,
        constraints
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async estimateBudget(destination: string, duration: number, travelStyle: string): Promise<ApiResponse<{
    estimatedBudget: number;
    currency: string;
    breakdown: Record<string, number>;
    confidence: number;
  }>> {
    try {
      const response = await this.client.post<ApiResponse<{
        estimatedBudget: number;
        currency: string;
        breakdown: Record<string, number>;
        confidence: number;
      }>>('/ai/estimate-budget', {
        destination,
        duration,
        travelStyle,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getChatResponse(tripId: string, message: string): Promise<ApiResponse<{ response: string; suggestions?: string[] }>> {
    try {
      const response = await this.client.post<ApiResponse<{ response: string; suggestions?: string[] }>>(
        `/ai/chat/${tripId}`,
        { message }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== BUDGET ET FINANCES ==========

  async getBudget(tripId: string): Promise<ApiResponse<TripBudget>> {
    try {
      const response = await this.client.get<ApiResponse<TripBudget>>(`/trips/${tripId}/budget`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateBudget(tripId: string, budget: Partial<TripBudget>): Promise<ApiResponse<TripBudget>> {
    try {
      const response = await this.client.put<ApiResponse<TripBudget>>(`/trips/${tripId}/budget`, budget);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addExpense(tripId: string, expense: Omit<Expense, 'id' | 'createdAt'>): Promise<ApiResponse<Expense>> {
    try {
      const response = await this.client.post<ApiResponse<Expense>>(`/trips/${tripId}/expenses`, expense);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateExpense(tripId: string, expenseId: string, expense: Partial<Expense>): Promise<ApiResponse<Expense>> {
    try {
      const response = await this.client.put<ApiResponse<Expense>>(`/trips/${tripId}/expenses/${expenseId}`, expense);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteExpense(tripId: string, expenseId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.delete<ApiResponse>(`/trips/${tripId}/expenses/${expenseId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async splitExpense(tripId: string, expenseId: string, splits: ExpenseSplit[]): Promise<ApiResponse<SharedExpense>> {
    try {
      const response = await this.client.post<ApiResponse<SharedExpense>>(
        `/trips/${tripId}/expenses/${expenseId}/split`,
        { splits }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async settleExpense(tripId: string, expenseId: string, settlement: Omit<Settlement, 'id' | 'date'>): Promise<ApiResponse<Settlement>> {
    try {
      const response = await this.client.post<ApiResponse<Settlement>>(
        `/trips/${tripId}/expenses/${expenseId}/settle`,
        settlement
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async uploadReceipt(tripId: string, expenseId: string, imageUri: string): Promise<ApiResponse<{ receiptUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('receipt', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as any);

      const response = await this.client.post<ApiResponse<{ receiptUrl: string }>>(
        `/trips/${tripId}/expenses/${expenseId}/receipt`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        }
      );

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== SOCIAL ET FOLLOWERS ==========

  async followUser(userId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post<ApiResponse>(`/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async unfollowUser(userId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.delete<ApiResponse>(`/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getFollowers(userId?: string, page = 1): Promise<ApiResponse<PaginatedResponse<UserProfile>>> {
    try {
      const endpoint = userId ? `/users/${userId}/followers` : '/users/me/followers';
      const response = await this.client.get<ApiResponse<PaginatedResponse<UserProfile>>>(
        `${endpoint}?page=${page}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getFollowing(userId?: string, page = 1): Promise<ApiResponse<PaginatedResponse<UserProfile>>> {
    try {
      const endpoint = userId ? `/users/${userId}/following` : '/users/me/following';
      const response = await this.client.get<ApiResponse<PaginatedResponse<UserProfile>>>(
        `${endpoint}?page=${page}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getFeed(page = 1): Promise<ApiResponse<PaginatedResponse<Trip>>> {
    try {
      const response = await this.client.get<ApiResponse<PaginatedResponse<Trip>>>(
        `/feed?page=${page}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== NOTIFICATIONS ==========

  async getNotifications(page = 1): Promise<ApiResponse<PaginatedResponse<{
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    read: boolean;
    createdAt: string;
  }>>> {
    try {
      const response = await this.client.get<ApiResponse<PaginatedResponse<any>>>(
        `/notifications?page=${page}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.put<ApiResponse>(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    try {
      const response = await this.client.put<ApiResponse>('/notifications/read-all');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updatePushToken(token: string): Promise<ApiResponse> {
    try {
      const response = await this.client.put<ApiResponse>('/users/me/push-token', {
        token,
        platform: Platform.OS,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== GÉOLOCALISATION ==========

  async getNearbyTrips(latitude: number, longitude: number, radius = 50): Promise<ApiResponse<Trip[]>> {
    try {
      const response = await this.client.get<ApiResponse<Trip[]>>(
        `/discover/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async searchPlaces(query: string, location?: { latitude: number; longitude: number }): Promise<ApiResponse<Location[]>> {
    try {
      const params = new URLSearchParams({ q: query });
      if (location) {
        params.append('lat', location.latitude.toString());
        params.append('lng', location.longitude.toString());
      }

      const response = await this.client.get<ApiResponse<Location[]>>(`/places/search?${params}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getPlaceDetails(placeId: string): Promise<ApiResponse<Location & {
    photos: string[];
    reviews: Array<{
      rating: number;
      text: string;
      author: string;
      date: string;
    }>;
    openingHours: string[];
    website?: string;
    phone?: string;
  }>> {
    try {
      const response = await this.client.get<ApiResponse<any>>(`/places/${placeId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== ANALYTICS ET STATISTIQUES ==========

  async getTripAnalytics(tripId: string): Promise<ApiResponse<{
    views: { date: string; count: number }[];
    likes: { date: string; count: number }[];
    demographics: {
      countries: Record<string, number>;
      ageGroups: Record<string, number>;
      travelStyles: Record<string, number>;
    };
    engagement: {
      averageViewDuration: number;
      bounceRate: number;
      shareRate: number;
    };
  }>> {
    try {
      const response = await this.client.get<ApiResponse<any>>(`/trips/${tripId}/analytics`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUserAnalytics(): Promise<ApiResponse<{
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    topTrips: Array<{ tripId: string; title: string; views: number }>;
    growthMetrics: {
      viewsGrowth: number;
      followersGrowth: number;
      engagementRate: number;
    };
  }>> {
    try {
      const response = await this.client.get<ApiResponse<any>>('/users/me/analytics');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== IMPORT/EXPORT ==========

  async importFromEmail(email: string): Promise<ApiResponse<Trip[]>> {
    try {
      const response = await this.client.post<ApiResponse<Trip[]>>('/import/email', { email });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async exportTrip(tripId: string, format: 'pdf' | 'json' | 'ics'): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      const response = await this.client.post<ApiResponse<{ downloadUrl: string }>>(
        `/trips/${tripId}/export`,
        { format }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async importFromUrl(url: string): Promise<ApiResponse<Trip>> {
    try {
      const response = await this.client.post<ApiResponse<Trip>>('/import/url', { url });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== UTILITAIRES ==========

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('❌ API Health Check Failed:', error);
      return false;
    }
  }

  async getAppConfig(): Promise<ApiResponse<{
    features: Record<string, boolean>;
    limits: Record<string, number>;
    maintenance: boolean;
    version: {
      current: string;
      minimum: string;
      recommended: string;
    };
  }>> {
    try {
      const response = await this.client.get<ApiResponse<any>>('/config');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== MÉTHODES PRIVÉES ==========

  private async getDeviceInfo(): Promise<DeviceInfo> {
    const deviceId = await this.getDeviceId();
    
    return {
      platform: Platform.OS as 'ios' | 'android' | 'web',
      version: Platform.Version.toString(),
      deviceId,
      appVersion: '1.0.0', // À remplacer par la vraie version
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private async getDeviceId(): Promise<string> {
    try {
      let deviceId = await SecureStore.getItemAsync('tripshare_device_id');
      
      if (!deviceId) {
        deviceId = this.generateUUID();
        await SecureStore.setItemAsync('tripshare_device_id', deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.warn('⚠️ Failed to get device ID:', error);
      return this.generateUUID();
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isValidApiResponse(data: any): boolean {
    return typeof data === 'object' && 
           data !== null && 
           typeof data.success === 'boolean';
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) {
      // Erreur réseau
      return true;
    }

    const status = error.response.status;
    
    // Retry pour les erreurs serveur temporaires
    return status >= 500 || status === 408 || status === 429;
  }

  private async retryRequest(originalRequest: AxiosRequestConfig & { _retryCount?: number }): Promise<AxiosResponse> {
    const retryCount = originalRequest._retryCount || 0;
    
    if (retryCount >= API_CONFIG.retryAttempts) {
      throw new Error('Nombre maximum de tentatives atteint');
    }

    const delay = Math.min(
      API_CONFIG.retryDelay * Math.pow(2, retryCount),
      API_CONFIG.maxRetryDelay
    );

    await new Promise(resolve => setTimeout(resolve, delay));

    originalRequest._retryCount = retryCount + 1;
    
    return this.client(originalRequest);
  }

  private serializeFilters(filters?: SearchFilters): Record<string, string> {
    if (!filters) return {};

    const serialized: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          serialized[key] = JSON.stringify(value);
        } else if (Array.isArray(value)) {
          serialized[key] = value.join(',');
        } else {
          serialized[key] = value.toString();
        }
      }
    });

    return serialized;
  }

  private normalizeError(error: any): Error {
    if (error.response) {
      // Erreur de réponse HTTP
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     `Erreur HTTP ${error.response.status}`;
      
      const normalizedError = new Error(message);
      (normalizedError as any).code = error.response.status;
      (normalizedError as any).data = error.response.data;
      
      return normalizedError;
    } else if (error.request) {
      // Erreur de réseau
      return new Error('Erreur de connexion. Vérifiez votre connexion internet.');
    } else {
      // Autre erreur
      return new Error(error.message || 'Une erreur inattendue s\'est produite');
    }
  }

  private handleError(error: any): ApiResponse {
    const normalizedError = this.normalizeError(error);
    
    return {
      success: false,
      error: normalizedError.message,
      code: (normalizedError as any).code,
      timestamp: new Date().toISOString(),
    };
  }

  // ========== GETTERS ==========

  get isAuthenticated(): boolean {
    return !!this.authToken;
  }

  get currentToken(): string | null {
    return this.authToken;
  }

  get apiBaseUrl(): string {
    return API_CONFIG.baseURL || '';
  }
}

// ========== INSTANCE SINGLETON ==========

export const apiService = new ApiService();

// ========== EXPORTS ==========

export default apiService;

// Types utilitaires
export type {
  User,
  Trip,
  Activity,
  Location,
  TripBudget,
  Expense,
  AIRecommendation,
  SearchFilters,
  UserProfile,
  DeviceInfo,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  PaginatedResponse,
  TripStats,
  UserStats,
  UserSettings,
  UserPreferences,
  AIItineraryRequest,
  Collaborator,
  ExpenseSplit,
  Settlement,
  SharedExpense,
  BudgetCategory,
  BudgetSummary,
  WeatherInfo,
  BookingInfo,
  Contact,
  Money,
  ActivityType,
};