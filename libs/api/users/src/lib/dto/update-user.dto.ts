import { PartialType, OmitType, ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { IUpdateUserDto, IUpdateUserPasswordDto } from '@ekklesia/shared';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) implements IUpdateUserDto {}

export class UpdateUserPasswordDto implements IUpdateUserPasswordDto {
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
