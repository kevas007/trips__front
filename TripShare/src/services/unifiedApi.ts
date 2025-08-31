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

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit & { 
      skipApiPrefix?: boolean,
      timeout?: number 
    } = {}
  ): Promise<T> {
    // Récupérer le token depuis authService
    const token = authService.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': (options.headers as Record<string, string>)?.['Content-Type'] || 'application/json',
      ...(!options.skipApiPrefix && token && { Authorization: `Bearer ${token}` }),
      ...options.headers as Record<string, string>,
    };

    // Construire l'URL complète
    const fullUrl = getFullApiUrl(endpoint, options.skipApiPrefix);

    console.log(`🚀 UnifiedAPI ${options.method || 'GET'} ${fullUrl}`);
    console.log(`🔍 UnifiedAPI - Token disponible:`, !!token);
    console.log(`🌐 UnifiedAPI - Base URL: ${this.baseURL}`);

    try {
      // Ajouter un timeout et une gestion d'erreur réseau améliorée
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes

      let response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`📡 UnifiedAPI Réponse: ${response.status}`);

      // Si 401, essayer de rafraîchir le token et réessayer
      if (response.status === 401 && token) {
        try {
          console.log('🔄 UnifiedAPI - Token expiré, tentative de refresh...');
          const newToken = await authService.refreshAccessToken();
          console.log('✅ UnifiedAPI - Token rafraîchi, nouvelle tentative...');
          
          // Mettre à jour les headers avec le nouveau token
          headers.Authorization = `Bearer ${newToken}`;
          
          const retryController = new AbortController();
          const retryTimeoutId = setTimeout(() => retryController.abort(), 10000);
          
          response = await fetch(fullUrl, {
            ...options,
            headers,
            signal: retryController.signal,
          });
          
          clearTimeout(retryTimeoutId);
          console.log(`📡 UnifiedAPI Réponse après refresh: ${response.status}`);
        } catch (refreshError) {
          console.error('❌ UnifiedAPI - Échec du refresh:', refreshError);
          if (refreshError instanceof Error && refreshError.name !== 'AbortError') {
            await authService.logout();
            throw new Error('Session expirée, veuillez vous reconnecter');
          }
          throw refreshError;
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

      const responseText = await response.text();
      let data: any;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ UnifiedAPI - Erreur parsing JSON:', responseText);
        throw new Error('Réponse invalide du serveur');
      }
      
      // Vérifier que data n'est pas undefined ou null
      if (!data || typeof data !== 'object') {
        console.error('❌ UnifiedAPI - Données invalides après parsing:', data);
        throw new Error('Réponse invalide du serveur');
      }
      
      // Vérifier si c'est une réponse au format BackendResponse
      if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'success')) {
        // Format BackendResponse: {success: boolean, data: T, error?: string}
        if (!data.success) {
          throw new Error(data.error || 'Erreur serveur');
        }
        
        // S'assurer que data.data n'est pas undefined ou null
        if (data.data === undefined || data.data === null) {
          console.warn('⚠️ UnifiedAPI - data.data est null/undefined, retourner un objet vide');
          return {} as T;
        }
        // Retourner directement data.data
        return data.data as T;
      } else {
        // Format direct: retourner directement les données
        return data as T;
      }

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('❌ UnifiedAPI - Timeout de requête');
          throw new Error('Timeout de connexion - vérifiez votre connexion internet');
        } else if (error.message.includes('Network request failed')) {
          console.error('❌ UnifiedAPI - Erreur réseau');
          throw new Error('Erreur de connexion - vérifiez que le serveur est accessible');
        }
      }
      throw error;
    }
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