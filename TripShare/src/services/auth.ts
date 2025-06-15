import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { api } from './api'; // Utiliser le bon service API

// Configuration API
const API_BASE_URL = 'http://34.246.200.184:8000/api/v1';

// Interface API simple
class ApiClient {
  private token: string | null = null;

  setAuthToken(token: string) {
    this.token = token;
  }

  clearAuthToken() {
    this.token = null;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };

    const response = await fetch(`http://34.246.200.184:8000/api/v1${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorResponse = {
        response: {
          status: response.status,
          data: error,
        },
      };
      throw errorResponse;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    console.log('🔍 ApiClient.get - Token disponible:', !!this.token, 'Token (20 premiers chars):', this.token?.substring(0, 20) || 'AUCUN');
    
    // Debug mobile : Afficher le statut du token
    const tokenStatus = `ApiClient GET ${endpoint}\n\nToken disponible: ${!!this.token}\nToken (20 chars): ${this.token?.substring(0, 20) || 'AUCUN'}`;
    Alert.alert('🔍 DEBUG Token', tokenStatus);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };

    console.log('🔍 ApiClient.get - Headers envoyés:', headers);
    
    // Debug mobile : Afficher les headers
    const hasAuthHeader = headers.hasOwnProperty('Authorization');
    Alert.alert('🔍 DEBUG Headers', `Headers Authorization: ${hasAuthHeader ? 'PRÉSENT' : 'MANQUANT'}\n\nHeaders complets: ${JSON.stringify(headers, null, 2)}`);

    const response = await fetch(`http://34.246.200.184:8000/api/v1${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorResponse = {
        response: {
          status: response.status,
          data: error,
        },
      };
      throw errorResponse;
    }

    return response.json();
  }
}

const apiClient = new ApiClient();

// Types d'authentification
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  socialAuth?: {
    provider: 'google' | 'apple';
    id: string;
    idToken: string;
    name: string;
    photoURL?: string;
  };
}

export interface RegisterData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  countryCode: string;
  phone: string;
  acceptTerms: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  countryCode?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// Configuration des tokens
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

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
      console.log('🔄 initTokens - Début de l\'initialisation');
      this.token = await AsyncStorage.getItem(TOKEN_KEY);
      this.refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      
      console.log('🔍 initTokens - Token récupéré:', !!this.token, 'Token (20 premiers chars):', this.token?.substring(0, 20) || 'AUCUN');
      console.log('🔍 initTokens - RefreshToken récupéré:', !!this.refreshToken);
      
      // Debug mobile : Afficher les tokens récupérés
      const initInfo = `Initialisation Tokens:\n\nToken trouvé: ${!!this.token}\nToken (20 chars): ${this.token?.substring(0, 20) || 'AUCUN'}\nRefreshToken: ${!!this.refreshToken}`;
      Alert.alert('🔄 DEBUG initTokens', initInfo);
      
      if (this.token) {
        apiClient.setAuthToken(this.token);
        console.log('🔑 Token restauré depuis le storage et défini dans ApiClient:', this.token.substring(0, 20) + '...');
        Alert.alert('✅ DEBUG', 'Token restauré et défini dans ApiClient');
      } else {
        console.log('❌ Aucun token trouvé dans le storage');
        Alert.alert('❌ DEBUG', 'Aucun token trouvé dans AsyncStorage');
      }
      
      this.isInitialized = true;
      console.log('✅ initTokens - Initialisation terminée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des tokens:', error);
      Alert.alert('❌ ERREUR initTokens', `Erreur: ${error}`);
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
    try {
      const loginData = {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
      };
      
      const response = await apiClient.post('/auth/login', loginData) as any;
      
      // Adapter la réponse du backend Go
      if (response.success && response.data) {
        const authResponse: AuthResponse = {
          user: {
            id: response.data.user?.id?.toString() || '',
            username: response.data.user?.username || '',
            email: response.data.user?.email || '',
            firstName: response.data.user?.first_name || '',
            lastName: response.data.user?.last_name || '',
            phone: response.data.user?.phone_number || '',
            countryCode: '+33', // Par défaut
            avatar: response.data.user?.avatar || undefined,
            isEmailVerified: response.data.user?.verified || false,
            isPhoneVerified: false,
            createdAt: response.data.user?.created_at || new Date().toISOString(),
            updatedAt: response.data.user?.updated_at || new Date().toISOString(),
          },
          token: response.data.token || '',
          refreshToken: response.data.refresh_token || '',
          expiresIn: 3600, // 1 heure par défaut
        };
        
        await this.saveTokens(authResponse.token, authResponse.refreshToken);
        return authResponse;
      }
      
      throw new Error('Réponse invalide du serveur');
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Inscription
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validation côté client
      this.validateRegisterData(data);
      
      // Transformer les données vers le format attendu par le backend Go
      const backendData = {
        email: data.email.toLowerCase().trim(),
        username: data.username.trim(),
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        phone_number: data.phone?.trim() || '',
        password: data.password,
      };
      
      const response = await apiClient.post('/auth/register', backendData) as any;
      
      // Adapter la réponse du backend Go vers notre format AuthResponse
      if (response.success && response.data) {
        const authResponse: AuthResponse = {
          user: {
            id: response.data.id?.toString() || '',
            username: response.data.username || '',
            email: response.data.email || '',
            firstName: response.data.first_name || '',
            lastName: response.data.last_name || '',
            phone: response.data.phone_number || '',
            countryCode: data.countryCode,
            avatar: response.data.avatar || undefined,
            isEmailVerified: response.data.verified || false,
            isPhoneVerified: false,
            createdAt: response.data.created_at || new Date().toISOString(),
            updatedAt: response.data.updated_at || new Date().toISOString(),
          },
          token: response.data.token || '',
          refreshToken: response.data.refresh_token || '',
          expiresIn: 3600, // 1 heure par défaut
        };
        
        await this.saveTokens(authResponse.token, authResponse.refreshToken);
        return authResponse;
      }
      
      throw new Error('Réponse invalide du serveur');
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Récupération de mot de passe
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Réinitialisation de mot de passe
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
        token,
        password: newPassword,
      });
      return response;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      if (this.token) {
        await apiClient.post('/auth/logout', { refreshToken: this.refreshToken });
      }
    } catch (error) {
      console.warn('Erreur lors de la déconnexion:', error);
    } finally {
      await this.clearTokens();
    }
  }

  // Actualisation du token
  async refreshAccessToken(): Promise<string> {
    try {
      if (!this.refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }

      const response = await apiClient.post<{ token: string; refreshToken: string }>('/auth/refresh', {
        refreshToken: this.refreshToken,
      });

      await this.saveTokens(response.token, response.refreshToken);
      return response.token;
    } catch (error) {
      await this.clearTokens();
      throw this.handleAuthError(error);
    }
  }

  // Vérification du statut d'authentification
  async verifyToken(): Promise<User> {
    try {
      console.log('🔍 verifyToken - Début de la vérification');
      console.log('🔍 verifyToken - isInitialized:', this.isInitialized);
      
      // Debug mobile : Afficher l'état initial
      Alert.alert('🔍 DEBUG verifyToken', `Début vérification\n\nInitialisé: ${this.isInitialized}`);
      
      await this.waitForInitialization();
      
      console.log('🔍 verifyToken - Token dans AuthService:', !!this.token, 'Token (20 premiers chars):', this.token?.substring(0, 20) || 'AUCUN');
      
      // Debug mobile : Afficher l'état des tokens
      const tokenInfo = `AuthService Token:\n\nDisponible: ${!!this.token}\nToken (20 chars): ${this.token?.substring(0, 20) || 'AUCUN'}\nLongueur: ${this.token?.length || 0}`;
      Alert.alert('🔍 DEBUG AuthService', tokenInfo);
      
      if (!this.token) {
        Alert.alert('❌ ERREUR', 'Aucun token disponible dans AuthService');
        throw new Error('Aucun token disponible');
      }

      // S'assurer que le token est bien défini dans ApiClient
      console.log('🔍 verifyToken - Définition du token dans ApiClient');
      apiClient.setAuthToken(this.token);
      Alert.alert('✅ DEBUG', 'Token défini dans ApiClient');

      console.log('🔍 Vérification du token avec headers:', {
        Authorization: `Bearer ${this.token.substring(0, 20)}...`
      });

      const response = await apiClient.get('/users/me') as any;
      
      // Adapter la réponse du backend Go vers notre format User
      if (response.success && response.data) {
        const user: User = {
          id: response.data.id?.toString() || '',
          username: response.data.username || '',
          email: response.data.email || '',
          firstName: response.data.first_name || '',
          lastName: response.data.last_name || '',
          phone: response.data.phone_number || '',
          countryCode: '+33', // Par défaut
          avatar: response.data.avatar || undefined,
          isEmailVerified: response.data.verified || false,
          isPhoneVerified: false,
          createdAt: response.data.created_at || new Date().toISOString(),
          updatedAt: response.data.updated_at || new Date().toISOString(),
        };
        return user;
      }
      
      throw new Error('Réponse invalide du serveur');
    } catch (error) {
      await this.clearTokens();
      throw this.handleAuthError(error);
    }
  }

  // Sauvegarde des tokens
  private async saveTokens(token: string, refreshToken: string): Promise<void> {
    try {
      console.log('💾 saveTokens - Début de la sauvegarde');
      console.log('💾 saveTokens - Token (20 premiers chars):', token.substring(0, 20) + '...');
      
      // Debug mobile : Afficher la sauvegarde
      const saveInfo = `Sauvegarde Tokens:\n\nToken (20 chars): ${token.substring(0, 20)}...\nLongueur token: ${token.length}`;
      Alert.alert('💾 DEBUG saveTokens', saveInfo);
      
      this.token = token;
      this.refreshToken = refreshToken;
      
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, token),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
      ]);

      apiClient.setAuthToken(token);
      console.log('✅ saveTokens - Tokens sauvegardés et définis dans ApiClient');
      Alert.alert('✅ DEBUG saveTokens', 'Tokens sauvegardés avec succès dans AsyncStorage et ApiClient');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des tokens:', error);
      Alert.alert('❌ ERREUR saveTokens', `Erreur: ${error}`);
      throw new Error('Impossible de sauvegarder les informations d\'authentification');
    }
  }

  // Suppression des tokens
  private async clearTokens(): Promise<void> {
    try {
      this.token = null;
      this.refreshToken = null;
      
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      ]);

      apiClient.clearAuthToken();
    } catch (error) {
      console.error('Erreur lors de la suppression des tokens:', error);
    }
  }

  // Validation des données d'inscription
  private validateRegisterData(data: RegisterData): void {
    const errors: Partial<Record<keyof RegisterData, string>> = {};

    if (!data.username || data.username.length < 3) {
      errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }

    if (!data.firstName || data.firstName.length < 2) {
      errors.firstName = 'Le prénom doit contenir au moins 2 caractères';
    }

    if (!data.lastName || data.lastName.length < 2) {
      errors.lastName = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Adresse email invalide';
    }

    if (!data.password || data.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!data.phone || data.phone.length < 8) {
      errors.phone = 'Numéro de téléphone invalide';
    }

    if (!data.acceptTerms) {
      errors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
    }

    if (Object.keys(errors).length > 0) {
      const error = new Error('Données d\'inscription invalides');
      (error as any).validationErrors = errors;
      throw error;
    }
  }

  // Gestion des erreurs d'authentification
  private handleAuthError(error: any): AuthError {
    console.error('Erreur d\'authentification:', error);

    // Erreur réseau
    if (!error.response) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Problème de connexion. Vérifiez votre connexion internet.',
      };
    }

    const { status, data } = error.response;

    // Erreurs de validation côté client
    if (error.validationErrors) {
      return {
        code: 'VALIDATION_ERROR',
        message: 'Données invalides',
        details: error.validationErrors,
      };
    }

    // Erreurs serveur spécifiques
    switch (status) {
      case 400:
        return {
          code: 'BAD_REQUEST',
          message: data?.message || 'Données invalides',
          field: data?.field,
          details: data?.errors,
        };

      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: data?.message || 'Email ou mot de passe incorrect',
        };

      case 403:
        return {
          code: 'FORBIDDEN',
          message: data?.message || 'Accès refusé',
        };

      case 409:
        return {
          code: 'CONFLICT',
          message: data?.message || 'Cet email est déjà utilisé',
          field: data?.field,
        };

      case 422:
        return {
          code: 'VALIDATION_ERROR',
          message: 'Données invalides',
          details: data?.errors,
        };

      case 429:
        return {
          code: 'RATE_LIMITED',
          message: 'Trop de tentatives. Veuillez réessayer plus tard.',
        };

      case 500:
        return {
          code: 'SERVER_ERROR',
          message: 'Erreur serveur temporaire. Veuillez réessayer.',
        };

      default:
        return {
          code: 'UNKNOWN_ERROR',
          message: data?.message || 'Une erreur inattendue s\'est produite',
        };
    }
  }

  // Getters pour les tokens
  getToken(): string | null {
    return this.token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    const hasToken = !!this.token;
    console.log('🔐 isAuthenticated check:', hasToken, 'token length:', this.token?.length || 0);
    return hasToken;
  }
}

export const authService = new AuthService();
