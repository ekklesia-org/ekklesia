/**
 * Global Error Handler Middleware
 * 
 * Handles all errors throughout the application with consistent
 * error responses and proper logging.
 */

import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ChurchError } from '../errors/church.errors';

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
  path: string;
  method: string;
}

/**
 * Global error handler middleware
 * This should be applied to all routes to ensure consistent error handling
 */
export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    // Log the error for monitoring
    console.error(`[${new Date().toISOString()}] Error in ${c.req.method} ${c.req.path}:`, error);

    // Handle different error types
    if (error instanceof ChurchError) {
      return c.json({
        message: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString(),
        path: c.req.path,
        method: c.req.method,
      } as ErrorResponse, error.status);
    }

    if (error instanceof HTTPException) {
      return c.json({
        message: error.message,
        code: 'HTTP_EXCEPTION',
        timestamp: new Date().toISOString(),
        path: c.req.path,
        method: c.req.method,
      } as ErrorResponse, error.status);
    }

    // Handle validation errors (Zod errors)
    if (error && typeof error === 'object' && 'issues' in error) {
      const validationError = error as any;
      return c.json({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validationError.issues,
        timestamp: new Date().toISOString(),
        path: c.req.path,
        method: c.req.method,
      } as ErrorResponse, 400);
    }

    // Handle database connection errors
    if (error instanceof Error && error.message.includes('connection')) {
      return c.json({
        message: 'Database connection error',
        code: 'DATABASE_CONNECTION_ERROR',
        timestamp: new Date().toISOString(),
        path: c.req.path,
        method: c.req.method,
      } as ErrorResponse, 503);
    }

    // Handle Postgres errors by code when available
    const pgCode = (error as any)?.code as string | undefined;
    if (pgCode) {
      if (pgCode === '23505') {
        return c.json({
          message: 'Duplicate entry detected',
          code: 'DUPLICATE_ENTRY',
          details: { originalError: (error as any)?.detail || (error as any)?.message },
          timestamp: new Date().toISOString(),
          path: c.req.path,
          method: c.req.method,
        } as ErrorResponse, 409);
      }
      if (pgCode === '23502') {
        return c.json({
          message: 'Required field missing',
          code: 'REQUIRED_FIELD_MISSING',
          details: { originalError: (error as any)?.detail || (error as any)?.message },
          timestamp: new Date().toISOString(),
          path: c.req.path,
          method: c.req.method,
        } as ErrorResponse, 400);
      }
      if (pgCode === '23503') {
        return c.json({
          message: 'Invalid reference to related entity',
          code: 'FOREIGN_KEY_CONSTRAINT',
          details: { originalError: (error as any)?.detail || (error as any)?.message },
          timestamp: new Date().toISOString(),
          path: c.req.path,
          method: c.req.method,
        } as ErrorResponse, 400);
      }
    }

    // Handle other known error types
    if (error instanceof Error) {
      // Legacy pattern checks (SQLite-style) retained for completeness
      if (error.message.includes('UNIQUE constraint failed')) {
        return c.json({
          message: 'Duplicate entry detected',
          code: 'DUPLICATE_ENTRY',
          details: { originalError: error.message },
          timestamp: new Date().toISOString(),
          path: c.req.path,
          method: c.req.method,
        } as ErrorResponse, 409);
      }

      if (error.message.includes('NOT NULL constraint failed')) {
        return c.json({
          message: 'Required field missing',
          code: 'REQUIRED_FIELD_MISSING',
          details: { originalError: error.message },
          timestamp: new Date().toISOString(),
          path: c.req.path,
          method: c.req.method,
        } as ErrorResponse, 400);
      }

      if (error.message.includes('FOREIGN KEY constraint failed')) {
        return c.json({
          message: 'Invalid reference to related entity',
          code: 'FOREIGN_KEY_CONSTRAINT',
          details: { originalError: error.message },
          timestamp: new Date().toISOString(),
          path: c.req.path,
          method: c.req.method,
        } as ErrorResponse, 400);
      }
    }

    // Fallback for unexpected errors
    console.error('Unexpected error:', error);
    return c.json({
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
      path: c.req.path,
      method: c.req.method,
    } as ErrorResponse, 500);
  }
};

/**
 * Helper function to create standardized error responses
 */
export function createErrorResponse(
  message: string,
  code: string,
  status: number,
  details?: any
): Response {
  return new Response(
    JSON.stringify({
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Helper function to validate required fields
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null || data[field] === ''
  );

  if (missingFields.length > 0) {
    throw new HTTPException(400, { 
      message: `Missing required fields: ${missingFields.join(', ')}` 
    });
  }
}

/**
 * Helper function to validate UUID format
 */
export function validateUUID(id: string, fieldName: string = 'id'): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    throw new HTTPException(400, { 
      message: `Invalid ${fieldName} format. Expected UUID.` 
    });
  }
}

/**
 * Helper function to handle async operations with error wrapping
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof HTTPException || error instanceof ChurchError) {
      throw error;
    }
    
    console.error(`${errorMessage}:`, error);
    throw new HTTPException(500, { 
      message: errorMessage,
      code: 'ASYNC_OPERATION_FAILED'
    });
  }
}
