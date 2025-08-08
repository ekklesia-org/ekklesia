import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { auth, getAuthUser, churchContext } from '../middlewares/auth';
import { FinancialService } from '../services/financial.service';
import {
  TransactionSchema,
  DonationSchema,
  ExpenseSchema,
  FinancialSummarySchema,
  CreateTransactionSchema,
  CreateDonationSchema,
  CreateExpenseSchema,
  ReportQuerySchema
} from '../schemas/financial';

const financialRouter = new OpenAPIHono();
const financialService = new FinancialService();

// Error response schema
const ErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.any().optional()
});

// List response schema
const TransactionListResponseSchema = z.object({
  data: z.array(TransactionSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  })
});

const DonationListResponseSchema = z.object({
  data: z.array(DonationSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  })
});

const ExpenseListResponseSchema = z.object({
  data: z.array(ExpenseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  })
});

// Query schemas
const TransactionQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  churchId: z.string().uuid().optional()
});

const DonationQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  donorId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  churchId: z.string().uuid().optional(),
  method: z.enum(['cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'online', 'other']).optional()
});

const ExpenseQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
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
  ]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  churchId: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'paid', 'cancelled']).optional()
});

// Transaction routes
const createTransactionRoute = createRoute({
  method: 'post',
  path: '/transactions',
  tags: ['Financial'],
  summary: 'Create a new transaction',
  security: [{
    Bearer: []
  }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateTransactionSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: TransactionSchema,
        },
      },
      description: 'Transaction created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid input',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
  },
});

financialRouter.openapi(createTransactionRoute, async (c) => {
  // Apply auth and church context middleware
  await auth(c, async () => {});
  await churchContext(c, async () => {});
  
  try {
    const currentUser = getAuthUser(c);
    const input = c.req.valid('json');

    const transaction = await financialService.createTransaction(
      { ...input },
      currentUser
    );

    return c.json(transaction, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// List transactions route
const listTransactionsRoute = createRoute({
  method: 'get',
  path: '/transactions',
  tags: ['Financial'],
  summary: 'List transactions',
  security: [{
    Bearer: []
  }],
  request: {
    query: TransactionQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TransactionListResponseSchema,
        },
      },
      description: 'List of transactions',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
  },
});

financialRouter.openapi(listTransactionsRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});
  
  try {
    const currentUser = getAuthUser(c);
    const query = c.req.valid('query');

    const result = await financialService.listTransactions(
      { ...query },
      currentUser
    );

    return c.json(result);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Donation routes
const createDonationRoute = createRoute({
  method: 'post',
  path: '/donations',
  tags: ['Financial'],
  summary: 'Record a new donation',
  security: [{
    Bearer: []
  }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateDonationSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: DonationSchema,
        },
      },
      description: 'Donation recorded successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid input',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
  },
});

financialRouter.openapi(createDonationRoute, async (c) => {
  // Apply auth and church context middleware
  await auth(c, async () => {});
  await churchContext(c, async () => {});
  
  try {
    const currentUser = getAuthUser(c);
    const input = c.req.valid('json');

    const donation = await financialService.createDonation(
      { ...input },
      currentUser
    );

    return c.json(donation, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// List donations route
const listDonationsRoute = createRoute({
  method: 'get',
  path: '/donations',
  tags: ['Financial'],
  summary: 'List donations',
  security: [{
    Bearer: []
  }],
  request: {
    query: DonationQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: DonationListResponseSchema,
        },
      },
      description: 'List of donations',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
  },
});

financialRouter.openapi(listDonationsRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});
  
  try {
    const currentUser = getAuthUser(c);
    const query = c.req.valid('query');

    const result = await financialService.listDonations(
      { ...query },
      currentUser
    );

    return c.json(result);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Expense routes
const createExpenseRoute = createRoute({
  method: 'post',
  path: '/expenses',
  tags: ['Financial'],
  summary: 'Record a new expense',
  security: [{
    Bearer: []
  }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateExpenseSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: ExpenseSchema,
        },
      },
      description: 'Expense recorded successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid input',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
  },
});

financialRouter.openapi(createExpenseRoute, async (c) => {
  // Apply auth and church context middleware
  await auth(c, async () => {});
  await churchContext(c, async () => {});
  
  try {
    const currentUser = getAuthUser(c);
    const input = c.req.valid('json');

    const expense = await financialService.createExpense({
      ...input,
      churchId: currentUser.churchId!
    });

    return c.json(expense, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// List expenses route
const listExpensesRoute = createRoute({
  method: 'get',
  path: '/expenses',
  tags: ['Financial'],
  summary: 'List expenses',
  security: [{
    Bearer: []
  }],
  request: {
    query: ExpenseQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ExpenseListResponseSchema,
        },
      },
      description: 'List of expenses',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
  },
});

financialRouter.openapi(listExpensesRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});
  
  try {
    const currentUser = getAuthUser(c);
    const query = c.req.valid('query');

    const result = await financialService.listExpenses({
      ...query,
      churchId: query.churchId || currentUser.churchId!
    });

    return c.json(result);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Financial report route
const getFinancialReportRoute = createRoute({
  method: 'post',
  path: '/reports',
  tags: ['Financial'],
  summary: 'Generate financial report',
  security: [{
    Bearer: []
  }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ReportQuerySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: FinancialSummarySchema,
        },
      },
      description: 'Financial report generated successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid input',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
  },
});

financialRouter.openapi(getFinancialReportRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});
  
  try {
    const currentUser = getAuthUser(c);
    const input = c.req.valid('json');

    const report = await financialService.generateReport({
      ...input,
      churchId: input.churchId || currentUser.churchId!
    });

    return c.json(report);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

export { financialRouter };
