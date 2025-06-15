// === src/services/api.ts ===

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ========== CONFIGURATION DE L'API DE PRODUCTION ==========
const API_BASE_URL = 'http://34.246.200.184:8000/api/v1';

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
    console.log('🚀 APIService initialisé en mode PRODUCTION:', API_BASE_URL);
  }

  // -------- MÉTHODE FETCH PRINCIPALE --------
  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;

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

      console.log(`🚀 ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      console.log(`📡 Réponse: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}` };
        }
        throw new APIError(
          errorData.message || `Erreur HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      console.log('✅ Succès:', data);
      return data;
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

      // On suppose que le backend répond sous la forme :
      //   { success: true, data: { token, refresh_token, user: { … } } }
      const raw = await this.apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email.toLowerCase().trim(),
          username: userData.username.trim(),
          first_name: userData.first_name.trim(),
          last_name: userData.last_name.trim(),
          phone_number: userData.phone_number?.trim() || null,
          password: userData.password,
        }),
      });

      if (!raw.success || !raw.data || typeof raw.data.token !== 'string') {
        throw new APIError('Réponse inattendue du serveur (register)', 500, raw);
      }
      const accessToken = raw.data.token as string;
      const refreshToken = raw.data.refresh_token as string;
      const user = raw.data.user as User;

      // 1) Stocker les tokens
      await this.storeAuthData(accessToken, refreshToken);
      // 2) Stocker l'utilisateur renvoyé
      await this.storeUserData(user);

      console.log('✅ Inscription réussie:', user.email);
      return {
        user,
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      console.error('❌ Échec inscription:', error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Connexion:', credentials.email);

      // 1) Appel API à POST /auth/login – ici on suppose qu'on reçoit
      //    { success: true, data: { token, refresh_token } }
      const raw = await this.apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password,
        }),
      });

      if (!raw.success || !raw.data || typeof raw.data.token !== 'string') {
        throw new APIError('Réponse inattendue du serveur (login)', 500, raw);
      }

      const accessToken = raw.data.token as string;
      const refreshToken = raw.data.refresh_token as string;

      // 2) Stocker les tokens localement
      await this.storeAuthData(accessToken, refreshToken);

      // 3) Récupérer le profil complet de l'utilisateur via GET /users/me
      const profileRaw = await this.apiCall('/users/me', { method: 'GET' });
      // Selon l'implémentation du backend, on peut recevoir { data: user } ou directement user
      const user: User = profileRaw.data ? (profileRaw.data as User) : (profileRaw as User);

      // 4) Stocker l'utilisateur en local
      await this.storeUserData(user);

      console.log('✅ Connexion réussie – token + user stockés');
      return {
        user,
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      console.error('❌ Échec connexion:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // On tente d'avertir le serveur (si possible) – bien que l'on puisse ignorer cette erreur
      try {
        await this.apiCall('/auth/logout', { method: 'POST' });
      } catch (err) {
        console.log('⚠️ Erreur logout serveur (ignorée):', err);
      }
    } finally {
      // Toujours nettoyer le local
      await this.clearAuthData();
      console.log('✅ Déconnexion terminée');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await this.apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      console.log('✅ Email de récupération envoyé à :', email);
    } catch (error) {
      console.error('❌ Erreur mot de passe oublié:', error);
      throw error;
    }
  }

  // -------- STOCKAGE LOCAL --------
  private async storeAuthData(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      const promises: Promise<void>[] = [];
      // Stocker le token principal
      promises.push(Storage.setItem('auth_token', accessToken));
      if (refreshToken) {
        promises.push(Storage.setItem('refresh_token', refreshToken));
      }
      await Promise.all(promises);
      console.log('✅ Tokens stockés');
    } catch (error) {
      console.error('❌ Erreur stockage tokens:', error);
      throw error;
    }
  }

  private async storeUserData(user: User): Promise<void> {
    try {
      // On stocke l'objet utilisateur sous forme JSON stringify
      await Storage.setItem('user_data', JSON.stringify(user));
      console.log('✅ Utilisateur stocké');
    } catch (error) {
      console.error('❌ Erreur stockage utilisateur:', error);
      throw error;
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await Storage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
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
      console.log('✅ Données nettoyées');
    } catch (error) {
      console.warn('⚠️ Erreur nettoyage:', error);
    }
  }

  // -------- UTILITAIRES --------
  async testConnection(): Promise<{ status: 'success' | 'error'; message: string }> {
    try {
      const response = await this.apiCall('/');
      return {
        status: 'success',
        message: `✅ Connexion OK – ${response.message} v${response.version}`,
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: `❌ Connexion échouée: ${error.message}`,
      };
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.apiCall('/users/me', { method: 'GET' });
      const user: User = response.data ? (response.data as User) : (response as User);
      await this.storeUserData(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  // -------- MÉTHODES HTTP --------
  async get(endpoint: string, options: RequestInit = {}): Promise<any> {
    return this.apiCall(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint: string, data?: any, options: RequestInit = {}): Promise<any> {
    return this.apiCall(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any, options: RequestInit = {}): Promise<any> {
    return this.apiCall(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string, options: RequestInit = {}): Promise<any> {
    return this.apiCall(endpoint, { ...options, method: 'DELETE' });
  }
}

// ========== INSTANCE SINGLETON ==========
export const api = new APIService();
export default api;
