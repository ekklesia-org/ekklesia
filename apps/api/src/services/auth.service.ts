import * as bcrypt from 'bcryptjs';
import { DrizzleService } from '@ekklesia/database';
import { users, churches } from '@ekklesia/database';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { JWTService } from '../middlewares/auth';
import type { 
  LoginInput, 
  RegisterInput, 
  SetupInput, 
  AuthResponse, 
  UserProfile 
} from '../schemas/auth';

export class AuthService {
  private drizzleService: DrizzleService;

  constructor() {
    this.drizzleService = new DrizzleService();
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Find user by email with church
    const userResult = await this.drizzleService.db
      .select()
      .from(users)
      .leftJoin(churches, eq(users.churchId, churches.id))
      .where(eq(users.email, email))
      .limit(1);

    if (!userResult.length) {
      throw new HTTPException(401, { 
        message: 'Invalid credentials'
      });
    }

    const user = userResult[0].users;

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HTTPException(401, { 
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      throw new HTTPException(401, { 
        message: 'Account is deactivated'
      });
    }

    // Update last login
    await this.drizzleService.db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    // Generate JWT token
    const access_token = await JWTService.signToken({
      userId: user.id,
      username: user.email,
      role: user.role,
      churchId: user.churchId || undefined
    });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        churchId: user.churchId
      }
    };
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const { email, password, firstName, lastName, churchId } = input;

    // Check if user already exists
    const existingUser = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new HTTPException(409, { 
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await this.drizzleService.db
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
    const access_token = await JWTService.signToken({
      userId: newUser.id,
      username: newUser.email,
      role: newUser.role,
      churchId: newUser.churchId || undefined
    });

    return {
      access_token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        churchId: newUser.churchId
      }
    };
  }

  async setup(input: SetupInput): Promise<AuthResponse> {
    const { email, password, firstName, lastName, churchName } = input;

    // Check if any users exist (setup should only work if no users exist)
    const existingUsers = await this.drizzleService.db
      .select({ count: users.id })
      .from(users);

    if (existingUsers.length > 0) {
      throw new HTTPException(400, { 
        message: 'System has already been set up'
      });
    }

    // Create church first
    const [church] = await this.drizzleService.db
      .insert(churches)
      .values({
        name: churchName,
        slug: churchName.toLowerCase().replace(/\s+/g, '-'),
        email: email, // Use admin's email as church email initially
        isActive: true
      })
      .returning();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create super admin user
    const [newUser] = await this.drizzleService.db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        churchId: church.id,
        role: 'SUPER_ADMIN'
      })
      .returning();

    // Generate JWT token
    const access_token = await JWTService.signToken({
      userId: newUser.id,
      username: newUser.email,
      role: newUser.role,
      churchId: newUser.churchId || undefined
    });

    return {
      access_token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        churchId: newUser.churchId
      }
    };
  }

  async validateUser(userId: string): Promise<UserProfile | null> {
    const result = await this.drizzleService.db
      .select()
      .from(users)
      .leftJoin(churches, eq(users.churchId, churches.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const user = result[0].users;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      churchId: user.churchId,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    };
  }
}
