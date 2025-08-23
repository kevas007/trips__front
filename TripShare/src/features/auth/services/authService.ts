import { LoginCredentials, RegisterData, AuthResponse, AuthError  } from '../features/auth/types';const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8085';

class AuthService {
  private baseUrl = `${API_BASE_URL}/api/v1/auth`;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData: AuthError = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: AuthError = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Refresh-Token': refreshToken,
      },
    });

    if (!response.ok) {
      const errorData: AuthError = await response.json();
      throw new Error(errorData.message || 'Token refresh failed');
    }

    return response.json();
  }

  async logout(accessToken: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData: AuthError = await response.json();
      throw new Error(errorData.message || 'Logout failed');
    }
  }
}

export const authService = new AuthService();
