import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsUUID, Length, MinLength, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { UserRole, MemberStatus, MaritalStatus } from './enums';
export class CreateUserDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'securePassword123',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @Length(2, 100)
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @Length(2, 100)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '+1-555-123-4567'
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL of the user',
    example: 'https://example.com/avatar.jpg'
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Whether the user is active',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Role of the user',
    enum: UserRole,
    example: UserRole.MEMBER
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Church ID that the user belongs to',
    example: 'cuid-example'
  })
  @IsUUID()
  @IsOptional()
  churchId?: string;
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {}

export class UpdateUserPasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'currentPassword123'
  })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'newPassword123',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

// Church DTOs (moved from backend)
export class CreateChurchDto {
  @ApiProperty({
    description: 'Name of the church',
    example: 'First Baptist Church',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiPropertyOptional({
    description: 'Unique slug for the church (will be auto-generated if not provided)',
    example: 'first-baptist-church',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @Length(2, 100)
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Primary email address of the church',
    example: 'contact@firstbaptist.org'
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Phone number of the church',
    example: '+1-555-123-4567'
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Street address of the church',
    example: '123 Main Street'
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'City where the church is located',
    example: 'Springfield'
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'State where the church is located',
    example: 'IL'
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'ZIP code of the church',
    example: '62701'
  })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({
    description: 'Website URL of the church',
    example: 'https://firstbaptist.org'
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({
    description: 'Logo URL of the church',
    example: 'https://example.com/logo.png'
  })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Tax identification number (CNPJ in Brazil, EIN in US, etc.)',
    example: '12.345.678/0001-90'
  })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional({
    description: 'Whether the church is active',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateChurchDto extends PartialType(CreateChurchDto) {}

// Auth DTOs (moved from backend)
export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'newuser@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Church ID for multi-church support',
    example: 'church_12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  churchId?: string;
}

export class SetupDto {
  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@igreja.com'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Admin password',
    example: 'securepassword123',
    minLength: 6
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'Admin first name',
    example: 'João'
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Admin last name',
    example: 'Silva'
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Church name',
    example: 'Igreja Batista Central'
  })
  @IsString()
  churchName: string;
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
