import { DrizzleService, withTimestamps, withUpdateTimestamp } from '@ekklesia/database';
import { churches, churchSettings } from '@ekklesia/database';
import { eq, and, count, desc, like, or } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { ChurchSettingsSchema } from '../schemas/church';

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
      throw new HTTPException(400, {
        message: `Failed to get church settings: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Update church settings
   */
  async updateSettings(churchId: string, updatedSettings: ChurchSettingsDto): Promise<any> {
    try {
      const settings = ChurchSettingsSchema.parse(updatedSettings);
      const [updated] = await this.drizzleService.db
        .update(churchSettings)
        .set(withUpdateTimestamp(settings))
        .where(eq(churchSettings.churchId, churchId))
        .returning();

      if (!updated) {
        throw new HTTPException(404, {
          message: `Settings for church with ID "${churchId}" not found`
        });
      }

      return updated;
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to update church settings: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
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
      throw new HTTPException(400, {
        message: `Failed to create default church settings: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
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
      conditions.push(eq(churches.id, excludeId));
    }

    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(churches)
      .where(excludeId ? and(eq(churches.slug, slug), eq(churches.id, excludeId)) : eq(churches.slug, slug));

    return Number(result[0]?.count || 0) > 0;
  }

  /**
   * Check if an email already exists for another church
   */
  private async isEmailTaken(email: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(churches.email, email)];
    
    if (excludeId) {
      conditions.push(eq(churches.id, excludeId));
    }

    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(churches)
      .where(excludeId ? and(eq(churches.email, email), eq(churches.id, excludeId)) : eq(churches.email, email));

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
      throw new HTTPException(400, {
        message: errors.join(', ')
      });
    }
  }

  /**
   * Create a new church
   */
  async create(createChurchDto: CreateChurchDto): Promise<any> {
    try {
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
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to create church: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
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
      throw new HTTPException(400, {
        message: `Failed to fetch churches: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
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
        throw new HTTPException(404, {
          message: `Church with ID "${id}" not found`
        });
      }

      const { church, settings } = result[0];
      return {
        ...church,
        settings: settings || null,
      };
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to fetch church: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
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
        throw new HTTPException(404, {
          message: `Church with slug "${slug}" not found`
        });
      }

      const { church, settings } = result[0];
      return {
        ...church,
        settings: settings || null,
      };
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to fetch church: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Update a church
   */
  async update(id: string, updateChurchDto: UpdateChurchDto): Promise<any> {
    try {
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
        throw new HTTPException(404, {
          message: `Church with ID "${id}" not found`
        });
      }

      // Return updated church with settings
      return this.findOne(id);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to update church: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
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
        throw new HTTPException(404, {
          message: `Church with ID "${id}" not found`
        });
      }

      return updatedChurch;
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to remove church: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
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
        throw new HTTPException(404, {
          message: `Church with ID "${id}" not found`
        });
      }

      return updatedChurch;
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to soft delete church: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
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
        throw new HTTPException(404, {
          message: `Church with ID "${id}" not found`
        });
      }
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to delete church: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
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
        throw new HTTPException(404, {
          message: `Church with ID "${id}" not found`
        });
      }

      return updatedChurch;
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to activate church: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Deactivate a church
   */
  async deactivate(id: string): Promise<any> {
    try {
      const [updatedChurch] = await this.drizzleService.db
        .update(churches)
        .set(withUpdateTimestamp({
          isActive: false,
        }))
        .where(eq(churches.id, id))
        .returning();

      if (!updatedChurch) {
        throw new HTTPException(404, {
          message: `Church with ID "${id}" not found`
        });
      }

      return updatedChurch;
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to deactivate church: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
}
