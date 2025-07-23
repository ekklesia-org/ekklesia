import { z } from 'zod';

// Setup DTO schema for initializing the system
export const SetupSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  churchName: z.string().min(1, 'Church name is required'),
});

// System status response schema
export const SystemStatusSchema = z.object({
  isInitialized: z.boolean(),
  needsSetup: z.boolean(),
});

// Setup success response schema
export const SetupResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.string(),
    churchId: z.string(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  church: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    email: z.string(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

// Export types
export type SetupInput = z.infer<typeof SetupSchema>;
export type SystemStatus = z.infer<typeof SystemStatusSchema>;
export type SetupResponse = z.infer<typeof SetupResponseSchema>;
