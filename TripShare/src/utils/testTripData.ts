import { Trip } from '../services/tripService';
import { TripDataValidator } from './tripDataValidator';

/**
 * Script de test pour valider les données de voyage
 * Utilisez ce script pour tester la cohérence des données
 */

// Données de test représentant un voyage du backend
const mockBackendTrip = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  title: "Voyage à Paris",
  description: "Un super voyage à Paris",
  start_date: "2024-06-01T00:00:00Z",
  end_date: "2024-06-07T00:00:00Z",
  location: {
    city: "Paris",
    country: "France",
    latitude: 48.8566,
    longitude: 2.3522
  },
  budget: 1500.0,
  status: "planned",
  visibility: "public",
  trip_type: "leisure",
  duration: "7 jours",
  map_categories: ["restaurant", "tourist_attraction"],
  travel_categories: ["culture", "romantic"],
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-15T10:30:00Z",
  created_by: "456e7890-e89b-12d3-a456-426614174001",
  
  // Champs utilisateur directs
  username: "john_doe",
  first_name: "John",
  last_name: "Doe",
  avatar_url: "https://example.com/avatar.jpg",
  
  // Informations utilisateur (relation)
  user: {
    id: "456e7890-e89b-12d3-a456-426614174001",
    username: "john_doe",
    first_name: "John",
    last_name: "Doe",
    avatar_url: "https://example.com/avatar.jpg",
    email: "john@example.com",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  
  // Relations
  photos: [
    {
      id: "789e0123-e89b-12d3-a456-426614174002",
      trip_id: "123e4567-e89b-12d3-a456-426614174000",
      url: "https://example.com/photo1.jpg",
      caption: "Tour Eiffel",
      created_at: "2024-01-15T11:00:00Z"
    },
    {
      id: "789e0124-e89b-12d3-a456-426614174003",
      trip_id: "123e4567-e89b-12d3-a456-426614174000",
      url: "https://example.com/photo2.jpg",
      caption: "Louvre",
      created_at: "2024-01-15T11:01:00Z"
    }
  ],
  likes: [
    {
      id: "789e0125-e89b-12d3-a456-426614174004",
      trip_id: "123e4567-e89b-12d3-a456-426614174000",
      user_id: "456e7891-e89b-12d3-a456-426614174005",
      created_at: "2024-01-15T12:00:00Z",
      user: {
        id: "456e7891-e89b-12d3-a456-426614174005",
        username: "jane_smith",
        first_name: "Jane",
        last_name: "Smith",
        avatar_url: "https://example.com/jane.jpg"
      }
    }
  ],
  members: [
    {
      id: "789e0126-e89b-12d3-a456-426614174006",
      trip_id: "123e4567-e89b-12d3-a456-426614174000",
      user_id: "456e7890-e89b-12d3-a456-426614174001",
      role: "owner",
      status: "accepted",
      joined_at: "2024-01-15T10:30:00Z",
      user: {
        id: "456e7890-e89b-12d3-a456-426614174001",
        username: "john_doe",
        first_name: "John",
        last_name: "Doe",
        avatar_url: "https://example.com/avatar.jpg"
      }
    }
  ],
  
  // Champs calculés
  likes_count: 1,
  comments_count: 0,
  member_count: 1,
  expense_count: 0,
  recommendation_score: 0.85
};

// Données transformées (comme elles seraient après transformation dans tripService)
const mockTransformedTrip: Trip = {
  ...mockBackendTrip,
  // Champs de compatibilité ajoutés par la transformation
  destination: "Paris",
  images: [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ],
  tags: ["culture", "romantic"]
};

/**
 * Test de validation des données de voyage
 */
export function testTripDataValidation() {
  console.log('🧪 Test de validation des données de voyage');
  console.log('==========================================');
  
  // Test 1: Validation de la structure
  console.log('\n📋 Test 1: Validation de la structure');
  const structureValidation = TripDataValidator.validateTripStructure(mockTransformedTrip);
  console.log(`Structure valide: ${structureValidation.isValid ? '✅' : '❌'}`);
  if (!structureValidation.isValid) {
    console.log('Erreurs:', structureValidation.errors);
  }
  
  // Test 2: Validation de la cohérence des images
  console.log('\n🖼️ Test 2: Validation de la cohérence des images');
  const imagesValidation = TripDataValidator.validateImagesConsistency(mockTransformedTrip);
  console.log(`Images cohérentes: ${imagesValidation.isValid ? '✅' : '⚠️'}`);
  if (!imagesValidation.isValid) {
    console.log('Avertissements:', imagesValidation.warnings);
  }
  
  // Test 3: Validation de la cohérence des tags
  console.log('\n🏷️ Test 3: Validation de la cohérence des tags');
  const tagsValidation = TripDataValidator.validateTagsConsistency(mockTransformedTrip);
  console.log(`Tags cohérents: ${tagsValidation.isValid ? '✅' : '⚠️'}`);
  if (!tagsValidation.isValid) {
    console.log('Avertissements:', tagsValidation.warnings);
  }
  
  // Test 4: Validation de la cohérence des informations utilisateur
  console.log('\n👤 Test 4: Validation de la cohérence des informations utilisateur');
  const userValidation = TripDataValidator.validateUserInfoConsistency(mockTransformedTrip);
  console.log(`Informations utilisateur cohérentes: ${userValidation.isValid ? '✅' : '⚠️'}`);
  if (!userValidation.isValid) {
    console.log('Avertissements:', userValidation.warnings);
  }
  
  // Test 5: Validation complète
  console.log('\n🔍 Test 5: Validation complète');
  const completeValidation = TripDataValidator.validateTrip(mockTransformedTrip);
  console.log(completeValidation.summary);
  
  // Test 6: Test avec des données incohérentes
  console.log('\n⚠️ Test 6: Test avec des données incohérentes');
  const inconsistentTrip: Trip = {
    ...mockTransformedTrip,
    images: ["https://example.com/different.jpg"], // Image différente
    tags: ["different_tag"], // Tag différent
    user: {
      ...mockTransformedTrip.user!,
      username: "different_username" // Nom d'utilisateur différent
    }
  };
  
  TripDataValidator.logValidation(inconsistentTrip);
  
  console.log('\n✅ Tests terminés');
}

/**
 * Test de performance pour la validation
 */
export function testValidationPerformance() {
  console.log('\n⚡ Test de performance de validation');
  console.log('====================================');
  
  const startTime = performance.now();
  
  // Valider 1000 voyages
  for (let i = 0; i < 1000; i++) {
    const testTrip: Trip = {
      ...mockTransformedTrip,
      id: `test-${i}`,
      title: `Voyage test ${i}`
    };
    TripDataValidator.validateTrip(testTrip);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`Validation de 1000 voyages en ${duration.toFixed(2)}ms`);
  console.log(`Moyenne: ${(duration / 1000).toFixed(2)}ms par voyage`);
}

// Exporter les données de test pour utilisation dans d'autres tests
export { mockBackendTrip, mockTransformedTrip };
