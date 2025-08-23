export interface Trip {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  budget: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  activities?: Activity[];
  expenses?: Expense[];
}

export type TripStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface CreateTripData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  isPublic: boolean;
}

export interface UpdateTripData {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  isPublic?: boolean;
  status?: TripStatus;
}

export interface Activity {
  id: string;
  tripId: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  cost: number;
  category: ActivityCategory;
  createdAt: string;
  updatedAt: string;
}

export type ActivityCategory = 
  | 'culture'
  | 'adventure'
  | 'food'
  | 'shopping'
  | 'relaxation'
  | 'transport'
  | 'other';

export interface Expense {
  id: string;
  tripId: string;
  userId: string;
  amount: number;
  currency: string;
  description: string;
  category: ExpenseCategory;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory = 
  | 'accommodation'
  | 'transport'
  | 'food'
  | 'activities'
  | 'shopping'
  | 'other';

export interface TripStats {
  totalActivities: number;
  totalExpenses: number;
  averageDailyCost: number;
  daysRemaining: number;
  budgetUsed: number;
  budgetRemaining: number;
}
