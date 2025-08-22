export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string;
}

export interface Expense {
  id: string;
  notes: string;
  rating: number;
  createdAt: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  expenses: Expense[];
  incomes: Income[];
  expenseSummary?: string;
}
