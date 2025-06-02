// services/api.ts - Version experte avec interceptors
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

class APIService {
  private client: AxiosInstance;
  private refreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: __DEV__ ? 'http://localhost:8083/api/v1' : 'https://api.tripshare.com/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Ajouter token automatiquement
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Logs en développement
        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Gestion refresh token
    this.client.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.refreshing) {
            // Si déjà en cours de refresh, attendre
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.client(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.refreshing = true;

          try {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (!refreshToken) throw new Error('No refresh token');

            const response = await this.client.post('/auth/refresh', {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            
            await SecureStore.setItemAsync('accessToken', accessToken);
            await SecureStore.setItemAsync('refreshToken', newRefreshToken);

            // Résoudre toutes les requêtes en attente
            this.failedQueue.forEach(({ resolve }) => resolve());
            this.failedQueue = [];

            return this.client(originalRequest);
          } catch (refreshError) {
            // Échec refresh, déconnecter utilisateur
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            
            await this.logout();
            throw refreshError;
          } finally {
            this.refreshing = false;
          }
        }

        // Gestion d'erreurs spécifiques
        const errorMessage = this.getErrorMessage(error);
        if (__DEV__) {
          console.error(`❌ API Error: ${errorMessage}`);
        }

        return Promise.reject(new APIError(errorMessage, error.response?.status));
      }
    );
  }

  private getErrorMessage(error: any): string {
    if (!error.response) {
      return 'Problème de connexion. Vérifiez votre internet.';
    }

    switch (error.response.status) {
      case 400:
        return error.response.data?.message || 'Données invalides';
      case 401:
        return 'Session expirée. Reconnexion nécessaire.';
      case 403:
        return 'Accès non autorisé';
      case 404:
        return 'Ressource introuvable';
      case 429:
        return 'Trop de requêtes. Ralentissez un peu !';
      case 500:
        return 'Erreur serveur. Réessayez plus tard.';
      default:
        return 'Une erreur inattendue s\'est produite';
    }
  }

  // Méthodes API typées
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    
    // Stocker tokens automatiquement
    const { accessToken, refreshToken } = response.data;
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    
    return response.data;
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
    });
    
    const { accessToken, refreshToken } = response.data;
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      // Nettoyer même si la requête échoue
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
  }

  async getTrips(page = 1, limit = 20): Promise<PaginatedResponse<Trip>> {
    const response = await this.client.get<PaginatedResponse<Trip>>('/trips', {
      params: { page, limit },
    });
    return response.data;
  }

  async createTrip(trip: CreateTripRequest): Promise<Trip> {
    const response = await this.client.post<Trip>('/trips', trip);
    return response.data;
  }

  async uploadImage(uri: string, type: 'profile' | 'trip'): Promise<string> {
    const formData = new FormData();
    formData.append('image', {
      uri,
      type: 'image/jpeg',
      name: `${type}_${Date.now()}.jpg`,
    } as any);

    const response = await this.client.post<{ url: string }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  }
}

// Types TypeScript
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateTripRequest {
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  tags: string[];
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Instance singleton
export const api = new APIService();