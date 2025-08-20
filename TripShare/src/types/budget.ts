import { Expense, SharedExpense } from './expense';

export interface TripBudget {
  totalBudget?: number;
  currency: string;
  categories: BudgetCategory[];
  expenses: Expense[];
  sharedExpenses: SharedExpense[];
  summary: BudgetSummary;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  currency: string;
  color: string;
  icon: string;
}

export interface Money {
  amount: number;
  currency: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  exchangeRate?: number;
}

export interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  remaining: number;
  overBudget: boolean;
  byCategory: Record<string, { allocated: number; spent: number }>;
  byUser: Record<string, { spent: number; owes: number; owed: number }>;
} 