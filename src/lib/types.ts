import { Timestamp } from "firebase/firestore";

export type TransactionType = 'Cash' | 'Bank';
export type DonationType = 'Cash' | 'Bank' | 'Goods';

export interface Income {
  id: string;
  source: string;
  amount: number;
  createdAt: string;
  transactionType: TransactionType;
}

export interface Expense {
  id:string;
  notes: string;
  amount: number;
  createdAt: string;
  transactionType: TransactionType;
}

export interface Donation {
  id: string;
  source: string; // Donor name
  createdAt: string;
  donationType: DonationType;
  amount?: number; // For Cash/Bank
  goods?: string; // For Goods
}


export interface Event {
  id: string;
  userId: string;
  name: string;
  date: string;
  description?: string;
  expenses: Expense[];
  incomes: Income[];
  donations: Donation[];
  expenseSummary?: string;
  createdAt: Timestamp;
}
