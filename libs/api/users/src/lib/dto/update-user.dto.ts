import { PartialType, OmitType, ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {}

export class UpdateUserPasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'currentPassword123'
  })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'newPassword123',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
