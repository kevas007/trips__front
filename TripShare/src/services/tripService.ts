import { unifiedApi } from './unifiedApi';
import { API_CONFIG } from '../config/api';

export interface Trip {
  id: string;
  title: string;
  description?: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'friends';
  created_at: string;
  updated_at: string;
  user_id: string;
  // Champs utilisateur directs (renvoyés par le backend)
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  // Ancien format pour compatibilité
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  images?: string[];
  tags?: string[];
  likes_count?: number;
  comments_count?: number;
}

export interface TripsResponse {
  data: Trip[];
  total: number;
  page: number;
  limit: number;
}

class TripService {
  private baseUrl = API_CONFIG.BASE_URL + API_CONFIG.API_PREFIX;

  // Charger les voyages publics
  async getPublicTrips(page: number = 1, limit: number = 20): Promise<TripsResponse> {
    try {
      console.log('🔍 TripService - Chargement des voyages publics');
      const response = await unifiedApi.get<Trip[]>(`/trips/public?page=${page}&limit=${limit}`);
      console.log('✅ TripService - Voyages publics récupérés:', response);
      
      // Transformer les données pour correspondre au format attendu par le frontend
      const transformedTrips = (response || []).map(trip => ({
        ...trip,
        // Créer l'objet user à partir des champs directs
        user: {
          id: trip.user_id,
          name: trip.username || trip.first_name || trip.last_name || 'Utilisateur',
          avatar: trip.avatar_url
        },
        // Ajouter des images de test si aucune image n'est présente
        images: trip.images && trip.images.length > 0 ? trip.images : [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=400&h=300&fit=crop'
        ]
      }));
      
      // L'API unifiée retourne directement le tableau de voyages
      // On doit le transformer en format TripsResponse
      return {
        data: transformedTrips,
        total: transformedTrips.length,
        page: page,
        limit: limit
      };
    } catch (error) {
      console.error('❌ TripService - Erreur lors du chargement des voyages publics:', error);
      throw new Error('Impossible de charger les voyages publics');
    }
  }

  // Charger les voyages de l'utilisateur connecté
  async getUserTrips(page: number = 1, limit: number = 20): Promise<TripsResponse> {
    try {
      console.log('🔍 TripService - Chargement des voyages utilisateur');
      const response = await unifiedApi.get<TripsResponse>(`/trips?page=${page}&limit=${limit}`);
      console.log('✅ TripService - Voyages utilisateur récupérés:', response);
      return response;
    } catch (error) {
      console.error('❌ TripService - Erreur lors du chargement des voyages utilisateur:', error);
      throw new Error('Impossible de charger vos voyages');
    }
  }

  // Créer un nouveau voyage
  async createTrip(tripData: Partial<Trip>): Promise<Trip> {
    try {
      console.log('🔍 TripService - Création d\'un nouveau voyage');
      const response = await unifiedApi.post<Trip>('/trips', tripData);
      console.log('✅ TripService - Voyage créé:', response);
      return response;
    } catch (error) {
      console.error('❌ TripService - Erreur lors de la création du voyage:', error);
      throw new Error('Impossible de créer le voyage');
    }
  }

  // Obtenir un voyage par ID
  async getTripById(tripId: string): Promise<Trip> {
    try {
      console.log('🔍 TripService - Chargement du voyage:', tripId);
      const response = await unifiedApi.get<Trip>(`/trips/${tripId}`);
      console.log('✅ TripService - Voyage récupéré:', response);
      return response;
    } catch (error) {
      console.error('❌ TripService - Erreur lors du chargement du voyage:', error);
      throw new Error('Impossible de charger le voyage');
    }
  }

  // Mettre à jour un voyage
  async updateTrip(tripId: string, tripData: Partial<Trip>): Promise<Trip> {
    try {
      console.log('🔍 TripService - Mise à jour du voyage:', tripId);
      const response = await unifiedApi.put<Trip>(`/trips/${tripId}`, tripData);
      console.log('✅ TripService - Voyage mis à jour:', response);
      return response;
    } catch (error) {
      console.error('❌ TripService - Erreur lors de la mise à jour du voyage:', error);
      throw new Error('Impossible de mettre à jour le voyage');
    }
  }

  // Supprimer un voyage
  async deleteTrip(tripId: string): Promise<void> {
    try {
      console.log('🔍 TripService - Suppression du voyage:', tripId);
      await unifiedApi.delete(`/trips/${tripId}`);
      console.log('✅ TripService - Voyage supprimé');
    } catch (error) {
      console.error('❌ TripService - Erreur lors de la suppression du voyage:', error);
      throw new Error('Impossible de supprimer le voyage');
    }
  }
}

export const tripService = new TripService();
