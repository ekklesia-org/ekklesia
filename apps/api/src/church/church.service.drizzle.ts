import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleService, withTimestamps, withUpdateTimestamp } from '@ekklesia/database';
import { churches, churchSettings, users } from '@ekklesia/database';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { CreateChurchSettingsDto, UpdateChurchSettingsDto } from './dto/church-settings.dto';
import { eq, and, desc, ne, count, sql } from 'drizzle-orm';
import { ChurchService } from './church.service';

@Injectable()
export class ChurchServiceDrizzle extends ChurchService {
  constructor(private drizzle: DrizzleService) {
    super();
  }

  /**
   * Create a new church
   */
  async create(createChurchDto: CreateChurchDto): Promise<any> {
    const { slug, ...churchData } = createChurchDto;

    // Generate slug if not provided
    const finalSlug = slug || this.generateSlug(createChurchDto.name);

    // Check if slug already exists
    const existingChurch = await this.drizzle.db
      .select()
      .from(churches)
      .where(eq(churches.slug, finalSlug))
      .limit(1);

    if (existingChurch.length > 0) {
      throw new BadRequestException({
        message: `Church with slug "${finalSlug}" already exists`,
        translationKey: 'errors.church.slug_already_exists'
      });
    }

    // Check if email already exists
    const existingEmailChurch = await this.drizzle.db
      .select()
      .from(churches)
      .where(eq(churches.email, createChurchDto.email))
      .limit(1);

    if (existingEmailChurch.length > 0) {
      throw new BadRequestException({
        message: `Church with email "${createChurchDto.email}" already exists`,
        translationKey: 'errors.church.email_already_exists'
      });
    }

    try {
      const [church] = await this.drizzle.db
        .insert(churches)
        .values(withTimestamps({
          ...churchData,
          slug: finalSlug,
          isActive: churchData.isActive ?? true,
        }))
        .returning();

      // Get church with relations
      const result = await this.drizzle.db
        .select({
          church: churches,
          settings: churchSettings,
          user: users,
        })
        .from(churches)
        .leftJoin(churchSettings, eq(churches.id, churchSettings.churchId))
        .leftJoin(users, eq(churches.id, users.churchId))
        .where(eq(churches.id, church.id));

      // Group users
      const churchWithRelations = {
        ...result[0]?.church,
        settings: result[0]?.settings,
        users: result.filter(r => r.user).map(r => r.user),
      };

      return {
        ...churchWithRelations,
        userCount: churchWithRelations.users.length
      };
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
    churches: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const conditions = [];
    if (!includeInactive) {
      conditions.push(eq(churches.isActive, true));
    }

    // Get churches with user count
    const churchList = await this.drizzle.db
      .select({
        church: churches,
        settings: churchSettings,
        userCount: sql<number>`count(distinct ${users.id})::int`,
      })
      .from(churches)
      .leftJoin(churchSettings, eq(churches.id, churchSettings.churchId))
      .leftJoin(users, eq(churches.id, users.churchId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(churches.id, churchSettings.id)
      .orderBy(desc(churches.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await this.drizzle.db
      .select({ count: count() })
      .from(churches)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = countResult[0]?.count || 0;

    // Format results
    const churchesWithUserCount = churchList.map(result => ({
      ...result.church,
      settings: result.settings,
      userCount: result.userCount || 0
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
  async findOne(id: string): Promise<any> {
    const result = await this.drizzle.db
      .select({
        church: churches,
        settings: churchSettings,
        user: users,
      })
      .from(churches)
      .leftJoin(churchSettings, eq(churches.id, churchSettings.churchId))
      .leftJoin(users, eq(churches.id, users.churchId))
      .where(eq(churches.id, id));

    if (!result.length || !result[0].church) {
      throw new NotFoundException({
        message: `Church with ID "${id}" not found`,
        translationKey: 'errors.church.not_found'
      });
    }

    // Group users
    const church = result[0].church;
    const settings = result[0].settings;
    const userList = result.filter(r => r.user).map(r => {
      const user = r.user;
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      };
    }).filter(Boolean);

    return {
      ...church,
      settings,
      users: userList,
      userCount: userList.length
    };
  }

  /**
   * Get a church by slug
   */
  async findBySlug(slug: string): Promise<any> {
    const result = await this.drizzle.db
      .select({
        church: churches,
        settings: churchSettings,
        user: users,
      })
      .from(churches)
      .leftJoin(churchSettings, eq(churches.id, churchSettings.churchId))
      .leftJoin(users, eq(churches.id, users.churchId))
      .where(eq(churches.slug, slug));

    if (!result.length || !result[0].church) {
      throw new NotFoundException({
        message: `Church with slug "${slug}" not found`,
        translationKey: 'errors.church.not_found'
      });
    }

    // Group users
    const church = result[0].church;
    const settings = result[0].settings;
    const userList = result.filter(r => r.user).map(r => {
      const user = r.user;
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      };
    }).filter(Boolean);

    return {
      ...church,
      settings,
      users: userList,
      userCount: userList.length
    };
  }

  /**
   * Update a church
   */
  async update(id: string, updateChurchDto: UpdateChurchDto): Promise<any> {
    const { slug, email, ...updateData } = updateChurchDto;

    // Check if slug already exists (if provided)
    if (slug) {
      const existingSlugChurch = await this.drizzle.db
        .select()
        .from(churches)
        .where(and(
          eq(churches.slug, slug),
          ne(churches.id, id)
        ))
        .limit(1);

      if (existingSlugChurch.length > 0) {
        throw new BadRequestException({
          message: `Church with slug "${slug}" already exists`,
          translationKey: 'errors.church.slug_already_exists'
        });
      }
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmailChurch = await this.drizzle.db
        .select()
        .from(churches)
        .where(and(
          eq(churches.email, email),
          ne(churches.id, id)
        ))
        .limit(1);

      if (existingEmailChurch.length > 0) {
        throw new BadRequestException({
          message: `Church with email "${email}" already exists`,
          translationKey: 'errors.church.email_already_exists'
        });
      }
    }

    try {
      const [updatedChurch] = await this.drizzle.db
        .update(churches)
        .set(withUpdateTimestamp({
          ...updateData,
          slug,
          email,
        }))
        .where(eq(churches.id, id))
        .returning();

      if (!updatedChurch) {
        throw new NotFoundException({
          message: `Church with ID "${id}" not found`,
          translationKey: 'errors.church.not_found'
        });
      }

      // Get church with relations
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: `Failed to update church: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.church.update_failed'
      });
    }
  }

  /**
   * Delete a church (soft delete)
   */
  async remove(id: string): Promise<any> {
    // Check if there are super admins in this church
    const superAdmins = await this.drizzle.db
      .select()
      .from(users)
      .where(and(
        eq(users.churchId, id),
        eq(users.role, 'SUPER_ADMIN'),
        eq(users.isActive, true)
      ));

    if (superAdmins.length > 0) {
      throw new BadRequestException({
        message: 'Cannot delete church with active super admins. Please transfer or remove super admin users first.',
        translationKey: 'errors.church.has_super_admins'
      });
    }

    try {
      const [updatedChurch] = await this.drizzle.db
        .update(churches)
        .set(withUpdateTimestamp({
          isActive: false,
        }))
        .where(eq(churches.id, id))
        .returning();

      if (!updatedChurch) {
        throw new NotFoundException({
          message: `Church with ID "${id}" not found`,
          translationKey: 'errors.church.not_found'
        });
      }

      // Get church with relations
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
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
    // Check if there are super admins in this church
    const superAdmins = await this.drizzle.db
      .select()
      .from(users)
      .where(and(
        eq(users.churchId, id),
        eq(users.role, 'SUPER_ADMIN')
      ));

    if (superAdmins.length > 0) {
      throw new BadRequestException({
        message: 'Cannot delete church with super admins. Please transfer or remove super admin users first.',
        translationKey: 'errors.church.has_super_admins'
      });
    }

    // Check if this is the last active church
    const activeChurchCount = await this.drizzle.db
      .select({ count: count() })
      .from(churches)
      .where(eq(churches.isActive, true));

    if (activeChurchCount[0]?.count === 1) {
      const [churchToDelete] = await this.drizzle.db
        .select()
        .from(churches)
        .where(eq(churches.id, id))
        .limit(1);

      if (churchToDelete?.isActive) {
        throw new BadRequestException({
          message: 'Cannot delete the last active church in the system',
          translationKey: 'errors.church.last_active_church'
        });
      }
    }

    try {
      const result = await this.drizzle.db
        .delete(churches)
        .where(eq(churches.id, id));

      if (!result.rowCount || result.rowCount === 0) {
        throw new NotFoundException({
          message: `Church with ID "${id}" not found`,
          translationKey: 'errors.church.not_found'
        });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: `Failed to permanently delete church: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.church.delete_failed'
      });
    }
  }

  /**
   * Create church settings
   */
  async createSettings(createSettingsDto: CreateChurchSettingsDto): Promise<any> {
    const { churchId } = createSettingsDto;

    // Check if settings already exist for this church
    const existingSettings = await this.drizzle.db
      .select()
      .from(churchSettings)
      .where(eq(churchSettings.churchId, churchId))
      .limit(1);

    if (existingSettings.length > 0) {
      throw new BadRequestException({
        message: `Settings for church with ID "${churchId}" already exist`,
        translationKey: 'errors.church.settings_already_exist'
      });
    }

    try {
      const [settings] = await this.drizzle.db
        .insert(churchSettings)
        .values(withTimestamps(createSettingsDto))
        .returning();

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
  async updateSettings(churchId: string, updateSettingsDto: UpdateChurchSettingsDto): Promise<any> {
    // Check if settings exist for this church
    const existingSettings = await this.drizzle.db
      .select()
      .from(churchSettings)
      .where(eq(churchSettings.churchId, churchId))
      .limit(1);

    if (existingSettings.length === 0) {
      throw new NotFoundException({
        message: `Settings for church with ID "${churchId}" not found`,
        translationKey: 'errors.church.settings_not_found'
      });
    }

    try {
      const [settings] = await this.drizzle.db
        .update(churchSettings)
        .set(withUpdateTimestamp(updateSettingsDto))
        .where(eq(churchSettings.churchId, churchId))
        .returning();

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
  async getSettings(churchId: string): Promise<any> {
    const [settings] = await this.drizzle.db
      .select()
      .from(churchSettings)
      .where(eq(churchSettings.churchId, churchId))
      .limit(1);

    if (!settings) {
      // Return default settings if none exist
      return {
        churchId,
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        fiscalYear: 'calendar',
        enabledModules: [],
        enableOCR: false,
        ocrApiKey: null,
        bankName: null,
        accountNumber: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
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
    const superAdmins = await this.drizzle.db
      .select()
      .from(users)
      .where(and(
        eq(users.churchId, fromChurchId),
        eq(users.role, 'SUPER_ADMIN'),
        eq(users.isActive, true)
      ));

    if (superAdmins.length === 0) {
      return; // No Super Admins to transfer
    }

    // Transfer all Super Admins to the destination church
    await this.drizzle.db
      .update(users)
      .set(withUpdateTimestamp({
        churchId: toChurchId,
      }))
      .where(and(
        eq(users.churchId, fromChurchId),
        eq(users.role, 'SUPER_ADMIN'),
        eq(users.isActive, true)
      ));
  }

  /**
   * Transfer users to another church
   */
  async transferUsers(fromChurchId: string, toChurchId: string): Promise<void> {
    // Check if both churches exist
    const [fromChurch, toChurch] = await Promise.all([
      this.drizzle.db.select().from(churches).where(eq(churches.id, fromChurchId)).limit(1),
      this.drizzle.db.select().from(churches).where(eq(churches.id, toChurchId)).limit(1),
    ]);

    if (fromChurch.length === 0) {
      throw new NotFoundException({
        message: `Source church with ID "${fromChurchId}" not found`,
        translationKey: 'errors.church.source_not_found'
      });
    }

    if (toChurch.length === 0) {
      throw new NotFoundException({
        message: `Destination church with ID "${toChurchId}" not found`,
        translationKey: 'errors.church.destination_not_found'
      });
    }

    // Check for super admins in the source church
    const superAdmins = await this.drizzle.db
      .select()
      .from(users)
      .where(and(
        eq(users.churchId, fromChurchId),
        eq(users.role, 'SUPER_ADMIN')
      ));

    if (superAdmins.length > 0) {
      throw new BadRequestException({
        message: 'Cannot transfer users from a church with super admins',
        translationKey: 'errors.church.source_has_super_admins'
      });
    }

    // Transfer all users
    await this.drizzle.db
      .update(users)
      .set(withUpdateTimestamp({
        churchId: toChurchId,
      }))
      .where(eq(users.churchId, fromChurchId));
  }

  /**
   * Get churches available for transfer (excluding the current one)
   */
  async getChurchesForTransfer(excludeChurchId: string): Promise<any[]> {
    return await this.drizzle.db
      .select()
      .from(churches)
      .where(and(
        ne(churches.id, excludeChurchId),
        eq(churches.isActive, true)
      ));
  }

  /**
   * Generate a slug from church name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  }
}
