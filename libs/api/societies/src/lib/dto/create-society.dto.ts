import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum SocietyType {
  SAF = 'SAF',
  UPH = 'UPH',
  UPA = 'UPA',
  UMP = 'UMP',
  UCP = 'UCP'
}

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
