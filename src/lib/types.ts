import { Timestamp } from "firebase/firestore";

export type TransactionType = 'Cash' | 'Bank';
export type DonationType = 'Cash' | 'Bank' | 'Goods';

export interface Author {
    uid: string;
    name: string;
    photoURL: string;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  createdAt: string;
  transactionType: TransactionType;
  author?: Author;
}

export interface Expense {
  id:string;
  notes: string;
  amount: number;
  createdAt: string;
  transactionType: TransactionType;
  author?: Author;
}

export interface Donation {
  id: string;
  source: string; // Donor name
  createdAt: string;
  donationType: DonationType;
  amount?: number; // For Cash/Bank
  goods?: string; // For Goods
  author?: Author;
}

export interface EventFeatures {
  expenses: boolean;
  income: boolean;
  donations: boolean;
}


export interface Event {
  id: string;
  userId: string;
  ownerName: string;
  name: string;
  date: string;
  description?: string;
  features: EventFeatures;
  expenses: Expense[];
  incomes: Income[];
  donations: Donation[];
  collaborators: string[];
  pendingCollaborators?: string[];
  createdAt: Timestamp;
}
