import { unifiedApi } from './unifiedApi';
import { tripShareApi } from './tripShareApi';

export interface UnifiedTripData {
  title: string;
  description: string;
  destination: string;
  photos: string[];
  duration: string;
  budget: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  status: 'planned' | 'ongoing' | 'completed';
  difficulty?: string;
  tags: string[];
  places: Array<{
    name: string;
    description?: string;
    address?: string;
  }>;
}

export interface UnifiedTripResponse {
  id: string;
  title: string;
  status: 'success' | 'error';
  message: string;
  photos_uploaded: number;
  photos_failed: number;
}

/**
 * Service unifié pour la création de voyages
 * Combine les bonnes pratiques des deux approches existantes
 */
class UnifiedTripService {
  
  /**
   * Crée un voyage avec toutes les données et photos
   */
  async createTrip(tripData: UnifiedTripData): Promise<UnifiedTripResponse> {
    try {
      console.log('🚀 UnifiedTripService - Création du voyage:', tripData.title);
      
      // 1. Créer le voyage de base avec toutes les données SAUF les photos
      const tripPayload = {
        title: tripData.title,
        description: tripData.description,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        location: this.parseDestination(tripData.destination),
        budget: this.parseBudget(tripData.budget),
        status: tripData.status,
        visibility: tripData.isPublic ? 'public' : 'private',
        photos: [], // ✅ Pas de photos dans la création initiale
        duration: tripData.duration,
        difficulty: tripData.difficulty,
        tags: tripData.tags,
        places_visited: tripData.places.map(place => ({
          name: place.name,
          description: place.description || '',
          address: place.address || '',
          is_visited: false,
          photos: [],
          notes: '',
        })),
      };

      console.log('📝 UnifiedTripService - Payload voyage:', tripPayload);
      
      const tripResponse = await unifiedApi.post<any>('/trips', tripPayload);
      
      if (!tripResponse.id) {
        throw new Error('Erreur lors de la création du voyage');
      }

      console.log('✅ UnifiedTripService - Voyage créé avec ID:', tripResponse.id);

      // 2. Uploader les photos une par une avec la méthode unifiée
      let photosUploaded = 0;
      let photosFailed = 0;
      
      if (tripData.photos && tripData.photos.length > 0) {
        console.log('📸 UnifiedTripService - Upload de', tripData.photos.length, 'photos...');
        
        for (let i = 0; i < tripData.photos.length; i++) {
          try {
            await this.uploadTripPhoto(tripResponse.id, tripData.photos[i], i === 0);
            photosUploaded++;
            console.log(`✅ Photo ${i + 1}/${tripData.photos.length} uploadée`);
          } catch (error: any) {
            photosFailed++;
            console.warn(`⚠️ Erreur upload photo ${i + 1}:`, error);
            
            // Gérer les erreurs de modération
            if (error?.response?.status === 403) {
              console.error(`🚫 Photo ${i + 1} bloquée par la modération`);
              // Continue avec les photos suivantes
            } else if (error?.response?.status === 202) {
              console.warn(`🚩 Photo ${i + 1} flagguée mais acceptée`);
              photosUploaded++; // Compter comme réussie
              photosFailed--; // Ne pas compter comme échouée
            }
          }
        }
      }

      return {
        id: tripResponse.id,
        title: tripData.title,
        status: 'success',
        message: `Voyage "${tripData.title}" créé avec succès !`,
        photos_uploaded: photosUploaded,
        photos_failed: photosFailed,
      };

    } catch (error) {
      console.error('❌ UnifiedTripService - Erreur création voyage:', error);
      return {
        id: '',
        title: tripData.title,
        status: 'error',
        message: 'Impossible de créer le voyage. Veuillez réessayer.',
        photos_uploaded: 0,
        photos_failed: 0,
      };
    }
  }

  /**
   * Upload une photo pour un voyage (méthode unifiée)
   */
  private async uploadTripPhoto(tripId: string, photoUri: string, isMain: boolean = false): Promise<void> {
    try {
      console.log(`🔍 UnifiedTripService - Upload photo pour voyage ${tripId}`);
      console.log(`📸 Photo URI: ${photoUri}`);
      
      // Vérifier que l'URI est valide
      if (!photoUri || photoUri.startsWith('file://')) {
        console.log(`📸 Photo locale détectée: ${photoUri}`);
      }
      
      // ✅ MÉTHODE UNIFIÉE : Convertir l'URI en File compatible avec le backend
      const response = await fetch(photoUri);
      if (!response.ok) {
        throw new Error(`Erreur lors du fetch de l'image: ${response.status}`);
      }
      
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Image vide ou corrompue');
      }
      
      const filename = `trip_${tripId}_${Date.now()}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });
      
      console.log(`📁 Fichier créé: ${filename}, taille: ${blob.size} bytes`);
      
      // Créer FormData avec le format attendu par le backend
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('description', `Photo du voyage`);
      formData.append('title', `Photo ${isMain ? 'principale' : ''}`);
      formData.append('featured', isMain.toString());

      console.log(`📤 Envoi FormData avec ${formData.getAll('photo').length} photo(s)`);

      // Utiliser l'API unifiée pour l'upload
      const result = await tripShareApi.uploadTripPhoto(tripId, formData);
      
      console.log(`✅ UnifiedTripService - Photo uploadée avec succès:`, result);
    } catch (error: any) {
      console.error(`❌ UnifiedTripService - Erreur upload photo:`, error);
      console.error(`❌ Détails de l'erreur:`, error.message);
      if (error.response) {
        console.error(`❌ Status: ${error.response.status}`);
        console.error(`❌ Response:`, error.response.data);
      }
      throw error;
    }
  }

  /**
   * Parse la destination en format LocationJSON
   */
  private parseDestination(destination: string) {
    // Format simple pour l'instant - peut être enrichi plus tard
    const parts = destination.split(',');
    return {
      city: parts[0]?.trim() || destination,
      country: parts[parts.length - 1]?.trim() || 'France',
      latitude: 0, // À récupérer via géocodage si nécessaire
      longitude: 0,
    };
  }

  /**
   * Parse le budget en format numérique
   */
  private parseBudget(budget: string): number | undefined {
    const budgetMap: { [key: string]: number } = {
      '💸 Petit budget (< 500€)': 500,
      '💰 Budget moyen (500€ - 1500€)': 1000,
      '💎 Budget élevé (1500€ - 3000€)': 2000,
      '🏆 Budget illimité (> 3000€)': 5000,
      '🎯 Autre budget': 1000,
    };
    
    return budgetMap[budget];
  }
}

// Export du service unifié
export const unifiedTripService = new UnifiedTripService();
