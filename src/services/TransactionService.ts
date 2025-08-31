import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction, CreateTransactionDto, UpdateTransactionDto } from '../types/Transaction.js';

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

  async getAllTransactions(): Promise<Transaction[]> {
    return this.readTransactions();
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const transactions = await this.readTransactions();
    const transaction = transactions.find(t => t.id === id);
    return transaction ?? null;
  }

  async createTransaction(transactionData: CreateTransactionDto): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: uuidv4(),
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

  async updateTransaction(id: string, updateData: UpdateTransactionDto): Promise<Transaction | null> {
    const transactions = await this.readTransactions();
    const index = transactions.findIndex(t => t.id === id);

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

  async deleteTransaction(id: string): Promise<boolean> {
    const transactions = await this.readTransactions();
    const index = transactions.findIndex(t => t.id === id);

    if (index === -1) {
      return false;
    }

    transactions.splice(index, 1);
    await this.writeTransactions(transactions);
    return true;
  }
}