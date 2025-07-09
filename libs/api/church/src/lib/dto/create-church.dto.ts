import { IsString, IsEmail, IsOptional, IsBoolean, IsUrl, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
    description: 'Whether the church is active',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
