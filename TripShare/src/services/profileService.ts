import { unifiedApi } from './unifiedApi';
import { User, UserStats, Badge, PrivacySettings, NotificationSettings } from '../types/user';
import { badgeService } from './badgeService';

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  phone_number?: string;
  date_of_birth?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// Données de fallback pour les stats
const DEFAULT_STATS: UserStats = {
  tripsCreated: 0,
  tripsShared: 0,
  tripsLiked: 0,
  followers: 0,
  following: 0,
  totalViews: 0,
  totalLikes: 0,
  countriesVisited: 0,
  citiesVisited: 0,
};

class ProfileService {
  // Récupérer le profil de l'utilisateur connecté
  async getProfile(): Promise<User> {
    try {
      const response = await unifiedApi.get<any>('/users/me');
      console.log('🔍 ProfileService.getProfile - Réponse brute:', response);
      
      // L'API unifiée retourne directement les données (après extraction de data.data)
      // Le backend retourne { user: ..., profile: ... }
      const { user, profile } = response;
      console.log('🔍 ProfileService.getProfile - User:', user);
      console.log('🔍 ProfileService.getProfile - Profile:', profile);
      
      if (!user || !profile) {
        throw new Error('Données de profil incomplètes');
      }
      
      // Fusionner user et profile pour compatibilité avec le frontend
      const userWithProfile = {
        ...user,
        profile: profile,
        // Ajouter l'avatar directement sur l'objet user pour compatibilité
        avatar: profile?.avatar_url || user?.avatar_url,
        avatar_url: profile?.avatar_url || user?.avatar_url,
        // S'assurer que le nom est correctement défini
        name: user?.first_name && user?.last_name ? 
          `${user.first_name} ${user.last_name}`.trim() : 
          user?.username || user?.name || 'Utilisateur TripShare',
        username: user?.username || user?.email?.split('@')[0] || 'utilisateur',
      };
      
      console.log('🔍 ProfileService.getProfile - User fusionné:', userWithProfile);
      return userWithProfile;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du profil:', error);
      throw new Error('Impossible de récupérer le profil utilisateur');
    }
  }

  // Mettre à jour le profil
  async updateProfile(data: ProfileUpdateData): Promise<User> {
    try {
      const response = await unifiedApi.put<any>('/users/me', data);
      // L'API unifiée retourne directement les données
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du profil:', error);
      throw new Error('Impossible de mettre à jour le profil');
    }
  }

  // Mettre à jour l'avatar
  async updateAvatar(imageUri: string): Promise<User> {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      const response = await unifiedApi.put<any>('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // L'API unifiée retourne directement les données
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'avatar:', error);
      throw new Error('Impossible de mettre à jour l\'avatar');
    }
  }

  // Récupérer les statistiques avec fallback
  async getStats(): Promise<UserStats> {
    try {
      const response = await unifiedApi.get<any>('/users/me/stats');
      // L'API unifiée retourne directement les données
      const stats = response;
      
      // Normaliser les statistiques avec des valeurs par défaut
      return {
        tripsCreated: stats.trips_created || stats.total_trips || 0,
        tripsShared: stats.trips_shared || stats.total_trips || 0,
        tripsLiked: stats.trips_liked || 0,
        followers: stats.followers || stats.total_followers || 0,
        following: stats.following || stats.total_following || 0,
        totalViews: stats.total_views || 0,
        totalLikes: stats.total_likes || 0,
        countriesVisited: stats.countries_visited || 0,
        citiesVisited: stats.cities_visited || 0,
      };
    } catch (error) {
      console.warn('⚠️ Erreur lors de la récupération des stats, utilisation du fallback:', error);
      return DEFAULT_STATS;
    }
  }

  // Récupérer les badges automatiquement basés sur les statistiques
  async getBadges(): Promise<Badge[]> {
    try {
      // Récupérer les statistiques utilisateur
      const stats = await this.getStats();
      const user = await this.getProfile();
      
      // Calculer les badges automatiquement
      const calculatedBadges = badgeService.calculateBadges(stats, user.createdAt || new Date().toISOString());
      
      console.log('🎖️ Badges calculés automatiquement:', calculatedBadges);
      return calculatedBadges;
    } catch (error) {
      console.warn('⚠️ Erreur lors du calcul des badges, utilisation du fallback:', error);
      // Retourner un badge par défaut pour les nouveaux utilisateurs
      return [{
        id: 1,
        name: 'Nouveau Voyageur',
        description: 'Bienvenue sur TripShare !',
        icon: '🎒',
        category: 'achievement',
        created_at: new Date().toISOString(),
      }];
    }
  }

  // Vérifier les nouveaux badges gagnés
  async checkNewBadges(currentBadges: Badge[]): Promise<Badge[]> {
    try {
      const stats = await this.getStats();
      const user = await this.getProfile();
      
      const newBadges = badgeService.checkForNewBadges(currentBadges, stats, user.createdAt || new Date().toISOString());
      
      if (newBadges.length > 0) {
        console.log('🎉 Nouveaux badges gagnés:', newBadges);
      }
      
      return newBadges;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des nouveaux badges:', error);
      return [];
    }
  }

  // Récupérer les followers
  async getFollowers(page: number = 1, limit: number = 20): Promise<PaginatedResponse<User>> {
    try {
      const response = await unifiedApi.get<any>(`/users/me/followers?page=${page}&limit=${limit}`);
      // L'API unifiée retourne directement les données
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des followers:', error);
      return { data: [], total: 0, page, limit, has_more: false };
    }
  }

  // Récupérer les following
  async getFollowing(page: number = 1, limit: number = 20): Promise<PaginatedResponse<User>> {
    try {
      const response = await unifiedApi.get<any>(`/users/me/following?page=${page}&limit=${limit}`);
      // L'API unifiée retourne directement les données
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des following:', error);
      return { data: [], total: 0, page, limit, has_more: false };
    }
  }

  // Suivre un utilisateur
  async followUser(userId: number): Promise<void> {
    try {
      await unifiedApi.post(`/users/${userId}/follow`);
    } catch (error) {
      console.error('❌ Erreur lors du suivi de l\'utilisateur:', error);
      throw new Error('Impossible de suivre cet utilisateur');
    }
  }

  // Ne plus suivre un utilisateur
  async unfollowUser(userId: number): Promise<void> {
    try {
      await unifiedApi.delete(`/users/${userId}/follow`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt du suivi:', error);
      throw new Error('Impossible d\'arrêter de suivre cet utilisateur');
    }
  }

  // Récupérer les paramètres de confidentialité
  async getPrivacySettings(): Promise<PrivacySettings> {
    try {
      const response = await unifiedApi.get<any>('/users/me/privacy');
      // L'API unifiée retourne directement les données
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des paramètres de confidentialité:', error);
      throw new Error('Impossible de récupérer les paramètres de confidentialité');
    }
  }

  // Mettre à jour les paramètres de confidentialité
  async updatePrivacySettings(settings: PrivacySettings): Promise<PrivacySettings> {
    try {
      const response = await unifiedApi.put<any>('/users/me/privacy', settings);
      // L'API unifiée retourne directement les données
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des paramètres de confidentialité:', error);
      throw new Error('Impossible de mettre à jour les paramètres de confidentialité');
    }
  }

  // Récupérer les paramètres de notification
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await unifiedApi.get<any>('/users/me/notifications/settings');
      // L'API unifiée retourne directement les données
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des paramètres de notification:', error);
      throw new Error('Impossible de récupérer les paramètres de notification');
    }
  }

  // Mettre à jour les paramètres de notification
  async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    try {
      const response = await unifiedApi.put<any>('/users/me/notifications/settings', settings);
      // L'API unifiée retourne directement les données
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des paramètres de notification:', error);
      throw new Error('Impossible de mettre à jour les paramètres de notification');
    }
  }

  // Découvrir des utilisateurs
  async discoverUsers(page: number = 1, limit: number = 20): Promise<PaginatedResponse<User>> {
    try {
      const response = await unifiedApi.get<any>(`/users/discover?page=${page}&limit=${limit}`);
      // L'API unifiée retourne directement les données
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la découverte d\'utilisateurs:', error);
      return { data: [], total: 0, page, limit, has_more: false };
    }
  }

  // Rechercher des utilisateurs
  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<User>> {
    try {
      const response = await unifiedApi.get<any>(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      // L'API unifiée retourne directement les données
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche d\'utilisateurs:', error);
      return { data: [], total: 0, page, limit, has_more: false };
    }
  }

  // Récupérer les voyages créés par l'utilisateur
  async getUserTrips(page: number = 1, limit: number = 10): Promise<PaginatedResponse<any>> {
    try {
      console.log('🔍 ProfileService.getUserTrips - Début de la requête');
      
      // Calculer l'offset à partir de la page
      const offset = (page - 1) * limit;
      
      // Utiliser created_by=me pour récupérer uniquement les voyages de l'utilisateur connecté
      // Le backend attend offset et limit, pas page et limit
      const response = await unifiedApi.get<any>(`/trips?created_by=me&offset=${offset}&limit=${limit}`);
      console.log('📡 ProfileService.getUserTrips - Réponse avec created_by=me:', response);
      
      if (Array.isArray(response) && response.length > 0) {
        console.log('✅ ProfileService.getUserTrips - Voyages trouvés avec created_by=me:', response);
        return { data: response, total: response.length, page, limit, has_more: response.length === limit };
      }
      
      console.log('⚠️ ProfileService.getUserTrips - Aucun voyage trouvé pour l\'utilisateur connecté');
      return { data: [], total: 0, page, limit, has_more: false };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des voyages:', error);
      return { data: [], total: 0, page, limit, has_more: false };
    }
  }

  // Mettre à jour les préférences de voyage
  async updateTravelPreferences(preferences: any): Promise<void> {
    try {
      const response = await unifiedApi.put<any>('/users/me/travel-preferences', preferences);
      // L'API unifiée retourne directement les données
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des préférences de voyage:', error);
      throw new Error('Impossible de mettre à jour les préférences de voyage');
    }
  }
}

export const profileService = new ProfileService(); 