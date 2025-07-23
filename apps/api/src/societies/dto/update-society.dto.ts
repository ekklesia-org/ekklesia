import { PartialType } from '@nestjs/mapped-types';
import { CreateSocietyDto } from './create-society.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSocietyDto extends PartialType(CreateSocietyDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
