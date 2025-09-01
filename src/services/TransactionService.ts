import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction, CreateTransactionDto, UpdateTransactionDto } from '../types/Transaction.js';
import type { PaginationParams, PaginatedResponse, PaginationMeta } from '../types/Pagination.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TransactionService {
  private readonly dataDir: string;
  private readonly transactionsFile: string;

  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.transactionsFile = path.join(this.dataDir, 'transactions.json');
  }

  async initializeStorage(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      try {
        await fs.access(this.transactionsFile);
      } catch {
        await fs.writeFile(this.transactionsFile, '[]');
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
      throw error;
    }
  }

  private async readTransactions(): Promise<Transaction[]> {
    try {
      const data = await fs.readFile(this.transactionsFile, 'utf8');
      return JSON.parse(data) as Transaction[];
    } catch (error) {
      console.error('Error reading transactions:', error);
      return [];
    }
  }

  private async writeTransactions(transactions: Transaction[]): Promise<void> {
    try {
      await fs.writeFile(this.transactionsFile, JSON.stringify(transactions, null, 2));
    } catch (error) {
      console.error('Error writing transactions:', error);
      throw error;
    }
  }

  async getAllTransactions(userId: string): Promise<Transaction[]> {
    const transactions = await this.readTransactions();
    return transactions.filter(t => t.userId === userId);
  }

  async getPaginatedTransactions(userId: string, params: PaginationParams): Promise<PaginatedResponse<Transaction>> {
    const allTransactions = await this.readTransactions();
    const transactions = allTransactions.filter(t => t.userId === userId);
    
    // Apply sorting
    const sortedTransactions = this.sortTransactions(transactions, params.sortBy, params.sortOrder);
    
    // Calculate pagination
    const totalItems = sortedTransactions.length;
    const totalPages = Math.ceil(totalItems / params.limit);
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    
    // Get paginated data
    const paginatedData = sortedTransactions.slice(startIndex, endIndex);
    
    // Create pagination metadata
    const pagination: PaginationMeta = {
      currentPage: params.page,
      totalPages,
      totalItems,
      itemsPerPage: params.limit,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    };
    
    return {
      data: paginatedData,
      pagination,
    };
  }

  private sortTransactions(
    transactions: Transaction[],
    sortBy: PaginationParams['sortBy'] = 'createdAt',
    sortOrder: PaginationParams['sortOrder'] = 'desc'
  ): Transaction[] {
    return [...transactions].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;
      
      switch (sortBy) {
        case 'amount':
          valueA = a.amount;
          valueB = b.amount;
          break;
        case 'date':
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
          break;
        case 'description':
          valueA = a.description.toLowerCase();
          valueB = b.description.toLowerCase();
          break;
        case 'category':
          valueA = a.category.toLowerCase();
          valueB = b.category.toLowerCase();
          break;
        case 'createdAt':
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  }

  async getTransactionById(id: string, userId: string): Promise<Transaction | null> {
    const transactions = await this.readTransactions();
    const transaction = transactions.find(t => t.id === id && t.userId === userId);
    return transaction ?? null;
  }

  async createTransaction(userId: string, transactionData: CreateTransactionDto): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: uuidv4(),
      userId,
      amount: transactionData.amount,
      description: transactionData.description,
      category: transactionData.category || 'Other',
      type: transactionData.type,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const transactions = await this.readTransactions();
    transactions.push(newTransaction);
    await this.writeTransactions(transactions);

    return newTransaction;
  }

  async updateTransaction(id: string, userId: string, updateData: UpdateTransactionDto): Promise<Transaction | null> {
    const transactions = await this.readTransactions();
    const index = transactions.findIndex(t => t.id === id && t.userId === userId);

    if (index === -1) {
      return null;
    }

    const updatedTransaction: Transaction = {
      ...transactions[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    transactions[index] = updatedTransaction;
    await this.writeTransactions(transactions);
    return updatedTransaction;
  }

  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    const transactions = await this.readTransactions();
    const index = transactions.findIndex(t => t.id === id && t.userId === userId);

    if (index === -1) {
      return false;
    }

    transactions.splice(index, 1);
    await this.writeTransactions(transactions);
    return true;
  }
}