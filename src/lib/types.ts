import { Timestamp } from "firebase/firestore";

export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string;
}

export interface Expense {
  id:string;
  notes: string;
  amount: number;
  createdAt: string;
}

export interface Event {
  id: string;
  userId: string;
  name: string;
  date: string;
  expenses: Expense[];
  incomes: Income[];
  expenseSummary?: string;
  createdAt: Timestamp;
}
