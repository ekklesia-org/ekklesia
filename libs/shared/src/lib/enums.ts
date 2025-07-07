// Roles de Usuário
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CHURCH_ADMIN = 'CHURCH_ADMIN',
  PASTOR = 'PASTOR',
  TREASURER = 'TREASURER',
  SECRETARY = 'SECRETARY',
  MEMBER = 'MEMBER',
}

// Status do usuário
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// Status do membro
export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TRANSFERRED = 'TRANSFERRED',
  DECEASED = 'DECEASED',
}

// Status marital do membro
export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

// Tipo de Transação Financeira
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

// Categoria de Transação Financeira
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
