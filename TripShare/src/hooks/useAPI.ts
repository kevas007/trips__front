// ========== HOOK API SIMPLIFIÉ - UTILISE LES SERVICES CORRIGÉS ==========

import { useState } from 'react';
import { authService, AuthResponse, LoginCredentials, RegisterData, AuthError } from '../services/auth';
import { unifiedApi } from '../services/unifiedApi';
import { api } from '../services/api';
import type { User } from '../types/user';

// ========== TYPES POUR LE HOOK ==========

export interface UseAPIResult {
  // États
  loading: boolean;
  error: string | null;
  
  // Méthodes d'authentification
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string>;
  verifyToken: () => Promise<User>;
  
  // Méthodes API génériques
  get: <T>(endpoint: string) => Promise<T>;
  post: <T>(endpoint: string, data?: any) => Promise<T>;
  put: <T>(endpoint: string, data?: any) => Promise<T>;
  delete: <T>(endpoint: string) => Promise<T>;
  patch: <T>(endpoint: string, data?: any) => Promise<T>;
  
  // Méthodes utilitaires
  testConnection: () => Promise<{ status: 'success' | 'error'; message: string }>;
  getCurrentUser: () => Promise<User>;
  isAuthenticated: () => boolean;
  getToken: () => string | null;
}

// ========== HOOK PRINCIPAL ==========

export const useAPI = (): UseAPIResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========== WRAPPER POUR GÉRER LOADING ET ERREURS ==========
  
  const withLoadingAndError = async <T>(
    operation: () => Promise<T>,
    errorMessage = 'Une erreur est survenue'
  ): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      return result;
    } catch (err: any) {
      console.error('❌ Erreur dans useAPI:', err);
      const message = err?.message || errorMessage;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========== MÉTHODES D'AUTHENTIFICATION ==========

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return withLoadingAndError(
      () => authService.login(credentials),
      'Erreur lors de la connexion'
    );
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    return withLoadingAndError(
      () => authService.register(data),
      'Erreur lors de l\'inscription'
    );
  };

  const logout = async (): Promise<void> => {
    return withLoadingAndError(
      () => authService.logout(),
      'Erreur lors de la déconnexion'
    );
  };

  const refreshToken = async (): Promise<string> => {
    return withLoadingAndError(
      () => authService.refreshAccessToken(),
      'Erreur lors de l\'actualisation du token'
    );
  };

  const verifyToken = async (): Promise<User> => {
    return withLoadingAndError(
      () => authService.verifyToken(),
      'Erreur lors de la vérification du token'
    );
  };

  // ========== MÉTHODES API GÉNÉRIQUES ==========

  const get = async <T>(endpoint: string): Promise<T> => {
    return withLoadingAndError(
      () => unifiedApi.get<T>(endpoint),
      `Erreur lors de la récupération de ${endpoint}`
    );
  };

  const post = async <T>(endpoint: string, data?: any): Promise<T> => {
    return withLoadingAndError(
      () => unifiedApi.post<T>(endpoint, data),
      `Erreur lors de l'envoi vers ${endpoint}`
    );
  };

  const put = async <T>(endpoint: string, data?: any): Promise<T> => {
    return withLoadingAndError(
      () => unifiedApi.put<T>(endpoint, data),
      `Erreur lors de la mise à jour de ${endpoint}`
    );
  };

  const patch = async <T>(endpoint: string, data?: any): Promise<T> => {
    return withLoadingAndError(
      () => unifiedApi.patch<T>(endpoint, data),
      `Erreur lors de la modification de ${endpoint}`
    );
  };

  const deleteEndpoint = async <T>(endpoint: string): Promise<T> => {
    return withLoadingAndError(
      () => unifiedApi.delete<T>(endpoint),
      `Erreur lors de la suppression de ${endpoint}`
    );
  };

  // ========== MÉTHODES UTILITAIRES ==========

  const testConnection = async (): Promise<{ status: 'success' | 'error'; message: string }> => {
    return withLoadingAndError(
      () => api.testConnection(),
      'Erreur lors du test de connexion'
    );
  };

  const getCurrentUser = async (): Promise<any> => {
    return withLoadingAndError(
      () => api.getCurrentUser(),
      'Erreur lors de la récupération de l\'utilisateur actuel'
    );
  };

  // ========== MÉTHODES SYNCHRONES ==========

  const isAuthenticated = (): boolean => {
    return authService.isAuthenticated();
  };

  const getToken = (): string | null => {
    return authService.getToken();
  };

  // ========== RETOUR DU HOOK ==========

  return {
    // États
    loading,
    error,
    
    // Méthodes d'authentification
    login,
    register,
    logout,
    refreshToken,
    verifyToken,
    
    // Méthodes API génériques
    get,
    post,
    put,
    patch,
    delete: deleteEndpoint,
    
    // Méthodes utilitaires
    testConnection,
    getCurrentUser,
    isAuthenticated,
    getToken,
  };
}; 