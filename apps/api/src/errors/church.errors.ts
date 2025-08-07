/**
 * Custom Error Types for Church Management Service
 *
 * These errors provide specific types for different church-related
 * operations and business rule violations.
 */

import { HTTPException } from 'hono/http-exception';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export class ChurchError extends HTTPException {
  public readonly code: string;
  public readonly details?: any;

  constructor(status: ContentfulStatusCode | undefined, message: string, code: string, details?: any) {
    super(status, { message });
    this.code = code;
    this.details = details;
    this.name = 'ChurchError';
  }
}

/**
 * Church Not Found Error
 * Thrown when a church cannot be found by ID or slug
 */
export class ChurchNotFoundError extends ChurchError {
  constructor(identifier: string, identifierType: 'id' | 'slug' = 'id') {
    super(
      404,
      `Church with ${identifierType} "${identifier}" not found`,
      'CHURCH_NOT_FOUND',
      { identifier, identifierType }
    );
  }
}

/**
 * Church Already Exists Error
 * Thrown when attempting to create a church with duplicate unique fields
 */
export class ChurchAlreadyExistsError extends ChurchError {
  constructor(field: string, value: string) {
    super(
      409,
      `A church with this ${field} already exists`,
      'CHURCH_ALREADY_EXISTS',
      { field, value }
    );
  }
}

/**
 * Church Settings Not Found Error
 * Thrown when church settings cannot be found
 */
export class ChurchSettingsNotFoundError extends ChurchError {
  constructor(churchId: string) {
    super(
      404,
      `Settings for church with ID "${churchId}" not found`,
      'CHURCH_SETTINGS_NOT_FOUND',
      { churchId }
    );
  }
}

/**
 * Church Cannot Be Deleted Error
 * Thrown when attempting to delete a church that violates business rules
 */
export class ChurchCannotBeDeletedError extends ChurchError {
  constructor(reason: string, details?: any) {
    super(
      400,
      `Church cannot be deleted: ${reason}`,
      'CHURCH_CANNOT_BE_DELETED',
      details
    );
  }
}

/**
 * Church Deactivation Error
 * Thrown when attempting to deactivate the last active church
 */
export class LastActiveChurchError extends ChurchError {
  constructor() {
    super(
      400,
      'Cannot deactivate the last active church in the system',
      'LAST_ACTIVE_CHURCH',
      { reason: 'At least one active church must exist in the system' }
    );
  }
}

/**
 * Church Transfer Error
 * Thrown when there are issues with transferring users between churches
 */
export class ChurchTransferError extends ChurchError {
  constructor(message: string, details?: any) {
    super(
      400,
      `Church transfer failed: ${message}`,
      'CHURCH_TRANSFER_ERROR',
      details
    );
  }
}

/**
 * Church Validation Error
 * Thrown when church data fails validation rules
 */
export class ChurchValidationError extends ChurchError {
  constructor(field: string, message: string, value?: any) {
    super(
      400,
      `Validation failed for ${field}: ${message}`,
      'CHURCH_VALIDATION_ERROR',
      { field, value, message }
    );
  }
}

/**
 * Church Permission Error
 * Thrown when user lacks permission for church operations
 */
export class ChurchPermissionError extends ChurchError {
  constructor(operation: string, userRole?: string) {
    super(
      403,
      `Insufficient permissions to ${operation}`,
      'CHURCH_PERMISSION_ERROR',
      { operation, userRole }
    );
  }
}

/**
 * Church Database Error
 * Thrown when database operations fail
 */
export class ChurchDatabaseError extends ChurchError {
  constructor(operation: string, originalError?: Error) {
    super(
      500,
      `Database operation failed: ${operation}`,
      'CHURCH_DATABASE_ERROR',
      {
        operation,
        originalError: originalError?.message,
        stack: originalError?.stack
      }
    );
  }
}

/**
 * Church Settings Validation Error
 * Thrown when church settings fail validation
 */
export class ChurchSettingsValidationError extends ChurchError {
  constructor(errors: Record<string, string>) {
    const errorMessages = Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(', ');

    super(
      400,
      `Church settings validation failed: ${errorMessages}`,
      'CHURCH_SETTINGS_VALIDATION_ERROR',
      { validationErrors: errors }
    );
  }
}

/**
 * Church Slug Generation Error
 * Thrown when unable to generate a unique slug
 */
export class ChurchSlugGenerationError extends ChurchError {
  constructor(name: string, attempts: number) {
    super(
      500,
      `Failed to generate unique slug for church "${name}" after ${attempts} attempts`,
      'CHURCH_SLUG_GENERATION_ERROR',
      { name, attempts }
    );
  }
}

/**
 * Business Rule Violation Error
 * Generic error for business rule violations
 */
export class ChurchBusinessRuleError extends ChurchError {
  constructor(rule: string, details?: any) {
    super(
      400,
      `Business rule violation: ${rule}`,
      'CHURCH_BUSINESS_RULE_ERROR',
      { rule, ...details }
    );
  }
}
