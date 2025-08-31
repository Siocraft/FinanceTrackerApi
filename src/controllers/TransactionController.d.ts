import { Request, Response } from 'express';
export declare class TransactionController {
    private transactionService;
    constructor();
    getAllTransactions(req: Request, res: Response): Promise<void>;
    getTransactionById(req: Request, res: Response): Promise<void>;
    createTransaction(req: Request, res: Response): Promise<void>;
    updateTransaction(req: Request, res: Response): Promise<void>;
    deleteTransaction(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=TransactionController.d.ts.map