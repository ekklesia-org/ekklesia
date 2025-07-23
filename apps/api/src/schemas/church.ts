import { z } from 'zod';

// Church settings schema
export const ChurchSettingsSchema = z.object({
  timezone: z.string().optional(),
  currency: z.string().optional(),
  fiscalYear: z.string().optional(),
  enabledModules: z.array(z.string()).optional(),
  enableOCR: z.boolean().optional(),
  ocrApiKey: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
});

// Base church schema
export const ChurchSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  settings: ChurchSettingsSchema.optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create church input schema
export const CreateChurchSchema = z.object({
  name: z.string().min(1, 'Church name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  settings: ChurchSettingsSchema.optional(),
});

// Update church input schema
export const UpdateChurchSchema = CreateChurchSchema.partial();

// Church list query schema
export const ChurchListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  includeInactive: z.coerce.boolean().default(false),
});

// Church list response schema
export const ChurchListResponseSchema = z.object({
  data: z.array(ChurchSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
