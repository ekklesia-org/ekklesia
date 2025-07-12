import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@ekklesia/database';
import { users, churches } from '@ekklesia/database';
import { SetupDto } from './dto/setup.dto';
import * as bcrypt from 'bcryptjs';
import { eq, count } from 'drizzle-orm';

@Injectable()
export class SetupService {
  constructor(private drizzle: DrizzleService) {}

  async isSystemInitialized(): Promise<boolean> {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'SUPER_ADMIN'));
    
    return result[0].count > 0;
  }

  async initializeSystem(setupDto: SetupDto) {
    const { email, password, firstName, lastName, churchName } = setupDto;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new church
    const [church] = await this.drizzle.db
      .insert(churches)
      .values({
        name: churchName,
        slug: churchName.toLowerCase().replace(/\s+/g, '-'),
        email,
        isActive: true,
      })
      .returning();

    // Create the super admin user
    const [user] = await this.drizzle.db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'SUPER_ADMIN',
        churchId: church.id,
        isActive: true,
      })
      .returning();

    return { user, church };
  }
}

