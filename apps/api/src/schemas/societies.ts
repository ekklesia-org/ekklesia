import { z } from 'zod';

// Society type enum
export const SocietyTypeSchema = z.enum(['SAF', 'UPH', 'UPA', 'UMP', 'UCP']);

// Society position enum  
export const SocietyPositionSchema = z.enum([
  'PRESIDENT', 
  'VICE_PRESIDENT', 
  'SECRETARY', 
  'TREASURER', 
  'MEMBER'
]);

// Create society schema
export const CreateSocietySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: SocietyTypeSchema,
  description: z.string().optional(),
  foundedDate: z.string().optional(), // ISO date string
  meetingDay: z.string().optional(),
  meetingTime: z.string().optional(),
  meetingLocation: z.string().optional(),
  churchId: z.string().min(1, 'Church ID is required'),
});

// Update society schema
export const UpdateSocietySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  type: SocietyTypeSchema.optional(),
  description: z.string().optional(),
  foundedDate: z.string().optional(),
  meetingDay: z.string().optional(),
  meetingTime: z.string().optional(),
  meetingLocation: z.string().optional(),
  churchId: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Society member schemas
export const AddSocietyMemberSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  position: SocietyPositionSchema.optional(),
  joinedDate: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateSocietyMemberSchema = z.object({
  position: SocietyPositionSchema.optional(),
  leftDate: z.string().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

// Response schemas
export const SocietySchema = z.object({
  id: z.string(),
  churchId: z.string(),
  name: z.string(),
  type: SocietyTypeSchema,
  description: z.string().nullable(),
  foundedDate: z.date().nullable(),
  meetingDay: z.string().nullable(),
  meetingTime: z.string().nullable(),
  meetingLocation: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SocietyMemberSchema = z.object({
  id: z.string(),
  societyId: z.string(),
  memberId: z.string(),
  position: SocietyPositionSchema,
  joinedDate: z.date(),
  leftDate: z.date().nullable(),
  isActive: z.boolean(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SocietyWithMembersSchema = z.object({
  id: z.string(),
  churchId: z.string(),
  name: z.string(),
  type: SocietyTypeSchema,
  description: z.string().nullable(),
  foundedDate: z.date().nullable(),
  meetingDay: z.string().nullable(),
  meetingTime: z.string().nullable(),
  meetingLocation: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  members: z.array(SocietyMemberSchema),
});

export const SocietyListResponseSchema = z.object({
  data: z.array(SocietySchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Query parameters
export const SocietyQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  churchId: z.string().optional(),
  type: SocietyTypeSchema.optional(),
  isActive: z.string().optional().transform(val => val === 'true'),
});

// Export types
export type SocietyType = z.infer<typeof SocietyTypeSchema>;
export type SocietyPosition = z.infer<typeof SocietyPositionSchema>;
export type CreateSocietyInput = z.infer<typeof CreateSocietySchema>;
export type UpdateSocietyInput = z.infer<typeof UpdateSocietySchema>;
export type AddSocietyMemberInput = z.infer<typeof AddSocietyMemberSchema>;
export type UpdateSocietyMemberInput = z.infer<typeof UpdateSocietyMemberSchema>;
export type Society = z.infer<typeof SocietySchema>;
export type SocietyMember = z.infer<typeof SocietyMemberSchema>;
export type SocietyListResponse = z.infer<typeof SocietyListResponseSchema>;
export type SocietyQuery = z.infer<typeof SocietyQuerySchema>;
