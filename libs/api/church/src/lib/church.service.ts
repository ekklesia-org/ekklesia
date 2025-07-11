import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '@ekklesia/database/lib/database.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { CreateChurchSettingsDto, UpdateChurchSettingsDto } from './dto/church-settings.dto';
import { Church, ChurchSettings } from '@ekklesia/drizzle';

@Injectable()
export class ChurchService {
  constructor(private prisma: DatabaseService) {}

  /**
   * Create a new church
   */
  async create(createChurchDto: CreateChurchDto): Promise<Church & { userCount: number }> {
    const { slug, ...churchData } = createChurchDto;

    // Generate slug if not provided
    const finalSlug = slug || this.generateSlug(createChurchDto.name);

    // Check if slug already exists
    const existingChurch = await this.prisma.church.findUnique({
      where: { slug: finalSlug }
    });

    if (existingChurch) {
      throw new BadRequestException({
        message: `Church with slug "${finalSlug}" already exists`,
        translationKey: 'errors.church.slug_already_exists'
      });
    }

    // Check if email already exists
    const existingEmailChurch = await this.prisma.church.findUnique({
      where: { email: createChurchDto.email }
    });

    if (existingEmailChurch) {
      throw new BadRequestException({
        message: `Church with email "${createChurchDto.email}" already exists`,
        translationKey: 'errors.church.email_already_exists'
      });
    }

    try {
      const church = await this.prisma.church.create({
        data: {
          ...churchData,
          slug: finalSlug,
          isActive: churchData.isActive ?? true,
        },
        include: {
          settings: true,
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true,
              createdAt: true,
            }
          }
        }
      });

      return {
        ...church,
        userCount: church.users.length
      } as Church & { userCount: number };
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to create church: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.church.create_failed'
      });
    }
  }

  /**
   * Get all churches with pagination
   */
  async findAll(page = 1, limit = 10, includeInactive = false): Promise<{
    churches: (Church & { userCount: number })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const where = includeInactive ? {} : { isActive: true };

    const [churches, total] = await Promise.all([
      this.prisma.church.findMany({
        where,
        skip,
        take: limit,
        include: {
          settings: true,
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true,
              createdAt: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.church.count({ where })
    ]);

    // Add userCount as a computed field
    const churchesWithUserCount = churches.map(church => ({
      ...church,
      userCount: church.users.length
    }));

    return {
      churches: churchesWithUserCount,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get a church by ID
   */
  async findOne(id: string): Promise<Church & { userCount: number }> {
    const church = await this.prisma.church.findUnique({
      where: { id },
      include: {
        settings: true,
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
          }
        }
      }
    });

    if (!church) {
      throw new NotFoundException({
        message: `Church with ID "${id}" not found`,
        translationKey: 'errors.church.not_found'
      });
    }

    return {
      ...church,
      userCount: church.users.length
    } as Church & { userCount: number };
  }

  /**
   * Get a church by slug
   */
  async findBySlug(slug: string): Promise<Church & { userCount: number }> {
    const church = await this.prisma.church.findUnique({
      where: { slug },
      include: {
        settings: true,
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
          }
        }
      }
    });

    if (!church) {
      throw new NotFoundException({
        message: `Church with slug "${slug}" not found`,
        translationKey: 'errors.church.not_found'
      });
    }

    return {
      ...church,
      userCount: church.users.length
    } as Church & { userCount: number };
  }

  /**
   * Update a church
   */
  async update(id: string, updateChurchDto: UpdateChurchDto): Promise<Church & { userCount: number }> {
    const existingChurch = await this.findOne(id);

    const { slug, ...churchData } = updateChurchDto;

    // If slug is being updated, check if it already exists
    if (slug && slug !== existingChurch.slug) {
      const existingSlugChurch = await this.prisma.church.findUnique({
        where: { slug }
      });

      if (existingSlugChurch && existingSlugChurch.id !== id) {
        throw new BadRequestException({
          message: `Church with slug "${slug}" already exists`,
          translationKey: 'errors.church.slug_already_exists'
        });
      }
    }

    // If email is being updated, check if it already exists
    if (updateChurchDto.email && updateChurchDto.email !== existingChurch.email) {
      const existingEmailChurch = await this.prisma.church.findUnique({
        where: { email: updateChurchDto.email }
      });

      if (existingEmailChurch && existingEmailChurch.id !== id) {
        throw new BadRequestException({
          message: `Church with email "${updateChurchDto.email}" already exists`,
          translationKey: 'errors.church.email_already_exists'
        });
      }
    }

    try {
      const church = await this.prisma.church.update({
        where: { id },
        data: {
          ...churchData,
          ...(slug && { slug }),
        },
        include: {
          settings: true,
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true,
              createdAt: true,
            }
          }
        }
      });

      return {
        ...church,
        userCount: church.users.length
      } as Church & { userCount: number };
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to update church: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.church.update_failed'
      });
    }
  }

  /**
   * Delete a church (soft delete by setting isActive to false)
   */
  async remove(id: string): Promise<Church & { userCount: number }> {
    // Check if church has Super Admin users
    const superAdmins = await this.prisma.user.findMany({
      where: {
        churchId: id,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });

    if (superAdmins.length > 0) {
      throw new BadRequestException({
        message: 'Cannot delete a church that has Super Admin users. Super Admins must be transferred to another church or their role changed before deletion.',
        translationKey: 'errors.church.cannot_delete_with_super_admins'
      });
    }

    try {
      const church = await this.prisma.church.update({
        where: { id },
        data: { isActive: false },
        include: {
          settings: true,
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true,
              createdAt: true,
            }
          }
        }
      });

      return {
        ...church,
        userCount: church.users.length
      } as Church & { userCount: number };
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to delete church: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.church.delete_failed'
      });
    }
  }

  /**
   * Permanently delete a church
   */
  async hardDelete(id: string): Promise<void> {
    // Check if church has Super Admin users
    const superAdmins = await this.prisma.user.findMany({
      where: {
        churchId: id,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });

    if (superAdmins.length > 0) {
      throw new BadRequestException({
        message: 'Cannot permanently delete a church that has Super Admin users. Super Admins must be transferred to another church or their role changed before deletion.',
        translationKey: 'errors.church.cannot_delete_with_super_admins'
      });
    }

    // Check if this is the last active church in the system
    const activeChurchCount = await this.prisma.church.count({
      where: { isActive: true }
    });

    if (activeChurchCount <= 1) {
      throw new BadRequestException({
        message: 'Cannot delete the last church in the system. At least one church must remain active.',
        translationKey: 'errors.church.cannot_delete_last_church'
      });
    }

    try {
      await this.prisma.church.delete({
        where: { id }
      });
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to permanently delete church: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.church.delete_failed'
      });
    }
  }

  /**
   * Create church settings
   */
  async createSettings(createSettingsDto: CreateChurchSettingsDto): Promise<ChurchSettings> {
    // Verify church exists
    await this.findOne(createSettingsDto.churchId);

    // Check if settings already exist
    const existingSettings = await this.prisma.churchSettings.findUnique({
      where: { churchId: createSettingsDto.churchId }
    });

    if (existingSettings) {
      throw new BadRequestException({
        message: `Settings for church "${createSettingsDto.churchId}" already exist`,
        translationKey: 'errors.church.settings_already_exist'
      });
    }

    try {
      const settings = await this.prisma.churchSettings.create({
        data: {
          churchId: createSettingsDto.churchId,
          timezone: createSettingsDto.timezone || 'America/Sao_Paulo',
          currency: createSettingsDto.currency || 'BRL',
          fiscalYear: createSettingsDto.fiscalYear || 'calendar',
          enabledModules: createSettingsDto.enabledModules || [],
          enableOCR: createSettingsDto.enableOCR || false,
          ocrApiKey: createSettingsDto.ocrApiKey,
          bankName: createSettingsDto.bankName,
          accountNumber: createSettingsDto.accountNumber,
        },
        include: {
          church: true
        }
      });

      return settings;
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to create church settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.church.settings_create_failed'
      });
    }
  }

  /**
   * Update church settings
   */
  async updateSettings(churchId: string, updateSettingsDto: UpdateChurchSettingsDto): Promise<ChurchSettings> {
    // Verify church exists
    await this.findOne(churchId);

    // Check if settings exist
    const existingSettings = await this.prisma.churchSettings.findUnique({
      where: { churchId }
    });

    if (!existingSettings) {
      throw new NotFoundException({
        message: `Settings for church "${churchId}" not found`,
        translationKey: 'errors.church.settings_not_found'
      });
    }

    try {
      const settings = await this.prisma.churchSettings.update({
        where: { churchId },
        data: updateSettingsDto,
        include: {
          church: true
        }
      });

      return settings;
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to update church settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.church.settings_update_failed'
      });
    }
  }

  /**
   * Get church settings
   */
  async getSettings(churchId: string): Promise<ChurchSettings> {
    // Verify church exists
    await this.findOne(churchId);

    const settings = await this.prisma.churchSettings.findUnique({
      where: { churchId },
      include: {
        church: true
      }
    });

    if (!settings) {
      throw new NotFoundException({
        message: `Settings for church "${churchId}" not found`,
        translationKey: 'errors.church.settings_not_found'
      });
    }

    return settings;
  }

  /**
   * Transfer Super Admin users to another church
   */
  async transferSuperAdmins(fromChurchId: string, toChurchId: string): Promise<void> {
    // Verify destination church exists and is active
    const destinationChurch = await this.findOne(toChurchId);
    if (!destinationChurch.isActive) {
      throw new BadRequestException({
        message: 'Cannot transfer Super Admins to an inactive church',
        translationKey: 'errors.church.cannot_transfer_to_inactive_church'
      });
    }

    // Get all Super Admin users from source church
    const superAdmins = await this.prisma.user.findMany({
      where: {
        churchId: fromChurchId,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });

    if (superAdmins.length === 0) {
      return; // No Super Admins to transfer
    }

    // Transfer all Super Admins to the destination church
    await this.prisma.user.updateMany({
      where: {
        churchId: fromChurchId,
        role: 'SUPER_ADMIN',
        isActive: true
      },
      data: {
        churchId: toChurchId
      }
    });
  }

  /**
   * Get churches that can receive Super Admin transfers
   */
  async getChurchesForTransfer(excludeChurchId: string): Promise<Church[]> {
    return await this.prisma.church.findMany({
      where: {
        id: { not: excludeChurchId },
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Generate slug from church name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
