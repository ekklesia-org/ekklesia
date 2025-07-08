import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ekklesia/database/lib/database.service';
import { SetupDto } from './dto/setup.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SetupService {
  constructor(private prisma: PrismaService) {}

  async isSystemInitialized(): Promise<boolean> {
    const adminCount = await this.prisma.user.count({
      where: { role: 'SUPER_ADMIN' }
    });
    return adminCount > 0;
  }

  async initializeSystem(setupDto: SetupDto) {
    const { email, password, firstName, lastName, churchName } = setupDto;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new church
    const church = await this.prisma.church.create({
      data: {
        name: churchName,
        slug: churchName.toLowerCase().replace(/\s+/g, '-'),
        email,
        isActive: true,
      },
    });

    // Create the super admin user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'SUPER_ADMIN',
        churchId: church.id,
        isActive: true,
      },
    });

    return { user, church };
  }
}

