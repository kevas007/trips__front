import { authService } from './auth';
import { API_CONFIG } from '../config/api';

// ========== FORMAT RÉPONSE BACKEND GO ==========
interface BackendResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Service API unifié qui utilise authService pour les tokens
class UnifiedApiService {
  private baseURL = API_CONFIG.BASE_URL;

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Récupérer le token depuis authService
    const token = authService.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers as Record<string, string>,
    };

    console.log(`🚀 UnifiedAPI ${options.method || 'GET'} ${endpoint}`);
    console.log(`🔍 UnifiedAPI - Token disponible:`, !!token);
    console.log(`🌐 UnifiedAPI - Base URL: ${this.baseURL}`);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`📡 UnifiedAPI Réponse: ${response.status}`);

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

  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
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
}

export const unifiedApi = new UnifiedApiService(); 