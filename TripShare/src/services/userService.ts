import { unifiedApi } from './unifiedApi';
import { UserTravelPreferences } from '../types/user';

export interface User {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user: User;
  profile: {
    id: string;
    user_id: string;
    bio?: string;
    avatar_url?: string;
    cover_photo_url?: string;
    location?: string;
    website?: string;
    birthday?: string;
    travel_preferences?: any;
    social_links?: any;
    interests?: string[];
    created_at: string;
    updated_at: string;
  };
}

class UserService {
  /**
   * Récupérer un utilisateur par son ID
   */
  async getUserById(userId: string): Promise<UserProfile> {
    try {
      console.log('🔍 UserService.getUserById - Récupération utilisateur:', userId);
      
      const response = await unifiedApi.get<UserProfile>(`/users/${userId}`);
      
      console.log('✅ UserService.getUserById - Utilisateur récupéré:', response);
      
      return response;
    } catch (error) {
      console.error('❌ UserService.getUserById - Erreur:', error);
      throw new Error('Impossible de récupérer les informations de l\'utilisateur');
    }
  }

  /**
   * Récupérer le profil public d'un utilisateur
   */
  async getPublicProfile(userId: string): Promise<UserProfile> {
    try {
      console.log('🔍 UserService.getPublicProfile - Récupération profil public:', userId);
      
      const response = await unifiedApi.get<UserProfile>(`/users/${userId}`);
      
      console.log('✅ UserService.getPublicProfile - Profil récupéré:', response);
      
      return response;
    } catch (error) {
      console.error('❌ UserService.getPublicProfile - Erreur:', error);
      throw new Error('Impossible de récupérer le profil public');
    }
  }

  /**
   * Rechercher des utilisateurs
   */
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      const response = await unifiedApi.get<User[]>(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('❌ UserService.searchUsers - Erreur:', error);
      throw new Error('Impossible de rechercher des utilisateurs');
    }
  }

  /**
   * Mettre à jour les préférences de voyage de l'utilisateur
   */
  async updatePreferences(preferences: UserTravelPreferences): Promise<UserTravelPreferences> {
    try {
      console.log('🔍 UserService.updatePreferences - Mise à jour des préférences:', preferences);
      
      const response = await unifiedApi.put<UserTravelPreferences>('/users/me/preferences', preferences);
      
      console.log('✅ UserService.updatePreferences - Préférences mises à jour:', response);
      
      return response;
    } catch (error) {
      console.error('❌ UserService.updatePreferences - Erreur:', error);
      throw new Error('Impossible de mettre à jour les préférences');
    }
  }
}

export const userService = new UserService();
