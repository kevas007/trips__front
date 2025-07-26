import { unifiedApi } from './unifiedApi';

export interface Comment {
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

export interface CreateCommentRequest {
  postId: string;
  text: string;
  parentCommentId?: string; // Pour les réponses
}

export interface LikeCommentRequest {
  commentId: string;
}

class CommentsService {
  // Récupérer les commentaires d'un post
  async getComments(postId: string): Promise<Comment[]> {
    try {
      console.log('🔄 Chargement des commentaires pour le post:', postId);
      
      const response = await unifiedApi.get(`/posts/${postId}/comments`);
      
      console.log('📡 Réponse API brute:', JSON.stringify(response, null, 2));
      
      // Priorité au format {success: true, data: [...]} (ce que l'API retourne actuellement)
      if (response && (response as any).success && Array.isArray((response as any).data)) {
        console.log('✅ Commentaires chargés (format success/data):', (response as any).data.length);
        const transformed = this.transformComments((response as any).data);
        console.log('🔄 Commentaires transformés:', JSON.stringify(transformed, null, 2));
        return transformed;
      }
      
      // Fallback pour le format tableau direct
      if (response && Array.isArray(response)) {
        console.log('✅ Commentaires chargés (format tableau):', response.length);
        return this.transformComments(response);
      }
      
      console.log('⚠️ Aucun commentaire trouvé pour le post:', postId);
      return [];
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des commentaires:', error);
      return [];
    }
  }

  // Créer un nouveau commentaire
  async createComment(request: CreateCommentRequest): Promise<Comment | null> {
    try {
      console.log('🔄 Création de commentaire pour le post:', request.postId);
      
      const payload = {
        content: request.text,
        parent_id: request.parentCommentId,
      };
      
      const response = await unifiedApi.post(`/posts/${request.postId}/comments`, payload);
      
      if (response) {
        console.log('✅ Commentaire créé avec succès:', (response as any).content);
        return this.transformComment(response as any);
      }
      
      console.log('❌ Erreur lors de la création du commentaire');
      return null;
    } catch (error) {
      console.log('❌ Erreur lors de la création du commentaire:', error);
      return null;
    }
  }

  // Liker/unliker un commentaire
  async likeComment(request: LikeCommentRequest): Promise<boolean> {
    try {
      console.log('🔄 Like du commentaire:', request.commentId);
      
      const response = await unifiedApi.post(`/comments/${request.commentId}/like`);
      
      console.log('📡 Réponse API like:', JSON.stringify(response, null, 2));
      
      // Vérifier si la réponse contient success: true
      if (response && (response as any).success === true) {
        console.log('✅ Like du commentaire mis à jour avec succès');
        return true;
      }
      
      console.log('❌ Erreur lors du like du commentaire - réponse invalide:', response);
      return false;
    } catch (error) {
      console.log('❌ Erreur lors du like du commentaire:', error);
      return false;
    }
  }



  // Supprimer un commentaire
  async deleteComment(commentId: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression du commentaire:', commentId);
      
      const response = await unifiedApi.delete(`/comments/${commentId}`);
      
      if (response) {
        console.log('✅ Commentaire supprimé');
        return true;
      }
      
      console.log('❌ Erreur lors de la suppression du commentaire');
      return false;
    } catch (error) {
      console.log('❌ Erreur lors de la suppression du commentaire:', error);
      return false;
    }
  }

  // Transformer les données de l'API en format Comment
  private transformComments(apiComments: any[]): Comment[] {
    return apiComments.map(comment => this.transformComment(comment));
  }

  private transformComment(apiComment: any): Comment {
    console.log('🔄 Transformation du commentaire:', JSON.stringify(apiComment, null, 2));
    
    // Compose le nom complet
    let userName = apiComment.user_name || apiComment.UserName
      || (apiComment.user?.FirstName && apiComment.user?.LastName
        ? `${apiComment.user.FirstName} ${apiComment.user.LastName}`
        : apiComment.user?.Username
          || apiComment.user?.name
          || 'Utilisateur');

    const transformed = {
      id: apiComment.id,
      user: {
        id: apiComment.user_id || apiComment.UserID || apiComment.user?.ID || apiComment.user?.id,
        name: userName,
        avatar: apiComment.user_avatar || apiComment.UserAvatar
          || apiComment.user?.AvatarURL
          || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
        verified: apiComment.user_verified || apiComment.UserVerified || apiComment.user?.IsAdmin || false,
      },
      text: apiComment.content || apiComment.Content || apiComment.text,
      likes: apiComment.likes_count || apiComment.LikesCount || (apiComment.likes ? apiComment.likes.length : 0) || 0,
      isLiked: apiComment.is_liked || apiComment.IsLiked || (apiComment.likes && apiComment.likes.length > 0) || false,
      timestamp: this.formatTimestamp(apiComment.created_at),
      replies: apiComment.replies ? this.transformComments(apiComment.replies) : undefined,
      isReply: apiComment.parent_id ? true : false,
    };
    
    console.log('✅ Commentaire transformé:', JSON.stringify(transformed, null, 2));
    return transformed;
  }

  // Formater le timestamp
  private formatTimestamp(timestamp: string): string {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}j`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}s`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mois`;
  }

  // Données de fallback si l'API n'est pas disponible
  getFallbackComments(): Comment[] {
    return [];
  }
}

export const commentsService = new CommentsService(); 