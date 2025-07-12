/**
 * Utility functions for handling timestamps consistently across the application
 */

export interface TimestampFields {
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateTimestampFields {
  updatedAt: Date;
}

/**
 * Creates timestamp fields for new records
 */
export function createTimestamps(): TimestampFields {
  const now = new Date();
  return {
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Creates update timestamp for existing records
 */
export function updateTimestamp(): UpdateTimestampFields {
  return {
    updatedAt: new Date(),
  };
}

/**
 * Adds timestamps to data for new records
 */
export function withTimestamps<T>(data: T): T & TimestampFields {
  return {
    ...data,
    ...createTimestamps(),
  };
}

/**
 * Adds update timestamp to data for existing records
 */
export function withUpdateTimestamp<T>(data: T): T & UpdateTimestampFields {
  return {
    ...data,
    ...updateTimestamp(),
  };
}
