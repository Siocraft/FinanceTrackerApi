import type { Request, Response } from 'express';
import { TransactionService } from '../services/TransactionService.js';
import type { CreateTransactionDto, UpdateTransactionDto } from '../types/Transaction.js';
import type { PaginationParams } from '../types/Pagination.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  async getAllTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if pagination parameters are provided
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      
      // If pagination parameters are provided, use paginated endpoint
      if (page && limit) {
        const sortBy = req.query.sortBy as PaginationParams['sortBy'] || 'createdAt';
        const sortOrder = req.query.sortOrder as PaginationParams['sortOrder'] || 'desc';
        
        // Validate pagination parameters
        if (page < 1) {
          res.status(400).json({ error: 'Page must be greater than 0' });
          return;
        }
        
        if (limit < 1 || limit > 100) {
          res.status(400).json({ error: 'Limit must be between 1 and 100' });
          return;
        }
        
        // Validate sortBy parameter
        const validSortFields = ['date', 'amount', 'description', 'category', 'createdAt'];
        if (sortBy && !validSortFields.includes(sortBy)) {
          res.status(400).json({ error: `sortBy must be one of: ${validSortFields.join(', ')}` });
          return;
        }
        
        // Validate sortOrder parameter
        if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
          res.status(400).json({ error: 'sortOrder must be either "asc" or "desc"' });
          return;
        }
        
        const paginationParams: PaginationParams = {
          page,
          limit,
          sortBy,
          sortOrder,
        };
        
        const result = await this.transactionService.getPaginatedTransactions(req.user!.uid, paginationParams);
        res.json(result);
      } else {
        // Return all transactions (backward compatibility)
        const transactions = await this.transactionService.getAllTransactions(req.user!.uid);
        res.json(transactions);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  async getTransactionById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const transaction = await this.transactionService.getTransactionById(id, req.user!.uid);
      
      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  }

  async createTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { amount, description, category, type }: CreateTransactionDto = req.body;
      
      if (!amount || !description || !type) {
        res.status(400).json({ error: 'Amount, description, and type are required' });
        return;
      }

      if (type !== 'income' && type !== 'expense') {
        res.status(400).json({ error: 'Type must be either "income" or "expense"' });
        return;
      }

      const newTransaction = await this.transactionService.createTransaction(req.user!.uid, {
        amount: parseFloat(amount.toString()),
        description,
        category: category || 'Other',
        type
      });

      res.status(201).json(newTransaction);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }

  async updateTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateTransactionDto = req.body;

      if (updateData.type && updateData.type !== 'income' && updateData.type !== 'expense') {
        res.status(400).json({ error: 'Type must be either "income" or "expense"' });
        return;
      }

      if (updateData.amount) {
        updateData.amount = parseFloat(updateData.amount.toString());
      }

      const updatedTransaction = await this.transactionService.updateTransaction(id, req.user!.uid, updateData);
      
      if (!updatedTransaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  }

  async deleteTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.transactionService.deleteTransaction(id, req.user!.uid);
      
      if (!deleted) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  }
}