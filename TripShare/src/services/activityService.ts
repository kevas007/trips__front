import { unifiedApi } from './unifiedApi';

export interface Activity {
  id: string;
  tripId: string;
  title: string;
  description: string;
  startTime: string;
  endTime?: string;
  location?: Location;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface CreateActivityRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: Location;
}

class ActivityService {
  // Récupérer les activités d'un voyage
  async getTripActivities(tripId: string): Promise<Activity[]> {
    try {
      const response = await unifiedApi.get<Activity[]>(`/trips/${tripId}/activities`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
      return [];
    }
  }

  // Créer une nouvelle activité
  async createActivity(tripId: string, activity: CreateActivityRequest): Promise<Activity> {
    try {
      const response = await unifiedApi.post<Activity>(`/trips/${tripId}/activities`, activity);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de l\'activité:', error);
      throw new Error('Impossible de créer l\'activité');
    }
  }

  // Mettre à jour une activité
  async updateActivity(activityId: string, updates: Partial<CreateActivityRequest>): Promise<Activity> {
    try {
      const response = await unifiedApi.put<Activity>(`/activities/${activityId}`, updates);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error);
      throw new Error('Impossible de mettre à jour l\'activité');
    }
  }

  // Supprimer une activité
  async deleteActivity(activityId: string): Promise<void> {
    try {
      await unifiedApi.delete(`/activities/${activityId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'activité:', error);
      throw new Error('Impossible de supprimer l\'activité');
    }
  }
}

export const activityService = new ActivityService();
