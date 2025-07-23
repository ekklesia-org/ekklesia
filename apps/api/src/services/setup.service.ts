import { DrizzleService, withTimestamps } from '@ekklesia/database';
import { users, churches } from '@ekklesia/database';
import { SetupInput } from '../schemas/setup';
import * as bcrypt from 'bcryptjs';
import { eq, count } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

export class SetupService {
  private drizzleService: DrizzleService;

  constructor() {
    this.drizzleService = new DrizzleService();
  }

  async isSystemInitialized(): Promise<boolean> {
    try {
      const result = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, 'SUPER_ADMIN'));
      
      return Number(result[0]?.count || 0) > 0;
    } catch (error) {
      throw new HTTPException(500, {
        message: 'Failed to check system status'
      });
    }
  }

  async initializeSystem(setupInput: SetupInput) {
    try {
      const { email, password, firstName, lastName, churchName } = setupInput;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create a new church
      const [church] = await this.drizzleService.db
        .insert(churches)
        .values(withTimestamps({
          name: churchName,
          slug: churchName.toLowerCase().replace(/\s+/g, '-'),
          email,
          isActive: true,
        }))
        .returning();

      // Create the super admin user
      const [user] = await this.drizzleService.db
        .insert(users)
        .values(withTimestamps({
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'SUPER_ADMIN',
          churchId: church.id,
          isActive: true,
        }))
        .returning();

      return { user, church };
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, {
        message: 'Failed to initialize system'
      });
    }
  }
}
