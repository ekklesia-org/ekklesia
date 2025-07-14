import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { CurrentUserData } from '../../../src/lib/decorators/current-user.decorator';

export abstract class UsersService {
  abstract create(createUserDto: CreateUserDto, currentUser?: CurrentUserData): Promise<any>;
  abstract findAll(
    page?: number,
    limit?: number,
    includeInactive?: boolean,
    churchId?: string,
    role?: string,
    currentUser?: CurrentUserData
  ): Promise<{
    users: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract findOne(id: string): Promise<any>;
  abstract findByEmail(email: string): Promise<any>;
  abstract findByChurch(
    churchId: string,
    page?: number,
    limit?: number,
    includeInactive?: boolean,
    currentUser?: CurrentUserData
  ): Promise<{
    users: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract update(id: string, updateUserDto: UpdateUserDto): Promise<any>;
  abstract updatePassword(id: string, updatePasswordDto: UpdateUserPasswordDto): Promise<{ message: string }>;
  abstract remove(id: string): Promise<any>;
  abstract hardDelete(id: string): Promise<void>;
  abstract activate(id: string): Promise<any>;
  abstract deactivate(id: string): Promise<any>;
  abstract updateRole(id: string, role: any): Promise<any>;
  abstract findAvailableForMember(
    churchId?: string,
    excludeMemberId?: string,
    currentUser?: CurrentUserData
  ): Promise<any[]>;
}
