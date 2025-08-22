import { Timestamp } from "firebase/firestore";

export type TransactionType = 'Cash' | 'Bank';

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

export interface Event {
  id: string;
  userId: string;
  name: string;
  date: string;
  description?: string;
  expenses: Expense[];
  incomes: Income[];
  expenseSummary?: string;
  createdAt: Timestamp;
}
