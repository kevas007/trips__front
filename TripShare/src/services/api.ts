// === src/services/api.ts ===

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_CONFIG, getFullApiUrl } from '../config/api';
import { APIResponse, UserTravelPreferences, User, Trip, Activity, Location, TripBudget, Expense, AIRecommendation, SearchFilters, UserProfile, DeviceInfo } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './auth';
import { APIService as BaseAPIService, APIError } from '../types/api';
import { TripFilters } from '../types/trip';

// ========== TYPES ==========
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
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
}

// ========== FORMAT RÉPONSE BACKEND GO ==========
interface BackendResponse {
  success: boolean;
  error?: string;
  data?: any;
}

const SECURE_STORE_OPTIONS = {
  keychainService: 'TripShare',
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

export class APIErrorImpl extends Error implements APIError {
  public code?: string;
  
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// On détecte si l'on est en environnement Web
const isWeb = Platform.OS === 'web';

// Petit utilitaire pour stocker/récupérer/effacer sur web ou mobile
const Storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  }
};

// ========== SERVICE API ==========
export class APIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.API_URL || 'http://localhost:3000/api';
    console.log(`🚀 APIService initialisé en mode ${API_CONFIG.ENV_NAME}:`, this.baseUrl);
  }

  // -------- MÉTHODE FETCH PRINCIPALE --------
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    console.log('🔍 Endpoint reçu:', endpoint);
    
    // Ne pas vérifier le token pour les routes d'authentification
    if (!endpoint.includes('/auth/')) {
      // Vérifier la validité du token avant chaque requête
      const isTokenValid = await authService.checkTokenValidity();
      if (!isTokenValid) {
        throw new APIErrorImpl('Session expirée', 401, null);
      }
    }

    const url = getFullApiUrl(endpoint);
    console.log('🔍 URL construite:', {
      endpoint,
      url,
      method: options.method || 'GET'
    });

    try {
      // Utiliser le token du service d'authentification
      const token = authService.getToken();
      console.log('🔑 Token trouvé:', !!token);

      if (!token && !endpoint.includes('/auth/')) {
        throw new APIErrorImpl('Non authentifié', 401, null);
      }

      // Créer le contrôleur d'abort avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);

      try {
        // Faire l'appel avec le signal d'abort
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
          },
          signal: controller.signal,
        });

        // Vérifier la réponse
        if (!response.ok) {
          // Si on reçoit une erreur 401, essayer de rafraîchir le token
          if (response.status === 401 && !endpoint.includes('/auth/')) {
            try {
              // Tenter de rafraîchir le token
              await authService.refreshAccessToken();
              
              // Réessayer la requête avec le nouveau token
              const newToken = authService.getToken();
              const retryResponse = await fetch(url, {
                ...options,
                headers: {
                  'Content-Type': 'application/json',
                  ...(newToken ? { 'Authorization': `Bearer ${newToken}` } : {}),
                  ...options.headers,
                },
              });

              if (!retryResponse.ok) {
                throw new APIErrorImpl(
                  `${retryResponse.status} ${retryResponse.statusText}`,
                  retryResponse.status,
                  await retryResponse.json().catch(() => null)
                );
              }

              return await retryResponse.json();
            } catch (refreshError) {
              // Si le rafraîchissement échoue, déconnecter l'utilisateur
              await authService.logout();
              throw new APIErrorImpl('Session expirée', 401, null);
            }
          }

          throw new APIErrorImpl(
            `${response.status} ${response.statusText}`,
            response.status,
            await response.json().catch(() => null)
          );
        }

        // Parser et retourner la réponse
        const data = await response.json();
        return data;

      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new APIErrorImpl('Timeout de la requête', 408, null);
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }

    } catch (error) {
      console.error(`❌ Erreur API: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      throw error;
    }
  }

  // -------- MÉTHODES GÉNÉRIQUES --------
  async get(endpoint: string, options: RequestInit = {}): Promise<any> {
    return this.apiCall(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint: string, data?: any, options: RequestInit = {}): Promise<any> {
    return this.apiCall(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data?: any, options: RequestInit = {}): Promise<any> {
    return this.apiCall(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string, options: RequestInit = {}): Promise<any> {
    return this.apiCall(endpoint, { ...options, method: 'DELETE' });
  }

  // -------- PRÉFÉRENCES UTILISATEUR --------
  async updatePreferences(preferences: Partial<UserTravelPreferences>): Promise<APIResponse<UserTravelPreferences>> {
    try {
      const response = await this.apiCall<APIResponse<UserTravelPreferences>>('/users/me/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }

  async getUserTravelPreferences(): Promise<APIResponse<UserTravelPreferences>> {
    try {
      const response = await this.apiCall<APIResponse<UserTravelPreferences>>('/users/me/travel-preferences');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      throw error;
    }
  }

  // -------- RECOMMANDATIONS --------
  async getRecommendedTrips(page: number = 1, limit: number = 10): Promise<APIResponse<any[]>> {
    try {
      const response = await this.apiCall<APIResponse<any[]>>(`/recommendations/trips?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
      throw error;
    }
  }

  async getTripsByCategory(category: string, page: number = 1, limit: number = 10): Promise<APIResponse<Trip[]>> {
    try {
      const response = await this.apiCall<APIResponse<Trip[]>>(`/recommendations/travel-category/${category}?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des voyages par catégorie:', error);
      throw error;
    }
  }

  // -------- VOYAGES --------
  async getTrips(filters: TripFilters): Promise<APIResponse<Trip[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.duration) queryParams.append('duration', filters.duration);
      if (filters.budget) queryParams.append('budget', filters.budget);
      if (filters.location) queryParams.append('location', filters.location);

      const response = await this.apiCall<APIResponse<Trip[]>>(`/trips?${queryParams.toString()}`);
      return response;
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
      };
    }
  }

  private handleError(error: unknown): APIError {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'unknown_error',
        status: 500,
      };
    }
    return {
      message: 'Une erreur inattendue s\'est produite',
      code: 'unknown_error',
      status: 500,
    };
  }
}

// ========== INSTANCE SINGLETON ==========
export const api = new APIService();
export default api;
