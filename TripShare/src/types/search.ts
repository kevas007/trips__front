export interface SearchFilters {
  destination?: string;
  duration?: {
    min?: number;
    max?: number;
  };
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  tags?: string[];
  category?: string;
  rating?: number;
  dateRange?: {
    start?: string;
    end?: string;
  };
  sortBy?: 'relevance' | 'popularity' | 'rating' | 'recent' | 'duration' | 'budget';
  sortOrder?: 'asc' | 'desc';
} 