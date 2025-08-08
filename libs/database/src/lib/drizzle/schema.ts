import { pgTable, text, boolean, timestamp, decimal, pgEnum, jsonb, index, date, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('UserRole', ['SUPER_ADMIN', 'CHURCH_ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'MEMBER']);
export const memberStatusEnum = pgEnum('MemberStatus', ['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'DECEASED']);
export const maritalStatusEnum = pgEnum('MaritalStatus', ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']);
export const transactionTypeEnum = pgEnum('TransactionType', ['INCOME', 'EXPENSE']);
export const transactionCategoryEnum = pgEnum('TransactionCategory', ['TITHE', 'OFFERING', 'DONATION', 'EVENT_INCOME', 'UTILITIES', 'MAINTENANCE', 'SUPPLIES', 'MINISTRY', 'SALARY', 'OTHER']);
export const transactionStatusEnum = pgEnum('TransactionStatus', ['PENDING', 'CONFIRMED', 'CANCELLED']);
export const societyTypeEnum = pgEnum('SocietyType', ['SAF', 'UPH', 'UPA', 'UMP', 'UCP']);
export const societyPositionEnum = pgEnum('SocietyPosition', ['PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'TREASURER', 'MEMBER']);

// Churches table
export const churches = pgTable('churches', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  email: text('email').unique().notNull(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zipCode'),
  website: text('website'),
  logoUrl: text('logoUrl'),
  taxId: text('taxId'),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  index('churches_isActive_idx').on(table.isActive),
  index('churches_createdAt_idx').on(table.createdAt),
  index('churches_name_idx').on(table.name),
]);

// Church Settings table
export const churchSettings = pgTable('church_settings', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  churchId: text('churchId').unique().notNull().references(() => churches.id, { onDelete: 'cascade' }),
  timezone: text('timezone').default('America/Sao_Paulo').notNull(),
  currency: text('currency').default('BRL').notNull(),
  fiscalYear: text('fiscalYear').default('calendar').notNull(),
  enabledModules: text('enabledModules').array(),
  enableOCR: boolean('enableOCR').default(false).notNull(),
  ocrApiKey: text('ocrApiKey'),
  bankName: text('bankName'),
  accountNumber: text('accountNumber'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  phone: text('phone'),
  avatar: text('avatar'),
  isActive: boolean('isActive').default(true).notNull(),
  role: userRoleEnum('role').default('MEMBER').notNull(),
  churchId: text('churchId').references(() => churches.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  lastLogin: timestamp('lastLogin', { mode: 'date' }),
});

// Members table
export const members = pgTable('members', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  churchId: text('churchId').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  email: text('email'),
  phone: text('phone'),
  dateOfBirth: timestamp('dateOfBirth', { mode: 'date' }),
  cpf: text('cpf').unique(),
  rg: text('rg'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zipCode'),
  status: memberStatusEnum('status').default('ACTIVE').notNull(),
  maritalStatus: maritalStatusEnum('maritalStatus').default('SINGLE').notNull(),
  baptismDate: timestamp('baptismDate', { mode: 'date' }),
  memberSince: timestamp('memberSince', { mode: 'date' }).defaultNow().notNull(),
  spouseId: text('spouseId').references(() => members.id, { onDelete: 'set null' }),
  profession: text('profession'),
  notes: text('notes'),
  photoUrl: text('photoUrl'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  userId: text('userId').unique().references(() => users.id),
}, (table) => [
  index('members_churchId_idx').on(table.churchId),
  index('members_status_idx').on(table.status),
  index('members_email_idx').on(table.email),
]);

// Transactions table
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  churchId: text('churchId').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  category: transactionCategoryEnum('category').notNull(),
  status: transactionStatusEnum('status').default('PENDING').notNull(),
  transactionDate: timestamp('transactionDate', { mode: 'date' }).notNull(),
  referenceNumber: text('referenceNumber'),
  bankAccount: text('bankAccount'),
  bankReference: text('bankReference'),
  memberId: text('memberId').references(() => members.id),
  isFromOCR: boolean('isFromOCR').default(false).notNull(),
  ocrData: jsonb('ocrData'),
  attachments: text('attachments').array(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  index('transactions_churchId_idx').on(table.churchId),
  index('transactions_type_idx').on(table.type),
  index('transactions_status_idx').on(table.status),
  index('transactions_transactionDate_idx').on(table.transactionDate),
]);

// Audit Logs table
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  churchId: text('churchId').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entityType').notNull(),
  entityId: text('entityId').notNull(),
  oldValues: jsonb('oldValues'),
  newValues: jsonb('newValues'),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  index('audit_logs_churchId_idx').on(table.churchId),
  index('audit_logs_userId_idx').on(table.userId),
  index('audit_logs_createdAt_idx').on(table.createdAt),
]);

// Societies table
export const societies = pgTable('societies', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  churchId: text('churchId').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: societyTypeEnum('type').notNull(),
  description: text('description'),
  foundedDate: date('foundedDate'),
  meetingDay: text('meetingDay'), // e.g., 'MONDAY', 'TUESDAY', etc.
  meetingTime: text('meetingTime'), // e.g., '19:00'
  meetingLocation: text('meetingLocation'),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  index('societies_churchId_idx').on(table.churchId),
  index('societies_type_idx').on(table.type),
  index('societies_isActive_idx').on(table.isActive),
]);

// Society Members table (many-to-many relationship)
export const societyMembers = pgTable('society_members', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  societyId: text('societyId').notNull().references(() => societies.id, { onDelete: 'cascade' }),
  memberId: text('memberId').notNull().references(() => members.id, { onDelete: 'cascade' }),
  position: societyPositionEnum('position').default('MEMBER').notNull(),
  joinedDate: date('joinedDate').defaultNow().notNull(),
  leftDate: date('leftDate'),
  isActive: boolean('isActive').default(true).notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  index('society_members_societyId_idx').on(table.societyId),
  index('society_members_memberId_idx').on(table.memberId),
  index('society_members_isActive_idx').on(table.isActive),
]);

// Society Events table
export const societyEvents = pgTable('society_events', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  societyId: text('societyId').notNull().references(() => societies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  eventDate: timestamp('eventDate', { mode: 'date' }).notNull(),
  location: text('location'),
  attendanceCount: integer('attendanceCount'),
  notes: text('notes'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  index('society_events_societyId_idx').on(table.societyId),
  index('society_events_eventDate_idx').on(table.eventDate),
]);

// Relations
export const churchesRelations = relations(churches, ({ one, many }) => ({
  settings: one(churchSettings, {
    fields: [churches.id],
    references: [churchSettings.churchId],
  }),
  users: many(users),
  members: many(members),
  transactions: many(transactions),
  auditLogs: many(auditLogs),
  societies: many(societies),
}));

export const churchSettingsRelations = relations(churchSettings, ({ one }) => ({
  church: one(churches, {
    fields: [churchSettings.churchId],
    references: [churches.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  church: one(churches, {
    fields: [users.churchId],
    references: [churches.id],
  }),
  member: one(members, {
    fields: [users.id],
    references: [members.userId],
  }),
  auditLogs: many(auditLogs),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  church: one(churches, {
    fields: [members.churchId],
    references: [churches.id],
  }),
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  spouse: one(members, {
    fields: [members.spouseId],
    references: [members.id],
    relationName: 'spouse',
  }),
  transactions: many(transactions),
  societyMemberships: many(societyMembers),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  church: one(churches, {
    fields: [transactions.churchId],
    references: [churches.id],
  }),
  member: one(members, {
    fields: [transactions.memberId],
    references: [members.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  church: one(churches, {
    fields: [auditLogs.churchId],
    references: [churches.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Society Relations
export const societiesRelations = relations(societies, ({ one, many }) => ({
  church: one(churches, {
    fields: [societies.churchId],
    references: [churches.id],
  }),
  societyMembers: many(societyMembers),
  events: many(societyEvents),
}));

export const societyMembersRelations = relations(societyMembers, ({ one }) => ({
  society: one(societies, {
    fields: [societyMembers.societyId],
    references: [societies.id],
  }),
  member: one(members, {
    fields: [societyMembers.memberId],
    references: [members.id],
  }),
}));

export const societyEventsRelations = relations(societyEvents, ({ one }) => ({
  society: one(societies, {
    fields: [societyEvents.societyId],
    references: [societies.id],
  }),
}));

