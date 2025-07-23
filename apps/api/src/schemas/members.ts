import { z } from 'zod';

// Member status enum
export const MemberStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'VISITING', 'TRANSFERRED']);

// Marital status enum
export const MaritalStatusEnum = z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']);

// Base member schema
export const MemberSchema = z.object({
  id: z.string().uuid(),
  churchId: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  status: MemberStatusEnum.default('ACTIVE'),
  maritalStatus: MaritalStatusEnum.optional(),
  baptismDate: z.string().datetime().optional(),
  memberSince: z.string().datetime().optional(),
  spouseId: z.string().uuid().optional(),
  profession: z.string().optional(),
  notes: z.string().optional(),
  photoUrl: z.string().url().optional(),
  userId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create member input schema
export const CreateMemberSchema = z.object({
  churchId: z.string().uuid(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  status: MemberStatusEnum.optional(),
  maritalStatus: MaritalStatusEnum.optional(),
  baptismDate: z.string().datetime().optional(),
  memberSince: z.string().datetime().optional(),
  spouseId: z.string().uuid().optional(),
  profession: z.string().optional(),
  notes: z.string().optional(),
  photoUrl: z.string().url().optional(),
  userId: z.string().uuid().optional(),
});

// Update member input schema
export const UpdateMemberSchema = CreateMemberSchema.omit({ churchId: true }).partial();

// Member list query schema
export const MemberListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: MemberStatusEnum.optional(),
  churchId: z.string().uuid().optional(),
  search: z.string().optional(),
});

// Member list response schema
export const MemberListResponseSchema = z.object({
  data: z.array(MemberSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Member with user details schema
export const MemberWithUserSchema = MemberSchema.extend({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    isActive: z.boolean(),
  }).optional(),
});

// Member statistics schema
export const MemberStatisticsSchema = z.object({
  totalMembers: z.number(),
  activeMembers: z.number(),
  inactiveMembers: z.number(),
  visitingMembers: z.number(),
  membersByMaritalStatus: z.record(z.string(), z.number()),
  membersByAgeGroup: z.record(z.string(), z.number()),
  recentBaptisms: z.number(),
  newMembersThisMonth: z.number(),
});
