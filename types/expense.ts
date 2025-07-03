export interface Expense {
  id: string;
  date: string;
  item: string;
  category: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  transactionType?: string;
}

export interface ExpenseFilters {
  category?: string;
  paymentMethod?: string;
  status?: string;
} 