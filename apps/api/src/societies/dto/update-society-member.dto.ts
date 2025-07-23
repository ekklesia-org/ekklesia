import { IsOptional, IsEnum, IsDateString, IsString, IsBoolean } from 'class-validator';
import { SocietyPosition } from './add-society-member.dto';

export class UpdateSocietyMemberDto {
  @IsEnum(SocietyPosition)
  @IsOptional()
  position?: SocietyPosition;

  @IsDateString()
  @IsOptional()
  leftDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
