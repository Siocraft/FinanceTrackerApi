import express from 'express';
import cors from 'cors';
import { TransactionController } from './controllers/TransactionController.js';
import { TransactionService } from './services/TransactionService.js';
import { specs, swaggerUi } from './swagger.js';
import { initializeFirebase } from './config/firebase.js';
import { authenticateToken } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase
initializeFirebase();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Initialize services
const transactionService = new TransactionService();
const transactionController = new TransactionController();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current status and timestamp of the API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions (with optional pagination)
 *     description: |
 *       Retrieve financial transactions. Supports pagination and sorting.
 *       
 *       **Without pagination**: Returns all transactions as an array
 *       
 *       **With pagination**: Include both `page` and `limit` query parameters to get paginated results
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         description: Page number for pagination (requires limit parameter)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 *         description: Number of items per page (requires page parameter)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, amount, description, category, createdAt]
 *           default: createdAt
 *           example: createdAt
 *         description: Field to sort by (only used with pagination)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *           example: desc
 *         description: Sort order (only used with pagination)
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                   description: All transactions (when pagination is not used)
 *                 - $ref: '#/components/schemas/PaginatedTransactionResponse'
 *                   description: Paginated transactions (when page and limit are provided)
 *             examples:
 *               all_transactions:
 *                 summary: All transactions (no pagination)
 *                 description: When no pagination parameters are provided
 *                 value: 
 *                   - id: "123e4567-e89b-12d3-a456-426614174000"
 *                     amount: 150.75
 *                     description: "Grocery shopping"
 *                     category: "Food"
 *                     type: "expense"
 *                     date: "2023-12-01T10:30:00.000Z"
 *                     createdAt: "2023-12-01T10:30:00.000Z"
 *               paginated_transactions:
 *                 summary: Paginated transactions
 *                 description: When page and limit parameters are provided
 *                 value:
 *                   data:
 *                     - id: "123e4567-e89b-12d3-a456-426614174000"
 *                       amount: 150.75
 *                       description: "Grocery shopping"
 *                       category: "Food"
 *                       type: "expense"
 *                       date: "2023-12-01T10:30:00.000Z"
 *                       createdAt: "2023-12-01T10:30:00.000Z"
 *                   pagination:
 *                     currentPage: 1
 *                     totalPages: 5
 *                     totalItems: 47
 *                     itemsPerPage: 10
 *                     hasNextPage: true
 *                     hasPreviousPage: false
 *       400:
 *         description: Bad request - invalid pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_page:
 *                 summary: Invalid page number
 *                 value:
 *                   error: "Page must be greater than 0"
 *               invalid_limit:
 *                 summary: Invalid limit
 *                 value:
 *                   error: "Limit must be between 1 and 100"
 *               invalid_sort_field:
 *                 summary: Invalid sort field
 *                 value:
 *                   error: "sortBy must be one of: date, amount, description, category, createdAt"
 *               invalid_sort_order:
 *                 summary: Invalid sort order
 *                 value:
 *                   error: "sortOrder must be either \"asc\" or \"desc\""
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/transactions', authenticateToken, (req, res) => transactionController.getAllTransactions(req, res));

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     description: Retrieve a specific transaction by its unique identifier
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the transaction to retrieve
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Transaction not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/transactions/:id', authenticateToken, (req, res) => transactionController.getTransactionById(req, res));

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Add a new financial transaction to the system
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *           examples:
 *             expense:
 *               summary: Example expense transaction
 *               value:
 *                 amount: 75.50
 *                 description: "Coffee and breakfast"
 *                 category: "Food & Dining"
 *                 type: "expense"
 *             income:
 *               summary: Example income transaction
 *               value:
 *                 amount: 2500.00
 *                 description: "Monthly salary"
 *                 category: "Salary"
 *                 type: "income"
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Bad request - missing required fields or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missing_fields:
 *                 summary: Missing required fields
 *                 value:
 *                   error: "Amount, description, and type are required"
 *               invalid_type:
 *                 summary: Invalid transaction type
 *                 value:
 *                   error: "Type must be either \"income\" or \"expense\""
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/transactions', authenticateToken, (req, res) => transactionController.createTransaction(req, res));

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     summary: Update an existing transaction
 *     description: Update a specific transaction by its unique identifier
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the transaction to update
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTransactionRequest'
 *           examples:
 *             partial_update:
 *               summary: Update only amount and description
 *               value:
 *                 amount: 85.00
 *                 description: "Updated coffee and breakfast"
 *             full_update:
 *               summary: Update all fields
 *               value:
 *                 amount: 120.75
 *                 description: "Dinner at restaurant"
 *                 category: "Food & Dining"
 *                 type: "expense"
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Bad request - invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Type must be either \"income\" or \"expense\""
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Transaction not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.put('/transactions/:id', authenticateToken, (req, res) => transactionController.updateTransaction(req, res));

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     description: Remove a specific transaction from the system
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the transaction to delete
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       204:
 *         description: Transaction deleted successfully (no content)
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Transaction not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete('/transactions/:id', authenticateToken, (req, res) => transactionController.deleteTransaction(req, res));

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