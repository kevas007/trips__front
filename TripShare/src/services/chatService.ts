import { unifiedApi } from './unifiedApi';

// Types pour le chat
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  metadata?: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    username: string;
    email: string;
    avatar_url?: string;
  };
  read_by?: Array<{
    id: string;
    user_id: string;
    read_at: string;
  }>;
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  left_at?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  id: string;
  type: 'private' | 'group' | 'community';
  name?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  created_by_user?: {
    id: string;
    username: string;
    email: string;
    avatar_url?: string;
  };
  members?: ConversationMember[];
  messages?: ChatMessage[];
}

export interface ChatNotification {
  id: string;
  conversation_id: string;
  user_id: string;
  type: 'new_message' | 'member_joined' | 'member_left';
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  conversation?: Conversation;
}

export interface ConversationStats {
  member_count: number;
  message_count: number;
  last_message?: ChatMessage;
}

class ChatService {
  // ========== CONVERSATIONS ==========

  // Récupérer toutes les conversations de l'utilisateur
  async getUserConversations(limit: number = 20, offset: number = 0): Promise<Conversation[]> {
    try {
      console.log('🔄 Chargement des conversations...');
      
      const response = await unifiedApi.get(`/chat/conversations?limit=${limit}&offset=${offset}`);
      
      if (response && (response as any).success && Array.isArray((response as any).data)) {
        console.log('✅ Conversations chargées:', (response as any).data.length);
        return (response as any).data;
      }
      
      console.log('⚠️ Aucune conversation trouvée');
      return [];
    } catch (error) {
      console.error('❌ Erreur lors du chargement des conversations:', error);
      return [];
    }
  }

  // Récupérer une conversation spécifique
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      console.log('🔄 Chargement de la conversation:', conversationId);
      
      const response = await unifiedApi.get(`/chat/conversations/${conversationId}`);
      
      if (response && (response as any).success && (response as any).data) {
        console.log('✅ Conversation chargée');
        return (response as any).data;
      }
      
      console.log('⚠️ Conversation non trouvée');
      return null;
    } catch (error) {
      console.error('❌ Erreur lors du chargement de la conversation:', error);
      return null;
    }
  }

  // Créer une nouvelle conversation
  async createConversation(type: string, name: string, memberIds: string[]): Promise<Conversation | null> {
    try {
      console.log('🔄 Création d\'une nouvelle conversation...');
      
      const response = await unifiedApi.post('/chat/conversations', {
        type,
        name,
        member_ids: memberIds,
      });
      
      if (response && (response as any).success && (response as any).data) {
        console.log('✅ Conversation créée');
        return (response as any).data;
      }
      
      console.log('⚠️ Échec de la création de la conversation');
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation:', error);
      return null;
    }
  }

  // Récupérer ou créer une conversation privée
  async getPrivateConversation(otherUserId: string): Promise<Conversation | null> {
    try {
      console.log('🔄 Récupération de la conversation privée avec:', otherUserId);
      
      const response = await unifiedApi.get(`/chat/conversations/private/${otherUserId}`);
      
      if (response && (response as any).success && (response as any).data) {
        console.log('✅ Conversation privée récupérée');
        return (response as any).data;
      }
      
      console.log('⚠️ Conversation privée non trouvée');
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la conversation privée:', error);
      return null;
    }
  }

  // ========== MESSAGES ==========

  // Récupérer les messages d'une conversation
  async getMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    try {
      console.log('🔄 Chargement des messages pour la conversation:', conversationId);
      
      const response = await unifiedApi.get(`/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`);
      
      if (response && (response as any).success && Array.isArray((response as any).data)) {
        console.log('✅ Messages chargés:', (response as any).data.length);
        return (response as any).data;
      }
      
      console.log('⚠️ Aucun message trouvé');
      return [];
    } catch (error) {
      console.error('❌ Erreur lors du chargement des messages:', error);
      return [];
    }
  }

  // Envoyer un message
  async sendMessage(conversationId: string, content: string, type: string = 'text', metadata?: string): Promise<ChatMessage | null> {
    try {
      console.log('🔄 Envoi d\'un message...');
      
      const response = await unifiedApi.post(`/chat/conversations/${conversationId}/messages`, {
        content,
        type,
        metadata,
      });
      
      if (response && (response as any).success && (response as any).data) {
        console.log('✅ Message envoyé');
        return (response as any).data;
      }
      
      console.log('⚠️ Échec de l\'envoi du message');
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
      return null;
    }
  }

  // Marquer un message comme lu
  async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      console.log('🔄 Marquage du message comme lu:', messageId);
      
      const response = await unifiedApi.post(`/chat/messages/${messageId}/read`);
      
      if (response && (response as any).success) {
        console.log('✅ Message marqué comme lu');
        return true;
      }
      
      console.log('⚠️ Échec du marquage du message');
      return false;
    } catch (error) {
      console.error('❌ Erreur lors du marquage du message:', error);
      return false;
    }
  }

  // Marquer tous les messages d'une conversation comme lus
  async markConversationAsRead(conversationId: string): Promise<boolean> {
    try {
      console.log('🔄 Marquage de la conversation comme lue:', conversationId);
      
      const response = await unifiedApi.post(`/chat/conversations/${conversationId}/messages/read`);
      
      if (response && (response as any).success) {
        console.log('✅ Conversation marquée comme lue');
        return true;
      }
      
      console.log('⚠️ Échec du marquage de la conversation');
      return false;
    } catch (error) {
      console.error('❌ Erreur lors du marquage de la conversation:', error);
      return false;
    }
  }

  // ========== MEMBRES ==========

  // Ajouter un membre à une conversation
  async addMember(conversationId: string, userId: string, role: string = 'member'): Promise<boolean> {
    try {
      console.log('🔄 Ajout d\'un membre à la conversation...');
      
      const response = await unifiedApi.post(`/chat/conversations/${conversationId}/members`, {
        user_id: userId,
        role,
      });
      
      if (response && (response as any).success) {
        console.log('✅ Membre ajouté');
        return true;
      }
      
      console.log('⚠️ Échec de l\'ajout du membre');
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du membre:', error);
      return false;
    }
  }

  // Retirer un membre d'une conversation
  async removeMember(conversationId: string, userId: string): Promise<boolean> {
    try {
      console.log('🔄 Retrait d\'un membre de la conversation...');
      
      const response = await unifiedApi.delete(`/chat/conversations/${conversationId}/members/${userId}`);
      
      if (response && (response as any).success) {
        console.log('✅ Membre retiré');
        return true;
      }
      
      console.log('⚠️ Échec du retrait du membre');
      return false;
    } catch (error) {
      console.error('❌ Erreur lors du retrait du membre:', error);
      return false;
    }
  }

  // ========== NOTIFICATIONS ==========

  // Récupérer les notifications de chat
  async getUserNotifications(limit: number = 20, offset: number = 0): Promise<ChatNotification[]> {
    try {
      console.log('🔄 Chargement des notifications...');
      
      const response = await unifiedApi.get(`/chat/notifications?limit=${limit}&offset=${offset}`);
      
      if (response && (response as any).success && Array.isArray((response as any).data)) {
        console.log('✅ Notifications chargées:', (response as any).data.length);
        return (response as any).data;
      }
      
      console.log('⚠️ Aucune notification trouvée');
      return [];
    } catch (error) {
      console.error('❌ Erreur lors du chargement des notifications:', error);
      return [];
    }
  }

  // Marquer une notification comme lue
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      console.log('🔄 Marquage de la notification comme lue:', notificationId);
      
      const response = await unifiedApi.post(`/chat/notifications/${notificationId}/read`);
      
      if (response && (response as any).success) {
        console.log('✅ Notification marquée comme lue');
        return true;
      }
      
      console.log('⚠️ Échec du marquage de la notification');
      return false;
    } catch (error) {
      console.error('❌ Erreur lors du marquage de la notification:', error);
      return false;
    }
  }

  // ========== STATISTIQUES ==========

  // Récupérer les statistiques d'une conversation
  async getConversationStats(conversationId: string): Promise<ConversationStats | null> {
    try {
      console.log('🔄 Chargement des statistiques de la conversation:', conversationId);
      
      const response = await unifiedApi.get(`/chat/conversations/${conversationId}/stats`);
      
      if (response && (response as any).success && (response as any).data) {
        console.log('✅ Statistiques chargées');
        return (response as any).data;
      }
      
      console.log('⚠️ Statistiques non trouvées');
      return null;
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques:', error);
      return null;
    }
  }

  // ========== UTILITAIRES ==========

  // Formater la date d'un message
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  }

  // Vérifier si un message a été lu par l'utilisateur actuel
  isMessageReadByUser(message: ChatMessage, currentUserId: string): boolean {
    return message.read_by?.some(read => read.user_id === currentUserId) || false;
  }

  // Obtenir le nombre de messages non lus dans une conversation
  getUnreadCount(conversation: Conversation, currentUserId: string): number {
    if (!conversation.messages) return 0;
    
    return conversation.messages.filter(message => 
      message.sender_id !== currentUserId && 
      !this.isMessageReadByUser(message, currentUserId)
    ).length;
  }
}

export const chatService = new ChatService(); 