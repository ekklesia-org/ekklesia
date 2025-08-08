import { z } from 'zod';

// Transaction Schema
export const TransactionSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense'], {
    message: 'Type must be either income or expense'
  }),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().datetime('Invalid date format'),
  churchId: z.string().uuid('Invalid church ID'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

// Donation Schema
export const DonationSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.number().positive('Donation amount must be positive'),
  donorId: z.string().uuid('Invalid donor ID'),
  method: z.enum(['cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'online', 'other'], {
    message: 'Invalid payment method'
  }),
  date: z.string().datetime('Invalid date format'),
  churchId: z.string().uuid('Invalid church ID'),
  designation: z.string().optional(),
  notes: z.string().optional(),
  receiptNumber: z.string().optional(),
  isAnonymous: z.boolean().optional().default(false),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

// Expense Schema
export const ExpenseSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.number().positive('Expense amount must be positive'),
  category: z.enum([
    'utilities',
    'maintenance',
    'salaries',
    'supplies',
    'events',
    'missions',
    'education',
    'worship',
    'administration',
    'other'
  ], {
    message: 'Invalid expense category'
  }),
  vendor: z.string().min(1, 'Vendor name is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().datetime('Invalid date format'),
  churchId: z.string().uuid('Invalid church ID'),
  invoiceNumber: z.string().optional(),
  approvedBy: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'paid', 'cancelled']).optional().default('pending'),
  paymentMethod: z.enum(['cash', 'check', 'credit_card', 'bank_transfer', 'other']).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

// Report Query Schema
export const ReportQuerySchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  type: z.enum(['income', 'expense', 'donation', 'summary', 'detailed'], {
    message: 'Invalid report type'
  }),
  churchId: z.string().uuid('Invalid church ID'),
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  includeDetails: z.boolean().optional().default(false)
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  {
    message: 'Start date must be before or equal to end date',
    path: ['startDate']
  }
);

// Financial Summary Schema
export const FinancialSummarySchema = z.object({
  totalIncome: z.number().nonnegative('Total income cannot be negative'),
  totalExpenses: z.number().nonnegative('Total expenses cannot be negative'),
  balance: z.number(),
  period: z.object({
    startDate: z.string().datetime('Invalid start date format'),
    endDate: z.string().datetime('Invalid end date format'),
    label: z.string().optional()
  }),
  breakdown: z.object({
    incomeByCategory: z.record(z.string(), z.number()).optional(),
    expensesByCategory: z.record(z.string(), z.number()).optional(),
    donationsByMethod: z.record(z.string(), z.number()).optional()
  }).optional(),
  previousPeriod: z.object({
    totalIncome: z.number().nonnegative().optional(),
    totalExpenses: z.number().nonnegative().optional(),
    balance: z.number().optional()
  }).optional(),
  percentageChange: z.object({
    income: z.number().optional(),
    expenses: z.number().optional(),
    balance: z.number().optional()
  }).optional()
});

// Type exports
export type Transaction = z.infer<typeof TransactionSchema>;
export type Donation = z.infer<typeof DonationSchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
export type ReportQuery = z.infer<typeof ReportQuerySchema>;
export type FinancialSummary = z.infer<typeof FinancialSummarySchema>;

// Create/Update schemas (without id and timestamps)
export const CreateTransactionSchema = TransactionSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const CreateDonationSchema = DonationSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const CreateExpenseSchema = ExpenseSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const UpdateTransactionSchema = TransactionSchema.partial().omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const UpdateDonationSchema = DonationSchema.partial().omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const UpdateExpenseSchema = ExpenseSchema.partial().omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
