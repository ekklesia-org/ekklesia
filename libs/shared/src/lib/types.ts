/* eslint-disable @typescript-eslint/no-explicit-any */
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

// API Error type
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
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

// ===== DTO INTERFACES =====
// These interfaces define the structure of DTOs that can be shared between client and server
// Backend implements these as classes with validation decorators

// Auth DTOs
export interface ILoginDto {
  email: string;
  password: string;
}

export interface IRegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  churchId?: string;
}

export interface IAuthResponseDto {
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

export interface IUserProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  churchId: string | null;
  isActive: boolean;
  lastLogin: Date | null;
}

export interface ITokenVerificationDto {
  valid: boolean;
  userId: string;
  username: string;
}

// Setup DTO
export interface ISetupDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  churchName: string;
}

// User DTOs
export interface ICreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  role: any; // UserRole enum (backend will type this properly)
  churchId?: string;
}

export interface IUpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  role?: any; // UserRole enum (backend will type this properly)
  churchId?: string;
}

export interface IUpdateUserPasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Church DTOs
export interface ICreateChurchDto {
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
  taxId?: string;
  isActive?: boolean;
}

export interface IUpdateChurchDto {
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
  taxId?: string;
  isActive?: boolean;
}

export interface IChurchSettingsDto {
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
}

// Member DTOs
export interface ICreateMemberDto {
  churchId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  cpf?: string;
  rg?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status?: any; // MemberStatus enum (backend will type this properly)
  maritalStatus?: any; // MaritalStatus enum (backend will type this properly)
  baptismDate?: string;
  memberSince?: string;
  spouseId?: string;
  profession?: string;
  notes?: string;
  photoUrl?: string;
  userId?: string;
}

export interface IUpdateMemberDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  cpf?: string;
  rg?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status?: any; // MemberStatus enum (backend will type this properly)
  maritalStatus?: any; // MaritalStatus enum (backend will type this properly)
  baptismDate?: string;
  memberSince?: string;
  spouseId?: string;
  profession?: string;
  notes?: string;
  photoUrl?: string;
  userId?: string;
}

// Society Types
export enum SocietyType {
  SAF = 'SAF',
  UPH = 'UPH',
  UPA = 'UPA',
  UMP = 'UMP',
  UCP = 'UCP'
}

export enum SocietyPosition {
  PRESIDENT = 'PRESIDENT',
  VICE_PRESIDENT = 'VICE_PRESIDENT',
  SECRETARY = 'SECRETARY',
  TREASURER = 'TREASURER',
  MEMBER = 'MEMBER'
}

export interface Society {
  id: string;
  churchId: string;
  name: string;
  type: SocietyType;
  description?: string;
  foundedDate?: Date;
  meetingDay?: string;
  meetingTime?: string;
  meetingLocation?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocietyMember {
  id: string;
  societyId: string;
  memberId: string;
  position: SocietyPosition;
  joinedDate: Date;
  leftDate?: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Society DTOs
export interface ICreateSocietyDto {
  churchId: string;
  name: string;
  type: SocietyType;
  description?: string;
  foundedDate?: string;
  meetingDay?: string;
  meetingTime?: string;
  meetingLocation?: string;
}

export interface IUpdateSocietyDto {
  name?: string;
  type?: SocietyType;
  description?: string;
  foundedDate?: string;
  meetingDay?: string;
  meetingTime?: string;
  meetingLocation?: string;
  isActive?: boolean;
}

export interface IAddSocietyMemberDto {
  memberId: string;
  position?: SocietyPosition;
  joinedDate?: string;
  notes?: string;
}

export interface IUpdateSocietyMemberDto {
  position?: SocietyPosition;
  leftDate?: string;
  isActive?: boolean;
  notes?: string;
}
