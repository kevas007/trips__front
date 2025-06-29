import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';
import { User } from '../types/user';

// ========== TYPES D'AUTHENTIFICATION - ALIGNÉS BACKEND GO ==========

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string; // OBLIGATOIRE selon le backend Go
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// ========== FORMAT RÉPONSE BACKEND GO ==========
interface BackendResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ========== CLIENT API SIMPLE ==========
class ApiClient {
  private token: string | null = null;

  setAuthToken(token: string) {
    this.token = token;
  }

  clearAuthToken() {
    this.token = null;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers as Record<string, string>,
    };

    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log(`🚀 ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`📡 Réponse: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: BackendResponse;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { success: false, error: errorText || `HTTP ${response.status}` };
      }

      throw {
        response: {
          status: response.status,
          data: errorData,
        },
      };
    }

    const data: BackendResponse<T> = await response.json();
    
    // Vérifier le format de réponse du backend Go
    if (!data.success) {
      throw {
        response: {
          status: response.status,
          data: data,
        },
      };
    }

    return data.data as T;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();

// ========== CONFIGURATION DES TOKENS ==========
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// ========== SERVICE D'AUTHENTIFICATION ==========
class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initTokens();
  }

  // Initialisation des tokens depuis le storage
  private async initTokens() {
    try {
      console.log('🔄 Initialisation des tokens...');
      this.token = await AsyncStorage.getItem(TOKEN_KEY);
      this.refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      
      console.log('🔍 Token récupéré:', !!this.token);
      console.log('🔍 RefreshToken récupéré:', !!this.refreshToken);
      
      if (this.token) {
        apiClient.setAuthToken(this.token);
        console.log('🔑 Token restauré depuis le storage');
      }
      
      this.isInitialized = true;
      console.log('✅ Initialisation terminée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des tokens:', error);
      this.isInitialized = true;
    }
  }

  // Attendre que les tokens soient initialisés
  private async waitForInitialization(): Promise<void> {
    if (this.isInitialized) return;
    
    return new Promise((resolve) => {
      const checkInit = () => {
        if (this.isInitialized) {
          resolve();
        } else {
          setTimeout(checkInit, 10);
        }
      };
      checkInit();
    });
  }

  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await this.waitForInitialization();

    try {
      console.log('🔐 Connexion en cours...');

      // Format exact attendu par le backend Go
      const response = await apiClient.post<{
        token: string;
        refresh_token: string;
        user: any; // Données publiques de l'utilisateur
      }>('/auth/login', {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
      });

      const { token, refresh_token, user } = response;
      
      await this.saveTokens(token, refresh_token);
      this.token = token;
      this.refreshToken = refresh_token;
      apiClient.setAuthToken(token);

      console.log('✅ Connexion réussie');
      
      return {
        user: this.normalizeUser(user),
        token,
        refresh_token,
      };

    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      throw this.handleAuthError(error);
    }
  }

  // Inscription
  async register(data: RegisterData): Promise<AuthResponse> {
    await this.waitForInitialization();

    try {
      console.log('📝 Inscription en cours...');

      // Format exact attendu par le backend Go
      // Validation côté client avant envoi - PROTECTION CONTRE UNDEFINED
      if (!data.email || typeof data.email !== 'string') {
        throw new Error('L\'email est obligatoire');
      }
      if (!data.username || typeof data.username !== 'string') {
        throw new Error('Le nom d\'utilisateur est obligatoire');
      }
      if (!data.first_name || typeof data.first_name !== 'string') {
        throw new Error('Le prénom est obligatoire');
      }
      if (!data.last_name || typeof data.last_name !== 'string') {
        throw new Error('Le nom est obligatoire');
      }
      if (!data.phone_number || typeof data.phone_number !== 'string' || data.phone_number.trim().length === 0) {
        throw new Error('Le numéro de téléphone est obligatoire');
      }
      if (!data.password || typeof data.password !== 'string') {
        throw new Error('Le mot de passe est obligatoire');
      }

      const requestData = {
        email: data.email.toLowerCase().trim(),
        username: data.username.toLowerCase().trim(),
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone_number: data.phone_number.trim(),
        password: data.password,
      };

      console.log('📝 Données envoyées au backend:', {
        ...requestData,
        password: '[HIDDEN]'
      });

      const response = await apiClient.post<{
        token: string;
        refresh_token: string;
        user: any;
      }>('/auth/register', requestData);

      const { token, refresh_token, user } = response;
      
      await this.saveTokens(token, refresh_token);
      this.token = token;
      this.refreshToken = refresh_token;
      apiClient.setAuthToken(token);

      console.log('✅ Inscription réussie');
      
      return {
        user: this.normalizeUser(user),
        token,
        refresh_token,
      };

    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error);
      throw this.handleAuthError(error);
    }
  }

  // Actualisation du token
  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('Aucun refresh token disponible');
    }

    try {
      const response = await apiClient.post<{
        token: string;
        refresh_token: string;
      }>('/auth/refresh', {
        refresh_token: this.refreshToken,
      });

      const { token, refresh_token } = response;
      
      await this.saveTokens(token, refresh_token);
      this.token = token;
      this.refreshToken = refresh_token;
      apiClient.setAuthToken(token);

      return token;
    } catch (error) {
      await this.clearTokens();
      throw error;
    }
  }

  // Vérification du token
  async verifyToken(): Promise<User> {
    await this.waitForInitialization();

    if (!this.token) {
      throw new Error('Aucun token disponible');
    }

    try {
      // Utiliser un endpoint qui nécessite l'authentification
      const userData = await apiClient.get<any>('/users/me');
      return this.normalizeUser(userData);
    } catch (error) {
      await this.clearTokens();
      throw error;
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      if (this.token) {
        await apiClient.post('/auth/logout', {});
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      await this.clearTokens();
    }
  }

  // Normaliser les données utilisateur du backend vers le frontend
  private normalizeUser(backendUser: any): User {
    return {
      id: parseInt(backendUser.id?.toString() || '0'),
      email: backendUser.email || '',
      username: backendUser.username || '',
      first_name: backendUser.first_name || '',
      last_name: backendUser.last_name || '',
      preferred_currency: backendUser.preferred_currency,
      language: backendUser.language,
      timezone: backendUser.timezone,
      email_verified: backendUser.email_verified || false,
      is_active: backendUser.is_active || true,
      is_admin: backendUser.is_admin || false,
      last_login_at: backendUser.last_login_at,
      preferences: backendUser.preferences,
      privacy_settings: backendUser.privacy_settings,
      notification_settings: backendUser.notification_settings,
      stats: backendUser.stats,
      badges: backendUser.badges,
      created_at: backendUser.created_at || new Date().toISOString(),
      updated_at: backendUser.updated_at || new Date().toISOString(),
    };
  }

  // Sauvegarde des tokens
  private async saveTokens(token: string, refreshToken: string): Promise<void> {
    try {
      console.log('💾 Sauvegarde des tokens...');
      
      this.token = token;
      this.refreshToken = refreshToken;
      
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      
      apiClient.setAuthToken(token);
      console.log('✅ Tokens sauvegardés');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des tokens:', error);
      throw new Error('Impossible de sauvegarder les informations d\'authentification');
    }
  }

  // Suppression des tokens
  private async clearTokens(): Promise<void> {
    try {
      this.token = null;
      this.refreshToken = null;
      
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      
      apiClient.clearAuthToken();
      console.log('🗑️ Tokens supprimés');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression des tokens:', error);
    }
  }

  // Gestion des erreurs
  private handleAuthError(error: any): AuthError {
    console.error('❌ Auth Error:', error);
    
    let errorMessage = 'Une erreur est survenue';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error?.response?.data) {
      const data = error.response.data;
      
      if (data.error) {
        errorMessage = data.error;
      }
      
      if (error.response.status === 401) {
        errorCode = 'UNAUTHORIZED';
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.response.status === 409) {
        errorCode = 'CONFLICT';
        errorMessage = 'Email ou nom d\'utilisateur déjà utilisé';
      } else if (error.response.status >= 500) {
        errorCode = 'SERVER_ERROR';
        errorMessage = 'Erreur du serveur. Veuillez réessayer plus tard.';
      }
    } else if (error?.message?.includes('Network request failed') || error?.name === 'TypeError') {
      errorCode = 'NETWORK_ERROR';
      errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
    }

    return {
      code: errorCode,
      message: errorMessage,
      details: error,
    };
  }

  // Méthodes utilitaires
  getToken(): string | null {
    return this.token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService();
export type { User };

