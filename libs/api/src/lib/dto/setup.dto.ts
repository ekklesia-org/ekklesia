import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class SetupDto {
  @ApiProperty({ 
    description: 'Admin email address',
    example: 'admin@igreja.com' 
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ 
    description: 'Admin password',
    example: 'securepassword123',
    minLength: 6 
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({ 
    description: 'Admin first name',
    example: 'João' 
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({ 
    description: 'Admin last name',
    example: 'Silva' 
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @ApiProperty({ 
    description: 'Church name',
    example: 'Igreja Batista Central' 
  })
  @IsString()
  @IsNotEmpty({ message: 'Church name is required' })
  churchName: string;
}
