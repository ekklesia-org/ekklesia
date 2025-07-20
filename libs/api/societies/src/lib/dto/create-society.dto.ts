import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { SocietyType } from '@ekklesia/shared';

export class CreateSocietyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(SocietyType)
  @IsNotEmpty()
  type: SocietyType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  foundedDate?: string;

  @IsString()
  @IsOptional()
  meetingDay?: string;

  @IsString()
  @IsOptional()
  meetingTime?: string;

  @IsString()
  @IsOptional()
  meetingLocation?: string;

  @IsString()
  @IsNotEmpty()
  churchId: string;
}
