import { EnhancedLocationService, PopularDestination } from './enhancedLocationService';

export interface ItineraryStep {
  id: string;
  title: string;
  description: string;
  city: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  suggestedDuration: string; // "2-3 heures"
  category: 'monument' | 'museum' | 'restaurant' | 'shopping' | 'nature' | 'activity' | 'accommodation';
  priority: 'must-see' | 'recommended' | 'optional';
  bestTimeToVisit: string[]; // ["morning", "afternoon", "evening"]
  estimatedCost: 'free' | 'low' | 'medium' | 'high';
  tips?: string;
  photoUrl?: string;
}

export interface CityItinerarySuggestion {
  cityName: string;
  country: string;
  recommendedDuration: string;
  bestTimeToVisit: string[];
  steps: ItineraryStep[];
  dayByDayPlan: {
    day: number;
    title: string;
    description: string;
    steps: string[]; // IDs des étapes
  }[];
}

export class ItinerarySuggestionsService {
  
  // 🏛️ Suggestions pour Paris
  private static parisItinerary: CityItinerarySuggestion = {
    cityName: 'Paris',
    country: 'France',
    recommendedDuration: '4-6 jours',
    bestTimeToVisit: ['Printemps', 'Été', 'Automne'],
    steps: [
      {
        id: 'paris-eiffel-tower',
        title: 'Tour Eiffel',
        description: 'Symbole emblématique de Paris, montez au sommet pour une vue panoramique',
        city: 'Paris',
        coordinates: { latitude: 48.8584, longitude: 2.2945 },
        suggestedDuration: '2-3 heures',
        category: 'monument',
        priority: 'must-see',
        bestTimeToVisit: ['afternoon', 'evening'],
        estimatedCost: 'medium',
        tips: 'Réservez à l\'avance, magnifique au coucher du soleil',
        photoUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52'
      },
      {
        id: 'paris-louvre',
        title: 'Musée du Louvre',
        description: 'Le plus grand musée du monde, abritant la Joconde',
        city: 'Paris',
        coordinates: { latitude: 48.8606, longitude: 2.3376 },
        suggestedDuration: '3-4 heures',
        category: 'museum',
        priority: 'must-see',
        bestTimeToVisit: ['morning', 'afternoon'],
        estimatedCost: 'medium',
        tips: 'Achetez vos billets en ligne, utilisez l\'entrée Pyramid',
        photoUrl: 'https://images.unsplash.com/photo-1566139884065-dca4c1a26516'
      },
      {
        id: 'paris-champs-elysees',
        title: 'Champs-Élysées & Arc de Triomphe',
        description: 'Avenue mythique et monument historique',
        city: 'Paris',
        coordinates: { latitude: 48.8738, longitude: 2.2950 },
        suggestedDuration: '2 heures',
        category: 'shopping',
        priority: 'recommended',
        bestTimeToVisit: ['afternoon'],
        estimatedCost: 'high',
        tips: 'Parfait pour le shopping et les photos',
        photoUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52'
      },
      {
        id: 'paris-montmartre',
        title: 'Montmartre & Sacré-Cœur',
        description: 'Quartier artistique avec vue panoramique',
        city: 'Paris',
        coordinates: { latitude: 48.8867, longitude: 2.3431 },
        suggestedDuration: '3-4 heures',
        category: 'monument',
        priority: 'must-see',
        bestTimeToVisit: ['afternoon', 'evening'],
        estimatedCost: 'free',
        tips: 'Prenez le funiculaire, ambiance bohème',
        photoUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52'
      },
      {
        id: 'paris-notre-dame',
        title: 'Île de la Cité & Notre-Dame',
        description: 'Cœur historique de Paris',
        city: 'Paris',
        coordinates: { latitude: 48.8530, longitude: 2.3499 },
        suggestedDuration: '2 heures',
        category: 'monument',
        priority: 'recommended',
        bestTimeToVisit: ['morning', 'afternoon'],
        estimatedCost: 'free',
        tips: 'Baladez-vous sur les quais de Seine',
        photoUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52'
      },
      {
        id: 'paris-marais',
        title: 'Le Marais',
        description: 'Quartier historique avec boutiques et restaurants',
        city: 'Paris',
        coordinates: { latitude: 48.8566, longitude: 2.3522 },
        suggestedDuration: '2-3 heures',
        category: 'shopping',
        priority: 'recommended',
        bestTimeToVisit: ['afternoon'],
        estimatedCost: 'medium',
        tips: 'Excellent pour déjeuner et faire du shopping',
        photoUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52'
      }
    ],
    dayByDayPlan: [
      {
        day: 1,
        title: 'Découverte des incontournables',
        description: 'Tour Eiffel et Champs-Élysées',
        steps: ['paris-eiffel-tower', 'paris-champs-elysees']
      },
      {
        day: 2,
        title: 'Art et culture',
        description: 'Louvre et Île de la Cité',
        steps: ['paris-louvre', 'paris-notre-dame']
      },
      {
        day: 3,
        title: 'Montmartre et ambiance parisienne',
        description: 'Quartier artistique et shopping',
        steps: ['paris-montmartre', 'paris-marais']
      }
    ]
  };

  // 🗾 Suggestions pour Tokyo
  private static tokyoItinerary: CityItinerarySuggestion = {
    cityName: 'Tokyo',
    country: 'Japon',
    recommendedDuration: '5-7 jours',
    bestTimeToVisit: ['Printemps', 'Automne'],
    steps: [
      {
        id: 'tokyo-shibuya',
        title: 'Shibuya Crossing',
        description: 'Le carrefour le plus fréquenté au monde',
        city: 'Tokyo',
        coordinates: { latitude: 35.6598, longitude: 139.7006 },
        suggestedDuration: '1-2 heures',
        category: 'activity',
        priority: 'must-see',
        bestTimeToVisit: ['afternoon', 'evening'],
        estimatedCost: 'free',
        tips: 'Montez au Shibuya Sky pour la vue d\'en haut',
        photoUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'
      },
      {
        id: 'tokyo-senso-ji',
        title: 'Temple Senso-ji',
        description: 'Plus ancien temple de Tokyo à Asakusa',
        city: 'Tokyo',
        coordinates: { latitude: 35.7148, longitude: 139.7967 },
        suggestedDuration: '2-3 heures',
        category: 'monument',
        priority: 'must-see',
        bestTimeToVisit: ['morning', 'afternoon'],
        estimatedCost: 'free',
        tips: 'Explorez la rue Nakamise-dori pour les souvenirs',
        photoUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'
      },
      {
        id: 'tokyo-harajuku',
        title: 'Harajuku & Takeshita Street',
        description: 'Centre de la mode kawaii et de la culture pop',
        city: 'Tokyo',
        coordinates: { latitude: 35.6702, longitude: 139.7026 },
        suggestedDuration: '2-3 heures',
        category: 'shopping',
        priority: 'recommended',
        bestTimeToVisit: ['afternoon'],
        estimatedCost: 'medium',
        tips: 'Parfait pour la mode alternative et les crêpes',
        photoUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'
      }
    ],
    dayByDayPlan: [
      {
        day: 1,
        title: 'Tokyo moderne',
        description: 'Shibuya et Harajuku',
        steps: ['tokyo-shibuya', 'tokyo-harajuku']
      },
      {
        day: 2,
        title: 'Tokyo traditionnel',
        description: 'Temples et culture',
        steps: ['tokyo-senso-ji']
      }
    ]
  };

  // 🇮🇹 Suggestions pour Rome
  private static romeItinerary: CityItinerarySuggestion = {
    cityName: 'Rome',
    country: 'Italie',
    recommendedDuration: '3-5 jours',
    bestTimeToVisit: ['Printemps', 'Automne'],
    steps: [
      {
        id: 'rome-colosseum',
        title: 'Colisée',
        description: 'Amphithéâtre antique emblématique',
        city: 'Rome',
        coordinates: { latitude: 41.8902, longitude: 12.4922 },
        suggestedDuration: '2-3 heures',
        category: 'monument',
        priority: 'must-see',
        bestTimeToVisit: ['morning', 'afternoon'],
        estimatedCost: 'medium',
        tips: 'Réservez pour éviter les files d\'attente',
        photoUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5'
      },
      {
        id: 'rome-vatican',
        title: 'Vatican & Chapelle Sixtine',
        description: 'Musées du Vatican et art de Michel-Ange',
        city: 'Rome',
        coordinates: { latitude: 41.9029, longitude: 12.4534 },
        suggestedDuration: '3-4 heures',
        category: 'museum',
        priority: 'must-see',
        bestTimeToVisit: ['morning'],
        estimatedCost: 'medium',
        tips: 'Réservation obligatoire, dress code strict',
        photoUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5'
      },
      {
        id: 'rome-trevi',
        title: 'Fontaine de Trevi',
        description: 'Fontaine baroque la plus célèbre de Rome',
        city: 'Rome',
        coordinates: { latitude: 41.9009, longitude: 12.4833 },
        suggestedDuration: '30 minutes',
        category: 'monument',
        priority: 'must-see',
        bestTimeToVisit: ['evening'],
        estimatedCost: 'free',
        tips: 'Jetez une pièce pour revenir à Rome !',
        photoUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5'
      }
    ],
    dayByDayPlan: [
      {
        day: 1,
        title: 'Rome antique',
        description: 'Colisée et Forum',
        steps: ['rome-colosseum']
      },
      {
        day: 2,
        title: 'Vatican et centre-ville',
        description: 'Art et fontaines',
        steps: ['rome-vatican', 'rome-trevi']
      }
    ]
  };

  // 📍 Base de données des suggestions par ville
  private static cityItineraries: { [key: string]: CityItinerarySuggestion } = {
    'Paris': ItinerarySuggestionsService.parisItinerary,
    'Tokyo': ItinerarySuggestionsService.tokyoItinerary,
    'Rome': ItinerarySuggestionsService.romeItinerary,
  };

  // 🎯 Obtenir suggestions pour une ville
  static getItinerarySuggestions(cityName: string): CityItinerarySuggestion | null {
    const city = cityName.split(',')[0].trim(); // Extraire juste le nom de la ville
    return this.cityItineraries[city] || null;
  }

  // 🌟 Obtenir étapes suggérées par priorité
  static getSuggestedSteps(
    cityName: string, 
    tripDuration: number, 
    interests: string[] = []
  ): ItineraryStep[] {
    const itinerary = this.getItinerarySuggestions(cityName);
    if (!itinerary) return [];

    let steps = [...itinerary.steps];

    // Filtrer par intérêts si spécifiés
    if (interests.length > 0) {
      steps = steps.filter(step => 
        interests.some(interest => step.category.includes(interest))
      );
    }

    // Trier par priorité
    const priorityOrder = { 'must-see': 3, 'recommended': 2, 'optional': 1 };
    steps.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    // Limiter selon la durée du voyage
    const maxSteps = Math.min(tripDuration * 2, steps.length);
    return steps.slice(0, maxSteps);
  }

  // 📅 Obtenir plan jour par jour
  static getDayByDayPlan(cityName: string): any[] {
    const itinerary = this.getItinerarySuggestions(cityName);
    return itinerary?.dayByDayPlan || [];
  }

  // 🔍 Rechercher étapes par catégorie
  static getStepsByCategory(
    cityName: string, 
    category: ItineraryStep['category']
  ): ItineraryStep[] {
    const itinerary = this.getItinerarySuggestions(cityName);
    if (!itinerary) return [];

    return itinerary.steps.filter(step => step.category === category);
  }

  // 💡 Suggestions intelligentes basées sur le profil
  static getSmartSuggestions(
    cityName: string,
    userProfile: {
      interests?: string[];
      budget?: 'low' | 'medium' | 'high';
      travelStyle?: 'relaxed' | 'active' | 'cultural';
      duration?: number;
    }
  ): ItineraryStep[] {
    const itinerary = this.getItinerarySuggestions(cityName);
    if (!itinerary) return [];

    let steps = [...itinerary.steps];

    // Filtrer par budget
    if (userProfile.budget) {
      const budgetMap = { 'low': ['free', 'low'], 'medium': ['free', 'low', 'medium'], 'high': ['free', 'low', 'medium', 'high'] };
      steps = steps.filter(step => budgetMap[userProfile.budget!].includes(step.estimatedCost));
    }

    // Filtrer par style de voyage
    if (userProfile.travelStyle === 'cultural') {
      steps = steps.filter(step => ['monument', 'museum'].includes(step.category));
    } else if (userProfile.travelStyle === 'relaxed') {
      steps = steps.filter(step => step.priority !== 'optional');
    }

    // Filtrer par intérêts
    if (userProfile.interests?.length) {
      steps = steps.filter(step => 
        userProfile.interests!.some(interest => 
          step.category.includes(interest) || 
          step.description.toLowerCase().includes(interest.toLowerCase())
        )
      );
    }

    return steps.slice(0, userProfile.duration ? userProfile.duration * 2 : 6);
  }

  // 🏙️ Vérifier si une ville a des suggestions
  static hasSuggestions(cityName: string): boolean {
    const city = cityName.split(',')[0].trim();
    return Object.keys(this.cityItineraries).includes(city);
  }

  // 📊 Obtenir statistiques de la ville
  static getCityStats(cityName: string) {
    const itinerary = this.getItinerarySuggestions(cityName);
    if (!itinerary) return null;

    return {
      totalSteps: itinerary.steps.length,
      mustSeeCount: itinerary.steps.filter(s => s.priority === 'must-see').length,
      recommendedDuration: itinerary.recommendedDuration,
      bestTimeToVisit: itinerary.bestTimeToVisit,
      freeActivities: itinerary.steps.filter(s => s.estimatedCost === 'free').length,
    };
  }
}
