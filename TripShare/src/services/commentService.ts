import { unifiedApi } from './unifiedApi';
import { authService } from './auth';
import { API_CONFIG } from '../config/api';
import { ErrorService } from './errorService';

export interface Comment {
  id: string;
  trip_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  replies?: Comment[];
  likes_count?: number;
  is_liked?: boolean;
}

export interface CreateCommentRequest {
  content: string;
  parent_id?: string; // Pour les réponses
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
}

export interface BackendCommentsResponse {
  success: boolean;
  data: Comment[];
}

class CommentService {
  /**
   * Obtenir les commentaires d'un voyage
   */
  async getTripComments(tripId: string, page: number = 1, limit: number = 20): Promise<CommentsResponse> {
    try {
      console.log('🔍 CommentService - Récupération des commentaires pour voyage:', tripId);
      
      // Utiliser fetch directement pour récupérer la réponse complète
      const baseUrl = API_CONFIG.BASE_URL + API_CONFIG.API_PREFIX;
      const response = await fetch(`${baseUrl}/trips/${tripId}/comments?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('✅ CommentService - Réponse complète du backend:', responseData);
      
      if (!responseData.success) {
        throw new Error('Erreur serveur');
      }
      
      const comments = responseData.data || [];
      console.log('✅ CommentService - Commentaires récupérés:', comments);
      
      // Convertir le format de réponse du backend au format attendu par le frontend
      return {
        comments: comments,
        total: responseData.total || comments.length,
        page: responseData.page || page,
        limit: responseData.limit || limit
      };
    } catch (error) {
      ErrorService.logError('CommentService - Récupération des commentaires', error, { tripId, page, limit });
      throw new Error(ErrorService.getUserFriendlyMessage(error));
    }
  }

  /**
   * Créer un commentaire
   */
  async createComment(tripId: string, commentData: CreateCommentRequest): Promise<Comment> {
    try {
      console.log('🔍 CommentService - Création d\'un commentaire pour voyage:', tripId);
      const response = await unifiedApi.post<Comment>(`/trips/${tripId}/comments`, commentData);
      console.log('✅ CommentService - Commentaire créé:', response);
      return response;
    } catch (error) {
      ErrorService.logError('CommentService - Création du commentaire', error, { tripId, commentData });
      throw new Error(ErrorService.getUserFriendlyMessage(error));
    }
  }

  /**
   * Mettre à jour un commentaire
   */
  async updateComment(commentId: string, content: string): Promise<Comment> {
    try {
      console.log('🔍 CommentService - Mise à jour du commentaire:', commentId);
      const response = await unifiedApi.put<Comment>(`/trip-comments/${commentId}`, { content });
      console.log('✅ CommentService - Commentaire mis à jour:', response);
      return response;
    } catch (error) {
      console.error('❌ CommentService - Erreur lors de la mise à jour du commentaire:', error);
      throw new Error('Impossible de mettre à jour le commentaire');
    }
  }

  /**
   * Supprimer un commentaire
   */
  async deleteComment(commentId: string): Promise<void> {
    try {
      console.log('🔍 CommentService - Suppression du commentaire:', commentId);
      await unifiedApi.delete(`/trip-comments/${commentId}`);
      console.log('✅ CommentService - Commentaire supprimé');
    } catch (error) {
      console.error('❌ CommentService - Erreur lors de la suppression du commentaire:', error);
      throw new Error('Impossible de supprimer le commentaire');
    }
  }

  /**
   * Liker un commentaire
   */
  async likeComment(commentId: string): Promise<{ is_liked: boolean; likes_count: number }> {
    try {
      console.log('🔍 CommentService - Like du commentaire:', commentId);
      const response = await unifiedApi.post<{ is_liked: boolean; likes_count: number }>(`/trip-comments/${commentId}/like`);
      console.log('✅ CommentService - Commentaire liké:', response);
      return response;
    } catch (error) {
      console.error('❌ CommentService - Erreur lors du like du commentaire:', error);
      throw new Error('Impossible de liker le commentaire');
    }
  }

  /**
   * Retirer le like d'un commentaire
   */
  async unlikeComment(commentId: string): Promise<{ is_liked: boolean; likes_count: number }> {
    try {
      console.log('🔍 CommentService - Unlike du commentaire:', commentId);
      const response = await unifiedApi.delete<{ is_liked: boolean; likes_count: number }>(`/trip-comments/${commentId}/like`);
      console.log('✅ CommentService - Like du commentaire retiré:', response);
      return response;
    } catch (error) {
      console.error('❌ CommentService - Erreur lors de l\'unlike du commentaire:', error);
      throw new Error('Impossible de retirer le like du commentaire');
    }
  }

  /**
   * Répondre à un commentaire
   */
  async replyToComment(tripId: string, parentCommentId: string, content: string): Promise<Comment> {
    try {
      console.log('🔍 CommentService - Réponse au commentaire:', parentCommentId);
      const response = await unifiedApi.post<Comment>(`/trips/${tripId}/comments`, {
        content,
        parent_id: parentCommentId
      });
      console.log('✅ CommentService - Réponse créée:', response);
      return response;
    } catch (error) {
      console.error('❌ CommentService - Erreur lors de la création de la réponse:', error);
      throw new Error('Impossible de créer la réponse');
    }
  }
}

export const commentService = new CommentService();
