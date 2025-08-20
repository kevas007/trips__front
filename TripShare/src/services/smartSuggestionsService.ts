import { EnhancedLocationService, PopularDestination } from './enhancedLocationService';

// 📊 Types pour le système de suggestions intelligentes
export interface UserDestinationPreference {
  id: string;
  user_id: string;
  destination_id: string;
  destination_name: string;
  destination_country: string;
  rating: number; // 1-5
  visit_date?: Date;
  trip_type: 'cultural' | 'beach' | 'adventure' | 'city' | 'nature' | 'romantic' | 'family' | 'business';
  budget_level: 'low' | 'medium' | 'high';
  duration_days: number;
  liked_places: string[]; // IDs des lieux aimés
  created_at: Date;
  updated_at: Date;
}

export interface AIGeneratedDestination {
  id: string;
  name: string;
  display_name: string;
  country: string;
  region?: string;
  continent: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  
  // Données générées par IA
  ai_score: number; // Score de pertinence IA (0-100)
  popularity_trend: 'rising' | 'stable' | 'declining';
  trending_reasons: string[];
  
  // Catégorisation IA
  primary_category: string;
  secondary_categories: string[];
  ai_tags: string[];
  
  // Recommandations IA
  best_time_to_visit: string[];
  suggested_duration: string;
  ideal_traveler_type: string[];
  cost_estimate: {
    budget: 'low' | 'medium' | 'high';
    daily_cost_range: string;
    accommodation_cost: string;
  };
  
  // Contenu généré par IA
  ai_description: string;
  ai_highlights: string[];
  ai_tips: string[];
  ai_warnings?: string[];
  
  // Métadonnées
  last_ai_update: Date;
  ai_version: string;
  data_source: 'ai_generated' | 'ai_enhanced' | 'user_curated';
  
  // Photos et médias
  photo_urls: string[];
  video_url?: string;
  
  // Statistiques
  total_likes: number;
  total_visits: number;
  average_rating: number;
  review_count: number;
}

export interface SmartSuggestionResult {
  destination: AIGeneratedDestination;
  relevance_score: number;
  match_reasons: string[];
  user_similarity: number;
  trending_bonus: number;
}

export class SmartSuggestionsService {
  
  // 🔄 Cache pour les suggestions
  private static suggestionsCache: Map<string, AIGeneratedDestination[]> = new Map();
  private static userPreferencesCache: Map<string, UserDestinationPreference[]> = new Map();
  
  // ⚙️ Configuration
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private static readonly MAX_SUGGESTIONS = 20;
  private static readonly MIN_RELEVANCE_SCORE = 0.3;

  /**
   * 🎯 Obtenir des suggestions intelligentes basées sur les préférences utilisateur
   */
  static async getSmartSuggestions(
    userId: string,
    filters: {
      tripType?: string;
      budget?: 'low' | 'medium' | 'high';
      duration?: number;
      continent?: string;
      maxResults?: number;
    } = {}
  ): Promise<SmartSuggestionResult[]> {
    try {
      // 1. Récupérer les préférences de l'utilisateur
      const userPreferences = await this.getUserPreferences(userId);
      
      // 2. Récupérer les destinations populaires (likes des autres utilisateurs)
      const popularDestinations = await this.getPopularDestinations();
      
      // 3. Récupérer les destinations générées par IA
      const aiDestinations = await this.getAIGeneratedDestinations();
      
      // 4. Combiner et scorer les suggestions
      const allDestinations = [...popularDestinations, ...aiDestinations];
      const scoredSuggestions = this.scoreDestinations(allDestinations, userPreferences, filters);
      
      // 5. Trier et retourner les meilleures suggestions
      return scoredSuggestions
        .filter(suggestion => suggestion.relevance_score >= this.MIN_RELEVANCE_SCORE)
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, filters.maxResults || this.MAX_SUGGESTIONS);
        
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions intelligentes:', error);
      // Fallback vers les suggestions statiques
      return this.getFallbackSuggestions(filters);
    }
  }

  /**
   * 👥 Récupérer les préférences de l'utilisateur
   */
  private static async getUserPreferences(userId: string): Promise<UserDestinationPreference[]> {
    // Vérifier le cache
    if (this.userPreferencesCache.has(userId)) {
      return this.userPreferencesCache.get(userId)!;
    }

    try {
      // Appel API pour récupérer les préférences
      const response = await fetch(`${process.env.API_BASE_URL}/api/users/${userId}/destination-preferences`);
      const preferences = await response.json();
      
      // Mettre en cache
      this.userPreferencesCache.set(userId, preferences);
      
      return preferences;
    } catch (error) {
      console.error('Erreur récupération préférences utilisateur:', error);
      return [];
    }
  }

  /**
   * 🔥 Récupérer les destinations populaires (likes des autres utilisateurs)
   */
  private static async getPopularDestinations(): Promise<AIGeneratedDestination[]> {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api/destinations/popular`);
      const destinations = await response.json();
      return destinations;
    } catch (error) {
      console.error('Erreur récupération destinations populaires:', error);
      return [];
    }
  }

  /**
   * 🤖 Récupérer les destinations générées par IA
   */
  private static async getAIGeneratedDestinations(): Promise<AIGeneratedDestination[]> {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api/destinations/ai-generated`);
      const destinations = await response.json();
      return destinations;
    } catch (error) {
      console.error('Erreur récupération destinations IA:', error);
      return [];
    }
  }

  /**
   * 📊 Scorer les destinations selon les préférences utilisateur
   */
  private static scoreDestinations(
    destinations: AIGeneratedDestination[],
    userPreferences: UserDestinationPreference[],
    filters: any
  ): SmartSuggestionResult[] {
    return destinations.map(destination => {
      let relevanceScore = 0;
      const matchReasons: string[] = [];
      let userSimilarity = 0;
      let trendingBonus = 0;

      // 1. Score de base IA
      relevanceScore += destination.ai_score / 100;

      // 2. Bonus de popularité (likes des autres utilisateurs)
      const popularityBonus = Math.min(destination.total_likes / 100, 0.3);
      relevanceScore += popularityBonus;
      if (popularityBonus > 0.1) {
        matchReasons.push(`Populaire (${destination.total_likes} likes)`);
      }

      // 3. Bonus de tendance
      if (destination.popularity_trend === 'rising') {
        trendingBonus = 0.2;
        relevanceScore += trendingBonus;
        matchReasons.push('Destination en vogue');
      }

      // 4. Correspondance avec les préférences utilisateur
      if (userPreferences.length > 0) {
        const userSimilarityScore = this.calculateUserSimilarity(destination, userPreferences);
        userSimilarity = userSimilarityScore;
        relevanceScore += userSimilarityScore * 0.4;
        
        if (userSimilarityScore > 0.5) {
          matchReasons.push('Correspond à vos goûts');
        }
      }

      // 5. Filtres appliqués
      if (filters.tripType && destination.ai_tags.includes(filters.tripType)) {
        relevanceScore += 0.3;
        matchReasons.push(`Type de voyage: ${filters.tripType}`);
      }

      if (filters.budget && destination.cost_estimate.budget === filters.budget) {
        relevanceScore += 0.2;
        matchReasons.push(`Budget adapté: ${filters.budget}`);
      }

      if (filters.continent && destination.continent === filters.continent) {
        relevanceScore += 0.15;
        matchReasons.push(`Continent: ${filters.continent}`);
      }

      // 6. Bonus pour les nouvelles destinations
      const daysSinceUpdate = (Date.now() - new Date(destination.last_ai_update).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 30) {
        relevanceScore += 0.1;
        matchReasons.push('Nouvelle suggestion');
      }

      return {
        destination,
        relevance_score: Math.min(relevanceScore, 1),
        match_reasons: matchReasons,
        user_similarity: userSimilarity,
        trending_bonus: trendingBonus
      };
    });
  }

  /**
   * 🧮 Calculer la similarité avec les préférences utilisateur
   */
  private static calculateUserSimilarity(
    destination: AIGeneratedDestination,
    userPreferences: UserDestinationPreference[]
  ): number {
    if (userPreferences.length === 0) return 0;

    let totalSimilarity = 0;
    let validComparisons = 0;

    for (const preference of userPreferences) {
      let similarity = 0;

      // Similarité géographique
      if (preference.destination_country === destination.country) {
        similarity += 0.4;
      }

      // Similarité de type de voyage
      if (destination.ai_tags.includes(preference.trip_type)) {
        similarity += 0.3;
      }

      // Similarité de budget
      if (preference.budget_level === destination.cost_estimate.budget) {
        similarity += 0.2;
      }

      // Similarité de durée
      const durationDiff = Math.abs(preference.duration_days - parseInt(destination.suggested_duration.split('-')[0]));
      if (durationDiff <= 2) {
        similarity += 0.1;
      }

      // Bonus si l'utilisateur a bien noté cette destination
      if (preference.rating >= 4) {
        similarity += 0.2;
      }

      totalSimilarity += similarity;
      validComparisons++;
    }

    return validComparisons > 0 ? totalSimilarity / validComparisons : 0;
  }

  /**
   * 🔄 Fallback vers les suggestions statiques
   */
  private static getFallbackSuggestions(filters: any): SmartSuggestionResult[] {
    const staticDestinations = EnhancedLocationService.getPopularDestinations();
    
    return staticDestinations.map(dest => ({
      destination: {
        id: dest.id,
        name: dest.name,
        display_name: dest.display_name,
        country: dest.country,
        continent: this.getContinentFromCountry(dest.country),
        coordinates: { latitude: dest.lat, longitude: dest.lng },
        ai_score: dest.popularity_score * 10,
        popularity_trend: 'stable' as const,
        trending_reasons: [],
        primary_category: dest.type,
        secondary_categories: [],
        ai_tags: [dest.type],
        best_time_to_visit: dest.best_season,
        suggested_duration: dest.suggested_duration,
        ideal_traveler_type: ['general'],
        cost_estimate: {
          budget: 'medium' as const,
          daily_cost_range: '50-150€',
          accommodation_cost: '80-200€'
        },
        ai_description: `Découvrez ${dest.name}, une destination exceptionnelle`,
        ai_highlights: dest.highlights,
        ai_tips: ['Réservez à l\'avance', 'Visitez hors saison'],
        last_ai_update: new Date(),
        ai_version: '1.0',
        data_source: 'user_curated' as const,
        photo_urls: [dest.photo_url || 'http://localhost:8085/storage/defaults/default-trip-image.jpg'],
        total_likes: Math.floor(dest.popularity_score * 1000),
        total_visits: Math.floor(dest.popularity_score * 500),
        average_rating: dest.popularity_score,
        review_count: Math.floor(dest.popularity_score * 200)
      },
      relevance_score: dest.popularity_score / 10,
      match_reasons: [`Destination populaire (${dest.popularity_score}/10)`],
      user_similarity: 0,
      trending_bonus: 0
    }));
  }

  /**
   * 🌍 Obtenir le continent depuis le pays
   */
  private static getContinentFromCountry(country: string): string {
    const continentMap: { [key: string]: string } = {
      'France': 'Europe',
      'Italie': 'Europe',
      'Espagne': 'Europe',
      'Allemagne': 'Europe',
      'Japon': 'Asia',
      'Chine': 'Asia',
      'Thaïlande': 'Asia',
      'Indonésie': 'Asia',
      'États-Unis': 'North America',
      'Canada': 'North America',
      'Mexique': 'North America',
      'Brésil': 'South America',
      'Argentine': 'South America',
      'Maroc': 'Africa',
      'Égypte': 'Africa',
      'Afrique du Sud': 'Africa',
      'Australie': 'Oceania',
      'Nouvelle-Zélande': 'Oceania'
    };
    
    return continentMap[country] || 'Unknown';
  }

  /**
   * 💾 Sauvegarder une préférence utilisateur
   */
  static async saveUserPreference(preference: Omit<UserDestinationPreference, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
      await fetch(`${process.env.API_BASE_URL}/api/users/${preference.user_id}/destination-preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preference),
      });
      
      // Invalider le cache
      this.userPreferencesCache.delete(preference.user_id);
    } catch (error) {
      console.error('Erreur sauvegarde préférence:', error);
    }
  }

  /**
   * 👍 Liker une destination
   */
  static async likeDestination(userId: string, destinationId: string): Promise<void> {
    try {
      await fetch(`${process.env.API_BASE_URL}/api/destinations/${destinationId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
    } catch (error) {
      console.error('Erreur like destination:', error);
    }
  }

  /**
   * 🧹 Nettoyer le cache
   */
  static clearCache(): void {
    this.suggestionsCache.clear();
    this.userPreferencesCache.clear();
  }

  /**
   * 📈 Obtenir les statistiques de suggestions
   */
  static async getSuggestionStats(): Promise<{
    totalDestinations: number;
    aiGeneratedCount: number;
    userCuratedCount: number;
    totalLikes: number;
    averageRating: number;
  }> {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api/destinations/stats`);
      return await response.json();
    } catch (error) {
      console.error('Erreur récupération stats:', error);
      return {
        totalDestinations: 0,
        aiGeneratedCount: 0,
        userCuratedCount: 0,
        totalLikes: 0,
        averageRating: 0
      };
    }
  }
}
