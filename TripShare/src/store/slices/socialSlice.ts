import { StateCreator } from 'zustand';
import { Trip } from '../../types/trips';

export interface SocialSlice {
  // State
  sharedTrips: Trip[];
  followers: string[];
  following: string[];
  isLoadingSocial: boolean;
  socialError: string | null;
  
  // Actions
  fetchSharedTrips: () => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  fetchFollowers: () => Promise<void>;
  fetchFollowing: () => Promise<void>;
  clearSocialError: () => void;
}

export const socialSlice: StateCreator<SocialSlice> = (set, _get) => ({
  // Initial state
  sharedTrips: [],
  followers: [],
  following: [],
  isLoadingSocial: false,
  socialError: null,

  // Actions
  fetchSharedTrips: async () => {
    set({ isLoadingSocial: true, socialError: null });
    
    try {
      // TODO: Implémenter l'appel API
      const response = await fetch('/api/v1/social/shared-trips');
      
      if (!response.ok) {
        throw new Error('Failed to fetch shared trips');
      }
      
      const data = await response.json();
      
      set({
        sharedTrips: data.trips,
        isLoadingSocial: false,
        socialError: null,
      });
    } catch (error) {
      set({
        isLoadingSocial: false,
        socialError: error instanceof Error ? error.message : 'Failed to fetch shared trips',
      });
    }
  },

  followUser: async (userId: string) => {
    set({ isLoadingSocial: true, socialError: null });
    
    try {
      // TODO: Implémenter l'appel API
      const response = await fetch(`/api/v1/social/follow/${userId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to follow user');
      }
      
      set((state) => ({
        following: [...state.following, userId],
        isLoadingSocial: false,
        socialError: null,
      }));
    } catch (error) {
      set({
        isLoadingSocial: false,
        socialError: error instanceof Error ? error.message : 'Failed to follow user',
      });
    }
  },

  unfollowUser: async (userId: string) => {
    set({ isLoadingSocial: true, socialError: null });
    
    try {
      // TODO: Implémenter l'appel API
      const response = await fetch(`/api/v1/social/unfollow/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to unfollow user');
      }
      
      set((state) => ({
        following: state.following.filter(id => id !== userId),
        isLoadingSocial: false,
        socialError: null,
      }));
    } catch (error) {
      set({
        isLoadingSocial: false,
        socialError: error instanceof Error ? error.message : 'Failed to unfollow user',
      });
    }
  },

  fetchFollowers: async () => {
    set({ isLoadingSocial: true, socialError: null });
    
    try {
      // TODO: Implémenter l'appel API
      const response = await fetch('/api/v1/social/followers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch followers');
      }
      
      const data = await response.json();
      
      set({
        followers: data.followers,
        isLoadingSocial: false,
        socialError: null,
      });
    } catch (error) {
      set({
        isLoadingSocial: false,
        socialError: error instanceof Error ? error.message : 'Failed to fetch followers',
      });
    }
  },

  fetchFollowing: async () => {
    set({ isLoadingSocial: true, socialError: null });
    
    try {
      // TODO: Implémenter l'appel API
      const response = await fetch('/api/v1/social/following');
      
      if (!response.ok) {
        throw new Error('Failed to fetch following');
      }
      
      const data = await response.json();
      
      set({
        following: data.following,
        isLoadingSocial: false,
        socialError: null,
      });
    } catch (error) {
      set({
        isLoadingSocial: false,
        socialError: error instanceof Error ? error.message : 'Failed to fetch following',
      });
    }
  },

  clearSocialError: () => {
    set({ socialError: null });
  },
});
