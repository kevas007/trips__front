// === src/services/api.ts ===

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/api';
import { User } from '../types';
import { APIError } from '../types/api';

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

export class APIErrorImpl extends Error implements APIError {
  public code?: string;
  
  constructor(
    message: string,
    public status: number,
    public data?: unknown
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
    this.baseUrl = process.env.API_URL || API_CONFIG.BASE_URL + API_CONFIG.API_PREFIX;
    console.log(`🚀 APIService initialisé en mode ${API_CONFIG.ENV_NAME}:`, this.baseUrl);
  }

  // -------- MÉTHODE FETCH PRINCIPALE --------
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    console.log('🔍 Endpoint reçu:', endpoint);
    
    // Ne pas vérifier le token pour les routes d'authentification
    if (!endpoint.includes('/auth/')) {
      // Vérifier la validité du token avant chaque requête
      const token = await this.getValidToken();
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        };
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    console.log('🌐 URL complète:', url);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log('📡 Réponse reçue:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIErrorImpl(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erreur API:', error);
      throw error;
    }
  }

  // -------- GESTION DES TOKENS --------
  private async getValidToken(): Promise<string | null> {
    try {
      const token = await Storage.getItem('access_token');
      if (!token) return null;

      // TODO: Vérifier l'expiration du token
      return token;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await Storage.getItem('refresh_token');
      if (!refreshToken) return null;

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        await Storage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          await Storage.setItem('refresh_token', data.refresh_token);
        }
        return data.access_token;
      }
    } catch (error) {
      console.error('❌ Erreur lors du refresh token:', error);
    }
    return null;
  }

  // -------- MÉTHODES PUBLIQUES --------
  async get<T>(endpoint: string): Promise<T> {
    return this.apiCall<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.apiCall<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.apiCall<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.apiCall<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.apiCall<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Instance exportée
export const api = new APIService();
