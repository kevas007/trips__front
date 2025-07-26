import { unifiedApi } from './unifiedApi';

export interface SimpleTripData {
  title: string;
  description: string;
  destination: string;
  photos: string[];
  duration: string;
  budget: string;
  isPublic: boolean;
  tags: string[];
}

export interface CreateTripResponse {
  id: string;
  title: string;
  status: 'success' | 'error';
  message: string;
  photos_uploaded: number;
}

class SimpleTripService {
  
  /**
   * Crée un voyage avec photos
   */
  async createTrip(tripData: SimpleTripData): Promise<CreateTripResponse> {
    try {
      console.log('📝 Création du voyage:', tripData.title);
      
      // 1. Créer le voyage de base
      const tripPayload = {
        title: tripData.title,
        description: tripData.description,
        destination: tripData.destination,
        duration: this.parseDuration(tripData.duration),
        budget: this.parseBudget(tripData.budget),
        is_public: tripData.isPublic,
        tags: tripData.tags,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 jours par défaut
      };

      const tripResponse = await unifiedApi.post<any>('/trips', tripPayload);
      
      if (!tripResponse.id) {
        throw new Error('Erreur lors de la création du voyage');
      }

      console.log('✅ Voyage créé avec ID:', tripResponse.id);

      // 2. Uploader les photos si présentes
      let photosUploaded = 0;
      if (tripData.photos && tripData.photos.length > 0) {
        console.log('📸 Upload de', tripData.photos.length, 'photos...');
        
        for (let i = 0; i < tripData.photos.length; i++) {
          try {
            await this.uploadTripPhoto(tripResponse.id, tripData.photos[i], i === 0);
            photosUploaded++;
            console.log(`✅ Photo ${i + 1}/${tripData.photos.length} uploadée`);
          } catch (error) {
            console.warn(`⚠️ Erreur upload photo ${i + 1}:`, error);
          }
        }
      }

      return {
        id: tripResponse.id,
        title: tripData.title,
        status: 'success',
        message: `Voyage "${tripData.title}" créé avec succès !`,
        photos_uploaded: photosUploaded,
      };

    } catch (error) {
      console.error('❌ Erreur création voyage:', error);
      return {
        id: '',
        title: tripData.title,
        status: 'error',
        message: 'Impossible de créer le voyage. Veuillez réessayer.',
        photos_uploaded: 0,
      };
    }
  }

  /**
   * Upload une photo pour un voyage
   */
  private async uploadTripPhoto(tripId: string, photoUri: string, isMain: boolean = false): Promise<void> {
    const formData = new FormData();
    
    // Préparer le fichier pour l'upload
    const filename = `trip_${tripId}_${Date.now()}.jpg`;
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: filename,
    } as any);

    formData.append('is_main', isMain.toString());
    formData.append('caption', '');

    await unifiedApi.post(`/trips/${tripId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 secondes pour l'upload
    });
  }

  /**
   * Parse la durée en format standard
   */
  private parseDuration(duration: string): number {
    const durationMap: { [key: string]: number } = {
      '🌅 1 jour': 1,
      '🏖️ Week-end (2-3 jours)': 3,
      '📅 Une semaine': 7,
      '🗓️ Deux semaines': 14,
      '🌍 Plus d\'un mois': 30,
      '⏰ Autre durée': 7,
    };
    
    return durationMap[duration] || 7;
  }

  /**
   * Parse le budget en format standard
   */
  private parseBudget(budget: string): { min: number; max: number; category: string } {
    const budgetMap: { [key: string]: { min: number; max: number; category: string } } = {
      'budget': { min: 0, max: 500, category: 'budget' },
      'medium': { min: 500, max: 1500, category: 'medium' },
      'luxury': { min: 1500, max: 5000, category: 'luxury' },
      'flexible': { min: 0, max: 10000, category: 'flexible' },
    };
    
    return budgetMap[budget] || { min: 0, max: 1000, category: 'medium' };
  }

  /**
   * Compresse une image avant upload
   */
  async compressImage(uri: string, quality: number = 0.8): Promise<string> {
    // En production, utiliser une bibliothèque comme expo-image-manipulator
    // Pour l'instant, retourner l'URI tel quel
    return uri;
  }

  /**
   * Valide les données du voyage
   */
  validateTripData(tripData: SimpleTripData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!tripData.title?.trim()) {
      errors.push('Le titre est requis');
    }

    if (!tripData.destination?.trim()) {
      errors.push('La destination est requise');
    }

    if (!tripData.photos || tripData.photos.length === 0) {
      errors.push('Au moins une photo est requise');
    }

    if (tripData.photos && tripData.photos.length > 10) {
      errors.push('Maximum 10 photos autorisées');
    }

    if (tripData.title && tripData.title.length > 100) {
      errors.push('Le titre ne peut pas dépasser 100 caractères');
    }

    if (tripData.description && tripData.description.length > 1000) {
      errors.push('La description ne peut pas dépasser 1000 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Génère des suggestions de tags basées sur la destination
   */
  generateTagSuggestions(destination: string): string[] {
    const destinationLower = destination.toLowerCase();
    const suggestions: string[] = [];

    // Suggestions basées sur la destination
    if (destinationLower.includes('paris') || destinationLower.includes('france')) {
      suggestions.push('🏛️ Culture', '🍽️ Gastronomie', '🏛️ Monuments');
    }
    
    if (destinationLower.includes('bali') || destinationLower.includes('thaïlande')) {
      suggestions.push('🏖️ Plage', '🧘 Détente', '🌴 Tropical');
    }
    
    if (destinationLower.includes('tokyo') || destinationLower.includes('japon')) {
      suggestions.push('🏛️ Culture', '🍜 Gastronomie', '🏙️ Ville');
    }
    
    if (destinationLower.includes('alpes') || destinationLower.includes('montagne')) {
      suggestions.push('🏔️ Montagne', '🎒 Aventure', '🥾 Randonnée');
    }

    // Suggestions génériques
    suggestions.push('✈️ International', '📸 Photo', '🎉 Découverte');
    
    return [...new Set(suggestions)].slice(0, 8);
  }

  /**
   * Obtient les statistiques de création de voyages
   */
  async getCreationStats(): Promise<{ totalTrips: number; totalPhotos: number; averageRating: number }> {
    try {
      const response = await unifiedApi.get<any>('/users/me/stats');
      return {
        totalTrips: response.trips_count || 0,
        totalPhotos: response.photos_count || 0,
        averageRating: response.average_rating || 0,
      };
    } catch (error) {
      console.warn('Impossible de récupérer les statistiques:', error);
      return { totalTrips: 0, totalPhotos: 0, averageRating: 0 };
    }
  }
}

export const simpleTripService = new SimpleTripService(); 