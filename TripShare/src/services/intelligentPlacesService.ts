import { EnhancedLocationService, PopularDestination } from './enhancedLocationService';

// 📍 Types enrichis pour les lieux
export interface PlacePhoto {
  url: string;
  width: number;
  height: number;
  attribution?: string;
}

export interface PlaceReview {
  author: string;
  rating: number;
  text: string;
  time: string;
  language: string;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  display_name: string;
  lat: number;
  lng: number;
  formatted_address: string;
  
  // Détails enrichis
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  price_level?: number; // 0-4
  photos: PlacePhoto[];
  reviews: PlaceReview[];
  
  // Informations pratiques
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  phone?: string;
  website?: string;
  
  // Catégorisation intelligente
  category: 'attraction' | 'restaurant' | 'hotel' | 'shopping' | 'nature' | 'culture' | 'nightlife' | 'transport';
  subcategory: string;
  
  // Scoring intelligent
  popularity_score: number; // 0-100
  recommendation_reason: string;
  best_time_to_visit: string[];
  estimated_duration: string;
  
  // Accessibilité et praticité
  accessibility: {
    wheelchair_accessible: boolean;
    public_transport_nearby: boolean;
  };
  
  // Tags personnalisés
  custom_tags: string[];
  local_insights: {
    crowd_level: 'low' | 'medium' | 'high';
    best_for: string[];
    insider_tip?: string;
  };
}

export interface IntelligentSuggestion {
  destination: string;
  places: PlaceDetails[];
  categories: {
    [key: string]: PlaceDetails[];
  };
  itinerary_suggestions: {
    duration: string;
    places: string[]; // place_ids
    description: string;
  }[];
}

export class IntelligentPlacesService {
  
  // 🏛️ Base de données enrichie des lieux populaires
  
  // PARIS 🇫🇷
  private static parisPlaces: PlaceDetails[] = [
    {
      place_id: 'paris_eiffel_tower',
      name: 'Tour Eiffel',
      display_name: 'Tour Eiffel, Paris, France',
      lat: 48.8584,
      lng: 2.2945,
      formatted_address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
      types: ['tourist_attraction', 'point_of_interest', 'establishment'],
      rating: 4.6,
      user_ratings_total: 284567,
      price_level: 2,
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
          width: 800,
          height: 600,
          attribution: 'Unsplash'
        },
        {
          url: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800',
          width: 800,
          height: 600,
          attribution: 'Unsplash'
        }
      ],
      reviews: [
        {
          author: 'Marie L.',
          rating: 5,
          text: 'Absolument magnifique ! La vue depuis le sommet est à couper le souffle, surtout au coucher du soleil.',
          time: '2024-01-15',
          language: 'fr'
        },
        {
          author: 'John D.',
          rating: 4,
          text: 'Iconic landmark! Book tickets in advance to avoid long queues. Evening visit is magical.',
          time: '2024-01-10',
          language: 'en'
        }
      ],
      opening_hours: {
        open_now: true,
        weekday_text: [
          'Lundi: 09:30 – 23:45',
          'Mardi: 09:30 – 23:45',
          'Mercredi: 09:30 – 23:45',
          'Jeudi: 09:30 – 23:45',
          'Vendredi: 09:30 – 23:45',
          'Samedi: 09:30 – 23:45',
          'Dimanche: 09:30 – 23:45'
        ]
      },
      website: 'https://www.toureiffel.paris',
      category: 'attraction',
      subcategory: 'monument',
      popularity_score: 98,
      recommendation_reason: 'Symbole emblématique de Paris avec vue panoramique exceptionnelle',
      best_time_to_visit: ['sunset', 'evening', 'early_morning'],
      estimated_duration: '2-3 heures',
      accessibility: {
        wheelchair_accessible: true,
        public_transport_nearby: true
      },
      custom_tags: ['romantique', 'vue panoramique', 'incontournable', 'photos'],
      local_insights: {
        crowd_level: 'high',
        best_for: ['couples', 'familles', 'photographes'],
        insider_tip: 'Réservez pour 18h30 en été pour voir le coucher de soleil depuis le 2ème étage'
      }
    },
    
    {
      place_id: 'paris_louvre',
      name: 'Musée du Louvre',
      display_name: 'Musée du Louvre, Paris, France',
      lat: 48.8606,
      lng: 2.3376,
      formatted_address: 'Rue de Rivoli, 75001 Paris',
      types: ['museum', 'tourist_attraction', 'point_of_interest'],
      rating: 4.7,
      user_ratings_total: 156789,
      price_level: 2,
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1566139884065-dca4c1a26516?w=800',
          width: 800,
          height: 600,
          attribution: 'Unsplash'
        }
      ],
      reviews: [
        {
          author: 'Sophie M.',
          rating: 5,
          text: 'Collection extraordinaire ! Prévoyez au moins une demi-journée. La Joconde vaut le détour.',
          time: '2024-01-12',
          language: 'fr'
        }
      ],
      opening_hours: {
        open_now: false,
        weekday_text: [
          'Lundi: Fermé',
          'Mardi: 09:00 – 18:00',
          'Mercredi: 09:00 – 21:45',
          'Jeudi: 09:00 – 18:00',
          'Vendredi: 09:00 – 21:45',
          'Samedi: 09:00 – 18:00',
          'Dimanche: 09:00 – 18:00'
        ]
      },
      website: 'https://www.louvre.fr',
      category: 'culture',
      subcategory: 'museum',
      popularity_score: 95,
      recommendation_reason: 'Plus grand musée du monde avec des œuvres emblématiques',
      best_time_to_visit: ['morning', 'weekday'],
      estimated_duration: '3-5 heures',
      accessibility: {
        wheelchair_accessible: true,
        public_transport_nearby: true
      },
      custom_tags: ['art', 'culture', 'histoire', 'joconde'],
      local_insights: {
        crowd_level: 'high',
        best_for: ['amateurs d\'art', 'familles', 'étudiants'],
        insider_tip: 'Entrée gratuite le premier dimanche de chaque mois (oct-mars)'
      }
    },

    {
      place_id: 'paris_montmartre',
      name: 'Montmartre et Sacré-Cœur',
      display_name: 'Montmartre, Paris, France',
      lat: 48.8867,
      lng: 2.3431,
      formatted_address: 'Montmartre, 75018 Paris',
      types: ['neighborhood', 'tourist_attraction'],
      rating: 4.5,
      user_ratings_total: 98765,
      price_level: 1,
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
          width: 800,
          height: 600,
          attribution: 'Unsplash'
        }
      ],
      reviews: [
        {
          author: 'Alexandre R.',
          rating: 5,
          text: 'Quartier bohème magnifique ! L\'ambiance artistique est unique, et la vue depuis le Sacré-Cœur est splendide.',
          time: '2024-01-08',
          language: 'fr'
        }
      ],
      opening_hours: {
        open_now: true,
        weekday_text: ['Ouvert 24h/24']
      },
      category: 'culture',
      subcategory: 'historic_district',
      popularity_score: 88,
      recommendation_reason: 'Quartier artistique emblématique avec vue panoramique',
      best_time_to_visit: ['afternoon', 'sunset'],
      estimated_duration: '3-4 heures',
      accessibility: {
        wheelchair_accessible: false,
        public_transport_nearby: true
      },
      custom_tags: ['artistique', 'vue panoramique', 'bohème', 'basilique'],
      local_insights: {
        crowd_level: 'medium',
        best_for: ['artistes', 'romantiques', 'photographes'],
        insider_tip: 'Prenez le funiculaire pour éviter la montée à pied'
      }
    },

    {
      place_id: 'paris_le_comptoir_du_relais',
      name: 'Le Comptoir du Relais',
      display_name: 'Le Comptoir du Relais, Paris, France',
      lat: 48.8506,
      lng: 2.3399,
      formatted_address: '9 Carrefour de l\'Odéon, 75006 Paris',
      types: ['restaurant', 'food', 'point_of_interest'],
      rating: 4.3,
      user_ratings_total: 2847,
      price_level: 3,
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
          width: 800,
          height: 600,
          attribution: 'Unsplash'
        }
      ],
      reviews: [
        {
          author: 'Julien B.',
          rating: 4,
          text: 'Excellent bistrot parisien ! Cuisine traditionnelle de qualité, réservation indispensable.',
          time: '2024-01-05',
          language: 'fr'
        }
      ],
      opening_hours: {
        open_now: true,
        weekday_text: [
          'Lundi: 12:00 – 15:00, 19:00 – 23:00',
          'Mardi: 12:00 – 15:00, 19:00 – 23:00',
          'Mercredi: 12:00 – 15:00, 19:00 – 23:00',
          'Jeudi: 12:00 – 15:00, 19:00 – 23:00',
          'Vendredi: 12:00 – 15:00, 19:00 – 23:00',
          'Samedi: 12:00 – 15:00, 19:00 – 23:00',
          'Dimanche: 12:00 – 15:00, 19:00 – 23:00'
        ]
      },
      phone: '+33 1 44 27 07 97',
      category: 'restaurant',
      subcategory: 'bistrot_francais',
      popularity_score: 82,
      recommendation_reason: 'Bistrot parisien authentique avec cuisine traditionnelle raffinée',
      best_time_to_visit: ['lunch', 'dinner'],
      estimated_duration: '1-2 heures',
      accessibility: {
        wheelchair_accessible: false,
        public_transport_nearby: true
      },
      custom_tags: ['cuisine française', 'bistrot', 'authentique', 'réservation'],
      local_insights: {
        crowd_level: 'high',
        best_for: ['gourmets', 'couples', 'expérience parisienne'],
        insider_tip: 'Essayez le menu dégustation le soir, c\'est exceptionnel'
      }
    }
  ];

  // TOKYO 🇯🇵
  private static tokyoPlaces: PlaceDetails[] = [
    {
      place_id: 'tokyo_shibuya_crossing',
      name: 'Shibuya Crossing',
      display_name: 'Shibuya Crossing, Tokyo, Japon',
      lat: 35.6598,
      lng: 139.7006,
      formatted_address: 'Shibuya City, Tokyo, Japan',
      types: ['tourist_attraction', 'point_of_interest'],
      rating: 4.4,
      user_ratings_total: 45678,
      price_level: 0,
      photos: [
        {
          url: 'http://localhost:8085/storage/defaults/default-trip-image.jpg',
          width: 800,
          height: 600,
          attribution: 'Unsplash'
        }
      ],
      reviews: [
        {
          author: 'Hiroshi T.',
          rating: 5,
          text: '世界で最も有名な交差点！夜の光景は特に素晴らしいです。',
          time: '2024-01-10',
          language: 'ja'
        },
        {
          author: 'Emma S.',
          rating: 4,
          text: 'Incredible experience! The organized chaos is mesmerizing. Go to Shibuya Sky for the best view.',
          time: '2024-01-07',
          language: 'en'
        }
      ],
      opening_hours: {
        open_now: true,
        weekday_text: ['Ouvert 24h/24']
      },
      category: 'attraction',
      subcategory: 'urban_landmark',
      popularity_score: 92,
      recommendation_reason: 'Carrefour le plus fréquenté au monde, expérience urbaine unique',
      best_time_to_visit: ['evening', 'rush_hour'],
      estimated_duration: '30 minutes - 1 heure',
      accessibility: {
        wheelchair_accessible: true,
        public_transport_nearby: true
      },
      custom_tags: ['urbain', 'moderne', 'foule', 'neon', 'shopping'],
      local_insights: {
        crowd_level: 'high',
        best_for: ['photography', 'first_time_visitors', 'urban_experience'],
        insider_tip: 'Montez au Shibuya Sky pour une vue aérienne du crossing'
      }
    },

    {
      place_id: 'tokyo_senso_ji',
      name: 'Temple Senso-ji',
      display_name: 'Temple Senso-ji, Asakusa, Tokyo',
      lat: 35.7148,
      lng: 139.7967,
      formatted_address: '2-3-1 Asakusa, Taito City, Tokyo',
      types: ['hindu_temple', 'tourist_attraction', 'place_of_worship'],
      rating: 4.3,
      user_ratings_total: 67890,
      price_level: 0,
      photos: [
        {
          url: 'http://localhost:8085/storage/defaults/default-trip-image.jpg',
          width: 800,
          height: 600,
          attribution: 'Unsplash'
        }
      ],
      reviews: [
        {
          author: 'Yuki M.',
          rating: 5,
          text: '東京最古のお寺。仲見世通りでのお買い物も楽しいです。',
          time: '2024-01-12',
          language: 'ja'
        }
      ],
      opening_hours: {
        open_now: true,
        weekday_text: [
          'Tous les jours: 06:00 – 17:00'
        ]
      },
      category: 'culture',
      subcategory: 'temple',
      popularity_score: 89,
      recommendation_reason: 'Plus ancien temple de Tokyo dans un quartier traditionnel',
      best_time_to_visit: ['morning', 'afternoon'],
      estimated_duration: '2-3 heures',
      accessibility: {
        wheelchair_accessible: true,
        public_transport_nearby: true
      },
      custom_tags: ['traditionnel', 'temple', 'spirituel', 'shopping', 'culture'],
      local_insights: {
        crowd_level: 'medium',
        best_for: ['culture_seekers', 'families', 'spiritual_experience'],
        insider_tip: 'Visitez tôt le matin pour éviter la foule et voir les rituels matinaux'
      }
    }
  ];

  // ROME 🇮🇹
  private static romePlaces: PlaceDetails[] = [
    {
      place_id: 'rome_colosseum',
      name: 'Colisée',
      display_name: 'Colisée, Rome, Italie',
      lat: 41.8902,
      lng: 12.4922,
      formatted_address: 'Piazza del Colosseo, 1, 00184 Roma RM, Italy',
      types: ['tourist_attraction', 'museum', 'point_of_interest'],
      rating: 4.6,
      user_ratings_total: 234567,
      price_level: 2,
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
          width: 800,
          height: 600,
          attribution: 'Unsplash'
        }
      ],
      reviews: [
        {
          author: 'Marco R.',
          rating: 5,
          text: 'Straordinario! La storia prende vita. Consiglio la visita guidata per apprezzare appieno.',
          time: '2024-01-09',
          language: 'it'
        },
        {
          author: 'Claire L.',
          rating: 5,
          text: 'Absolument époustouflant ! L\'histoire antique prend vie. Réservez absolument à l\'avance.',
          time: '2024-01-06',
          language: 'fr'
        }
      ],
      opening_hours: {
        open_now: true,
        weekday_text: [
          'Tous les jours: 08:30 – 16:30'
        ]
      },
      website: 'https://parcocolosseo.it',
      category: 'culture',
      subcategory: 'ancient_monument',
      popularity_score: 96,
      recommendation_reason: 'Monument antique emblématique, merveille architecturale',
      best_time_to_visit: ['morning', 'late_afternoon'],
      estimated_duration: '2-3 heures',
      accessibility: {
        wheelchair_accessible: true,
        public_transport_nearby: true
      },
      custom_tags: ['antique', 'histoire', 'architecture', 'gladiateurs'],
      local_insights: {
        crowd_level: 'high',
        best_for: ['history_lovers', 'families', 'first_time_visitors'],
        insider_tip: 'Achetez le billet combiné avec le Forum Romain et le Palatin'
      }
    }
  ];

  // 🎯 Base de données complète par ville
  private static cityPlaces: { [key: string]: PlaceDetails[] } = {
    'Paris': IntelligentPlacesService.parisPlaces,
    'Tokyo': IntelligentPlacesService.tokyoPlaces,
    'Rome': IntelligentPlacesService.romePlaces,
  };

  // 🔍 Méthodes de recherche intelligente

  /**
   * Obtenir suggestions intelligentes pour une ville
   */
  static getIntelligentSuggestions(cityName: string): IntelligentSuggestion | null {
    const city = cityName.split(',')[0].trim();
    const places = this.cityPlaces[city];
    
    if (!places) return null;

    // Catégoriser les lieux
    const categories: { [key: string]: PlaceDetails[] } = {};
    places.forEach(place => {
      if (!categories[place.category]) {
        categories[place.category] = [];
      }
      categories[place.category].push(place);
    });

    // Trier par score de popularité
    Object.keys(categories).forEach(category => {
      categories[category].sort((a, b) => b.popularity_score - a.popularity_score);
    });

    // Suggestions d'itinéraires
    const itinerary_suggestions = this.generateItinerarySuggestions(places);

    return {
      destination: city,
      places: places.sort((a, b) => b.popularity_score - a.popularity_score),
      categories,
      itinerary_suggestions
    };
  }

  /**
   * Recherche par catégorie
   */
  static getPlacesByCategory(
    cityName: string, 
    category: string
  ): PlaceDetails[] {
    const suggestions = this.getIntelligentSuggestions(cityName);
    return suggestions?.categories[category] || [];
  }

  /**
   * Recherche par score de popularité
   */
  static getTopPlaces(cityName: string, limit: number = 5): PlaceDetails[] {
    const suggestions = this.getIntelligentSuggestions(cityName);
    return suggestions?.places.slice(0, limit) || [];
  }

  /**
   * Recherche par tags personnalisés
   */
  static getPlacesByTags(cityName: string, tags: string[]): PlaceDetails[] {
    const suggestions = this.getIntelligentSuggestions(cityName);
    if (!suggestions) return [];

    return suggestions.places.filter(place =>
      tags.some(tag =>
        place.custom_tags && place.custom_tags.some(placeTag =>
          placeTag && placeTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );
  }

  /**
   * Recommandations personnalisées
   */
  static getPersonalizedRecommendations(
    cityName: string,
    userProfile: {
      interests?: string[];
      budget?: 'low' | 'medium' | 'high';
      travel_style?: 'relaxed' | 'active' | 'cultural';
      accessibility_needs?: boolean;
    }
  ): PlaceDetails[] {
    const suggestions = this.getIntelligentSuggestions(cityName);
    if (!suggestions) return [];

    let filteredPlaces = [...suggestions.places];

    // Filtrer par budget
    if (userProfile.budget) {
      const budgetMap = {
        'low': [0, 1],
        'medium': [0, 1, 2],
        'high': [0, 1, 2, 3, 4]
      };
      filteredPlaces = filteredPlaces.filter(place =>
        place.price_level === undefined || 
        budgetMap[userProfile.budget!].includes(place.price_level)
      );
    }

    // Filtrer par style de voyage
    if (userProfile.travel_style === 'cultural') {
      filteredPlaces = filteredPlaces.filter(place =>
        place.category === 'culture' || place.category === 'attraction'
      );
    }

    // Filtrer par accessibilité
    if (userProfile.accessibility_needs) {
      filteredPlaces = filteredPlaces.filter(place =>
        place.accessibility.wheelchair_accessible
      );
    }

    // Filtrer par intérêts
    if (userProfile.interests?.length) {
      filteredPlaces = filteredPlaces.filter(place =>
        userProfile.interests!.some(interest =>
          (place.custom_tags && place.custom_tags.some(tag =>
            tag.toLowerCase().includes(interest.toLowerCase())
          )) ||
          (place.local_insights && place.local_insights.best_for && place.local_insights.best_for.some(bestFor =>
            bestFor.toLowerCase().includes(interest.toLowerCase())
          ))
        )
      );
    }

    return filteredPlaces.slice(0, 8);
  }

  /**
   * Détails complets d'un lieu
   */
  static getPlaceDetails(placeId: string): PlaceDetails | null {
    for (const cityPlaces of Object.values(this.cityPlaces)) {
      const place = cityPlaces.find(p => p.place_id === placeId);
      if (place) return place;
    }
    return null;
  }

  /**
   * Générer suggestions d'itinéraires
   */
  private static generateItinerarySuggestions(places: PlaceDetails[]) {
    const topPlaces = places.sort((a, b) => b.popularity_score - a.popularity_score);
    
    return [
      {
        duration: 'Une journée',
        places: topPlaces.slice(0, 3).map(p => p.place_id),
        description: 'Les incontournables en une journée'
      },
      {
        duration: 'Week-end',
        places: topPlaces.slice(0, 6).map(p => p.place_id),
        description: 'Découverte complète en 2 jours'
      },
      {
        duration: 'Une semaine',
        places: topPlaces.map(p => p.place_id),
        description: 'Exploration approfondie'
      }
    ];
  }

  /**
   * Vérifier si des suggestions sont disponibles
   */
  static hasSuggestions(cityName: string): boolean {
    const city = cityName.split(',')[0].trim();
    return Object.keys(this.cityPlaces).includes(city);
  }

  /**
   * Obtenir toutes les villes disponibles
   */
  static getAvailableCities(): string[] {
    return Object.keys(this.cityPlaces);
  }

  /**
   * Recherche intelligente de lieux
   */
  static searchPlaces(cityName: string, query: string): PlaceDetails[] {
    const suggestions = this.getIntelligentSuggestions(cityName);
    if (!suggestions) return [];

    const searchTerm = query.toLowerCase();
    
    return suggestions.places.filter(place =>
      (place.name && place.name.toLowerCase().includes(searchTerm)) ||
      (place.subcategory && place.subcategory.toLowerCase().includes(searchTerm)) ||
      (place.custom_tags && place.custom_tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
      (place.recommendation_reason && place.recommendation_reason.toLowerCase().includes(searchTerm))
    );
  }
}
