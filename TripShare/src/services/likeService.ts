import { unifiedApi } from './unifiedApi';

export interface Like {
  id: string;
  trip_id: string;
  user_id: string;
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export interface LikeResponse {
  is_liked: boolean;
  likes_count: number;
}

class LikeService {
  /**
   * Liker un voyage
   */
  async likeTrip(tripId: string): Promise<LikeResponse> {
    try {
      console.log('🔍 LikeService - Like du voyage:', tripId);
      const response = await unifiedApi.post<{ success: boolean; message: string }>(`/trips/${tripId}/like`);
      console.log('✅ LikeService - Voyage liké:', response);
      return { is_liked: true, likes_count: 0 }; // Le count sera mis à jour séparément
    } catch (error: any) {
      // Si le voyage est déjà liké, c'est considéré comme un succès
      if (error.message?.includes('voyage déjà liké') || error.response?.data?.error?.includes('voyage déjà liké')) {
        console.log('✅ LikeService - Voyage déjà liké, considéré comme succès');
        return { is_liked: true, likes_count: 0 }; // Le count sera mis à jour séparément
      }
      console.error('❌ LikeService - Erreur lors du like:', error);
      throw new Error('Impossible de liker le voyage');
    }
  }

  /**
   * Retirer le like d'un voyage
   */
  async unlikeTrip(tripId: string): Promise<LikeResponse> {
    try {
      console.log('🔍 LikeService - Unlike du voyage:', tripId);
      const response = await unifiedApi.delete<{ success: boolean; message: string }>(`/trips/${tripId}/like`);
      console.log('✅ LikeService - Like retiré:', response);
      return { is_liked: false, likes_count: 0 }; // Le count sera mis à jour séparément
    } catch (error: any) {
      // Si le like n'existe pas, c'est considéré comme un succès
      if (error.message?.includes('like introuvable') || error.response?.data?.error?.includes('like introuvable')) {
        console.log('✅ LikeService - Like introuvable, considéré comme succès');
        return { is_liked: false, likes_count: 0 }; // Le count sera mis à jour séparément
      }
      console.error('❌ LikeService - Erreur lors de l\'unlike:', error);
      throw new Error('Impossible de retirer le like');
    }
  }

  /**
   * Vérifier si un utilisateur a liké un voyage
   */
  async isTripLiked(tripId: string): Promise<boolean> {
    try {
      console.log('🔍 LikeService - Vérification like pour voyage:', tripId);
      const response = await unifiedApi.get<any>(`/trips/${tripId}/liked`);
      console.log('✅ LikeService - Réponse complète:', response);
      
      // Gérer différents formats de réponse
      if (response && typeof response === 'object') {
        // Si c'est un objet avec is_liked
        if (typeof response.is_liked === 'boolean') {
          console.log('✅ LikeService - Statut like:', response.is_liked);
          return response.is_liked;
        }
        // Si c'est un tableau (liste des likes de l'utilisateur)
        if (Array.isArray(response)) {
          console.log('✅ LikeService - Liste des likes trouvée, longueur:', response.length);
          return response.length > 0;
        }
      }
      
      console.log('⚠️ LikeService - Structure de réponse inattendue:', response);
      return false;
    } catch (error) {
      console.error('❌ LikeService - Erreur lors de la vérification du like:', error);
      return false;
    }
  }

  /**
   * Obtenir le nombre de likes d'un voyage
   */
  async getTripLikesCount(tripId: string): Promise<number> {
    try {
      console.log('🔍 LikeService - Récupération nombre de likes pour voyage:', tripId);
      const response = await unifiedApi.get<any>(`/trips/${tripId}/likes`);
      console.log('✅ LikeService - Réponse complète:', response);
      
      // Gérer différents formats de réponse
      if (response && typeof response === 'object') {
        // Si c'est un objet avec count ou total
        if (typeof response.count === 'number') {
          console.log('✅ LikeService - Nombre de likes (count):', response.count);
          return response.count;
        }
        if (typeof response.total === 'number') {
          console.log('✅ LikeService - Nombre de likes (total):', response.total);
          return response.total;
        }
        // Si c'est un tableau (liste des likes)
        if (Array.isArray(response)) {
          console.log('✅ LikeService - Nombre de likes (array length):', response.length);
          return response.length;
        }
      }
      
      console.log('⚠️ LikeService - Structure de réponse inattendue:', response);
      return 0;
    } catch (error) {
      console.error('❌ LikeService - Erreur lors de la récupération du nombre de likes:', error);
      return 0;
    }
  }

  /**
   * Obtenir la liste des utilisateurs qui ont liké un voyage
   */
  async getTripLikes(tripId: string): Promise<Like[]> {
    try {
      console.log('🔍 LikeService - Récupération des likes pour voyage:', tripId);
      const response = await unifiedApi.get<Like[]>(`/trips/${tripId}/likes`);
      console.log('✅ LikeService - Réponse complète:', response);
      
      // Vérifier si la réponse a la structure attendue
      if (response && Array.isArray(response)) {
        console.log('✅ LikeService - Likes récupérés:', response);
        return response;
      } else {
        console.log('⚠️ LikeService - Structure de réponse inattendue:', response);
        return [];
      }
    } catch (error) {
      console.error('❌ LikeService - Erreur lors de la récupération des likes:', error);
      return [];
    }
  }
}

export const likeService = new LikeService();
