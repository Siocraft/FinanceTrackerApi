"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const TransactionController_1 = require("./controllers/TransactionController");
const TransactionService_1 = require("./services/TransactionService");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize services
const transactionService = new TransactionService_1.TransactionService();
const transactionController = new TransactionController_1.TransactionController();
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
async function startServer() {
    try {
        await transactionService.initializeStorage();
        app.listen(PORT, () => {
            console.log(`🚀 Finance Tracker API running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map