import { StateCreator } from 'zustand';
import { User, LoginCredentials, RegisterData } from '../../types/unified';
import { authService } from '../../services/auth';

export interface AuthSlice {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const authSlice: StateCreator<AuthSlice> = (set, _get, _api) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('🔐 Tentative de connexion via authService...');
      const response = await authService.login(credentials);
      
      // Créer un utilisateur avec les données disponibles
      const user: User = {
        id: (response.user as any).id || 'unknown',
        email: (response.user as any).email || credentials.email,
        username: (response.user as any).username || 'user',
        firstName: (response.user as any).first_name || (response.user as any).firstName || 'User',
        lastName: (response.user as any).last_name || (response.user as any).lastName || 'Name',
        avatarUrl: (response.user as any).avatar_url || (response.user as any).avatarUrl,
        bio: (response.user as any).bio,
        createdAt: (response.user as any).created_at || (response.user as any).createdAt || new Date().toISOString(),
        updatedAt: (response.user as any).updated_at || (response.user as any).updatedAt || new Date().toISOString(),
        lastLogin: (response.user as any).last_login || (response.user as any).lastLogin,
      };
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      console.log('✅ Connexion réussie via authService');
    } catch (error: any) {
      console.error('❌ Erreur de connexion via authService:', error);
      set({
        isLoading: false,
        error: error?.message || 'Erreur de connexion inconnue',
      });
    }
  },

  logout: async () => {
    try {
      console.log('🔐 Déconnexion via authService...');
      await authService.logout();
      
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
      
      console.log('✅ Déconnexion réussie via authService');
    } catch (error: any) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      // Forcer le nettoyage même en cas d'erreur
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('📝 Tentative d\'inscription via authService...');
      
      // Convertir les données vers le format attendu par le backend
      const registerData = {
        email: data.email,
        password: data.password,
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phone_number || '',
      };
      
      const response = await authService.register(registerData);
      
      // Créer un utilisateur avec les données disponibles
      const user: User = {
        id: (response.user as any).id || 'unknown',
        email: (response.user as any).email || data.email,
        username: (response.user as any).username || data.username,
        firstName: (response.user as any).first_name || (response.user as any).firstName || data.firstName,
        lastName: (response.user as any).last_name || (response.user as any).lastName || data.lastName,
        avatarUrl: (response.user as any).avatar_url || (response.user as any).avatarUrl,
        bio: (response.user as any).bio,
        createdAt: (response.user as any).created_at || (response.user as any).createdAt || new Date().toISOString(),
        updatedAt: (response.user as any).updated_at || (response.user as any).updatedAt || new Date().toISOString(),
        lastLogin: (response.user as any).last_login || (response.user as any).lastLogin,
      };
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      console.log('✅ Inscription réussie via authService');
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription via authService:', error);
      set({
        isLoading: false,
        error: error?.message || 'Erreur d\'inscription inconnue',
      });
    }
  },

  refreshToken: async () => {
    try {
      // TODO: Implémenter le refresh token
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      
      set({
        user: data.user,
        isAuthenticated: true,
      });
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        error: error?.message || 'Token refresh failed',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
});
