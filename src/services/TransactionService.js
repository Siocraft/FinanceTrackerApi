"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const Transaction_1 = require("../types/Transaction");
class TransactionService {
    dataDir;
    transactionsFile;
    constructor() {
        this.dataDir = path_1.default.join(__dirname, '../../data');
        this.transactionsFile = path_1.default.join(this.dataDir, 'transactions.json');
    }
    async initializeStorage() {
        try {
            await fs_1.promises.mkdir(this.dataDir, { recursive: true });
            try {
                await fs_1.promises.access(this.transactionsFile);
            }
            catch {
                await fs_1.promises.writeFile(this.transactionsFile, '[]');
            }
        }
        catch (error) {
            console.error('Error initializing storage:', error);
            throw error;
        }
    }
    async readTransactions() {
        try {
            const data = await fs_1.promises.readFile(this.transactionsFile, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Error reading transactions:', error);
            return [];
        }
    }
    async writeTransactions(transactions) {
        try {
            await fs_1.promises.writeFile(this.transactionsFile, JSON.stringify(transactions, null, 2));
        }
        catch (error) {
            console.error('Error writing transactions:', error);
            throw error;
        }
    }
    async getAllTransactions() {
        return this.readTransactions();
    }
    async getTransactionById(id) {
        const transactions = await this.readTransactions();
        return transactions.find(t => t.id === id) || null;
    }
    async createTransaction(transactionData) {
        const newTransaction = {
            id: (0, uuid_1.v4)(),
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
    async updateTransaction(id, updateData) {
        const transactions = await this.readTransactions();
        const index = transactions.findIndex(t => t.id === id);
        if (index === -1) {
            return null;
        }
        transactions[index] = {
            ...transactions[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        await this.writeTransactions(transactions);
        return transactions[index];
    }
    async deleteTransaction(id) {
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
exports.TransactionService = TransactionService;
//# sourceMappingURL=TransactionService.js.map