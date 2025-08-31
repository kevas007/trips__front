import { unifiedApi } from './unifiedApi';
import { Trip } from './tripService';

export interface TripSavedResponse {
  message: string;
}

export interface SavedTripsResponse {
  data: Trip[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

class TripSavedService {
  // Sauvegarder un voyage
  async saveTrip(tripId: string): Promise<TripSavedResponse> {
    try {
      const response = await unifiedApi.post<TripSavedResponse>(`/trips/${tripId}/save`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du voyage:', error);
      throw new Error('Impossible de sauvegarder le voyage');
    }
  }

  // Retirer un voyage des favoris
  async unsaveTrip(tripId: string): Promise<TripSavedResponse> {
    try {
      const response = await unifiedApi.delete<TripSavedResponse>(`/trips/${tripId}/save`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la suppression du voyage:', error);
      throw new Error('Impossible de retirer le voyage des favoris');
    }
  }

  // Récupérer tous les voyages sauvegardés
  async getSavedTrips(page: number = 1, limit: number = 20): Promise<SavedTripsResponse> {
    try {
      const response = await unifiedApi.get<SavedTripsResponse>(`/trips/saved?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des voyages sauvegardés:', error);
      throw new Error('Impossible de récupérer les voyages sauvegardés');
    }
  }

  // Vérifier si un voyage est sauvegardé
  async isTripSaved(tripId: string): Promise<boolean> {
    try {
      const response = await unifiedApi.get<{ is_saved: boolean }>(`/trips/${tripId}/saved`);
      console.log('Réponse isTripSaved:', response);
      return response.is_saved;
    } catch (error: any) {
      console.error('Erreur lors de la vérification du statut de sauvegarde:', error);
      if (error.response?.status === 404) {
        // Si le voyage n'existe pas, considérer comme non sauvegardé
        return false;
      }
      return false;
    }
  }
}

export const tripSavedService = new TripSavedService();
