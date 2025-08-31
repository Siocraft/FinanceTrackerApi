export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTransactionDto {
  amount: number;
  description: string;
  category?: string;
  type: 'income' | 'expense';
}

export interface UpdateTransactionDto {
  amount?: number;
  description?: string;
  category?: string;
  type?: 'income' | 'expense';
}