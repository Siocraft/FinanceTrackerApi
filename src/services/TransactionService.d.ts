import { Transaction, CreateTransactionDto, UpdateTransactionDto } from '../types/Transaction';
export declare class TransactionService {
    private readonly dataDir;
    private readonly transactionsFile;
    constructor();
    initializeStorage(): Promise<void>;
    private readTransactions;
    private writeTransactions;
    getAllTransactions(): Promise<Transaction[]>;
    getTransactionById(id: string): Promise<Transaction | null>;
    createTransaction(transactionData: CreateTransactionDto): Promise<Transaction>;
    updateTransaction(id: string, updateData: UpdateTransactionDto): Promise<Transaction | null>;
    deleteTransaction(id: string): Promise<boolean>;
}
//# sourceMappingURL=TransactionService.d.ts.map