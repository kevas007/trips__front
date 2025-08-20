// ========== STORE PRINCIPAL ZUSTAND ==========
// Équivalent Pinia pour React Native

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ========== TYPES ==========
import type { User } from '../types/user';
// import type { Trip } from '../types/trip';
import type { Theme } from '../types/theme';

// Types pour l'authentification
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  socialAuth?: any;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  username?: string;
  acceptTerms?: boolean;
}

// Types pour les tags
export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// Types pour les commentaires
interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    verified?: boolean;
  };
  text: string;
  likes: number;
  isLiked: boolean;
  timestamp: string;
  replies?: Comment[];
  isReply?: boolean;
}

// Types pour les réseaux sociaux
interface SocialPost {
  id: string;
  content: string;
  author: User | null;
  createdAt: string;
  likes: number;
  comments: any[];
  images: string[];
  isLiked?: boolean;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

// ========== STORE AUTHENTIFICATION ==========
interface AuthState {
  // État
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isNewUser: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: any) => Promise<void>;
  clearError: () => void;
  setNewUser: (isNew: boolean) => void;
  
  // Sélecteurs
  getUser: () => User | null;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // État initial
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isNewUser: false,
  
  // Actions
  login: async (credentials) => {
    set({
      isLoading: true,
      error: null,
    });
    
    try {
      // Import dynamique pour éviter les dépendances circulaires
      const { authService } = await import('../services/auth');
      const response = await authService.login(credentials);
      console.log('✅ Login - résultat:', {
        userId: response?.user?.id,
        email: response?.user?.email,
        hasToken: !!(response as any)?.token,
        hasRefresh: !!(response as any)?.refresh_token,
      });
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur de connexion',
        isLoading: false,
      });
      throw error;
    }
  },
  
  register: async (data) => {
    set({
      isLoading: true,
      error: null,
    });
    
    try {
      const { authService } = await import('../services/auth');
      // Normalisation et sécurisation des champs requis
      const email = (data.email || '').toLowerCase().trim();
      const firstName = (data.firstName || '').trim();
      const lastName = (data.lastName || '').trim();
      const rawUsername = (data.username || '').trim();
      const phone = (data.phone || '').trim();
      const password = (data.password || '').trim();

      // Génération d'un username si absent
      let safeUsername = rawUsername;
      if (!safeUsername) {
        const fromNames = (firstName + lastName).replace(/\s+/g, '');
        const fromEmail = email.split('@')[0] || '';
        safeUsername = (fromNames || fromEmail || 'user')
          .toLowerCase()
          .replace(/[^a-z0-9_\-]/g, '')
          .slice(0, 20);
      }
      if (!safeUsername) {
        throw new Error("Le nom d'utilisateur est obligatoire");
      }
      if (!email) {
        throw new Error("L'email est obligatoire");
      }
      if (!firstName) {
        throw new Error('Le prénom est obligatoire');
      }
      if (!lastName) {
        throw new Error('Le nom est obligatoire');
      }
      // Le numéro de téléphone est optionnel côté backend; on n'empêche pas l'inscription si absent
      if (!password) {
        throw new Error('Le mot de passe est obligatoire');
      }

      // Adapter les données pour le service (format backend)
      const adaptedData = {
        email,
        password,
        username: safeUsername,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
      };
      const response = await authService.register(adaptedData);
      console.log('✅ Register - résultat:', {
        userId: response?.user?.id,
        email: response?.user?.email,
        hasToken: !!(response as any)?.token,
        hasRefresh: !!(response as any)?.refresh_token,
      });
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isNewUser: true,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur d\'inscription',
        isLoading: false,
      });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const { authService } = await import('../services/auth');
      await authService.logout();
    } catch (error) {
      console.warn('Erreur lors de la déconnexion:', error);
    }
    
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      isNewUser: false,
    });
  },
  
  updateProfile: async (data) => {
    const currentUser = get().user;
    if (!currentUser) return;
    
    set({
      isLoading: true,
    });
    
    try {
      // Mise à jour locale pour l'instant
      set({
        user: { ...currentUser, ...data },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur de mise à jour',
        isLoading: false,
      });
      throw error;
    }
  },

  updatePreferences: async (preferences) => {
    const currentUser = get().user;
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }
    
    set({
      isLoading: true,
      error: null,
    });
    
    try {
      // Import dynamique pour éviter les dépendances circulaires
      const { authService } = await import('../services/auth');
      
      // Utiliser directement authService avec le bon token
      // On fait un appel PUT vers /users/me/preferences
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const { getFullApiUrl } = await import('../config/api');
      const url = getFullApiUrl('/users/me/travel-preferences');
      
      console.log('🔄 Sauvegarde des préférences avec token:', !!token);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur réponse:', response.status, errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Préférences mises à jour via store:', result);
      
      // Mettre à jour l'utilisateur local avec les nouvelles préférences
      set({
        user: { 
          ...currentUser, 
          preferences: preferences 
        },
        isLoading: false,
      });
      
      return result;
    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour des préférences:', error);
      set({
        error: error.message || 'Erreur de mise à jour des préférences',
        isLoading: false,
      });
      throw error;
    }
  },
  
  clearError: () => {
    set({
      error: null,
    });
  },
  
  setNewUser: (isNew) => {
    set({
      isNewUser: isNew,
    });
  },
  
  // Sélecteurs
  getUser: () => get().user,
  isLoggedIn: () => get().isAuthenticated,
}));

// ========== STORE THÈME ==========
interface ThemeState {
  // État
  themeMode: 'light' | 'dark' | 'system';
  fontSize: 'Petit' | 'Normal' | 'Grand' | 'Très grand';
  
  // Actions
  setTheme: (mode: 'light' | 'dark' | 'system') => void;
  setFontSize: (size: 'Petit' | 'Normal' | 'Grand' | 'Très grand') => void;
  toggleTheme: () => void;
  
  // Sélecteurs
  getTheme: () => Theme;
  isDark: () => boolean;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  // État initial
  themeMode: 'system',
  fontSize: 'Normal',
  
  // Actions
  setTheme: (mode) => {
    set({
      themeMode: mode,
    });
  },
  
  setFontSize: (size) => {
    set({
      fontSize: size,
    });
  },
  
  toggleTheme: () => {
    const currentMode = get().themeMode;
    let newMode: 'light' | 'dark' | 'system';
    
    if (currentMode === 'system') {
      newMode = 'dark';
    } else if (currentMode === 'dark') {
      newMode = 'light';
    } else {
      newMode = 'dark';
    }
    
    set({
      themeMode: newMode,
    });
  },
  
  // Sélecteurs
  getTheme: () => {
    const { themeMode } = get();
    const { lightTheme, darkTheme } = require('../types/theme');
    return themeMode === 'dark' ? darkTheme : lightTheme;
  },
  
  isDark: () => {
    const { themeMode } = get();
    return themeMode === 'dark';
  },
}));

// ========== STORE TRIPS ==========
interface TripState {
  // État
  trips: any[];
  currentTrip: any | null;
  savedTrips: any[];
  userTrips: any[];
  publicTrips: any[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadTrips: (refresh?: boolean) => Promise<void>;
  loadPublicTrips: (limit?: number, offset?: number) => Promise<any[]>;
  loadUserTrips: (userId?: string) => Promise<any[]>;
  createTrip: (tripData: any) => Promise<any>;
  updateTrip: (tripId: string, updates: any) => Promise<any>;
  deleteTrip: (tripId: string) => Promise<boolean>;
  likeTrip: (tripId: string) => Promise<boolean>;
  saveTrip: (tripId: string) => Promise<boolean>;
  uploadTripPhotos: (tripId: string, photos: any[]) => Promise<any[]>;
  setCurrentTrip: (trip: any | null) => void;
  clearError: () => void;
  
  // Sélecteurs
  getTripById: (id: string) => any | undefined;
  getSavedTrips: () => any[];
  getPublicTrips: () => any[];
  getUserTrips: () => any[];
}

export const useTripStore = create<TripState>((set, get) => ({
  // État initial
  trips: [],
  currentTrip: null,
  savedTrips: [],
  userTrips: [],
  publicTrips: [],
  loading: false,
  error: null,
  
  // Actions
  loadTrips: async (refresh = false) => {
    return get().loadPublicTrips(20, 0);
  },

  loadPublicTrips: async (limit: number = 20, offset: number = 0) => {
    set({ loading: true, error: null });
    
    try {
      const { authService } = await import('../services/auth');
      const token = authService.getToken();
      const { getFullApiUrl } = await import('../config/api');
      
      const url = getFullApiUrl(`/trips/public?limit=${limit}&offset=${offset}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const trips = result.success ? (result.data || []) : (Array.isArray(result) ? result : []);
      
      set(state => ({
        publicTrips: offset === 0 ? trips : [...state.publicTrips, ...trips],
        trips: offset === 0 ? trips : [...state.trips, ...trips],
        loading: false,
      }));
      
      return trips;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du chargement des voyages publics',
        loading: false,
      });
      throw error;
    }
  },

  loadUserTrips: async (userId?: string) => {
    set({ loading: true, error: null });
    
    try {
      const { authService } = await import('../services/auth');
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const { getFullApiUrl } = await import('../config/api');
      const endpoint = userId ? `/users/${userId}/trips` : '/users/me/trips';
      const url = getFullApiUrl(endpoint);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const trips = result.success ? (result.data || []) : (Array.isArray(result) ? result : []);
      
      set({ userTrips: trips, loading: false });
      return trips;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du chargement des voyages utilisateur',
        loading: false,
      });
      throw error;
    }
  },

  createTrip: async (tripData: any) => {
    set({ loading: true, error: null });
    
    try {
      const { authService } = await import('../services/auth');
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const { getFullApiUrl } = await import('../config/api');
      const url = getFullApiUrl('/trips');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const newTrip = result.success ? result.data : result;
      
      if (!newTrip) {
        throw new Error('Erreur lors de la création du voyage');
      }

      // Ajouter le nouveau voyage aux listes appropriées
      set(state => ({
        trips: [newTrip, ...state.trips],
        userTrips: [newTrip, ...state.userTrips],
        currentTrip: newTrip,
        loading: false,
      }));
      
      return newTrip;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de la création du voyage',
        loading: false,
      });
      throw error;
    }
  },

  updateTrip: async (tripId: string, updates: any) => {
    set({ loading: true, error: null });
    
    try {
      const { authService } = await import('../services/auth');
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const { getFullApiUrl } = await import('../config/api');
      const url = getFullApiUrl(`/trips/${tripId}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const updatedTrip = result.success ? result.data : result;
      
      // Mettre à jour le voyage dans toutes les listes
      set(state => ({
        trips: state.trips.map(trip => trip.id === tripId ? updatedTrip : trip),
        userTrips: state.userTrips.map(trip => trip.id === tripId ? updatedTrip : trip),
        publicTrips: state.publicTrips.map(trip => trip.id === tripId ? updatedTrip : trip),
        currentTrip: state.currentTrip?.id === tripId ? updatedTrip : state.currentTrip,
        loading: false,
      }));
      
      return updatedTrip;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de la mise à jour du voyage',
        loading: false,
      });
      throw error;
    }
  },

  deleteTrip: async (tripId: string) => {
    try {
      const { authService } = await import('../services/auth');
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const { getFullApiUrl } = await import('../config/api');
      const url = getFullApiUrl(`/trips/${tripId}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      // Supprimer le voyage de toutes les listes
      set(state => ({
        trips: state.trips.filter(trip => trip.id !== tripId),
        userTrips: state.userTrips.filter(trip => trip.id !== tripId),
        publicTrips: state.publicTrips.filter(trip => trip.id !== tripId),
        currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip,
      }));
      
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de la suppression du voyage',
      });
      return false;
    }
  },

  likeTrip: async (tripId: string) => {
    try {
      const { authService } = await import('../services/auth');
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const { getFullApiUrl } = await import('../config/api');
      const url = getFullApiUrl(`/trips/${tripId}/like`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      // Mettre à jour le like dans toutes les listes
      set(state => {
        const updateTrip = (trip: any) => {
          if (trip.id === tripId) {
            return {
              ...trip,
              isLiked: !trip.isLiked,
              likes: trip.isLiked ? trip.likes - 1 : trip.likes + 1,
            };
          }
          return trip;
        };

        return {
          trips: state.trips.map(updateTrip),
          userTrips: state.userTrips.map(updateTrip),
          publicTrips: state.publicTrips.map(updateTrip),
          currentTrip: state.currentTrip?.id === tripId ? updateTrip(state.currentTrip) : state.currentTrip,
        };
      });
      
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du like du voyage',
      });
      return false;
    }
  },

  saveTrip: async (tripId: string) => {
    try {
      const { authService } = await import('../services/auth');
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const { getFullApiUrl } = await import('../config/api');
      const url = getFullApiUrl(`/trips/${tripId}/save`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const isSaved = result.success ? result.data?.saved : true;
      
      // Mettre à jour la liste des voyages sauvegardés
      set(state => {
        const trip = state.trips.find(t => t.id === tripId) || 
                    state.publicTrips.find(t => t.id === tripId);
        
        if (trip) {
          return {
            savedTrips: isSaved 
              ? [...state.savedTrips, trip]
              : state.savedTrips.filter(t => t.id !== tripId),
          };
        }
        return state;
      });
      
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de la sauvegarde du voyage',
      });
      return false;
    }
  },

  uploadTripPhotos: async (tripId: string, photos: any[]) => {
    set({ loading: true, error: null });
    
    try {
      const { authService } = await import('../services/auth');
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const uploadedPhotos = [];
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const formData = new FormData();
        formData.append('photo', {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.name || `photo_${Date.now()}_${i}.jpg`,
        } as any);
        formData.append('trip_id', tripId);
        
        const { getFullApiUrl } = await import('../config/api');
        const url = getFullApiUrl(`/trips/${tripId}/photos`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          const uploadedPhoto = result.success ? result.data : result;
          uploadedPhotos.push(uploadedPhoto);
        } else {
          console.error(`Erreur upload photo ${i + 1}:`, response.status);
        }
      }
      
      set({ loading: false });
      return uploadedPhotos;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de l\'upload des photos',
        loading: false,
      });
      throw error;
    }
  },
  
  setCurrentTrip: (trip) => {
    set({ currentTrip: trip });
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  // Sélecteurs
  getTripById: (id) => {
    const state = get();
    return state.trips.find(trip => trip.id === id) ||
           state.userTrips.find(trip => trip.id === id) ||
           state.publicTrips.find(trip => trip.id === id);
  },
  
  getSavedTrips: () => {
    return get().savedTrips;
  },

  getPublicTrips: () => {
    return get().publicTrips;
  },

  getUserTrips: () => {
    return get().userTrips;
  },
}));

// ========== STORE SOCIAL ==========
interface SocialState {
  // État
  posts: SocialPost[];
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadPosts: (refresh?: boolean) => Promise<void>;
  loadNotifications: () => Promise<void>;
  createPost: (data: Partial<SocialPost>) => Promise<SocialPost>;
  likePost: (id: string) => Promise<void>;
  commentPost: (id: string, comment: string) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearError: () => void;
  
  // Sélecteurs
  getPostById: (id: string) => SocialPost | undefined;
  getUnreadNotifications: () => Notification[];
}

export const useSocialStore = create<SocialState>((set, get) => ({
  // État initial
  posts: [],
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  
  // Actions
  loadPosts: async (refresh = false) => {
    set({
      loading: true,
      error: null,
      posts: refresh ? [] : get().posts,
    });
    
    try {
      // Simulation d'appel API
      const mockPosts: SocialPost[] = [];
      
      set({
        posts: refresh ? mockPosts : [...get().posts, ...mockPosts],
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur de chargement',
        loading: false,
      });
      throw error;
    }
  },
  
  loadNotifications: async () => {
    try {
      // Simulation d'appel API
      const mockNotifications: Notification[] = [];
      
      set({
        notifications: mockNotifications,
        unreadCount: mockNotifications.filter(n => !n.read).length,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur de chargement des notifications',
      });
      throw error;
    }
  },
  
  createPost: async (data) => {
    try {
      // Simulation d'appel API
      const newPost: SocialPost = {
        id: Date.now().toString(),
        content: data.content || '',
        author: null, // Utilisateur sera récupéré depuis le store auth
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: [],
        images: data.images || [],
      };
      
      set({
        posts: [newPost, ...get().posts],
      });
      
      return newPost;
    } catch (error: any) {
      set({
        error: error.message || 'Erreur de création',
      });
      throw error;
    }
  },
  
  likePost: async (id) => {
    const currentPosts = get().posts;
    const updatedPosts = currentPosts.map(post => {
      if (post.id === id) {
        return {
          ...post,
          likes: post.likes + 1,
          isLiked: true,
        };
      }
      return post;
    });
    
    set({
      posts: updatedPosts,
    });
    
    try {
      // Appel API pour liker
    } catch (error: any) {
      // Revert on error
      set({
        posts: currentPosts,
      });
      throw error;
    }
  },
  
  commentPost: async (id, comment) => {
    try {
      // Appel API pour commenter
      const currentPosts = get().posts;
      const updatedPosts = currentPosts.map(post => {
        if (post.id === id) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: Date.now().toString(),
                content: comment,
                author: null,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
        return post;
      });
      
      set({
        posts: updatedPosts,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur de commentaire',
      });
      throw error;
    }
  },
  
  markNotificationAsRead: (id) => {
    const currentNotifications = get().notifications;
    const updatedNotifications = currentNotifications.map(notification => {
      if (notification.id === id && !notification.read) {
        return {
          ...notification,
          read: true,
        };
      }
      return notification;
    });
    
    set({
      notifications: updatedNotifications,
      unreadCount: Math.max(0, get().unreadCount - 1),
    });
  },
  
  markAllNotificationsAsRead: () => {
    const currentNotifications = get().notifications;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      read: true,
    }));
    
    set({
      notifications: updatedNotifications,
      unreadCount: 0,
    });
  },
  
  clearError: () => {
    set({
      error: null,
    });
  },
  
  // Sélecteurs
  getPostById: (id) => {
    return get().posts.find(post => post.id === id);
  },
  
  getUnreadNotifications: () => {
    return get().notifications.filter(n => !n.read);
  },
}));

// ========== STORE TAGS ==========
interface TagState {
  // État
  tags: Tag[];
  popularTags: Tag[];
  loading: boolean;
  error: string | null;
  
  // Actions
  searchTags: (query: string, limit?: number) => Promise<Tag[]>;
  createTag: (name: string, category?: string) => Promise<Tag>;
  getPopularTags: (limit?: number) => Promise<Tag[]>;
  clearError: () => void;
  
  // Sélecteurs
  getTagById: (id: string) => Tag | undefined;
  getTagByName: (name: string) => Tag | undefined;
}

export const useTagStore = create<TagState>((set, get) => ({
  // État initial
  tags: [],
  popularTags: [],
  loading: false,
  error: null,
  
  // Actions
  searchTags: async (query: string, limit: number = 10) => {
    if (query.length < 2) {
      return [];
    }

    set({ loading: true, error: null });
    
    try {
      const { authService } = await import('../services/auth');
      const token = authService.getToken();
      const { getFullApiUrl } = await import('../config/api');
      
      const url = getFullApiUrl(`/tags/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const tags = result.success ? (result.data?.tags || []) : [];
      
      // Mettre à jour les tags dans le store
      set(state => ({
        tags: [...state.tags, ...tags.filter((tag: Tag) => 
          !state.tags.some(existing => existing.id === tag.id)
        )],
        loading: false,
      }));
      
      return tags;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de la recherche de tags',
        loading: false,
      });
      throw error;
    }
  },

  createTag: async (name: string, category: string = 'general') => {
    set({ loading: true, error: null });
    
    try {
      const { authService } = await import('../services/auth');
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const { getFullApiUrl } = await import('../config/api');
      const url = getFullApiUrl('/tags');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, category }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const newTag = result.success ? result.data : null;
      
      if (!newTag) {
        throw new Error('Erreur lors de la création du tag');
      }

      // Ajouter le nouveau tag au store
      set(state => ({
        tags: [...state.tags, newTag],
        loading: false,
      }));
      
      return newTag;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de la création du tag',
        loading: false,
      });
      throw error;
    }
  },

  getPopularTags: async (limit: number = 20) => {
    set({ loading: true, error: null });
    
    try {
      const { authService } = await import('../services/auth');
      const token = authService.getToken();
      const { getFullApiUrl } = await import('../config/api');
      
      const url = getFullApiUrl(`/tags/popular?limit=${limit}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const tags = result.success ? (result.data?.tags || []) : [];
      
      set({ popularTags: tags, loading: false });
      return tags;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du chargement des tags populaires',
        loading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  // Sélecteurs
  getTagById: (id: string) => {
    return get().tags.find(tag => tag.id === id);
  },

  getTagByName: (name: string) => {
    return get().tags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
  },
}));

// ========== STORE COMMENTAIRES ==========
interface CommentsState {
  // État
  commentsByPost: Record<string, Comment[]>;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadComments: (postId: string, forceReload?: boolean) => Promise<Comment[]>;
  createComment: (postId: string, text: string, parentCommentId?: string) => Promise<Comment>;
  likeComment: (commentId: string) => Promise<boolean>;
  clearError: () => void;
  clearComments: (postId?: string) => void;
  
  // Sélecteurs
  getCommentsForPost: (postId: string) => Comment[];
  getCommentById: (commentId: string) => Comment | undefined;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  // État initial
  commentsByPost: {},
  loading: false,
  error: null,
  
  // Actions
  loadComments: async (postId: string, forceReload: boolean = false) => {
    const existingComments = get().commentsByPost[postId];
    if (!forceReload && existingComments) {
      return existingComments;
    }

    set({ loading: true, error: null });
    
    try {
      const { authService } = await import('../services/auth');
      const token = authService.getToken();
      const { getFullApiUrl } = await import('../config/api');
      
      const url = getFullApiUrl(`/posts/${postId}/comments`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      let comments: Comment[] = [];
      
      // Gérer les différents formats de réponse
      if (result.success && Array.isArray(result.data)) {
        comments = result.data;
      } else if (Array.isArray(result)) {
        comments = result;
      }
      
      // Mettre à jour les commentaires dans le store
      set(state => ({
        commentsByPost: {
          ...state.commentsByPost,
          [postId]: comments,
        },
        loading: false,
      }));
      
      return comments;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du chargement des commentaires',
        loading: false,
      });
      throw error;
    }
  },

  createComment: async (postId: string, text: string, parentCommentId?: string) => {
    set({ loading: true, error: null });
    
    try {
      const { authService } = await import('../services/auth');
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const { getFullApiUrl } = await import('../config/api');
      const url = getFullApiUrl(`/posts/${postId}/comments`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          text: text.trim(), 
          parentCommentId 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const newComment = result.success ? result.data : result;
      
      if (!newComment) {
        throw new Error('Erreur lors de la création du commentaire');
      }

      // Ajouter le nouveau commentaire au store
      set(state => ({
        commentsByPost: {
          ...state.commentsByPost,
          [postId]: [newComment, ...(state.commentsByPost[postId] || [])],
        },
        loading: false,
      }));
      
      return newComment;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de la création du commentaire',
        loading: false,
      });
      throw error;
    }
  },

  likeComment: async (commentId: string) => {
    try {
      const { authService } = await import('../services/auth');
      const token = authService.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const { getFullApiUrl } = await import('../config/api');
      const url = getFullApiUrl(`/comments/${commentId}/like`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      // Mettre à jour le like dans le store
      set(state => {
        const newCommentsByPost = { ...state.commentsByPost };
        
        Object.keys(newCommentsByPost).forEach(postId => {
          newCommentsByPost[postId] = newCommentsByPost[postId].map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              };
            }
            return comment;
          });
        });
        
        return { commentsByPost: newCommentsByPost };
      });
      
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du like du commentaire',
      });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearComments: (postId?: string) => {
    if (postId) {
      set(state => {
        const newCommentsByPost = { ...state.commentsByPost };
        delete newCommentsByPost[postId];
        return { commentsByPost: newCommentsByPost };
      });
    } else {
      set({ commentsByPost: {} });
    }
  },

  // Sélecteurs
  getCommentsForPost: (postId: string) => {
    return get().commentsByPost[postId] || [];
  },

  getCommentById: (commentId: string) => {
    const { commentsByPost } = get();
    for (const comments of Object.values(commentsByPost)) {
      const comment = comments.find(c => c.id === commentId);
      if (comment) return comment;
    }
    return undefined;
  },
}));

// ========== STORE RACINE ==========
// Combine tous les stores pour un accès centralisé

export const useRootStore = () => ({
  auth: useAuthStore(),
  theme: useThemeStore(),
  trips: useTripStore(),
  social: useSocialStore(),
  tags: useTagStore(),
  comments: useCommentsStore(),
});

// ========== HOOKS UTILITAIRES ==========

// Hook pour accéder à l'utilisateur connecté
export const useUser = () => {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  return {
    user,
    isAuthenticated,
    isLoggedIn: !!user && isAuthenticated,
  };
};

// Hook pour accéder au thème
export const useAppTheme = () => {
  const theme = useThemeStore(state => state.getTheme());
  const isDark = useThemeStore(state => state.isDark());
  const themeMode = useThemeStore(state => state.themeMode);
  const fontSize = useThemeStore(state => state.fontSize);
  const setTheme = useThemeStore(state => state.setTheme);
  const setFontSize = useThemeStore(state => state.setFontSize);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  
  return {
    theme,
    isDark,
    themeMode,
    fontSize,
    setTheme,
    setFontSize,
    toggleTheme,
  };
};

// Hook pour accéder aux voyages
export const useTrips = () => {
  const trips = useTripStore(state => state.trips);
  const currentTrip = useTripStore(state => state.currentTrip);
  const savedTrips = useTripStore(state => state.savedTrips);
  const userTrips = useTripStore(state => state.userTrips);
  const publicTrips = useTripStore(state => state.publicTrips);
  const loading = useTripStore(state => state.loading);
  const error = useTripStore(state => state.error);
  const loadTrips = useTripStore(state => state.loadTrips);
  const loadPublicTrips = useTripStore(state => state.loadPublicTrips);
  const loadUserTrips = useTripStore(state => state.loadUserTrips);
  const createTrip = useTripStore(state => state.createTrip);
  const updateTrip = useTripStore(state => state.updateTrip);
  const deleteTrip = useTripStore(state => state.deleteTrip);
  const likeTrip = useTripStore(state => state.likeTrip);
  const saveTrip = useTripStore(state => state.saveTrip);
  const uploadTripPhotos = useTripStore(state => state.uploadTripPhotos);
  const setCurrentTrip = useTripStore(state => state.setCurrentTrip);
  const clearError = useTripStore(state => state.clearError);
  const getTripById = useTripStore(state => state.getTripById);
  const getSavedTrips = useTripStore(state => state.getSavedTrips);
  const getPublicTrips = useTripStore(state => state.getPublicTrips);
  const getUserTrips = useTripStore(state => state.getUserTrips);
  
  return {
    trips,
    currentTrip,
    savedTrips,
    userTrips,
    publicTrips,
    loading,
    error,
    loadTrips,
    loadPublicTrips,
    loadUserTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    likeTrip,
    saveTrip,
    uploadTripPhotos,
    setCurrentTrip,
    clearError,
    getTripById,
    getSavedTrips,
    getPublicTrips,
    getUserTrips,
  };
};

// Hook pour accéder aux posts sociaux
export const useSocial = () => {
  const posts = useSocialStore(state => state.posts);
  const notifications = useSocialStore(state => state.notifications);
  const unreadCount = useSocialStore(state => state.unreadCount);
  const loading = useSocialStore(state => state.loading);
  const error = useSocialStore(state => state.error);
  const loadPosts = useSocialStore(state => state.loadPosts);
  const createPost = useSocialStore(state => state.createPost);
  const likePost = useSocialStore(state => state.likePost);
  const markNotificationAsRead = useSocialStore(state => state.markNotificationAsRead);
  
  return {
    posts,
    notifications,
    unreadCount,
    loading,
    error,
    loadPosts,
    createPost,
    likePost,
    markNotificationAsRead,
  };
};

// Hook pour accéder aux tags
export const useTags = () => {
  const tags = useTagStore(state => state.tags);
  const popularTags = useTagStore(state => state.popularTags);
  const loading = useTagStore(state => state.loading);
  const error = useTagStore(state => state.error);
  const searchTags = useTagStore(state => state.searchTags);
  const createTag = useTagStore(state => state.createTag);
  const getPopularTags = useTagStore(state => state.getPopularTags);
  const clearError = useTagStore(state => state.clearError);
  const getTagById = useTagStore(state => state.getTagById);
  const getTagByName = useTagStore(state => state.getTagByName);
  
  return {
    tags,
    popularTags,
    loading,
    error,
    searchTags,
    createTag,
    getPopularTags,
    clearError,
    getTagById,
    getTagByName,
  };
};

// Hook pour accéder aux commentaires
export const useComments = () => {
  const commentsByPost = useCommentsStore(state => state.commentsByPost);
  const loading = useCommentsStore(state => state.loading);
  const error = useCommentsStore(state => state.error);
  const loadComments = useCommentsStore(state => state.loadComments);
  const createComment = useCommentsStore(state => state.createComment);
  const likeComment = useCommentsStore(state => state.likeComment);
  const clearError = useCommentsStore(state => state.clearError);
  const clearComments = useCommentsStore(state => state.clearComments);
  const getCommentsForPost = useCommentsStore(state => state.getCommentsForPost);
  const getCommentById = useCommentsStore(state => state.getCommentById);
  
  return {
    commentsByPost,
    loading,
    error,
    loadComments,
    createComment,
    likeComment,
    clearError,
    clearComments,
    getCommentsForPost,
    getCommentById,
  };
};
