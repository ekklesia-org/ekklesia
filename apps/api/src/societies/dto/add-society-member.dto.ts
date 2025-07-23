import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum SocietyPosition {
  PRESIDENT = 'PRESIDENT',
  VICE_PRESIDENT = 'VICE_PRESIDENT', 
  SECRETARY = 'SECRETARY',
  TREASURER = 'TREASURER',
  MEMBER = 'MEMBER'
}

export class AddSocietyMemberDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsEnum(SocietyPosition)
  @IsOptional()
  position?: SocietyPosition = SocietyPosition.MEMBER;

  @IsDateString()
  @IsOptional()
  joinedDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
