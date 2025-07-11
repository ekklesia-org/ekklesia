export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CHURCH_ADMIN = 'CHURCH_ADMIN',
  PASTOR = 'PASTOR',
  TREASURER = 'TREASURER',
  SECRETARY = 'SECRETARY',
  MEMBER = 'MEMBER',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TRANSFERRED = 'TRANSFERRED',
  DECEASED = 'DECEASED',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum TransactionCategory {
  TITHE = 'TITHE',
  OFFERING = 'OFFERING',
  DONATION = 'DONATION',
  EVENT_INCOME = 'EVENT_INCOME',
  UTILITIES = 'UTILITIES',
  MAINTENANCE = 'MAINTENANCE',
  SUPPLIES = 'SUPPLIES',
  MINISTRY = 'MINISTRY',
  SALARY = 'SALARY',
  OTHER = 'OTHER',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export interface Church {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  logoUrl?: string;
  taxId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChurchSettings {
  id: string;
  churchId: string;
  timezone: string;
  currency: string;
  fiscalYear: string;
  enabledModules: string[];
  enableOCR: boolean;
  ocrApiKey?: string;
  bankName?: string;
  accountNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  role: UserRole;
  churchId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface Member {
  id: string;
  churchId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  cpf?: string;
  rg?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: MemberStatus;
  maritalStatus: MaritalStatus;
  baptismDate?: Date;
  memberSince: Date;
  spouseId?: string;
  profession?: string;
  notes?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface Transaction {
  id: string;
  churchId: string;
  description: string;
  amount: unknown;
  type: TransactionType;
  category: TransactionCategory;
  status: TransactionStatus;
  transactionDate: Date;
  referenceNumber?: string;
  bankAccount?: string;
  bankReference?: string;
  memberId?: string;
  isFromOCR: boolean;
  ocrData?: unknown;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  churchId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export class DrizzleClient {
  // placeholder for actual Drizzle client
}
