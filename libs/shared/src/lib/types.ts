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

// Auth-related types (from backend)
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  churchId?: string;
}

export interface AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    churchId?: string;
  };
}

export interface UserProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  churchId: string | null;
  isActive: boolean;
  lastLogin: Date | null;
}

export interface TokenVerificationDto {
  valid: boolean;
  userId: string;
  username: string;
}

export interface SetupDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  churchName: string;
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
  isActive?: boolean;
}

// User DTOs (from backend)
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  role: UserRole;
  churchId?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  role?: UserRole;
  churchId?: string;
}

export interface UpdateUserPasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Church DTOs (from backend)
export interface CreateChurchDto {
  name: string;
  slug?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  logoUrl?: string;
  isActive?: boolean;
}

export interface UpdateChurchDto {
  name?: string;
  slug?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  logoUrl?: string;
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
