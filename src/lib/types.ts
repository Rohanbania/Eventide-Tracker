export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string;
}

export interface Experience {
  id: string;
  notes: string;
  rating: number;
  createdAt: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  experiences: Experience[];
  incomes: Income[];
  experienceSummary?: string;
}
