import { Location } from './location';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  description?: string;
  date: string;
  location?: Location;
  paidBy: string;
  splitWith: ExpenseSplit[];
  receipt?: string;
  tags: string[];
  createdAt: string;
}

export interface SharedExpense {
  id: string;
  expense: Expense;
  splits: ExpenseSplit[];
  settlements: Settlement[];
  status: 'pending' | 'settled' | 'disputed';
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'accepted' | 'disputed';
}

export interface Settlement {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  method: 'cash' | 'transfer' | 'paypal' | 'venmo' | 'other';
  status: 'pending' | 'completed' | 'failed';
  date: string;
} 