import { StateCreator } from 'zustand';
import { User, LoginCredentials, RegisterData } from '../../types/unified';
import { authService } from '../../services/auth';
import { userService } from '../../services/userService';
import { UserTravelPreferences } from '../../types/user';

export interface AuthSlice {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isNewUser: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  setNewUser: (isNew: boolean) => void;
  completeOnboarding: () => void;
  updatePreferences: (preferences: UserTravelPreferences) => Promise<void>;
}

export const authSlice: StateCreator<AuthSlice> = (set, _get, _api) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isNewUser: false,

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
        name: (response.user as any).name || `${(response.user as any).first_name || 'User'} ${(response.user as any).last_name || 'Name'}`,
        firstName: (response.user as any).first_name || 'User',
        lastName: (response.user as any).last_name || 'Name',
        username: (response.user as any).username || 'user',
        avatar: (response.user as any).avatar_url || (response.user as any).avatarUrl,
        bio: (response.user as any).bio,
        verified: (response.user as any).verified || false,
        createdAt: (response.user as any).created_at || (response.user as any).createdAt || new Date().toISOString(),
        updatedAt: (response.user as any).updated_at || (response.user as any).updatedAt || new Date().toISOString(),
        settings: {
          biometricEnabled: false,
          notificationsEnabled: true,
          emailNotifications: true,
          language: 'fr',
          currency: 'EUR',
          timezone: 'Europe/Paris',
          privacyLevel: 'public',
          autoSync: true,
          dataCollection: true,
        },
        stats: {
          tripsCreated: 0,
          tripsShared: 0,
          tripsLiked: 0,
          followers: 0,
          following: 0,
          totalViews: 0,
          totalLikes: 0,
          countriesVisited: 0,
          citiesVisited: 0,
        },
        preferences: {
          activities: [],
          accommodation: [],
          transportation: [],
          food: [],
          budget: [],
          climate: [],
          culture: [],
        },
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
        name: (response.user as any).name || `${data.firstName || 'User'} ${data.lastName || 'Name'}`,
        firstName: data.firstName || (response.user as any).first_name || 'User',
        lastName: data.lastName || (response.user as any).last_name || 'Name',
        username: (response.user as any).username || data.username,
        avatar: (response.user as any).avatar_url || (response.user as any).avatarUrl,
        bio: (response.user as any).bio,
        verified: (response.user as any).verified || false,
        createdAt: (response.user as any).created_at || (response.user as any).createdAt || new Date().toISOString(),
        updatedAt: (response.user as any).updated_at || (response.user as any).updatedAt || new Date().toISOString(),
        settings: {
          biometricEnabled: false,
          notificationsEnabled: true,
          emailNotifications: true,
          language: 'fr',
          currency: 'EUR',
          timezone: 'Europe/Paris',
          privacyLevel: 'public',
          autoSync: true,
          dataCollection: true,
        },
        stats: {
          tripsCreated: 0,
          tripsShared: 0,
          tripsLiked: 0,
          followers: 0,
          following: 0,
          totalViews: 0,
          totalLikes: 0,
          countriesVisited: 0,
          citiesVisited: 0,
        },
        preferences: {
          activities: [],
          accommodation: [],
          transportation: [],
          food: [],
          budget: [],
          climate: [],
          culture: [],
        },
      };
      
      set({
        user,
        isAuthenticated: true,
        isNewUser: true, // Marquer comme nouvel utilisateur
        isLoading: false,
        error: null,
      });
      
      console.log('✅ Inscription réussie via authService');
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription via authService:', error);
      
      // IMPORTANT: Ne pas changer isAuthenticated en cas d'erreur d'inscription
      // pour éviter la redirection automatique vers login
      set({
        isLoading: false,
        error: error?.message || 'Erreur d\'inscription inconnue',
        // Garder isAuthenticated et user inchangés
      });
      
      // Relancer l'erreur pour que le composant puisse la gérer
      throw error;
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

  setNewUser: (isNew: boolean) => {
    set({ isNewUser: isNew });
  },

  completeOnboarding: () => {
    set({ isNewUser: false });
  },

  updatePreferences: async (preferences) => {
    try {
      console.log('📝 Tentative de mise à jour des préférences via userService...');
      await userService.updatePreferences(preferences);
      
      // Mettre à jour l'utilisateur dans le store
      set((state) => {
        if (state.user) {
          state.user.preferences = preferences;
        }
        return state;
      });
      
      console.log('✅ Mise à jour des préférences réussie via userService');
    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour des préférences:', error);
      set({
        error: error?.message || 'Erreur lors de la mise à jour des préférences',
      });
    }
  },
});
