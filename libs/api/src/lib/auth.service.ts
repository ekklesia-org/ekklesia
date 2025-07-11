import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '@ekklesia/database/lib/database.service';
import { User } from '@ekklesia/drizzle';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: DatabaseService,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { church: true }
    });

    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        translationKey: 'errors.auth.invalid_credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        translationKey: 'errors.auth.invalid_credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException({
        message: 'Account is deactivated',
        translationKey: 'errors.auth.account_disabled'
      });
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const payload = { 
      sub: user.id, 
      username: user.email,
      role: user.role,
      churchId: user.churchId 
    };
    
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        churchId: user.churchId || undefined
      }
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, churchId } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new UnauthorizedException({
        message: 'User with this email already exists',
        translationKey: 'errors.auth.email_already_exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        churchId,
        role: 'MEMBER' // Default role
      },
      include: { church: true }
    });

    // Generate JWT token
    const payload = { 
      sub: user.id, 
      username: user.email,
      role: user.role,
      churchId: user.churchId 
    };
    
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        churchId: user.churchId || undefined
      }
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { church: true }
    });
  }
}
