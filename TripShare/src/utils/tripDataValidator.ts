import { Trip } from '../services/tripService';

/**
 * Utilitaire pour valider la cohérence des données de voyage
 * entre le frontend et le backend
 */
export class TripDataValidator {
  
  /**
   * Valide qu'un objet Trip a la structure attendue
   */
  static validateTripStructure(trip: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Vérification des champs obligatoires
    if (!trip.id) errors.push('ID manquant');
    if (!trip.title) errors.push('Titre manquant');
    if (!trip.created_by) errors.push('Créateur manquant');
    if (!trip.created_at) errors.push('Date de création manquante');
    if (!trip.updated_at) errors.push('Date de mise à jour manquante');
    
    // Vérification de la structure location
    if (!trip.location) {
      errors.push('Location manquante');
    } else {
      if (!trip.location.city) errors.push('Ville manquante dans location');
      if (!trip.location.country) errors.push('Pays manquant dans location');
      if (typeof trip.location.latitude !== 'number') errors.push('Latitude invalide');
      if (typeof trip.location.longitude !== 'number') errors.push('Longitude invalide');
    }
    
    // Vérification du statut
    const validStatuses = ['planned', 'confirmed', 'ongoing', 'completed', 'cancelled'];
    if (!validStatuses.includes(trip.status)) {
      errors.push(`Statut invalide: ${trip.status}`);
    }
    
    // Vérification de la visibilité
    const validVisibilities = ['public', 'private'];
    if (!validVisibilities.includes(trip.visibility)) {
      errors.push(`Visibilité invalide: ${trip.visibility}`);
    }
    
    // Vérification des champs de compatibilité
    if (!trip.destination) errors.push('Champ de compatibilité destination manquant');
    if (!trip.images) errors.push('Champ de compatibilité images manquant');
    if (!trip.tags) errors.push('Champ de compatibilité tags manquant');
    
    // Vérification des informations utilisateur
    if (!trip.user) {
      errors.push('Informations utilisateur manquantes');
    } else {
      if (!trip.user.id) errors.push('ID utilisateur manquant');
      if (!trip.user.username) errors.push('Nom d\'utilisateur manquant');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Valide la cohérence entre les photos et les images
   */
  static validateImagesConsistency(trip: Trip): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    // Vérifier que les images correspondent aux photos
    if (trip.photos && trip.photos.length > 0 && trip.images) {
      const photoUrls = trip.photos.map(photo => photo.url);
      const imageUrls = trip.images;
      
      if (photoUrls.length !== imageUrls.length) {
        warnings.push(`Incohérence: ${trip.photos.length} photos vs ${trip.images.length} images`);
      }
      
      // Vérifier que les URLs correspondent
      for (let i = 0; i < Math.min(photoUrls.length, imageUrls.length); i++) {
        if (photoUrls[i] !== imageUrls[i]) {
          warnings.push(`URL incohérente à l'index ${i}: photo=${photoUrls[i]}, image=${imageUrls[i]}`);
        }
      }
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
  
  /**
   * Valide la cohérence des tags
   */
  static validateTagsConsistency(trip: Trip): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    if (trip.travel_categories && trip.tags) {
      if (trip.travel_categories.length !== trip.tags.length) {
        warnings.push(`Incohérence tags: ${trip.travel_categories.length} travel_categories vs ${trip.tags.length} tags`);
      }
      
      // Vérifier que les tags correspondent
      for (let i = 0; i < Math.min(trip.travel_categories.length, trip.tags.length); i++) {
        if (trip.travel_categories[i] !== trip.tags[i]) {
          warnings.push(`Tag incohérent à l'index ${i}: travel_categories=${trip.travel_categories[i]}, tags=${trip.tags[i]}`);
        }
      }
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
  
  /**
   * Valide la cohérence des informations utilisateur
   */
  static validateUserInfoConsistency(trip: Trip): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    // Vérifier la cohérence entre les champs directs et l'objet user
    if (trip.user && trip.username) {
      if (trip.user.username !== trip.username) {
        warnings.push(`Nom d'utilisateur incohérent: user.username=${trip.user.username}, username=${trip.username}`);
      }
    }
    
    if (trip.user && trip.first_name) {
      if (trip.user.first_name !== trip.first_name) {
        warnings.push(`Prénom incohérent: user.first_name=${trip.user.first_name}, first_name=${trip.first_name}`);
      }
    }
    
    if (trip.user && trip.last_name) {
      if (trip.user.last_name !== trip.last_name) {
        warnings.push(`Nom incohérent: user.last_name=${trip.user.last_name}, last_name=${trip.last_name}`);
      }
    }
    
    if (trip.user && trip.avatar_url) {
      if (trip.user.avatar_url !== trip.avatar_url) {
        warnings.push(`Avatar incohérent: user.avatar_url=${trip.user.avatar_url}, avatar_url=${trip.avatar_url}`);
      }
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
  
  /**
   * Validation complète d'un voyage
   */
  static validateTrip(trip: Trip): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    summary: string;
  } {
    const structureValidation = this.validateTripStructure(trip);
    const imagesValidation = this.validateImagesConsistency(trip);
    const tagsValidation = this.validateTagsConsistency(trip);
    const userValidation = this.validateUserInfoConsistency(trip);
    
    const allErrors = [...structureValidation.errors];
    const allWarnings = [
      ...imagesValidation.warnings,
      ...tagsValidation.warnings,
      ...userValidation.warnings
    ];
    
    const isValid = structureValidation.isValid;
    
    const summary = `
Validation du voyage ${trip.id} (${trip.title}):
- Structure: ${structureValidation.isValid ? '✅' : '❌'} (${structureValidation.errors.length} erreurs)
- Images: ${imagesValidation.isValid ? '✅' : '⚠️'} (${imagesValidation.warnings.length} avertissements)
- Tags: ${tagsValidation.isValid ? '✅' : '⚠️'} (${tagsValidation.warnings.length} avertissements)
- Utilisateur: ${userValidation.isValid ? '✅' : '⚠️'} (${userValidation.warnings.length} avertissements)
    `.trim();
    
    return {
      isValid,
      errors: allErrors,
      warnings: allWarnings,
      summary
    };
  }
  
  /**
   * Log les résultats de validation pour le débogage
   */
  static logValidation(trip: Trip): void {
    const validation = this.validateTrip(trip);
    
    console.log('🔍 Validation des données de voyage:');
    console.log(validation.summary);
    
    if (validation.errors.length > 0) {
      console.error('❌ Erreurs de validation:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
    }
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Avertissements de validation:');
      validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
    
    if (validation.isValid && validation.warnings.length === 0) {
      console.log('✅ Voyage valide sans avertissements');
    }
  }
}
