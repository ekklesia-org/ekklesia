import { z } from 'zod';

// User role enum
export const UserRoleEnum = z.enum([
  'SUPER_ADMIN',
  'CHURCH_ADMIN',
  'PASTOR',
  'TREASURER',
  'SECRETARY',
  'MEMBER'
]);

// User schemas
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(100),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(100),
  phone: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  role: UserRoleEnum,
  churchId: z.string().uuid().optional(),
  isActive: z.boolean().optional().default(true),
});

export const UpdateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(100).optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(100).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  role: UserRoleEnum.optional(),
  churchId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const UpdateRoleSchema = z.object({
  role: UserRoleEnum,
});

// Response schemas
export const UserSchema = z.object({
  id: z.string(),
  churchId: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: UserRoleEnum,
  phone: z.string().nullable(),
  avatar: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLogin: z.date().nullable(),
});

export const UserListResponseSchema = z.object({
  data: z.array(UserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
  churchId: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  lastLogin: z.date().nullable(),
});

// Query schemas
export const UserListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  includeInactive: z.coerce.boolean().default(false),
  churchId: z.string().uuid().optional(),
  role: UserRoleEnum.optional(),
});

export const UserByChurchQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  includeInactive: z.coerce.boolean().default(false),
});

export const AvailableForMemberQuerySchema = z.object({
  churchId: z.string().uuid().optional(),
  excludeMemberId: z.string().uuid().optional(),
});

// Export types
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserListQuery = z.infer<typeof UserListQuerySchema>;
export type UserByChurchQuery = z.infer<typeof UserByChurchQuerySchema>;
export type AvailableForMemberQuery = z.infer<typeof AvailableForMemberQuerySchema>;
