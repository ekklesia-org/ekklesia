import { DrizzleService } from '@ekklesia/database';
import { transactions } from '@ekklesia/database';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

export class FinancialService {
  private drizzleService: DrizzleService;

  constructor() {
    this.drizzleService = new DrizzleService();
  }

  /**
   * Transaction Management
   */
  async createTransaction(data: any, currentUser?: any): Promise<any> {
    // Check permission
    if (!currentUser || currentUser.role !== 'TREASURER') {
      throw new HTTPException(403, { message: 'Unauthorized' });
    }

    try {
      const newTransaction = await this.drizzleService.db
        .insert(transactions)
        .values(data)
        .returning();
      return newTransaction;
    } catch (error) {
      throw new HTTPException(400, { message: `Failed to create transaction: ${(error as Error).message}` });
    }
  }

  async listTransactions(filters: any, currentUser?: any): Promise<any> {
    // More logic here with filters, authorization
    try {
      const transactionsList = await this.drizzleService.db
        .select()
        .from(transactions);
      return transactionsList;
    } catch (error) {
      throw new HTTPException(400, { message: 'Failed to list transactions' });
    }
  }

  async updateTransaction(id: string, data: any, currentUser?: any): Promise<any> {
    if (!currentUser || currentUser.role !== 'TREASURER') {
      throw new HTTPException(403, { message: 'Unauthorized' });
    }

    try {
      const updated = await this.drizzleService.db
        .update(transactions)
        .set(data)
        .where(eq(transactions.id, id))
        .returning();

      return updated;
    } catch (error) {
      throw new HTTPException(400, { message: 'Failed to update transaction' });
    }
  }

  async deleteTransaction(id: string, currentUser?: any): Promise<void> {
    if (!currentUser || currentUser.role !== 'TREASURER') {
      throw new HTTPException(403, { message: 'Unauthorized' });
    }

    try {
      await this.drizzleService.db
        .delete(transactions)
        .where(eq(transactions.id, id));
    } catch (error) {
      throw new HTTPException(400, { message: 'Failed to delete transaction' });
    }
  }

  /**
   * Donation Tracking
   */
  async recordDonation(data: any, currentUser?: any): Promise<any> {
    return this.createTransaction({ ...data, type: 'INCOME', category: 'DONATION' }, currentUser);
  }

  async listDonationsByDonor(donorId: string, currentUser?: any): Promise<any> {
    // Implement logic to fetch donations by donor
  }

  async generateDonationReceipts(donorId: string, currentUser?: any): Promise<any> {
    // Implement logic to generate receipts
  }

  /**
   * Expense Management
   */
  async recordExpense(data: any, currentUser?: any): Promise<any> {
    return this.createTransaction({ ...data, type: 'EXPENSE' }, currentUser);
  }

  async categorizeExpense(expenseId: string, category: string, currentUser?: any): Promise<any> {
    // TODO: Fix enum validation once proper enum structure is available
    // if (!Object.values(transactionCategoryEnum.values).includes(category)) {
    //   throw new HTTPException(400, { message: 'Invalid category' });
    // }
    return this.updateTransaction(expenseId, { category }, currentUser);
  }

  async approveExpense(expenseId: string, currentUser?: any): Promise<any> {
    return this.updateTransaction(expenseId, { status: 'CONFIRMED' }, currentUser);
  }

  /**
   * Financial Reporting
   */
  async generateIncomeStatement(currentUser?: any): Promise<any> {
    // Implement logic to generate income statements
  }

  async generateBalanceSheet(currentUser?: any): Promise<any> {
    // Implement logic to generate balance sheets
  }

  async generateDonorReport(donorId: string, currentUser?: any): Promise<any> {
    // Implement logic to generate donor reports
  }

  // Add missing methods that are called in routes
  async createDonation(data: any): Promise<any> {
    return this.recordDonation(data);
  }

  async listDonations(filters: any): Promise<any> {
    // Implement donation listing logic
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }

  async createExpense(data: any): Promise<any> {
    return this.recordExpense(data);
  }

  async listExpenses(filters: any): Promise<any> {
    // Implement expense listing logic
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }

  async generateReport(params: any): Promise<any> {
    // Implement report generation logic
    return { type: params.type, data: [] };
  }

  /**
   * Budget Management
   */
  async createBudget(data: any, currentUser?: any): Promise<any> {
    // Implement logic to create a budget
  }

  async trackBudget(budgetId: string, currentUser?: any): Promise<any> {
    // Implement logic to track a budget
  }

  async analyzeBudgetVariance(budgetId: string, currentUser?: any): Promise<any> {
    // Implement logic to analyze budget variance
  }
}

export default new FinancialService();

