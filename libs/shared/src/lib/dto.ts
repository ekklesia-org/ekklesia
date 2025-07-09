import { UserRole, UserStatus, MemberStatus, MaritalStatus } from './enums';

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

// Note: Auth and User DTOs have been moved to types.ts to consolidate with backend DTOs
