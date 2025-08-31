import { unifiedApi } from './unifiedApi';
import { authService } from './auth';
import { API_CONFIG } from '../config/api';
import { TripDataValidator } from '../utils/tripDataValidator';

// Interface Trip corrigée pour correspondre au backend
export interface Trip {
  id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  budget?: number;
  status: 'planned' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  visibility: 'public' | 'private';
  trip_type?: string;
  duration?: string;
  map_categories?: string[];
  travel_categories?: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  
  // Champs utilisateur directs (renvoyés par le backend)
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  
  // Informations utilisateur (renvoyées par le backend)
  user?: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
  
  // Relations
  photos?: TripPhoto[];
  likes?: TripLike[];
  members?: TripMember[];
  expenses?: any[];
  activities?: any[];
  steps?: any[];
  tags_objects?: any[];
  
  // Champs calculés
  member_count?: number;
  expense_count?: number;
  likes_count?: number;
  comments_count?: number;
  recommendation_score?: number;
  
  // Lieux visités
  places_visited?: any[];
  
  // Compatibilité avec l'ancien format
  destination?: string; // Pour compatibilité
  images?: string[]; // Pour compatibilité avec l'ancien format
  tags?: string[]; // Pour compatibilité avec l'ancien format
}

// Types pour les relations
export interface TripPhoto {
  id: string;
  trip_id: string;
  url: string;
  caption?: string;
  created_at: string;
}

export interface TripLike {
  id: string;
  trip_id: string;
  user_id: string;
  created_at: string;
  user?: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  joined_at?: string;
  user?: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
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
      
      // Le backend attend limit et offset, pas page et limit
      const offset = (page - 1) * limit;
      
      // Le backend renvoie {success: true, data: [...], total: ..., page: ..., limit: ...}
      // Mais unifiedApi retourne seulement data.data (le tableau)
      // On doit récupérer la réponse complète pour avoir total, page, limit
      interface BackendTripsResponse {
        success: boolean;
        data: Trip[];
        total: number;
        page: number;
        limit: number;
      }
      
      // Utiliser fetch directement pour récupérer la réponse complète
      const response = await fetch(`${this.baseUrl}/trips/public?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const responseData: BackendTripsResponse = await response.json();
      console.log('✅ TripService - Réponse complète du backend:', responseData);
      
      if (!responseData.success) {
        throw new Error('Erreur serveur');
      }
      
      const trips = responseData.data || [];
      console.log('✅ TripService - Voyages publics récupérés:', trips);
      console.log('✅ TripService - Premier voyage ID:', trips[0]?.id);
      console.log('✅ TripService - Total:', responseData.total);
      console.log('✅ TripService - Page:', responseData.page);
      console.log('✅ TripService - Limit:', responseData.limit);
      
      // Transformer les données pour correspondre au format attendu par le frontend
      const transformedTrips = trips.map(trip => {
        // Protection contre les valeurs undefined
        if (!trip || typeof trip !== 'object') {
          console.warn('⚠️ TripService - Voyage invalide détecté:', trip);
          return null;
        }
        
        return {
          ...trip,
          // Créer l'objet user à partir des champs directs si user n'existe pas
          user: trip.user || {
            id: trip.created_by || 'unknown',
            username: trip.username || 'utilisateur',
            first_name: trip.first_name || '',
            last_name: trip.last_name || '',
            avatar_url: trip.avatar_url || '',
            email: '',
            created_at: trip.created_at || '',
            updated_at: trip.updated_at || ''
          },
          // Ajouter la destination pour compatibilité
          destination: trip.location?.city || 'Destination inconnue',
          // Ajouter des images de test si aucune photo n'est présente
          images: trip.photos && Array.isArray(trip.photos) && trip.photos.length > 0 
            ? trip.photos.map((photo: any) => photo?.url || '').filter(url => url)
            : [
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
              'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
              'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=400&h=300&fit=crop'
            ],
          // Ajouter les tags pour compatibilité
          tags: Array.isArray(trip.travel_categories) ? trip.travel_categories : []
        };
      }).filter(trip => trip !== null); // Filtrer les voyages invalides
      
      // Transformer en format TripsResponse
      return {
        data: transformedTrips,
        total: responseData.total,
        page: responseData.page,
        limit: responseData.limit
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
      
      // Le backend attend limit et offset, pas page et limit
      const offset = (page - 1) * limit;
      
      // Le backend renvoie {success: true, data: [...], total: ..., page: ..., limit: ...}
      interface BackendTripsResponse {
        success: boolean;
        data: Trip[];
        total: number;
        page: number;
        limit: number;
      }
      
      // Utiliser fetch directement pour récupérer la réponse complète
      const response = await fetch(`${this.baseUrl}/trips?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const responseData: BackendTripsResponse = await response.json();
      console.log('✅ TripService - Réponse complète du backend (user trips):', responseData);
      
      if (!responseData.success) {
        throw new Error('Erreur serveur');
      }
      
      const trips = responseData.data || [];
      console.log('✅ TripService - Voyages utilisateur récupérés:', trips);
      
      return {
        data: trips,
        total: responseData.total,
        page: responseData.page,
        limit: responseData.limit
      };
    } catch (error) {
      console.error('❌ TripService - Erreur lors du chargement des voyages utilisateur:', error);
      throw new Error('Impossible de charger vos voyages');
    }
  }

  // Créer un nouveau voyage
  async createTrip(tripData: Partial<Trip>): Promise<Trip> {
    try {
      console.log('🔍 TripService - Création d\'un nouveau voyage');
      const trip = await unifiedApi.post<Trip>('/trips', tripData);
      console.log('✅ TripService - Voyage créé:', trip);
      return trip;
    } catch (error) {
      console.error('❌ TripService - Erreur lors de la création du voyage:', error);
      throw new Error('Impossible de créer le voyage');
    }
  }

  // Obtenir un voyage par ID
  async getTripById(tripId: string): Promise<Trip> {
    try {
      console.log('🔍 TripService - Chargement du voyage:', tripId);
      
      // Utiliser fetch directement pour récupérer la réponse complète
      const response = await fetch(`${this.baseUrl}/trips/${tripId}`, {
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
      console.log('✅ TripService - Réponse complète du backend:', responseData);
      
      if (!responseData.success) {
        throw new Error('Erreur serveur');
      }
      
      const trip = responseData.data;
      
      // Transformer les données pour compatibilité
      const transformedTrip: Trip = {
        ...trip,
        // Créer l'objet user à partir des champs directs si user n'existe pas
        user: trip.user || {
          id: trip.created_by || 'unknown',
          username: (trip as any).username || 'utilisateur',
          first_name: (trip as any).first_name || '',
          last_name: (trip as any).last_name || '',
          avatar_url: (trip as any).avatar_url || '',
          email: '',
          created_at: trip.created_at || '',
          updated_at: trip.updated_at || ''
        },
        // Ajouter la destination pour compatibilité
        destination: trip.location?.city || 'Destination inconnue',
        // Ajouter des images de test si aucune photo n'est présente
        images: trip.photos && trip.photos.length > 0 
          ? trip.photos.map((photo: any) => photo.url)
          : [
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=400&h=300&fit=crop'
          ],
        // Ajouter les tags pour compatibilité
        tags: trip.travel_categories || []
      };
      
      console.log('✅ TripService - Voyage transformé:', transformedTrip);
      
      // Valider les données transformées
      TripDataValidator.logValidation(transformedTrip);
      
      return transformedTrip;
    } catch (error) {
      console.error('❌ TripService - Erreur lors du chargement du voyage:', error);
      throw new Error('Impossible de charger le voyage');
    }
  }

  // Mettre à jour un voyage
  async updateTrip(tripId: string, tripData: Partial<Trip>): Promise<Trip> {
    try {
      console.log('🔍 TripService - Mise à jour du voyage:', tripId);
      const trip = await unifiedApi.put<Trip>(`/trips/${tripId}`, tripData);
      console.log('✅ TripService - Voyage mis à jour:', trip);
      return trip;
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
