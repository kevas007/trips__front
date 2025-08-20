import { LocationSuggestion } from '../components/places/LocationSearchInput';

// Configuration pour Google Places API
const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY'; // À configurer
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api';

// Interface pour les détails de lieu enrichis
export interface EnhancedLocationDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
  website?: string;
  international_phone_number?: string;
}

// Interface pour les suggestions populaires
export interface PopularDestination {
  id: string;
  name: string;
  display_name: string;
  country: string;
  type: 'city' | 'region' | 'landmark' | 'beach' | 'mountain';
  popularity_score: number;
  suggested_duration: string; // "3-5 jours"
  best_season: string[];
  highlights: string[];
  lat: number;
  lng: number;
  photo_url?: string;
}

export class EnhancedLocationService {
  
  // 🔍 Recherche avec Google Places Autocomplete
  static async searchLocationsGoogle(
    query: string, 
    types: string[] = ['(cities)', '(regions)']
  ): Promise<LocationSuggestion[]> {
    if (!query || query.length < 2) return [];

    try {
      const typeString = types.join('|');
      const url = `${GOOGLE_PLACES_BASE_URL}/place/autocomplete/json?input=${encodeURIComponent(query)}&types=${typeString}&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.warn('Google Places API error:', data.status);
        return [];
      }

      return data.predictions.map((prediction: any) => ({
        id: prediction.place_id,
        name: prediction.structured_formatting.main_text,
        display_name: prediction.description,
        lat: '0', // Sera récupéré avec getPlaceDetails
        lon: '0',
        type: prediction.types[0] || 'locality',
        address: {
          city: prediction.structured_formatting.main_text,
          country: prediction.structured_formatting.secondary_text?.split(', ').pop(),
          state: prediction.structured_formatting.secondary_text,
        }
      }));
    } catch (error) {
      console.error('Erreur recherche Google Places:', error);
      return [];
    }
  }

  // 📍 Obtenir les détails complets d'un lieu
  static async getPlaceDetails(placeId: string): Promise<EnhancedLocationDetails | null> {
    try {
      const fields = 'place_id,name,formatted_address,geometry,photos,rating,user_ratings_total,price_level,types,opening_hours,reviews,website,international_phone_number';
      const url = `${GOOGLE_PLACES_BASE_URL}/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.warn('Google Places Details API error:', data.status);
        return null;
      }

      return data.result;
    } catch (error) {
      console.error('Erreur détails lieu:', error);
      return null;
    }
  }

  // 🌟 Suggestions de destinations populaires
  static getPopularDestinations(): PopularDestination[] {
    return [
      {
        id: 'paris-france',
        name: 'Paris',
        display_name: 'Paris, France',
        country: 'France',
        type: 'city',
        popularity_score: 9.5,
        suggested_duration: '4-7 jours',
        best_season: ['Printemps', 'Été', 'Automne'],
        highlights: ['Tour Eiffel', 'Louvre', 'Champs-Élysées', 'Montmartre'],
        lat: 48.8566,
        lng: 2.3522,
        photo_url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52'
      },
      {
        id: 'tokyo-japan',
        name: 'Tokyo',
        display_name: 'Tokyo, Japon',
        country: 'Japon',
        type: 'city',
        popularity_score: 9.3,
        suggested_duration: '5-10 jours',
        best_season: ['Printemps', 'Automne'],
        highlights: ['Shibuya', 'Senso-ji', 'Tokyo Skytree', 'Harajuku'],
        lat: 35.6762,
        lng: 139.6503,
        photo_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'
      },
      {
        id: 'rome-italy',
        name: 'Rome',
        display_name: 'Rome, Italie',
        country: 'Italie',
        type: 'city',
        popularity_score: 9.1,
        suggested_duration: '3-5 jours',
        best_season: ['Printemps', 'Automne'],
        highlights: ['Colisée', 'Vatican', 'Fontaine de Trevi', 'Forum Romain'],
        lat: 41.9028,
        lng: 12.4964,
        photo_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5'
      },
      {
        id: 'santorini-greece',
        name: 'Santorin',
        display_name: 'Santorin, Grèce',
        country: 'Grèce',
        type: 'landmark',
        popularity_score: 8.9,
        suggested_duration: '3-4 jours',
        best_season: ['Été'],
        highlights: ['Oia', 'Fira', 'Plages volcaniques', 'Couchers de soleil'],
        lat: 36.3932,
        lng: 25.4615,
        photo_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff'
      },
      {
        id: 'bali-indonesia',
        name: 'Bali',
        display_name: 'Bali, Indonésie',
        country: 'Indonésie',
        type: 'region',
        popularity_score: 8.7,
        suggested_duration: '7-14 jours',
        best_season: ['Printemps', 'Été', 'Automne'],
        highlights: ['Ubud', 'Temples', 'Rizières', 'Plages'],
        lat: -8.3405,
        lng: 115.0920,
        photo_url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1'
      },
      {
        id: 'iceland-ring-road',
        name: 'Islande',
        display_name: 'Islande - Route circulaire',
        country: 'Islande',
        type: 'region',
        popularity_score: 8.5,
        suggested_duration: '7-10 jours',
        best_season: ['Été'],
        highlights: ['Aurores boréales', 'Geysers', 'Cascades', 'Glaciers'],
        lat: 64.9631,
        lng: -19.0208,
        photo_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
      },
      {
        id: 'marrakech-morocco',
        name: 'Marrakech',
        display_name: 'Marrakech, Maroc',
        country: 'Maroc',
        type: 'city',
        popularity_score: 8.3,
        suggested_duration: '3-5 jours',
        best_season: ['Automne', 'Hiver', 'Printemps'],
        highlights: ['Médina', 'Souks', 'Jardins Majorelle', 'Palais'],
        lat: 31.6295,
        lng: -7.9811,
        photo_url: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73d0e'
      },
      {
        id: 'new-york-usa',
        name: 'New York',
        display_name: 'New York, États-Unis',
        country: 'États-Unis',
        type: 'city',
        popularity_score: 9.2,
        suggested_duration: '4-7 jours',
        best_season: ['Printemps', 'Automne'],
        highlights: ['Times Square', 'Central Park', 'Statue de la Liberté', 'Brooklyn Bridge'],
        lat: 40.7128,
        lng: -74.0060,
        photo_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9'
      }
    ];
  }

  // 🔥 Suggestions basées sur la saison
  static getSeasonalSuggestions(season: 'spring' | 'summer' | 'autumn' | 'winter'): PopularDestination[] {
    const seasonMap = {
      spring: 'Printemps',
      summer: 'Été', 
      autumn: 'Automne',
      winter: 'Hiver'
    };

    return this.getPopularDestinations()
      .filter(dest => dest.best_season.includes(seasonMap[season]))
      .sort((a, b) => b.popularity_score - a.popularity_score);
  }

  // 🎯 Suggestions par type de voyage
  static getSuggestionsByTripType(type: 'cultural' | 'beach' | 'adventure' | 'city' | 'nature'): PopularDestination[] {
    const typeMapping = {
      cultural: ['city'],
      beach: ['landmark', 'region'],
      adventure: ['region', 'mountain'],
      city: ['city'],
      nature: ['region', 'mountain']
    };

    return this.getPopularDestinations()
      .filter(dest => typeMapping[type].includes(dest.type))
      .sort((a, b) => b.popularity_score - a.popularity_score);
  }

  // 📸 Obtenir l'URL d'une photo Google Places
  static getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `${GOOGLE_PLACES_BASE_URL}/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
  }

  // 🔄 Service de fallback avec OpenStreetMap (actuel)
  static async searchLocationsOSM(query: string): Promise<LocationSuggestion[]> {
    if (!query || query.length < 2) return [];

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TripShare-App/1.0',
        },
      });

      if (!response.ok) throw new Error('Erreur réseau');

      const data = await response.json();
      
      return data.map((item: any) => ({
        id: item.place_id?.toString() || item.osm_id?.toString() || Math.random().toString(),
        name: item.display_name.split(',')[0],
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        type: item.type || 'place',
        address: {
          city: item.address?.city || item.address?.town || item.address?.village,
          country: item.address?.country,
          state: item.address?.state,
        },
      }));
    } catch (error) {
      console.error('Erreur recherche OSM:', error);
      return [];
    }
  }

  // 🎯 Service principal avec fallback automatique
  static async searchLocations(query: string): Promise<LocationSuggestion[]> {
    // Essayer Google Places en premier (si configuré)
    if (GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY') {
      const googleResults = await this.searchLocationsGoogle(query);
      if (googleResults.length > 0) return googleResults;
    }

    // Fallback vers OpenStreetMap
    return this.searchLocationsOSM(query);
  }
}
