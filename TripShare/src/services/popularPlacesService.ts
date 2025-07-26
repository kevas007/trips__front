import { LocationSuggestion } from '../components/places/LocationSearchInput';

export interface PopularPlace {
  id: string;
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  type: string;
  category: string;
  rating?: number;
  description?: string;
  city: string;
  country: string;
  address: string;
}

export class PopularPlacesService {
  private static popularPlacesByDestination: { [key: string]: PopularPlace[] } = {
    'Bruxelles': [
      {
        id: 'local-brussels-grand-place',
        name: 'Grand Place de Bruxelles',
        display_name: 'Grand Place, 1000 Bruxelles, Belgique',
        lat: 50.8467,
        lon: 4.3525,
        type: 'tourism',
        category: 'Monument historique',
        rating: 4.8,
        description: 'Place centrale historique de Bruxelles, classée au patrimoine mondial de l\'UNESCO',
        city: 'Bruxelles',
        country: 'Belgique',
        address: 'Grand Place, 1000 Bruxelles'
      },
      {
        id: 'local-brussels-manneken-pis',
        name: 'Manneken Pis',
        display_name: 'Manneken Pis, Rue de l\'Étuve 31, 1000 Bruxelles, Belgique',
        lat: 50.8449,
        lon: 4.3499,
        type: 'tourism',
        category: 'Monument',
        rating: 4.2,
        description: 'Statue emblématique de Bruxelles représentant un petit garçon urinant',
        city: 'Bruxelles',
        country: 'Belgique',
        address: 'Rue de l\'Étuve 31, 1000 Bruxelles'
      },
      {
        id: 'local-brussels-atomium',
        name: 'Atomium',
        display_name: 'Atomium, Square de l\'Atomium, 1020 Bruxelles, Belgique',
        lat: 50.8949,
        lon: 4.3414,
        type: 'tourism',
        category: 'Monument moderne',
        rating: 4.5,
        description: 'Structure monumentale représentant un cristal de fer agrandi 165 milliards de fois',
        city: 'Bruxelles',
        country: 'Belgique',
        address: 'Square de l\'Atomium, 1020 Bruxelles'
      },
      {
        id: 'local-brussels-parc-cinquantenaire',
        name: 'Parc du Cinquantenaire',
        display_name: 'Parc du Cinquantenaire, 1000 Bruxelles, Belgique',
        lat: 50.8404,
        lon: 4.3947,
        type: 'tourism',
        category: 'Parc',
        rating: 4.6,
        description: 'Grand parc urbain avec arc de triomphe et musées',
        city: 'Bruxelles',
        country: 'Belgique',
        address: 'Parc du Cinquantenaire, 1000 Bruxelles'
      },
      {
        id: 'local-brussels-musee-magritte',
        name: 'Musée Magritte',
        display_name: 'Musée Magritte, Place Royale 1, 1000 Bruxelles, Belgique',
        lat: 50.8417,
        lon: 4.3594,
        type: 'museum',
        category: 'Musée d\'art',
        rating: 4.7,
        description: 'Musée dédié à l\'œuvre du peintre surréaliste René Magritte',
        city: 'Bruxelles',
        country: 'Belgique',
        address: 'Place Royale 1, 1000 Bruxelles'
      }
    ],
    'Paris': [
      {
        id: 'local-paris-eiffel',
        name: 'Tour Eiffel',
        display_name: 'Tour Eiffel, Champ de Mars, 75007 Paris, France',
        lat: 48.8584,
        lon: 2.2945,
        type: 'tourism',
        category: 'Monument',
        rating: 4.6,
        description: 'Tour de fer de 324 mètres de hauteur, symbole de Paris',
        city: 'Paris',
        country: 'France',
        address: 'Champ de Mars, 75007 Paris'
      },
      {
        id: 'local-paris-louvre',
        name: 'Musée du Louvre',
        display_name: 'Musée du Louvre, Rue de Rivoli, 75001 Paris, France',
        lat: 48.8606,
        lon: 2.3376,
        type: 'museum',
        category: 'Musée d\'art',
        rating: 4.8,
        description: 'Plus grand musée d\'art et d\'antiquités au monde',
        city: 'Paris',
        country: 'France',
        address: 'Rue de Rivoli, 75001 Paris'
      },
      {
        id: 'local-paris-arc-triomphe',
        name: 'Arc de Triomphe',
        display_name: 'Arc de Triomphe, Place Charles de Gaulle, 75008 Paris, France',
        lat: 48.8738,
        lon: 2.2950,
        type: 'tourism',
        category: 'Monument',
        rating: 4.5,
        description: 'Monument historique situé sur la place Charles de Gaulle',
        city: 'Paris',
        country: 'France',
        address: 'Place Charles de Gaulle, 75008 Paris'
      },
      {
        id: 'local-paris-notre-dame',
        name: 'Cathédrale Notre-Dame',
        display_name: 'Cathédrale Notre-Dame, 6 Parvis Notre-Dame, 75004 Paris, France',
        lat: 48.8530,
        lon: 2.3499,
        type: 'tourism',
        category: 'Église',
        rating: 4.7,
        description: 'Cathédrale gothique emblématique de Paris',
        city: 'Paris',
        country: 'France',
        address: '6 Parvis Notre-Dame, 75004 Paris'
      },
      {
        id: 'local-paris-champs-elysees',
        name: 'Champs-Élysées',
        display_name: 'Avenue des Champs-Élysées, 75008 Paris, France',
        lat: 48.8698,
        lon: 2.3077,
        type: 'tourism',
        category: 'Avenue',
        rating: 4.4,
        description: 'Avenue la plus célèbre de Paris, surnommée la plus belle avenue du monde',
        city: 'Paris',
        country: 'France',
        address: 'Avenue des Champs-Élysées, 75008 Paris'
      }
    ],
    'Amsterdam': [
      {
        id: 'local-amsterdam-rijksmuseum',
        name: 'Rijksmuseum',
        display_name: 'Rijksmuseum, Museumstraat 1, 1071 XX Amsterdam, Pays-Bas',
        lat: 52.3600,
        lon: 4.8852,
        type: 'museum',
        category: 'Musée national',
        rating: 4.7,
        description: 'Musée national des Pays-Bas, abritant une vaste collection d\'art',
        city: 'Amsterdam',
        country: 'Pays-Bas',
        address: 'Museumstraat 1, 1071 XX Amsterdam'
      },
      {
        id: 'local-amsterdam-van-gogh',
        name: 'Musée Van Gogh',
        display_name: 'Musée Van Gogh, Museumplein 6, 1071 DJ Amsterdam, Pays-Bas',
        lat: 52.3584,
        lon: 4.8811,
        type: 'museum',
        category: 'Musée d\'art',
        rating: 4.8,
        description: 'Musée dédié à l\'œuvre de Vincent van Gogh',
        city: 'Amsterdam',
        country: 'Pays-Bas',
        address: 'Museumplein 6, 1071 DJ Amsterdam'
      },
      {
        id: 'local-amsterdam-anne-frank',
        name: 'Maison d\'Anne Frank',
        display_name: 'Maison d\'Anne Frank, Westermarkt 20, 1016 DK Amsterdam, Pays-Bas',
        lat: 52.3752,
        lon: 4.8840,
        type: 'museum',
        category: 'Musée historique',
        rating: 4.6,
        description: 'Maison où Anne Frank et sa famille se sont cachées pendant la Seconde Guerre mondiale',
        city: 'Amsterdam',
        country: 'Pays-Bas',
        address: 'Westermarkt 20, 1016 DK Amsterdam'
      },
      {
        id: 'local-amsterdam-dam-square',
        name: 'Place du Dam',
        display_name: 'Place du Dam, 1012 Amsterdam, Pays-Bas',
        lat: 52.3731,
        lon: 4.8926,
        type: 'tourism',
        category: 'Place',
        rating: 4.5,
        description: 'Place centrale d\'Amsterdam, cœur historique de la ville',
        city: 'Amsterdam',
        country: 'Pays-Bas',
        address: 'Place du Dam, 1012 Amsterdam'
      },
      {
        id: 'local-amsterdam-canal-cruise',
        name: 'Croisière sur les canaux',
        display_name: 'Croisière sur les canaux d\'Amsterdam, Pays-Bas',
        lat: 52.3676,
        lon: 4.9041,
        type: 'tourism',
        category: 'Activité',
        rating: 4.7,
        description: 'Croisière traditionnelle sur les célèbres canaux d\'Amsterdam',
        city: 'Amsterdam',
        country: 'Pays-Bas',
        address: 'Canaux d\'Amsterdam'
      }
    ],
    'Rome': [
      {
        id: 'local-rome-colosseum',
        name: 'Colisée',
        display_name: 'Colisée, Piazza del Colosseo, 1, 00184 Roma RM, Italie',
        lat: 41.8902,
        lon: 12.4922,
        type: 'tourism',
        category: 'Monument antique',
        rating: 4.8,
        description: 'Amphithéâtre antique, symbole de l\'Empire romain',
        city: 'Rome',
        country: 'Italie',
        address: 'Piazza del Colosseo, 1, 00184 Roma RM'
      },
      {
        id: 'local-rome-vatican',
        name: 'Vatican',
        display_name: 'Vatican, Cité du Vatican',
        lat: 41.9028,
        lon: 12.4534,
        type: 'tourism',
        category: 'État',
        rating: 4.9,
        description: 'Plus petit État souverain du monde, siège de l\'Église catholique',
        city: 'Rome',
        country: 'Italie',
        address: 'Cité du Vatican'
      },
      {
        id: 'local-rome-trevi',
        name: 'Fontaine de Trevi',
        display_name: 'Fontaine de Trevi, Piazza di Trevi, 00187 Roma RM, Italie',
        lat: 41.9009,
        lon: 12.4833,
        type: 'tourism',
        category: 'Fontaine',
        rating: 4.6,
        description: 'Plus grande fontaine baroque de Rome',
        city: 'Rome',
        country: 'Italie',
        address: 'Piazza di Trevi, 00187 Roma RM'
      },
      {
        id: 'local-rome-pantheon',
        name: 'Panthéon',
        display_name: 'Panthéon, Piazza della Rotonda, 00186 Roma RM, Italie',
        lat: 41.8986,
        lon: 12.4769,
        type: 'tourism',
        category: 'Temple antique',
        rating: 4.7,
        description: 'Temple antique dédié à tous les dieux, aujourd\'hui église',
        city: 'Rome',
        country: 'Italie',
        address: 'Piazza della Rotonda, 00186 Roma RM'
      },
      {
        id: 'local-rome-forum',
        name: 'Forum Romain',
        display_name: 'Forum Romain, Via della Salara Vecchia, 5/6, 00186 Roma RM, Italie',
        lat: 41.8925,
        lon: 12.4853,
        type: 'tourism',
        category: 'Site archéologique',
        rating: 4.8,
        description: 'Centre de la vie publique de la Rome antique',
        city: 'Rome',
        country: 'Italie',
        address: 'Via della Salara Vecchia, 5/6, 00186 Roma RM'
      }
    ]
  };

  static getPopularPlaces(destination: string): LocationSuggestion[] {
    const normalizedDestination = this.normalizeDestination(destination);
    const places = this.popularPlacesByDestination[normalizedDestination] || [];
    
    return places.map(place => ({
      id: place.id,
      name: place.name,
      display_name: place.display_name,
      lat: place.lat.toString(),
      lon: place.lon.toString(),
      type: place.type,
      address: {
        city: place.city,
        country: place.country,
        state: undefined
      }
    }));
  }

  static getPopularPlacesWithDetails(destination: string): PopularPlace[] {
    const normalizedDestination = this.normalizeDestination(destination);
    return this.popularPlacesByDestination[normalizedDestination] || [];
  }

  static getAvailableDestinations(): string[] {
    return Object.keys(this.popularPlacesByDestination);
  }

  static hasPopularPlaces(destination: string): boolean {
    const normalizedDestination = this.normalizeDestination(destination);
    return !!this.popularPlacesByDestination[normalizedDestination];
  }

  private static normalizeDestination(destination: string): string {
    // Normaliser les noms de destinations pour la correspondance
    const normalized = destination.trim().toLowerCase();
    
    if (normalized.includes('bruxelles') || normalized.includes('brussels')) {
      return 'Bruxelles';
    }
    if (normalized.includes('paris')) {
      return 'Paris';
    }
    if (normalized.includes('amsterdam')) {
      return 'Amsterdam';
    }
    if (normalized.includes('rome') || normalized.includes('roma')) {
      return 'Rome';
    }
    
    // Retourner la destination originale si aucune correspondance
    return destination;
  }

  static getPlaceCategories(destination: string): string[] {
    const places = this.getPopularPlacesWithDetails(destination);
    const categories = [...new Set(places.map(place => place.category))];
    return categories.sort();
  }
} 