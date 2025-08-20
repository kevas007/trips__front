import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, getFullApiUrl } from '../config/api';
import { User } from '../types/user';

// ========== TYPES D'AUTHENTIFICATION - ALIGNÉS BACKEND GO ==========

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  socialAuth?: {
    provider: string;
    id: string;
    idToken: string;
    name?: string;
    photoURL?: string;
  };
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

    const url = getFullApiUrl(endpoint);
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
  private isRefreshing: boolean = false;

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
      console.log('🌐 Configuration API:', API_CONFIG.CONFIG_INFO);

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
      // Le numéro de téléphone est optionnel côté backend; ne pas bloquer si absent
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

  // Actualisation du token avec protection contre les appels simultanés
  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('Aucun refresh token disponible');
    }

    // Éviter les appels simultanés de refresh
    if (this.isRefreshing) {
      throw new Error('Refresh déjà en cours');
    }

    this.isRefreshing = true;

    try {
      console.log('🔄 Tentative de rafraîchissement du token...');
      console.log('⏰ Refresh token disponible:', !!this.refreshToken);
      
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

      console.log('✅ Token rafraîchi avec succès');
      console.log('⏰ Nouveau token valide pour 24h');
      return token;
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement du token:', error);
      console.error('🔍 Détails de l\'erreur:', JSON.stringify(error, null, 2));
      await this.clearTokens();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Vérification du token avec protection contre les boucles infinies
  async verifyToken(): Promise<User> {
    await this.waitForInitialization();

    if (!this.token) {
      throw new Error('Aucun token disponible');
    }

    try {
      console.log('🔍 VerifyToken - Token disponible, appel de /users/me...');
      // Utiliser un endpoint qui nécessite l'authentification
      const userData = await apiClient.get<any>('/users/me');
      console.log('🔍 Données brutes de /users/me:', userData);
      
      // Gérer la structure { user: {...}, profile: {...} } retournée par le backend
      let userToNormalize = userData;
      if (userData && userData.user && userData.profile) {
        // Fusionner user et profile comme dans le ProfileScreen - compatible Hermes
        userToNormalize = Object.assign({}, userData.user || {}, userData.profile || {});
        console.log('🔍 Données fusionnées user+profile:', userToNormalize);
      }
      
      const normalizedUser = this.normalizeUser(userToNormalize);
      console.log('🔍 Utilisateur normalisé:', normalizedUser);
      return normalizedUser;
    } catch (error: any) {
      const status = error?.response?.status;
      // Si l'erreur est 401, tenter de rafraîchir le token UNE SEULE FOIS
      if (status === 401 && this.refreshToken && !this.isRefreshing) {
        try {
          console.log('🔄 Token 401 détecté, tentative de refresh...');
          await this.refreshAccessToken();
          // Réessayer la requête avec le nouveau token
          const userData = await apiClient.get<any>('/users/me');
          const normalizedUser = this.normalizeUser(userData);
          console.log('✅ Retry après refresh réussi');
          return normalizedUser;
        } catch (refreshError) {
          console.error('❌ Refresh failed, clearing tokens');
          await this.clearTokens();
          throw refreshError;
        }
      }
      // Pour 403, considérer le token invalide et nettoyer
      if (status === 403) {
        console.error('❌ VerifyToken 403 - clearing tokens');
        await this.clearTokens();
        throw error;
      }
      // Pour les erreurs 5xx / réseau, NE PAS nettoyer les tokens
      console.error('⚠️ VerifyToken non-auth error, conservation des tokens:', status);
      throw error;
    }
  }

  // Vérification de la validité du token
  async checkTokenValidity(): Promise<boolean> {
    try {
      if (!this.token) {
        console.log('❌ Aucun token trouvé - Déconnexion automatique');
        await this.logout();
        return false;
      }

      // Vérifier le token avec le backend
      await this.verifyToken();
      return true;
    } catch (error) {
      const status = (error as any)?.response?.status;
      if (status === 401 || status === 403) {
        console.error('❌ Token invalide - Déconnexion automatique:', error);
        await this.logout();
        return false;
      }
      console.warn('⚠️ Erreur non-auth lors de la vérification du token: on conserve la session');
      return true;
    }
  }

  // Déconnexion améliorée
  async logout(): Promise<void> {
    try {
      console.log('🔄 Déconnexion en cours...');
      
      // Appeler l'endpoint de déconnexion si on a un token et refreshToken
      if (this.token && this.refreshToken) {
        try {
          await apiClient.post('/auth/logout', {
            refresh_token: this.refreshToken
          });
          console.log('✅ Déconnexion côté serveur réussie');
        } catch (error) {
          console.warn('⚠️ Erreur lors de la déconnexion côté serveur:', error);
        }
      } else {
        console.log('⚠️ Pas de refresh token pour la déconnexion côté serveur');
      }

      // Nettoyer les tokens locaux
      await this.clearTokens();
      this.token = null;
      this.refreshToken = null;
      apiClient.clearAuthToken();

      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      // Forcer le nettoyage même en cas d'erreur
      await this.clearTokens();
      this.token = null;
      this.refreshToken = null;
      apiClient.clearAuthToken();
    }
  }

  // Normaliser les données utilisateur du backend vers le frontend
  private normalizeUser(backendUser: any): User {
    return {
      id: backendUser.id?.toString() || '',
      email: backendUser.email || '',
      name: `${backendUser.first_name || ''} ${backendUser.last_name || ''}`.trim(),
      username: backendUser.username || '',
      avatar: backendUser.avatar_url || backendUser.avatar,
      bio: backendUser.bio,
      verified: backendUser.email_verified || false,
      createdAt: backendUser.created_at || new Date().toISOString(),
      updatedAt: backendUser.updated_at || new Date().toISOString(),
      settings: {
        biometricEnabled: false,
        notificationsEnabled: true,
        emailNotifications: true,
        language: backendUser.language || 'fr',
        currency: backendUser.preferred_currency || 'EUR',
        timezone: backendUser.timezone || 'Europe/Paris',
        privacyLevel: 'public',
        autoSync: true,
        dataCollection: true,
      },
      stats: {
        tripsCreated: backendUser.stats?.total_trips || 0,
        tripsShared: backendUser.stats?.total_trips || 0,
        tripsLiked: 0,
        followers: backendUser.stats?.total_followers || 0,
        following: backendUser.stats?.total_following || 0,
        totalViews: 0,
        totalLikes: backendUser.stats?.total_likes || 0,
        countriesVisited: 0,
        citiesVisited: 0,
      },
      preferences: backendUser.travel_preferences || {
        activities: [],
        accommodation: [],
        transport: [],
        food: [],
        budget: [],
        climate: [],
        culture: [],
      },
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

  // Méthodes pour gérer le token
  setToken(token: string): void {
    this.token = token;
    apiClient.setAuthToken(token);
  }

  clearToken(): void {
    this.token = null;
    apiClient.clearAuthToken();
  }
}

export const authService = new AuthService();
export type { User };

