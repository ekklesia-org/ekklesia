import { UserRole, UserStatus, MemberStatus, MaritalStatus } from './enums';

// DTO para autenticação
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status?: UserStatus;
}

// DTO para atualizar usuário
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  status?: UserStatus;
  churchId?: string;
}

// DTO para criação de membro
export interface CreateMemberDto {
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
  status?: MemberStatus;
  maritalStatus?: MaritalStatus;
  baptismDate?: Date;
  memberSince?: Date;
  profession?: string;
  notes?: string;
  photoUrl?: string;
}
