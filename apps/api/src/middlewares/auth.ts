import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { sign, verify } from 'hono/jwt';
import type { JWTPayload as HonoJWTPayload } from 'hono/utils/jwt/types';

// Type augmentation is automatically loaded from types/hono.d.ts

// Types
export interface JWTPayload extends HonoJWTPayload {
  userId: string;
  username: string;
  role: string;
  churchId?: string;
}

// AuthContext is now automatically extended via module augmentation
export interface AuthContext extends Context {
  user: JWTPayload;
}

// JWT utilities
export class JWTService {
  private static get secret(): string {
    const s = process.env.JWT_SECRET;
    if (!s) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return s;
  }

  static async signToken(payload: JWTPayload): Promise<string> {
    return await sign(payload as HonoJWTPayload, this.secret);
  }

  static async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const payload = (await verify(token, this.secret)) as unknown as JWTPayload;
      return payload;
    } catch (error) {
      throw new HTTPException(401, { message: 'Invalid token' });
    }
  }
}

// Authentication middleware
export const auth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const payload = await JWTService.verifyToken(token);
    // Add user to context
    c.set('user', payload);
    await next();
  } catch (error) {
    throw new HTTPException(401, { message: 'Invalid or expired token' });
  }
};

// Get authenticated user from context
export const getAuthUser = (c: Context): JWTPayload => {
  const user = c.get('user') as JWTPayload;
  if (!user) {
    throw new HTTPException(401, { message: 'User not authenticated' });
  }
  return user;
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = getAuthUser(c);
    
    if (!roles.includes(user.role)) {
      throw new HTTPException(403, { message: 'Insufficient permissions' });
    }
    
    await next();
  };
};

// Church context middleware (ensures user can only access their church data)
export const churchContext = async (c: Context, next: Next) => {
  const user = getAuthUser(c);
  
  // Super admins can access any church
  if (user.role === 'SUPER_ADMIN') {
    await next();
    return;
  }
  
  // Other users must have a church context
  if (!user.churchId) {
    throw new HTTPException(403, { message: 'No church access' });
  }
  
  await next();
};
