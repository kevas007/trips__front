// Types communs pour l'application TripShare

// ========== PAGINATION ==========
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========== FILTRES ==========
export interface TripFilters {
  status?: TripStatus;
  destination?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  budget?: {
    min: number;
    max: number;
  };
  tags?: string[];
  participants?: string[];
}

// ========== STATUTS ==========
export type TripStatus = 
  | 'planned' 
  | 'ongoing' 
  | 'completed' 
  | 'confirmed' 
  | 'cancelled';

// ========== RÉPONSES API ==========
export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface APIError {
  message: string;
  code?: string;
  status?: number;
}

// ========== UTILITAIRES ==========
export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  budget?: {
    min: number;
    max: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

// ========== GÉOLOCALISATION ==========
export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  type: 'restaurant' | 'hotel' | 'attraction' | 'transport' | 'other';
  rating?: number;
  photos?: string[];
  description?: string;
  website?: string;
  phone?: string;
  openingHours?: string[];
  priceRange?: 'budget' | 'moderate' | 'expensive' | 'luxury';
}

// ========== ACTIVITÉS ==========
export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  location: string;
  startTime: string;
  endTime: string;
  cost: number;
  currency: string;
  notes?: string;
  photos?: string[];
  bookingInfo?: {
    url?: string;
    phone?: string;
    email?: string;
  };
}

export type ActivityCategory = 
  | 'sightseeing' 
  | 'restaurant' 
  | 'shopping' 
  | 'transport' 
  | 'accommodation' 
  | 'entertainment' 
  | 'outdoor' 
  | 'cultural' 
  | 'other';

// ========== DÉPENSES ==========
export interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  paidBy: string;
  splitBetween: string[];
  receipt?: string;
  location?: string;
  notes?: string;
}

export type ExpenseCategory = 
  | 'accommodation' 
  | 'transport' 
  | 'food' 
  | 'activities' 
  | 'shopping' 
  | 'entertainment' 
  | 'other';

// ========== BUDGET ==========
export interface TripBudget {
  id: string;
  tripId: string;
  totalBudget: number;
  currency: string;
  categories: BudgetCategory[];
  expenses: Expense[];
  summary: BudgetSummary;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  averageDailySpent: number;
  daysRemaining: number;
  isOverBudget: boolean;
}

export interface Money {
  amount: number;
  currency: string;
}

// ========== RECOMMANDATIONS IA ==========
export interface AIRecommendation {
  id: string;
  type: 'destination' | 'activity' | 'restaurant' | 'accommodation';
  title: string;
  description: string;
  confidence: number;
  reasons: string[];
  data: any;
  createdAt: string;
}

export interface AIItineraryRequest {
  destination: string;
  duration: number;
  budget: number;
  interests: string[];
  travelStyle: 'adventure' | 'relaxation' | 'culture' | 'food' | 'shopping';
  groupSize: number;
  preferences: {
    accommodation: 'budget' | 'moderate' | 'luxury';
    transport: 'public' | 'rental' | 'private';
    pace: 'slow' | 'moderate' | 'fast';
  };
}

// ========== COLLABORATION ==========
export interface SharedExpense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitBetween: string[];
  status: 'pending' | 'settled';
  createdAt: string;
  updatedAt: string;
}

export interface Settlement {
  id: string;
  tripId: string;
  fromUser: string;
  toUser: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed';
  method?: 'cash' | 'transfer' | 'app';
  createdAt: string;
  completedAt?: string;
}

// ========== NOTIFICATIONS ==========
export interface Notification {
  id: string;
  userId: string;
  type: 'trip' | 'expense' | 'social' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

// ========== STATISTIQUES ==========
export interface TripStats {
  totalExpenses: number;
  averageDailyExpense: number;
  mostExpensiveCategory: ExpenseCategory;
  totalActivities: number;
  completedActivities: number;
  daysRemaining: number;
  totalPhotos: number;
  totalLikes: number;
  totalViews: number;
  totalShares: number;
}

export interface UserStats {
  tripsCreated: number;
  tripsShared: number;
  tripsLiked: number;
  followers: number;
  following: number;
  totalViews: number;
  totalLikes: number;
  countriesVisited: number;
  citiesVisited: number;
  totalDistance: number;
  totalDays: number;
}

// ========== EXPORTS ==========
export type {
  PaginatedResponse,
  TripFilters,
  TripStatus,
  APIResponse,
  APIError,
  SearchFilters,
  Location,
  Activity,
  ActivityCategory,
  Expense,
  ExpenseCategory,
  TripBudget,
  BudgetCategory,
  BudgetSummary,
  Money,
  AIRecommendation,
  AIItineraryRequest,
  SharedExpense,
  Settlement,
  Notification,
  TripStats,
  UserStats
};
