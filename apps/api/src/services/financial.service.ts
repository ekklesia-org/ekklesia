import { DrizzleService } from '@ekklesia/database';
import { transactions } from '@ekklesia/database';
import { eq, and } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { safeAsync, validateRequiredFields } from '../middlewares/error-handler';

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
      throw new HTTPException(403, { 
        message: 'Insufficient permissions to create transactions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Enforce church scoping on server side
    if (currentUser.role !== 'SUPER_ADMIN') {
      data.churchId = currentUser.churchId;
    }

    // Validate required fields
    validateRequiredFields(data, ['description', 'amount', 'type', 'category']);

    return safeAsync(async () => {
      const [newTransaction] = await this.drizzleService.db
        .insert(transactions)
        .values(data)
        .returning();
      return newTransaction;
    }, 'Failed to create transaction');
  }

  async listTransactions(filters: any = {}, currentUser?: any): Promise<any> {
    // Check basic permissions
    if (!currentUser) {
      throw new HTTPException(401, { 
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    // Determine church scope
    const churchId = currentUser.role === 'SUPER_ADMIN' ? (filters.churchId || currentUser.churchId) : currentUser.churchId;

    return safeAsync(async () => {
      const transactionsList = await this.drizzleService.db
        .select()
        .from(transactions)
        .where(churchId ? eq(transactions.churchId, churchId) : undefined);
      return transactionsList;
    }, 'Failed to list transactions');
  }

  async updateTransaction(id: string, data: any, currentUser?: any): Promise<any> {
    if (!currentUser || currentUser.role !== 'TREASURER') {
      throw new HTTPException(403, { 
        message: 'Insufficient permissions to update transactions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    if (!id) {
      throw new HTTPException(400, {
        message: 'Transaction ID is required',
        code: 'MISSING_TRANSACTION_ID'
      });
    }

    // Enforce church scoping on update
    const scopeChurchId = currentUser.role === 'SUPER_ADMIN' ? undefined : currentUser.churchId;

    return safeAsync(async () => {
      const [updated] = await this.drizzleService.db
        .update(transactions)
        .set(data)
        .where(scopeChurchId ? and(eq(transactions.id, id), eq(transactions.churchId, scopeChurchId)) : eq(transactions.id, id))
        .returning();

      if (!updated) {
        throw new HTTPException(404, {
          message: `Transaction with ID "${id}" not found`,
          code: 'TRANSACTION_NOT_FOUND'
        });
      }

      return updated;
    }, 'Failed to update transaction');
  }

  async deleteTransaction(id: string, currentUser?: any): Promise<void> {
    if (!currentUser || currentUser.role !== 'TREASURER') {
      throw new HTTPException(403, { 
        message: 'Insufficient permissions to delete transactions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    if (!id) {
      throw new HTTPException(400, {
        message: 'Transaction ID is required',
        code: 'MISSING_TRANSACTION_ID'
      });
    }

    // Enforce church scoping on delete
    const scopeChurchId = currentUser.role === 'SUPER_ADMIN' ? undefined : currentUser.churchId;

    return safeAsync(async () => {
      const result = await this.drizzleService.db
        .delete(transactions)
        .where(scopeChurchId ? and(eq(transactions.id, id), eq(transactions.churchId, scopeChurchId)) : eq(transactions.id, id));

      if (!result.rowCount || result.rowCount === 0) {
        throw new HTTPException(404, {
          message: `Transaction with ID "${id}" not found`,
          code: 'TRANSACTION_NOT_FOUND'
        });
      }
    }, 'Failed to delete transaction');
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
  async createDonation(data: any, currentUser?: any): Promise<any> {
    return this.recordDonation(data, currentUser);
  }

  async listDonations(filters: any = {}, currentUser?: any): Promise<any> {
    // For now, reuse listTransactions scoped to INCOME/DONATION when implemented
    return this.listTransactions(filters, currentUser);
  }

  async createExpense(data: any, currentUser?: any): Promise<any> {
    return this.recordExpense(data, currentUser);
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

