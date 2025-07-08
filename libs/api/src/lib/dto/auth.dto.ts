import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

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
    description: 'Church ID for multi-tenant support',
    example: 'church_12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  churchId?: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: 'user_12345',
        description: 'User ID',
      },
      email: {
        type: 'string',
        example: 'user@example.com',
        description: 'User email',
      },
      firstName: {
        type: 'string',
        example: 'John',
        description: 'User first name',
      },
      lastName: {
        type: 'string',
        example: 'Doe',
        description: 'User last name',
      },
      role: {
        type: 'string',
        example: 'MEMBER',
        description: 'User role',
        enum: ['SUPER_ADMIN', 'CHURCH_ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'MEMBER'],
      },
      churchId: {
        type: 'string',
        example: 'church_12345',
        description: 'Church ID (optional)',
        nullable: true,
      },
    },
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    churchId?: string;
  };
}

export class UserProfileDto {
  @ApiProperty({
    description: 'User ID',
    example: 'user_12345',
  })
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User role',
    example: 'MEMBER',
    enum: ['SUPER_ADMIN', 'CHURCH_ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'MEMBER'],
  })
  role: string;

  @ApiProperty({
    description: 'Church ID',
    example: 'church_12345',
    nullable: true,
  })
  churchId: string | null;

  @ApiProperty({
    description: 'Whether user is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2025-01-08T01:20:00.000Z',
    nullable: true,
  })
  lastLogin: Date | null;
}

export class TokenVerificationDto {
  @ApiProperty({
    description: 'Whether token is valid',
    example: true,
  })
  valid: boolean;

  @ApiProperty({
    description: 'User ID from token',
    example: 'user_12345',
  })
  userId: string;

  @ApiProperty({
    description: 'Username from token',
    example: 'user@example.com',
  })
  username: string;
}
