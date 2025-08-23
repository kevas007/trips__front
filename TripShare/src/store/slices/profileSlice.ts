import { StateCreator } from 'zustand';
import { User, UserStats } from '../../types/user';

export interface ProfileSlice {
  // State
  profile: User | null;
  stats: UserStats | null;
  isLoadingProfile: boolean;
  profileError: string | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  fetchStats: () => Promise<void>;
  clearProfileError: () => void;
}

export const profileSlice: StateCreator<ProfileSlice> = (set, _get) => ({
  // Initial state
  profile: null,
  stats: null,
  isLoadingProfile: false,
  profileError: null,

  // Actions
  fetchProfile: async () => {
    set({ isLoadingProfile: true, profileError: null });
    
    try {
      // TODO: Implémenter l'appel API
      const response = await fetch('/api/v1/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      
      set({
        profile: data.profile,
        isLoadingProfile: false,
        profileError: null,
      });
    } catch (error) {
      set({
        isLoadingProfile: false,
        profileError: error instanceof Error ? error.message : 'Failed to fetch profile',
      });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoadingProfile: true, profileError: null });
    
    try {
      // TODO: Implémenter l'appel API
      const response = await fetch('/api/v1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const responseData = await response.json();
      
      set({
        profile: responseData.profile,
        isLoadingProfile: false,
        profileError: null,
      });
    } catch (error) {
      set({
        isLoadingProfile: false,
        profileError: error instanceof Error ? error.message : 'Failed to update profile',
      });
    }
  },

  fetchStats: async () => {
    set({ isLoadingProfile: true, profileError: null });
    
    try {
      // TODO: Implémenter l'appel API
      const response = await fetch('/api/v1/profile/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      
      set({
        stats: data.stats,
        isLoadingProfile: false,
        profileError: null,
      });
    } catch (error) {
      set({
        isLoadingProfile: false,
        profileError: error instanceof Error ? error.message : 'Failed to fetch stats',
      });
    }
  },

  clearProfileError: () => {
    set({ profileError: null });
  },
});
