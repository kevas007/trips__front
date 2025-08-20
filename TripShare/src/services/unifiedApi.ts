import { authService } from './auth';
import { API_CONFIG, getFullApiUrl } from '../config/api';

// ========== FORMAT RÉPONSE BACKEND GO ==========
interface BackendResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Service API unifié qui utilise authService pour les tokens
class UnifiedApiService {
  private baseURL = API_CONFIG.BASE_URL;

  private async makeRequest<T>(endpoint: string, options: RequestInit & { skipApiPrefix?: boolean } = {}): Promise<T> {
    // Récupérer le token depuis authService
    let token = authService.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(!options.skipApiPrefix && token && { Authorization: `Bearer ${token}` }),
      ...options.headers as Record<string, string>,
    };

    // Construire l'URL complète
    const fullUrl = getFullApiUrl(endpoint, options.skipApiPrefix);

    console.log(`🚀 UnifiedAPI ${options.method || 'GET'} ${fullUrl}`);
    console.log(`🔍 UnifiedAPI - Token disponible:`, !!token);
    console.log(`🌐 UnifiedAPI - Base URL: ${this.baseURL}`);

    let response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    console.log(`📡 UnifiedAPI Réponse: ${response.status}`);

    // Si 401, essayer de rafraîchir le token et réessayer
    if (response.status === 401 && token) {
      try {
        console.log('🔄 UnifiedAPI - Token expiré, tentative de refresh...');
        const newToken = await authService.refreshAccessToken();
        console.log('✅ UnifiedAPI - Token rafraîchi, nouvelle tentative...');
        
        // Mettre à jour les headers avec le nouveau token
        headers.Authorization = `Bearer ${newToken}`;
        
        response = await fetch(fullUrl, {
          ...options,
          headers,
        });
        
        console.log(`📡 UnifiedAPI Réponse après refresh: ${response.status}`);
      } catch (refreshError) {
        console.error('❌ UnifiedAPI - Échec du refresh, déconnexion...');
        await authService.logout();
        throw new Error('Session expirée, veuillez vous reconnecter');
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: BackendResponse;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { success: false, error: errorText || `HTTP ${response.status}` };
      }

      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data: BackendResponse<T> = await response.json();
    
    // Vérifier le format de réponse du backend Go
    if (!data.success) {
      throw new Error(data.error || 'Erreur serveur');
    }

    // Retourner les données de réponse
    return data.data as T;
  }

  async get<T>(endpoint: string, options: { skipApiPrefix?: boolean } = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET', ...options });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
      headers: {
        ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options?.headers,
      },
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export const unifiedApi = new UnifiedApiService(); 