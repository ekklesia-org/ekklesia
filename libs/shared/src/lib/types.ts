import { UserRole } from './enums';

// Geral
export type ID = string;

// ApiResponse padrão
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// User Entity
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  churchId?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

// User with Church info
export interface UserWithChurch extends User {
  church?: {
    id: string;
    name: string;
    slug: string;
  };
}

// Padrão de autenticação
export interface AuthToken {
  token: string;
  expiresIn: number;
}

// Legacy auth types (keeping for backward compatibility)
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface AuthError {
  message: string;
  translationKey?: string;
}

// Request Padrão para endpoints
export interface RequestParams {
  headers?: { [key: string]: string };
  query?: { [key: string]: string | number };
  body?: Record<string, unknown>; // Use um tipo genérico mais detalhado
}

// Church Entity (for super admin management)
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
  userCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Church with Users
export interface ChurchWithUsers extends Church {
  users: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
  }[];
}

// Church creation request
export interface CreateChurchRequest {
  // Church information
  churchName: string;
  churchEmail: string;
  churchPhone?: string;
  churchAddress?: string;
  churchCity?: string;
  churchState?: string;
  churchZip?: string;
  churchTaxId?: string;
  // Admin user information
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
}

// Church update request
export interface UpdateChurchRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  logoUrl?: string;
  taxId?: string;
  isActive?: boolean;
}

// List Response Types
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChurchListResponse {
  churches: ChurchWithUsers[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Common API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MessageResponse {
  message: string;
}
