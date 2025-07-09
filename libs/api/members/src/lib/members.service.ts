import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@ekklesia/database/lib/database.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from '@ekklesia/prisma';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new member
   */
  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    try {
      const member = await this.prisma.member.create({
        data: createMemberDto,
      });
      return member;
    } catch (error) {
      throw new BadRequestException(`Failed to create member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all members with pagination
   */
  async findAll(page = 1, limit = 10, churchId: string | null = null): Promise<{ members: Member[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const where = churchId ? { churchId } : {};

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      members,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a member by ID
   */
  async findOne(id: string): Promise<Member> {
    const member = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID "${id}" not found`);
    }

    return member;
  }

  /**
   * Update a member
   */
  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    try {
      const member = await this.prisma.member.update({
        where: { id },
        data: updateMemberDto,
      });
      return member;
    } catch (error) {
      throw new BadRequestException(`Failed to update member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a member (soft delete by setting status to INACTIVE)
   */
  async remove(id: string): Promise<Member> {
    try {
      const member = await this.prisma.member.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });
      return member;
    } catch (error) {
      throw new BadRequestException(`Failed to delete member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Permanently delete a member
   */
  async hardDelete(id: string): Promise<void> {
    try {
      await this.prisma.member.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to permanently delete member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

