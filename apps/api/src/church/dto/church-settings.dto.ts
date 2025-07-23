import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChurchSettingsDto {
  @ApiProperty({
    description: 'Church ID',
    example: 'cm123456789abcdef'
  })
  @IsString()
  churchId: string;

  @ApiPropertyOptional({
    description: 'Timezone for the church',
    example: 'America/Sao_Paulo',
    default: 'America/Sao_Paulo'
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Currency used by the church',
    example: 'BRL',
    default: 'BRL'
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Fiscal year type',
    example: 'calendar',
    default: 'calendar'
  })
  @IsString()
  @IsOptional()
  fiscalYear?: string;

  @ApiPropertyOptional({
    description: 'Enabled modules for the church',
    example: ['members', 'finance', 'events'],
    default: []
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  enabledModules?: string[];

  @ApiPropertyOptional({
    description: 'Whether OCR is enabled',
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  enableOCR?: boolean;

  @ApiPropertyOptional({
    description: 'OCR API key',
    example: 'sk-1234567890abcdef'
  })
  @IsString()
  @IsOptional()
  ocrApiKey?: string;

  @ApiPropertyOptional({
    description: 'Bank name',
    example: 'Banco do Brasil'
  })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({
    description: 'Bank account number',
    example: '12345-6'
  })
  @IsString()
  @IsOptional()
  accountNumber?: string;
}

export class UpdateChurchSettingsDto {
  @ApiPropertyOptional({
    description: 'Timezone for the church',
    example: 'America/Sao_Paulo'
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Currency used by the church',
    example: 'BRL'
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Fiscal year type',
    example: 'calendar'
  })
  @IsString()
  @IsOptional()
  fiscalYear?: string;

  @ApiPropertyOptional({
    description: 'Enabled modules for the church',
    example: ['members', 'finance', 'events']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  enabledModules?: string[];

  @ApiPropertyOptional({
    description: 'Whether OCR is enabled',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  enableOCR?: boolean;

  @ApiPropertyOptional({
    description: 'OCR API key',
    example: 'sk-1234567890abcdef'
  })
  @IsString()
  @IsOptional()
  ocrApiKey?: string;

  @ApiPropertyOptional({
    description: 'Bank name',
    example: 'Banco do Brasil'
  })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({
    description: 'Bank account number',
    example: '12345-6'
  })
  @IsString()
  @IsOptional()
  accountNumber?: string;
}
