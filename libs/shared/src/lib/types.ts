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
