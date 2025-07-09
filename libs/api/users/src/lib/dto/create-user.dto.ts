import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsUUID, Length, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@ekklesia/prisma';
import { ICreateUserDto } from '@ekklesia/shared';

export class CreateUserDto implements ICreateUserDto {
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
