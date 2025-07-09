import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, Length, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemberStatus, MaritalStatus } from '@ekklesia/prisma';
import { ICreateMemberDto } from '@ekklesia/shared';

export class CreateMemberDto implements ICreateMemberDto {
  @ApiProperty({
    description: 'Church ID that the member belongs to',
    example: 'cuid-example'
  })
  @IsUUID()
  churchId: string;

  @ApiProperty({
    description: 'First name of the member',
    example: 'João',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @Length(2, 100)
  firstName: string;

  @ApiProperty({
    description: 'Last name of the member',
    example: 'Silva',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @Length(2, 100)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Email address of the member',
    example: 'joao.silva@email.com'
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the member',
    example: '+55 11 99999-9999'
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Date of birth of the member',
    example: '1990-01-15'
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'CPF (Brazilian tax ID) of the member',
    example: '123.456.789-00'
  })
  @IsString()
  @IsOptional()
  cpf?: string;

  @ApiPropertyOptional({
    description: 'RG (Brazilian ID) of the member',
    example: '12.345.678-9'
  })
  @IsString()
  @IsOptional()
  rg?: string;

  @ApiPropertyOptional({
    description: 'Street address of the member',
    example: 'Rua das Flores, 123'
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'City where the member lives',
    example: 'São Paulo'
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'State where the member lives',
    example: 'SP'
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'ZIP code of the member',
    example: '01234-567'
  })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({
    description: 'Status of the member',
    enum: MemberStatus,
    default: MemberStatus.ACTIVE
  })
  @IsEnum(MemberStatus)
  @IsOptional()
  status?: MemberStatus;

  @ApiPropertyOptional({
    description: 'Marital status of the member',
    enum: MaritalStatus,
    default: MaritalStatus.SINGLE
  })
  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional({
    description: 'Baptism date of the member',
    example: '2020-06-15'
  })
  @IsDateString()
  @IsOptional()
  baptismDate?: string;

  @ApiPropertyOptional({
    description: 'Date when the member joined the church',
    example: '2020-01-01'
  })
  @IsDateString()
  @IsOptional()
  memberSince?: string;

  @ApiPropertyOptional({
    description: 'Spouse ID if the member is married',
    example: 'cuid-example'
  })
  @IsUUID()
  @IsOptional()
  spouseId?: string;

  @ApiPropertyOptional({
    description: 'Profession of the member',
    example: 'Engenheiro'
  })
  @IsString()
  @IsOptional()
  profession?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the member',
    example: 'Líder do ministério de jovens'
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Photo URL of the member',
    example: 'https://example.com/photo.jpg'
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'User ID if the member has a system user account',
    example: 'cuid-example'
  })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
