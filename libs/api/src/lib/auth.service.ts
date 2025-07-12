import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DrizzleService } from '@ekklesia/database';
import { users, churches } from '@ekklesia/database';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {
  constructor(
    private drizzle: DrizzleService,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email with church
    const userResult = await this.drizzle.db
      .select()
      .from(users)
      .leftJoin(churches, eq(users.churchId, churches.id))
      .where(eq(users.email, email))
      .limit(1);

    if (!userResult.length) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        translationKey: 'errors.auth.invalid_credentials'
      });
    }

    const user = userResult[0].users;

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
    await this.drizzle.db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

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
    const existingUser = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new UnauthorizedException({
        message: 'User with this email already exists',
        translationKey: 'errors.auth.email_already_exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await this.drizzle.db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        churchId,
        role: 'MEMBER' // Default role
      })
      .returning();

    // Generate JWT token
    const payload = {
      sub: newUser.id,
      username: newUser.email,
      role: newUser.role,
      churchId: newUser.churchId
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        churchId: newUser.churchId || undefined
      }
    };
  }

  async validateUser(userId: string): Promise<any> {
    const result = await this.drizzle.db
      .select()
      .from(users)
      .leftJoin(churches, eq(users.churchId, churches.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const user = result[0].users;
    const church = result[0].churches;

    return {
      ...user,
      church
    };
  }
}
