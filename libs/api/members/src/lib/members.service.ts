import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

// Type definitions - these can be imported from database when needed
export interface Member {
  id: string;
  churchId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: Date | null;
  cpf?: string | null;
  rg?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'DECEASED';
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  baptismDate?: Date | null;
  memberSince: Date;
  spouseId?: string | null;
  profession?: string | null;
  notes?: string | null;
  photoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId?: string | null;
}

export interface PaginatedMembersResult {
  members: Member[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class MembersService {
  abstract create(createMemberDto: CreateMemberDto): Promise<Member>;
  abstract findAll(page?: number, limit?: number, churchId?: string | null): Promise<PaginatedMembersResult>;
  abstract findOne(id: string): Promise<Member>;
  abstract update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member>;
  abstract remove(id: string): Promise<Member>;
  abstract hardDelete(id: string): Promise<void>;
}

