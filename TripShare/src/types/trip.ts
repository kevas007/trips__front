// Types pour les voyages

export interface Trip {
  id: string;
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  budget: number;
  currency: string;
  participants: string[];
  activities: Activity[];
  expenses: Expense[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export type TripStatus = 'planning' | 'active' | 'completed' | 'cancelled';

export interface CreateTripData {
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  participants: string[];
}

export interface UpdateTripData {
  title?: string;
  description?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  participants?: string[];
}

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
}

export type ExpenseCategory = 
  | 'accommodation' 
  | 'transport' 
  | 'food' 
  | 'activities' 
  | 'shopping' 
  | 'entertainment' 
  | 'other';

export interface TripStats {
  totalExpenses: number;
  averageDailyExpense: number;
  mostExpensiveCategory: ExpenseCategory;
  totalActivities: number;
  completedActivities: number;
  daysRemaining: number;
} 