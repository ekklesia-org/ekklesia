import { DrizzleService, withTimestamps, withUpdateTimestamp } from '@ekklesia/database';
import { churches, churchSettings, users } from '@ekklesia/database';
import { eq, and, count, desc, like, or, ne } from 'drizzle-orm';
import { ChurchSettingsSchema } from '../schemas/church';
import { ChurchValidator } from '../utils/church.validation';
import {
  ChurchNotFoundError,
  ChurchAlreadyExistsError,
  ChurchSettingsNotFoundError,
  ChurchCannotBeDeletedError,
  ChurchValidationError,
  LastActiveChurchError,
  ChurchTransferError,
  ChurchDatabaseError,
  ChurchBusinessRuleError,
  ChurchSettingsValidationError
} from '../errors/church.errors';

export interface CreateChurchDto {
  name: string;
  slug?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  logoUrl?: string;
  taxId?: string;
  isActive?: boolean;
}

export interface UpdateChurchDto {
  name?: string;
  slug?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  logoUrl?: string;
  taxId?: string;
  isActive?: boolean;
}

export interface ChurchListQueryDto {
  page?: number;
  limit?: number;
  includeInactive?: boolean;
  search?: string;
}

export interface ChurchSettingsDto {
  timezone?: string;
  currency?: string;
  fiscalYear?: string;
  enabledModules?: string[];
  enableOCR?: boolean;
  ocrApiKey?: string;
  bankName?: string;
  accountNumber?: string;
}

export class ChurchesService {
  private drizzleService: DrizzleService;

  constructor() {
    this.drizzleService = new DrizzleService();
  }

  /**
   * Transfer all super admin users from one church to another
   */
  async transferSuperAdmins(fromChurchId: string, toChurchId: string): Promise<void> {
    try {
      // Validate transfer rules
      await this.validateTransferRules(fromChurchId, toChurchId);

      await this.drizzleService.db
        .update(users)
        .set({ churchId: toChurchId, updatedAt: new Date() })
        .where(and(eq(users.role, 'SUPER_ADMIN'), eq(users.churchId, fromChurchId)));
    } catch (error) {
      if (error instanceof ChurchTransferError) {
        throw error;
      }
      throw new ChurchDatabaseError('transfer super admins', error);
    }
  }

  /**
   * Transfer all users from one church to another
   */
  async transferAllUsers(fromChurchId: string, toChurchId: string): Promise<void> {
    try {
      // Validate transfer rules
      await this.validateTransferRules(fromChurchId, toChurchId);

      await this.drizzleService.db
        .update(users)
        .set({ churchId: toChurchId, updatedAt: new Date() })
        .where(eq(users.churchId, fromChurchId));
    } catch (error) {
      if (error instanceof ChurchTransferError) {
        throw error;
      }
      throw new ChurchDatabaseError('transfer all users', error);
    }
  }

  /**
   * Get list of active churches excluding the current one
   */
  async getAvailableForTransfer(currentChurchId: string): Promise<any[]> {
    try {
      const results = await this.drizzleService.db
        .select()
        .from(churches)
        .where(and(eq(churches.isActive, true), ne(churches.id, currentChurchId)));

      return results;
    } catch (error) {
      throw new ChurchDatabaseError('get available churches', error);
    }
  }

  /**
   * Validate if church can be deleted (no super admins, not last active church)
   */
  async canDelete(churchId: string): Promise<boolean> {
    try {
      // Check super admins
      const superAdmins = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .where(and(eq(users.role, 'SUPER_ADMIN'), eq(users.churchId, churchId)));

      if (Number(superAdmins[0]?.count || 0) > 0) {
        throw new ChurchCannotBeDeletedError('super admins exist');
      }

      // Check if it's the last active church
      const activeChurches = await this.drizzleService.db
        .select({ count: count() })
        .from(churches)
        .where(eq(churches.isActive, true));

      if (Number(activeChurches[0]?.count || 0) <= 1) {
        throw new LastActiveChurchError();
      }

      return true;
    } catch (error) {
      if (error instanceof ChurchValidationError || error instanceof LastActiveChurchError) {
        throw error;
      }
      throw new ChurchDatabaseError('validate church deletion', error);
    }
  }

  /**
   * Get church settings or create default if not exist
   */
  async getSettings(churchId: string): Promise<any> {
    try {
      const result = await this.drizzleService.db
        .select()
        .from(churchSettings)
        .where(eq(churchSettings.churchId, churchId))
        .limit(1);

      if (result.length === 0) {
        return this.createDefaultSettings(churchId);
      }

      return result[0];
    } catch (error) {
      throw new ChurchDatabaseError('get church settings', error);
    }
  }

  /**
   * Update church settings
   */
  async updateSettings(churchId: string, updatedSettings: ChurchSettingsDto): Promise<any> {
    try {
      ChurchValidator.validateChurchSettings(updatedSettings);
      const settings = ChurchSettingsSchema.parse(updatedSettings);
      const [updated] = await this.drizzleService.db
        .update(churchSettings)
        .set(withUpdateTimestamp(settings))
        .where(eq(churchSettings.churchId, churchId))
        .returning();

      if (!updated) {
        throw new ChurchSettingsNotFoundError(churchId);
      }

      return updated;
    } catch (error) {
      if (error instanceof ChurchSettingsValidationError || error instanceof ChurchSettingsNotFoundError) {
        throw error;
      }
      throw new ChurchDatabaseError('update church settings', error);
    }
  }

  /**
   * Create default church settings
   */
  async createDefaultSettings(churchId: string): Promise<any> {
    try {
      const [defaultSettings] = await this.drizzleService.db
        .insert(churchSettings)
        .values(withTimestamps({
          churchId,
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          fiscalYear: 'calendar',
          enableOCR: false,
        }))
        .returning();

      return defaultSettings;
    } catch (error) {
      throw new ChurchDatabaseError('create default church settings', error);
    }
  }

  /**
   * Generate a URL-friendly slug from a church name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Check if a slug already exists for another church
   */
  private async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(churches.slug, slug)];
    
    if (excludeId) {
      conditions.push(ne(churches.id, excludeId));
    }

    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(churches)
      .where(excludeId ? and(eq(churches.slug, slug), ne(churches.id, excludeId)) : eq(churches.slug, slug));

    return Number(result[0]?.count || 0) > 0;
  }

  /**
   * Check if an email already exists for another church
   */
  private async isEmailTaken(email: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(churches.email, email)];
    
    if (excludeId) {
      conditions.push(ne(churches.id, excludeId));
    }

    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(churches)
      .where(excludeId ? and(eq(churches.email, email), ne(churches.id, excludeId)) : eq(churches.email, email));

    return Number(result[0]?.count || 0) > 0;
  }

  /**
   * Generate a unique slug for a church
   */
  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    let baseSlug = this.generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.isSlugTaken(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Validate church data for duplicate constraints
   */
  private async validateChurchConstraints(
    data: CreateChurchDto | UpdateChurchDto, 
    excludeId?: string
  ): Promise<void> {
    const errors: string[] = [];

    // Check email uniqueness
    if (data.email && await this.isEmailTaken(data.email, excludeId)) {
      errors.push('A church with this email already exists');
    }

    // Check slug uniqueness if provided
    if (data.slug && await this.isSlugTaken(data.slug, excludeId)) {
      errors.push('A church with this slug already exists');
    }

    if (errors.length > 0) {
      throw new ChurchAlreadyExistsError(
        errors.includes('email') ? 'email' : 'slug',
        data.email || data.slug || ''
      );
    }
  }

  /**
   * Create a new church
   */
  async create(createChurchDto: CreateChurchDto): Promise<any> {
    try {
      // Validate church data
      ChurchValidator.validateCreateChurch(createChurchDto);

      // Validate constraints
      await this.validateChurchConstraints(createChurchDto);

      // Generate slug if not provided
      const slug = createChurchDto.slug || await this.generateUniqueSlug(createChurchDto.name);

      // Create church
      const [newChurch] = await this.drizzleService.db
        .insert(churches)
        .values(withTimestamps({
          name: createChurchDto.name,
          slug,
          email: createChurchDto.email,
          phone: createChurchDto.phone,
          address: createChurchDto.address,
          city: createChurchDto.city,
          state: createChurchDto.state,
          zipCode: createChurchDto.zipCode,
          website: createChurchDto.website,
          logoUrl: createChurchDto.logoUrl,
          taxId: createChurchDto.taxId,
          isActive: createChurchDto.isActive !== undefined ? createChurchDto.isActive : true,
        }))
        .returning();

      // Create default church settings
      await this.drizzleService.db
        .insert(churchSettings)
        .values(withTimestamps({
          churchId: newChurch.id,
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          fiscalYear: 'calendar',
          enableOCR: false,
        }));

      // Return church with settings
      return this.findOne(newChurch.id);
    } catch (error) {
      if (error instanceof ChurchValidationError || error instanceof ChurchAlreadyExistsError) {
        throw error;
      }
      throw new ChurchDatabaseError('create church', error);
    }
  }

  /**
   * Retrieve all churches with pagination
   */
  async findAll(query: ChurchListQueryDto = {}): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      includeInactive = false,
      search
    } = query;

    const offset = (page - 1) * limit;

    try {
      // Build where conditions
      const conditions = [];

      if (!includeInactive) {
        conditions.push(eq(churches.isActive, true));
      }

      if (search) {
        conditions.push(
          or(
            like(churches.name, `%${search}%`),
            like(churches.email, `%${search}%`),
            like(churches.slug, `%${search}%`)
          )
        );
      }

      // Get churches with settings
      const churchesList = await this.drizzleService.db
        .select({
          church: churches,
          settings: churchSettings,
        })
        .from(churches)
        .leftJoin(churchSettings, eq(churches.id, churchSettings.churchId))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(churches.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const countResult = await this.drizzleService.db
        .select({ count: count() })
        .from(churches)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = countResult[0]?.count || 0;

      // Format results
      const formattedChurches = churchesList.map(result => ({
        ...result.church,
        settings: result.settings || null,
      }));

      return {
        data: formattedChurches,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new ChurchDatabaseError('fetch churches list', error);
    }
  }

  /**
   * Retrieve a church by ID
   */
  async findOne(id: string): Promise<any> {
    try {
      const result = await this.drizzleService.db
        .select({
          church: churches,
          settings: churchSettings,
        })
        .from(churches)
        .leftJoin(churchSettings, eq(churches.id, churchSettings.churchId))
        .where(eq(churches.id, id))
        .limit(1);

      if (!result.length) {
        throw new ChurchNotFoundError(id);
      }

      const { church, settings } = result[0];
      return {
        ...church,
        settings: settings || null,
      };
    } catch (error) {
      if (error instanceof ChurchNotFoundError) {
        throw error;
      }
      throw new ChurchDatabaseError('fetch church by ID', error);
    }
  }

  /**
   * Retrieve a church by slug
   */
  async findBySlug(slug: string): Promise<any> {
    try {
      const result = await this.drizzleService.db
        .select({
          church: churches,
          settings: churchSettings,
        })
        .from(churches)
        .leftJoin(churchSettings, eq(churches.id, churchSettings.churchId))
        .where(eq(churches.slug, slug))
        .limit(1);

      if (!result.length) {
        throw new ChurchNotFoundError(slug, 'slug');
      }

      const { church, settings } = result[0];
      return {
        ...church,
        settings: settings || null,
      };
    } catch (error) {
      if (error instanceof ChurchNotFoundError) {
        throw error;
      }
      throw new ChurchDatabaseError('fetch church by slug', error);
    }
  }

  /**
   * Update a church
   */
  async update(id: string, updateChurchDto: UpdateChurchDto): Promise<any> {
    try {
      ChurchValidator.validateUpdateChurch(updateChurchDto);

      // Check if church exists
      await this.findOne(id);

      // Validate constraints (excluding current church)
      await this.validateChurchConstraints(updateChurchDto, id);

      // Generate new slug if name is being updated and slug is not provided
      let slug = updateChurchDto.slug;
      if (updateChurchDto.name && !updateChurchDto.slug) {
        slug = await this.generateUniqueSlug(updateChurchDto.name, id);
      }

      // Update church
      const [updatedChurch] = await this.drizzleService.db
        .update(churches)
        .set(withUpdateTimestamp({
          ...updateChurchDto,
          slug,
        }))
        .where(eq(churches.id, id))
        .returning();

      if (!updatedChurch) {
        throw new ChurchNotFoundError(id);
      }

      // Return updated church with settings
      return this.findOne(id);
    } catch (error) {
      if (error instanceof ChurchValidationError || error instanceof ChurchNotFoundError) {
        throw error;
      }
      throw new ChurchDatabaseError('update church', error);
    }
  }

  /**
   * Remove a church (soft delete)
   */
  async remove(id: string): Promise<any> {
    try {
      const [updatedChurch] = await this.drizzleService.db
        .update(churches)
        .set(withUpdateTimestamp({
          isActive: false,
        }))
        .where(eq(churches.id, id))
        .returning();

      if (!updatedChurch) {
        throw new ChurchNotFoundError(id);
      }

      return updatedChurch;
    } catch (error) {
      if (error instanceof ChurchNotFoundError) {
        throw error;
      }
      throw new ChurchDatabaseError('remove (soft delete) church', error);
    }
  }

  /**
   * Soft delete a church (mark as inactive)
   */
  async softDelete(id: string): Promise<any> {
    try {
      const [updatedChurch] = await this.drizzleService.db
        .update(churches)
        .set(withUpdateTimestamp({
          isActive: false,
        }))
        .where(eq(churches.id, id))
        .returning();

      if (!updatedChurch) {
        throw new ChurchNotFoundError(id);
      }

      return updatedChurch;
    } catch (error) {
      if (error instanceof ChurchNotFoundError) {
        throw error;
      }
      throw new ChurchDatabaseError('soft delete church', error);
    }
  }

  /**
   * Permanently delete a church
   */
  async hardDelete(id: string): Promise<void> {
    try {
      const result = await this.drizzleService.db
        .delete(churches)
        .where(eq(churches.id, id));

      if (!result.rowCount || result.rowCount === 0) {
        throw new ChurchNotFoundError(id);
      }
    } catch (error) {
      if (error instanceof ChurchNotFoundError) {
        throw error;
      }
      throw new ChurchDatabaseError('delete church', error);
    }
  }

  /**
   * Activate a church
   */
  async activate(id: string): Promise<any> {
    try {
      const [updatedChurch] = await this.drizzleService.db
        .update(churches)
        .set(withUpdateTimestamp({
          isActive: true,
        }))
        .where(eq(churches.id, id))
        .returning();

      if (!updatedChurch) {
        throw new ChurchNotFoundError(id);
      }

      return updatedChurch;
    } catch (error) {
      if (error instanceof ChurchNotFoundError) {
        throw error;
      }
      throw new ChurchDatabaseError('activate church', error);
    }
  }

  /**
   * Deactivate a church
   */
  async deactivate(id: string): Promise<any> {
    try {
      ChurchValidator.validateBusinessRules.canDeactivateChurch(await this.isLastActiveChurch(id));

      const [updatedChurch] = await this.drizzleService.db
        .update(churches)
        .set(withUpdateTimestamp({
          isActive: false,
        }))
        .where(eq(churches.id, id))
        .returning();

      if (!updatedChurch) {
        throw new ChurchNotFoundError(id);
      }

      return updatedChurch;
    } catch (error) {
      if (error instanceof ChurchBusinessRuleError || error instanceof ChurchNotFoundError) {
        throw error;
      }
      throw new ChurchDatabaseError('deactivate church', error);
    }
  }

  /**
   * Helper method to validate transfer rules
   */
  private async validateTransferRules(fromChurchId: string, toChurchId: string): Promise<void> {
    try {
      // Check if source church exists
      const fromChurch = await this.drizzleService.db
        .select()
        .from(churches)
        .where(eq(churches.id, fromChurchId))
        .limit(1);

      // Check if target church exists and is active
      const toChurch = await this.drizzleService.db
        .select()
        .from(churches)
        .where(eq(churches.id, toChurchId))
        .limit(1);

      ChurchValidator.validateBusinessRules.canTransferUsers(
        fromChurch.length > 0,
        toChurch.length > 0,
        toChurch.length > 0 && toChurch[0].isActive
      );
    } catch (error) {
      if (error instanceof ChurchBusinessRuleError) {
        throw new ChurchTransferError(error.message, error.details);
      }
      throw new ChurchDatabaseError('validate transfer rules', error);
    }
  }

  /**
   * Helper method to check if this is the last active church
   */
  private async isLastActiveChurch(churchId: string): Promise<boolean> {
    try {
      const activeChurches = await this.drizzleService.db
        .select({ count: count() })
        .from(churches)
        .where(eq(churches.isActive, true));

      const currentChurch = await this.drizzleService.db
        .select()
        .from(churches)
        .where(eq(churches.id, churchId))
        .limit(1);

      // If current church is not active, it's not the last active church
      if (!currentChurch.length || !currentChurch[0].isActive) {
        return false;
      }

      return Number(activeChurches[0]?.count || 0) <= 1;
    } catch (error) {
      throw new ChurchDatabaseError('check if last active church', error);
    }
  }
}
