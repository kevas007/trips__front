import { unifiedApi } from './unifiedApi';
import { User, UserStats, Badge, PrivacySettings, NotificationSettings } from '../types/user';

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

class ProfileService {
  // Récupérer le profil de l'utilisateur connecté
  async getProfile(): Promise<User> {
    const response = await unifiedApi.get<any>('/users/me');
    // Le backend retourne { success: true, data: user }
    return response.success ? response.data : response;
  }

  // Mettre à jour le profil
  async updateProfile(data: ProfileUpdateData): Promise<User> {
    const response = await unifiedApi.put<any>('/users/me', data);
    return response.success ? response.data : response;
  }

  // Mettre à jour l'avatar
  async updateAvatar(imageUri: string): Promise<User> {
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
    return response.success ? response.data : response;
  }

  // Récupérer les statistiques
  async getStats(): Promise<UserStats> {
    const response = await unifiedApi.get<any>('/users/me/stats');
    return response.success ? response.data : response;
  }

  // Récupérer les badges
  async getBadges(): Promise<Badge[]> {
    const response = await unifiedApi.get<any>('/users/me/badges');
    return response.success ? response.data : response;
  }

  // Récupérer les followers
  async getFollowers(page: number = 1, limit: number = 20): Promise<PaginatedResponse<User>> {
    const response = await unifiedApi.get<any>(`/users/me/followers?page=${page}&limit=${limit}`);
    return response.success ? response.data : response;
  }

  // Récupérer les following
  async getFollowing(page: number = 1, limit: number = 20): Promise<PaginatedResponse<User>> {
    const response = await unifiedApi.get<any>(`/users/me/following?page=${page}&limit=${limit}`);
    return response.success ? response.data : response;
  }

  // Suivre un utilisateur
  async followUser(userId: number): Promise<void> {
    await unifiedApi.post(`/users/${userId}/follow`);
  }

  // Ne plus suivre un utilisateur
  async unfollowUser(userId: number): Promise<void> {
    await unifiedApi.delete(`/users/${userId}/follow`);
  }

  // Récupérer les paramètres de confidentialité
  async getPrivacySettings(): Promise<PrivacySettings> {
    const response = await unifiedApi.get<any>('/users/me/privacy');
    return response.success ? response.data : response;
  }

  // Mettre à jour les paramètres de confidentialité
  async updatePrivacySettings(settings: PrivacySettings): Promise<PrivacySettings> {
    const response = await unifiedApi.put<any>('/users/me/privacy', settings);
    return response.success ? response.data : response;
  }

  // Récupérer les paramètres de notification
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await unifiedApi.get<any>('/users/me/notifications/settings');
    return response.success ? response.data : response;
  }

  // Mettre à jour les paramètres de notification
  async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    const response = await unifiedApi.put<any>('/users/me/notifications/settings', settings);
    return response.success ? response.data : response;
  }

  // Découvrir de nouveaux utilisateurs
  async discoverUsers(page: number = 1, limit: number = 20): Promise<PaginatedResponse<User>> {
    const response = await unifiedApi.get<any>(`/users/discover?page=${page}&limit=${limit}`);
    return response.success ? response.data : response;
  }

  // Rechercher des utilisateurs
  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<User>> {
    const response = await unifiedApi.get<any>(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.success ? response.data : response;
  }
}

export const profileService = new ProfileService(); 