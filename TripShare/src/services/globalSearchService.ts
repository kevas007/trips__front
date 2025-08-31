import { unifiedApi } from './unifiedApi';

// Types pour la recherche globale
export interface SearchResult {
  id: string;
  type: 'user' | 'trip' | 'tag';
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  metadata?: Record<string, any>;
  relevance: number;
}

export interface GlobalSearchResponse {
  results: SearchResult[];
  total: number;
  has_more: boolean;
  suggestions?: string[];
}

export interface SearchFilters {
  types?: ('user' | 'trip' | 'tag')[];
  categories?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  location?: string;
  tags?: string[];
}

class GlobalSearchService {
  // Recherche globale principale
  async search(
    query: string,
    filters?: SearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<GlobalSearchResponse> {
    try {
      console.log('🔍 GlobalSearchService - Recherche:', { query, filters, page, limit });
      
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });

      // Ajouter les filtres si présents
      if (filters?.types?.length) {
        params.append('types', filters.types.join(','));
      }
      if (filters?.categories?.length) {
        params.append('categories', filters.categories.join(','));
      }
      if (filters?.location) {
        params.append('location', filters.location);
      }
      if (filters?.tags?.length) {
        params.append('tags', filters.tags.join(','));
      }
      if (filters?.dateRange?.start) {
        params.append('date_start', filters.dateRange.start);
      }
      if (filters?.dateRange?.end) {
        params.append('date_end', filters.dateRange.end);
      }

      const response = await unifiedApi.get<GlobalSearchResponse>(`/search/global?${params}`);
      console.log('✅ GlobalSearchService - Résultats trouvés:', response.total);
      return response;
    } catch (error) {
      console.error('❌ GlobalSearchService - Erreur recherche globale:', error);
      return {
        results: [],
        total: 0,
        has_more: false,
        suggestions: []
      };
    }
  }

  // Recherche rapide (pour autocomplétion)
  async quickSearch(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      console.log('🔍 GlobalSearchService - Recherche rapide:', query);
      
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        quick: 'true'
      });

      const response = await unifiedApi.get<{ results: SearchResult[] }>(`/search/quick?${params}`);
      console.log('✅ GlobalSearchService - Résultats rapides:', response.results.length);
      return response.results;
    } catch (error) {
      console.error('❌ GlobalSearchService - Erreur recherche rapide:', error);
      return [];
    }
  }

  // Recherche par type spécifique
  async searchUsers(query: string, page: number = 1, limit: number = 10): Promise<SearchResult[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
        type: 'user'
      });

      const response = await unifiedApi.get<{ results: SearchResult[] }>(`/search/global?${params}`);
      return response.results;
    } catch (error) {
      console.error('❌ GlobalSearchService - Erreur recherche utilisateurs:', error);
      return [];
    }
  }

  async searchTrips(query: string, page: number = 1, limit: number = 10): Promise<SearchResult[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
        type: 'trip'
      });

      const response = await unifiedApi.get<{ results: SearchResult[] }>(`/search/global?${params}`);
      return response.results;
    } catch (error) {
      console.error('❌ GlobalSearchService - Erreur recherche voyages:', error);
      return [];
    }
  }

  async searchTags(query: string, page: number = 1, limit: number = 10): Promise<SearchResult[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
        type: 'tag'
      });

      const response = await unifiedApi.get<{ results: SearchResult[] }>(`/search/global?${params}`);
      return response.results;
    } catch (error) {
      console.error('❌ GlobalSearchService - Erreur recherche tags:', error);
      return [];
    }
  }

  // Suggestions de recherche
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });

      const response = await unifiedApi.get<{ suggestions: string[] }>(`/search/suggestions?${params}`);
      return response.suggestions || [];
    } catch (error) {
      console.error('❌ GlobalSearchService - Erreur suggestions:', error);
      return [];
    }
  }

  // Recherche populaire
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    try {
      const response = await unifiedApi.get<{ searches: string[] }>(`/search/popular?limit=${limit}`);
      return response.searches || [];
    } catch (error) {
      console.error('❌ GlobalSearchService - Erreur recherches populaires:', error);
      return [];
    }
  }

  // Recherche récente
  async getRecentSearches(): Promise<string[]> {
    try {
      const response = await unifiedApi.get<{ searches: string[] }>('/search/recent');
      return response.searches || [];
    } catch (error) {
      console.error('❌ GlobalSearchService - Erreur recherches récentes:', error);
      return [];
    }
  }

  // Sauvegarder une recherche
  async saveSearch(query: string): Promise<void> {
    try {
      await unifiedApi.post('/search/save', { query });
    } catch (error) {
      console.error('❌ GlobalSearchService - Erreur sauvegarde recherche:', error);
    }
  }

  // Recherche avancée avec filtres complexes
  async advancedSearch(
    query: string,
    filters: SearchFilters,
    sortBy: 'relevance' | 'date' | 'popularity' = 'relevance',
    sortOrder: 'asc' | 'desc' = 'desc',
    page: number = 1,
    limit: number = 20
  ): Promise<GlobalSearchResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        advanced: 'true'
      });

      // Ajouter tous les filtres
      if (filters.types?.length) {
        params.append('types', filters.types.join(','));
      }
      if (filters.categories?.length) {
        params.append('categories', filters.categories.join(','));
      }
      if (filters.location) {
        params.append('location', filters.location);
      }
      if (filters.tags?.length) {
        params.append('tags', filters.tags.join(','));
      }
      if (filters.dateRange?.start) {
        params.append('date_start', filters.dateRange.start);
      }
      if (filters.dateRange?.end) {
        params.append('date_end', filters.dateRange.end);
      }

      const response = await unifiedApi.get<GlobalSearchResponse>(`/search/advanced?${params}`);
      return response;
    } catch (error) {
      console.error('❌ GlobalSearchService - Erreur recherche avancée:', error);
      return {
        results: [],
        total: 0,
        has_more: false,
        suggestions: []
      };
    }
  }
}

export const globalSearchService = new GlobalSearchService(); 