// === src/services/api.ts ===

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/api';

// ========== TYPES ==========
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
}

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
interface BackendResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class APIError extends Error {
  constructor(message: string, public statusCode?: number, public data?: any) {
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
class APIService {
  constructor() {
    console.log(`🚀 APIService initialisé en mode ${API_CONFIG.ENV_NAME}:`, API_CONFIG.BASE_URL);
  }

  // -------- MÉTHODE FETCH PRINCIPALE --------
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    try {
      // 1) Récupérer le token d'authentification (s'il existe)
      const token = await Storage.getItem('auth_token').catch(() => null);

      // 2) Construire la config de l'appel
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      if (API_CONFIG.ENABLE_LOGGING) {
        console.log(`🚀 ${config.method || 'GET'} ${url}`);
      }
      
      const response = await fetch(url, config);
      
      if (API_CONFIG.ENABLE_LOGGING) {
        console.log(`📡 Réponse: ${response.status}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: BackendResponse;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { success: false, error: errorText || `HTTP ${response.status}` };
        }
        throw new APIError(
          errorData.error || `Erreur HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      const data: BackendResponse<T> = await response.json();
      
      // Vérifier le format de réponse du backend Go
      if (!data.success) {
        throw new APIError(data.error || 'Erreur serveur', response.status, data);
      }
      
      if (API_CONFIG.ENABLE_LOGGING) {
        console.log('✅ Succès:', data.data);
      }
      
      return data.data as T;
    } catch (error: any) {
      console.error('❌ Erreur API:', error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Erreur de connexion: ${error.message}`, 0);
    }
  }

  // -------- Méthodes pour le service Auth --------
  setAuthToken(token: string) {
    // Cette méthode sera appelée par authService
    // Le token sera automatiquement inclus dans les prochains appels
  }

  clearAuthToken() {
    // Pour nettoyer le token lors de la déconnexion
  }

  // -------- AUTHENTIFICATION --------
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('📝 Inscription:', userData.email);

      // Format exact attendu par le backend Go
             // Validation des champs obligatoires selon le backend Go
       if (!userData.phone_number || userData.phone_number.trim().length === 0) {
         throw new APIError('Le numéro de téléphone est obligatoire', 400);
       }
       if (userData.username.length < 3 || userData.username.length > 30) {
         throw new APIError('Le nom d\'utilisateur doit contenir entre 3 et 30 caractères', 400);
       }
       if (userData.password.length < 8) {
         throw new APIError('Le mot de passe doit contenir au moins 8 caractères', 400);
       }

       const requestData = {
         email: userData.email.toLowerCase().trim(),
         username: userData.username.toLowerCase().trim(), // Backend force lowercase
         first_name: userData.first_name.trim(),
         last_name: userData.last_name.trim(),
         phone_number: userData.phone_number.trim(),
         password: userData.password,
       };

       console.log('📝 API - Données envoyées:', {
         ...requestData,
         password: '[HIDDEN]'
       });

       const response = await this.apiCall<{
         token: string;
         refresh_token: string;
         user: any;
       }>('/auth/register', {
         method: 'POST',
         body: JSON.stringify(requestData),
       });

      const { token, refresh_token, user } = response;

      // 1) Stocker les tokens
      await this.storeAuthData(token, refresh_token);
      // 2) Stocker l'utilisateur renvoyé
      await this.storeUserData(user);

      console.log('✅ Inscription réussie:', user.email);
      return {
        user,
        access_token: token,
        refresh_token: refresh_token,
      };
    } catch (error) {
      console.error('❌ Échec inscription:', error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Connexion:', credentials.email);

      // Format exact attendu par le backend Go
      const response = await this.apiCall<{
        token: string;
        refresh_token: string;
        user: any;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password,
        }),
      });

      const { token, refresh_token, user } = response;

      // 1) Stocker les tokens
      await this.storeAuthData(token, refresh_token);
      // 2) Stocker l'utilisateur renvoyé  
      await this.storeUserData(user);

      console.log('✅ Connexion réussie:', user.email);
      return {
        user,
        access_token: token,
        refresh_token: refresh_token,
      };
    } catch (error) {
      console.error('❌ Échec connexion:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🔓 Déconnexion...');
      
      // Appel API optionnel pour invalider le token côté serveur
      try {
        await this.apiCall('/auth/logout', { method: 'POST' });
      } catch (error) {
        console.warn('⚠️ Erreur lors de la déconnexion côté serveur:', error);
      }

      // Nettoyer les données locales
      await this.clearAuthData();
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      console.log('🔑 Récupération de mot de passe:', email);
      
      await this.apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      
      console.log('✅ Email de récupération envoyé');
    } catch (error) {
      console.error('❌ Erreur récupération mot de passe:', error);
      throw error;
    }
  }

  // -------- STOCKAGE DES DONNÉES --------
  private async storeAuthData(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      await Storage.setItem('auth_token', accessToken);
      if (refreshToken) {
        await Storage.setItem('refresh_token', refreshToken);
      }
      console.log('💾 Tokens stockés');
    } catch (error) {
      console.error('❌ Erreur stockage tokens:', error);
      throw new APIError('Impossible de stocker les tokens');
    }
  }

  private async storeUserData(user: User): Promise<void> {
    try {
      await Storage.setItem('user_data', JSON.stringify(user));
      console.log('💾 Données utilisateur stockées');
    } catch (error) {
      console.error('❌ Erreur stockage user:', error);
      throw new APIError('Impossible de stocker les données utilisateur');
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await Storage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Erreur récupération user:', error);
      return null;
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await Storage.getItem('auth_token');
    } catch (error) {
      console.error('❌ Erreur récupération token:', error);
      return null;
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        Storage.removeItem('auth_token'),
        Storage.removeItem('refresh_token'),
        Storage.removeItem('user_data'),
      ]);
      console.log('🗑️ Données d\'authentification supprimées');
    } catch (error) {
      console.error('❌ Erreur suppression données auth:', error);
    }
  }

  // -------- TEST DE CONNEXION --------
  async testConnection(): Promise<{ status: 'success' | 'error'; message: string }> {
    try {
      console.log('🔍 Test de connexion API...');
      const response = await this.apiCall<{ message: string }>('/health');
      return {
        status: 'success',
        message: response?.message || 'Connexion établie',
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Impossible de se connecter au serveur',
      };
    }
  }

  // -------- RÉCUPÉRATION DE L'UTILISATEUR ACTUEL --------
  async getCurrentUser(): Promise<User> {
    try {
      console.log('👤 Récupération utilisateur actuel...');
      const userData = await this.apiCall<any>('/users/me');
      return userData;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur actuel:', error);
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
}

// ========== INSTANCE SINGLETON ==========
export const api = new APIService();
export default api;
