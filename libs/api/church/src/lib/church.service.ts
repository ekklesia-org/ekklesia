import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@ekklesia/database/lib/database.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { CreateChurchSettingsDto, UpdateChurchSettingsDto } from './dto/church-settings.dto';
import { Church, ChurchSettings } from '@ekklesia/prisma';

@Injectable()
export class ChurchService {
  constructor(private prisma: PrismaService) {}

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
      throw new BadRequestException(`Church with slug "${finalSlug}" already exists`);
    }

    // Check if email already exists
    const existingEmailChurch = await this.prisma.church.findUnique({
      where: { email: createChurchDto.email }
    });

    if (existingEmailChurch) {
      throw new BadRequestException(`Church with email "${createChurchDto.email}" already exists`);
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
      throw new BadRequestException(`Failed to create church: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      throw new NotFoundException(`Church with ID "${id}" not found`);
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
      throw new NotFoundException(`Church with slug "${slug}" not found`);
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
        throw new BadRequestException(`Church with slug "${slug}" already exists`);
      }
    }

    // If email is being updated, check if it already exists
    if (updateChurchDto.email && updateChurchDto.email !== existingChurch.email) {
      const existingEmailChurch = await this.prisma.church.findUnique({
        where: { email: updateChurchDto.email }
      });

      if (existingEmailChurch && existingEmailChurch.id !== id) {
        throw new BadRequestException(`Church with email "${updateChurchDto.email}" already exists`);
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
      throw new BadRequestException(`Failed to update church: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a church (soft delete by setting isActive to false)
   */
  async remove(id: string): Promise<Church & { userCount: number }> {
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
      throw new BadRequestException(`Failed to delete church: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Permanently delete a church
   */
  async hardDelete(id: string): Promise<void> {
    try {
      await this.prisma.church.delete({
        where: { id }
      });
    } catch (error) {
      throw new BadRequestException(`Failed to permanently delete church: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      throw new BadRequestException(`Settings for church "${createSettingsDto.churchId}" already exist`);
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
      throw new BadRequestException(`Failed to create church settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      throw new NotFoundException(`Settings for church "${churchId}" not found`);
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
      throw new BadRequestException(`Failed to update church settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      throw new NotFoundException(`Settings for church "${churchId}" not found`);
    }

    return settings;
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
