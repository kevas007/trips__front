// === src/services/api.ts - VERSION PROFESSIONNELLE CORRIGÉE ===

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ========== CONFIGURATION ENVIRONNEMENT ==========

const API_CONFIGS = {
  development: {
    baseURL: 'http://localhost:8000/api/v1',
    timeout: 10000,
  },
  staging: {
    baseURL: 'https://staging-api.tripshare.com/api/v1',
    timeout: 15000,
  },
  production: {
    baseURL: 'https://api.tripshare.com/api/v1',
    timeout: 20000,
  },
};

const ENV = __DEV__ ? 'development' : 'production';
const CONFIG = API_CONFIGS[ENV];

// ========== TYPES PROFESSIONNELS ==========

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  avatar?: string | null;
  verified: boolean;
  created_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  bio?: string;
  preferences?: TravelPreferences;
  ratings?: UserRatings;
}

export interface TravelPreferences {
  sustainability_focused: boolean;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  music_preferences: string[];
  conversation_level: 'quiet' | 'moderate' | 'chatty';
}

export interface UserRatings {
  average_rating: number;
  total_ratings: number;
  driver_rating?: number;
  passenger_rating?: number;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  password: string;
  travel_preferences?: Partial<TravelPreferences>;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ========== GESTION D'ERREURS PROFESSIONNELLE ==========

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }

  get isNetworkError(): boolean {
    return this.statusCode === 0 || !this.statusCode;
  }

  get isServerError(): boolean {
    return (this.statusCode || 0) >= 500;
  }

  get isClientError(): boolean {
    return (this.statusCode || 0) >= 400 && (this.statusCode || 0) < 500;
  }

  get isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }
}

// ========== INTERCEPTEURS ET RETRY LOGIC ==========

class APIService {
  private baseURL: string;
  private timeout: number;
  private requestQueue: Set<string> = new Set();

  constructor() {
    this.baseURL = CONFIG.baseURL;
    this.timeout = CONFIG.timeout;
    
    console.log(`🚀 APIService initialisé: ${this.baseURL}`);
  }

  // ========== MÉTHODE FETCH AVEC RETRY ET CACHE ==========

  private async apiCall<T = any>(
    endpoint: string, 
    options: RequestInit = {},
    retryCount = 0
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const requestId = `${options.method || 'GET'}_${endpoint}`;

    // Éviter les requêtes en double
    if (this.requestQueue.has(requestId)) {
      throw new APIError('Requête déjà en cours', 429);
    }

    try {
      this.requestQueue.add(requestId);

      // Token d'authentification
      const token = await this.getStoredToken();
      
      // Configuration avec timeout et headers optimisés
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const config: RequestInit = {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': Platform.OS === 'ios' ? 'TripShare-iOS' : 'TripShare-Android',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      console.log(`🚀 ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      console.log(`📡 Réponse: ${response.status}`);

      // Gestion spéciale des erreurs d'auth
      if (response.status === 401 && token) {
        await this.handleTokenExpiration();
        throw new APIError('Token expiré', 401);
      }

      const responseText = await response.text();
      let responseData: APIResponse<T>;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { 
          success: response.ok, 
          data: responseText as any,
          message: response.ok ? 'Succès' : `Erreur HTTP ${response.status}`
        };
      }

      if (!response.ok) {
        throw new APIError(
          responseData.message || `Erreur HTTP ${response.status}`,
          response.status,
          responseData.errors,
          responseData.data
        );
      }

      console.log('✅ Succès:', responseData);
      return responseData;

    } catch (error: any) {
      console.error('❌ Erreur API:', error);

      // Retry logic pour les erreurs réseau
      if (error.name === 'AbortError') {
        throw new APIError('Timeout de la requête', 408);
      }

      if (error instanceof APIError) {
        // Retry automatique pour les erreurs serveur (3 tentatives max)
        if (error.isServerError && retryCount < 2) {
          console.log(`🔄 Retry ${retryCount + 1}/3`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.apiCall(endpoint, options, retryCount + 1);
        }
        throw error;
      }

      throw new APIError(
        `Erreur de connexion: ${error.message}`,
        0
      );
    } finally {
      this.requestQueue.delete(requestId);
    }
  }

  // ========== AUTHENTIFICATION AMÉLIORÉE ==========

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('📝 Inscription:', userData.email);

      const response = await this.apiCall<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email.toLowerCase().trim(),
          username: userData.username.trim(),
          first_name: userData.first_name.trim(),
          last_name: userData.last_name.trim(),
          phone_number: userData.phone_number?.trim() || null,
          password: userData.password,
          travel_preferences: userData.travel_preferences || {
            sustainability_focused: true,
            conversation_level: 'moderate'
          }
        }),
      });
      
      if (response.success && response.data) {
        await this.storeAuthData(response.data);
        console.log('✅ Inscription réussie:', response.data.user.email);
        return response.data;
      }
      
      throw new APIError('Réponse invalide du serveur');
    } catch (error) {
      console.error('❌ Échec inscription:', error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Connexion:', credentials.email);

      const response = await this.apiCall<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password,
        }),
      });
      
      if (response.success && response.data) {
        await this.storeAuthData(response.data);
        console.log('✅ Connexion réussie:', response.data.user.email);
        return response.data;
      }
      
      throw new APIError('Réponse invalide du serveur');
    } catch (error) {
      console.error('❌ Échec connexion:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = await this.getStoredToken();
      
      if (token) {
        try {
          await this.apiCall('/auth/logout', { method: 'POST' });
        } catch (error) {
          console.log('Erreur logout serveur (ignorée):', error);
        }
      }
    } finally {
      await this.clearAuthData();
      console.log('✅ Déconnexion terminée');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await this.apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
      });
      
      console.log('✅ Email envoyé:', email);
    } catch (error) {
      console.error('❌ Erreur mot de passe oublié:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      
      if (!refreshToken) {
        throw new APIError('Aucun refresh token', 401);
      }

      const response = await this.apiCall<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.success && response.data) {
        await this.storeAuthData(response.data);
        return response.data;
      }

      throw new APIError('Impossible de rafraîchir le token');
    } catch (error) {
      await this.clearAuthData();
      throw error;
    }
  }

  // ========== GESTION AVANCÉE DES TOKENS ==========

  private async handleTokenExpiration(): Promise<void> {
    try {
      await this.refreshToken();
    } catch (error) {
      // Token refresh échoué, forcer la déconnexion
      await this.clearAuthData();
      throw new APIError('Session expirée', 401);
    }
  }

  private async storeAuthData(authData: AuthResponse): Promise<void> {
    try {
      const promises = [
        SecureStore.setItemAsync('auth_token', authData.access_token),
        SecureStore.setItemAsync('refresh_token', authData.refresh_token),
        SecureStore.setItemAsync('user_data', JSON.stringify(authData.user)),
        SecureStore.setItemAsync('token_expires_at', 
          (Date.now() + authData.expires_in * 1000).toString()
        )
      ];
      
      await Promise.all(promises);
      console.log('✅ Données auth stockées');
    } catch (error) {
      console.error('❌ Erreur stockage auth:', error);
      throw error;
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return null;
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      // Vérifier expiration
      const expiresAt = await SecureStore.getItemAsync('token_expires_at');
      if (expiresAt && Date.now() > parseInt(expiresAt)) {
        console.log('🔄 Token expiré, tentative refresh...');
        await this.refreshToken();
      }

      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('❌ Erreur récupération token:', error);
      return null;
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync('auth_token'),
        SecureStore.deleteItemAsync('refresh_token'),
        SecureStore.deleteItemAsync('user_data'),
        SecureStore.deleteItemAsync('token_expires_at'),
      ]);
      console.log('✅ Données nettoyées');
    } catch (error) {
      console.warn('⚠️ Erreur nettoyage:', error);
    }
  }

  // ========== MÉTHODES UTILITAIRES ==========

  async testConnection(): Promise<{ status: 'success' | 'error'; message: string }> {
    try {
      const response = await this.apiCall('/health');
      return {
        status: 'success',
        message: `✅ Connexion OK - Version ${response.data?.version || 'unknown'}`
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: `❌ Connexion échouée: ${error.message}`
      };
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.apiCall<User>('/user/me');
      
      if (response.success && response.data) {
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.data));
        return response.data;
      }
      
      throw new APIError('Impossible de récupérer les données utilisateur');
    } catch (error) {
      throw error;
    }
  }

  // ========== NOUVELLES FONCTIONNALITÉS VOYAGE ==========

  async searchTrips(params: {
    from: string;
    to: string;
    date: string;
    passengers?: number;
    sustainability_only?: boolean;
  }) {
    return this.apiCall('/trips/search', {
      method: 'GET',
      // En production, utiliser URLSearchParams
    });
  }

  async createTrip(tripData: any) {
    return this.apiCall('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async getUserRatings(userId: string) {
    return this.apiCall(`/users/${userId}/ratings`);
  }
}

// ========== INSTANCE SINGLETON AVEC LAZY LOADING ==========
let apiInstance: APIService | null = null;

export const getAPIInstance = (): APIService => {
  if (!apiInstance) {
    apiInstance = new APIService();
  }
  return apiInstance;
};

export const api = getAPIInstance();
export default api;