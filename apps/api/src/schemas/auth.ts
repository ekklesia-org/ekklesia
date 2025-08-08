import { z } from 'zod';

// Auth schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  churchId: z.string().optional(),
});

export const SetupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  churchName: z.string().min(1, 'Church name is required'),
});

// Response schemas
export const AuthResponseSchema = z.object({
  access_token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.string(),
    churchId: z.string().nullable(),
  }),
});

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
  churchId: z.string().nullable(),
  isActive: z.boolean(),
  lastLogin: z.date().nullable(),
});

export const TokenVerificationSchema = z.object({
  valid: z.boolean(),
  userId: z.string(),
  username: z.string(),
});

// Export types
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type SetupInput = z.infer<typeof SetupSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type TokenVerification = z.infer<typeof TokenVerificationSchema>;
