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
  role: string;
  churchId?: string;
  phone?: string;
  avatar?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Padrão de autenticação
export interface AuthToken {
  token: string;
  expiresIn: number;
}

// Auth-related types
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
  body?: any;
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
