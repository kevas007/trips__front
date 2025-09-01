import { unifiedApi } from './unifiedApi';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'trip' | 'achievement' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  user?: {
    id: string;
    name: string;
    avatar: string;
  };
  data?: any;
}

export interface NotificationResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

class NotificationService {
  /**
   * Récupérer les notifications de l'utilisateur connecté
   */
  async getUserNotifications(page: number = 1, limit: number = 20): Promise<NotificationResponse> {
    try {
      console.log('🔍 NotificationService.getUserNotifications - Récupération des notifications');
      
      const response = await unifiedApi.get<NotificationResponse>(`/notifications?page=${page}&limit=${limit}`);
      
      console.log('✅ NotificationService.getUserNotifications - Notifications récupérées:', response);
      
      return response;
    } catch (error) {
      console.error('❌ NotificationService.getUserNotifications - Erreur:', error);
      throw new Error('Impossible de récupérer les notifications');
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      console.log('🔍 NotificationService.markAsRead - Marquage comme lue:', notificationId);
      
      const response = await unifiedApi.put<Notification>(`/notifications/${notificationId}/read`);
      
      console.log('✅ NotificationService.markAsRead - Notification marquée comme lue');
      
      return response;
    } catch (error) {
      console.error('❌ NotificationService.markAsRead - Erreur:', error);
      throw new Error('Impossible de marquer la notification comme lue');
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<void> {
    try {
      console.log('🔍 NotificationService.markAllAsRead - Marquage de toutes les notifications');
      
      await unifiedApi.put('/notifications/read-all');
      
      console.log('✅ NotificationService.markAllAsRead - Toutes les notifications marquées comme lues');
    } catch (error) {
      console.error('❌ NotificationService.markAllAsRead - Erreur:', error);
      throw new Error('Impossible de marquer toutes les notifications comme lues');
    }
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      console.log('🔍 NotificationService.deleteNotification - Suppression:', notificationId);
      
      await unifiedApi.delete(`/notifications/${notificationId}`);
      
      console.log('✅ NotificationService.deleteNotification - Notification supprimée');
    } catch (error) {
      console.error('❌ NotificationService.deleteNotification - Erreur:', error);
      throw new Error('Impossible de supprimer la notification');
    }
  }
}

export const notificationService = new NotificationService();
