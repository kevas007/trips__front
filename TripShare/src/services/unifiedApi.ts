import { authService } from './auth';

// Service API unifié qui utilise authService pour les tokens
class UnifiedApiService {
  private baseURL = 'http://34.246.200.184:8000/api/v1';

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

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`📡 UnifiedAPI Réponse: ${response.status}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
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