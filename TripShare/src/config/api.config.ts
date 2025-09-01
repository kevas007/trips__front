/**
 * Configuration de l'API Backend TripShare
 */

export const API_CONFIG = {
  // URL de base de l'API
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1',
  
  // Endpoints d'authentification
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    
    // Nouveaux endpoints de vérification de disponibilité
    CHECK_USERNAME: '/auth/check-username',
    CHECK_EMAIL: '/auth/check-email',
  },
  
  // Endpoints utilisateur
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    AVATAR: '/user/avatar',
    PREFERENCES: '/user/preferences',
  },
  
  // Endpoints des voyages
  TRIPS: {
    LIST: '/trips',
    CREATE: '/trips',
    GET: (id: string) => `/trips/${id}`,
    UPDATE: (id: string) => `/trips/${id}`,
    DELETE: (id: string) => `/trips/${id}`,
    PHOTOS: (id: string) => `/trips/${id}/photos`,
    MEMBERS: (id: string) => `/trips/${id}/members`,
  },
  
  // Configuration des requêtes
  REQUEST: {
    TIMEOUT: 10000, // 10 secondes
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 seconde
  },
  
  // Configuration des erreurs
  ERRORS: {
    NETWORK_ERROR: 'Erreur de connexion au serveur',
    TIMEOUT_ERROR: 'La requête a pris trop de temps',
    VALIDATION_ERROR: 'Données de validation incorrectes',
    SERVER_ERROR: 'Erreur interne du serveur',
    UNAUTHORIZED: 'Non autorisé',
    FORBIDDEN: 'Accès interdit',
    NOT_FOUND: 'Ressource non trouvée',
  },
};

/**
 * Construit une URL complète pour un endpoint
 */
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

/**
 * Construit une URL pour la vérification de disponibilité du nom d'utilisateur
 */
export const buildUsernameCheckUrl = (username: string): string => {
  return buildApiUrl(API_CONFIG.AUTH.CHECK_USERNAME, { username });
};

/**
 * Construit une URL pour la vérification de disponibilité de l'email
 */
export const buildEmailCheckUrl = (email: string): string => {
  return buildApiUrl(API_CONFIG.AUTH.CHECK_EMAIL, { email });
};

/**
 * Configuration des headers par défaut
 */
export const getDefaultHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
};

/**
 * Configuration des headers avec authentification
 */
export const getAuthHeaders = (token: string): HeadersInit => {
  return {
    ...getDefaultHeaders(),
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Gestion des erreurs de l'API
 */
export const handleApiError = (response: Response): Promise<never> => {
  switch (response.status) {
    case 400:
      throw new Error(API_CONFIG.ERRORS.VALIDATION_ERROR);
    case 401:
      throw new Error(API_CONFIG.ERRORS.UNAUTHORIZED);
    case 403:
      throw new Error(API_CONFIG.ERRORS.FORBIDDEN);
    case 404:
      throw new Error(API_CONFIG.ERRORS.NOT_FOUND);
    case 500:
      throw new Error(API_CONFIG.ERRORS.SERVER_ERROR);
    default:
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
  }
};

/**
 * Effectue une requête API avec gestion des erreurs
 */
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const config: RequestInit = {
    headers: getDefaultHeaders(),
    ...options,
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(API_CONFIG.ERRORS.NETWORK_ERROR);
  }
};

/**
 * Effectue une requête API authentifiée
 */
export const authenticatedApiRequest = async <T>(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<T> => {
  const config: RequestInit = {
    headers: getAuthHeaders(token),
    ...options,
  };
  
  return apiRequest<T>(url, config);
};

export default API_CONFIG;
