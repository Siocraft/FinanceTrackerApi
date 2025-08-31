import express from 'express';
import cors from 'cors';
import { TransactionController } from './controllers/TransactionController';
import { TransactionService } from './services/TransactionService';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const transactionService = new TransactionService();
const transactionController = new TransactionController();

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Transaction routes
app.get('/transactions', (req, res) => transactionController.getAllTransactions(req, res));
app.get('/transactions/:id', (req, res) => transactionController.getTransactionById(req, res));
app.post('/transactions', (req, res) => transactionController.createTransaction(req, res));
app.put('/transactions/:id', (req, res) => transactionController.updateTransaction(req, res));
app.delete('/transactions/:id', (req, res) => transactionController.deleteTransaction(req, res));

// Start server
async function startServer(): Promise<void> {
  try {
    await transactionService.initializeStorage();
    app.listen(PORT, () => {
      console.log(`🚀 Finance Tracker API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();