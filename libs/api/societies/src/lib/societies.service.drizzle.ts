import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '@ekklesia/database';
import { CreateSocietyDto } from './dto/create-society.dto';
import { SocietyType } from '@ekklesia/shared';
import { UpdateSocietyDto } from './dto/update-society.dto';
import { AddSocietyMemberDto } from './dto/add-society-member.dto';
import { UpdateSocietyMemberDto } from './dto/update-society-member.dto';
import { SocietiesService } from './societies.service';
import { SocietyListResponse } from '@ekklesia/shared';
import { societies, societyMembers, members } from '@ekklesia/database';
import { eq, and, count } from 'drizzle-orm';

@Injectable()
export class SocietiesServiceDrizzle extends SocietiesService {
  constructor(private drizzle: DrizzleService) {
    super();
  }

  async create(createSocietyDto: CreateSocietyDto): Promise<any> {
    try {
      const [society] = await this.drizzle.db
        .insert(societies)
        .values({
          ...createSocietyDto,
        })
        .returning();

      return society;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to create society',
        error,
      });
    }
  }

  async findAll(churchId: string, includeInactive = false, page = 1, limit = 10): Promise<SocietyListResponse> {
    const conditions = includeInactive ? [] : [eq(societies.isActive, true)];
    const whereClause = and(eq(societies.churchId, churchId), ...conditions);

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get paginated data
    const data = await this.drizzle.db
      .select()
      .from(societies)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await this.drizzle.db
      .select({ count: count() })
      .from(societies)
      .where(whereClause);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return {
      data: data as any[], // Type assertion to bypass compile-time type checking
      total,
      page,
      limit,
      totalPages
    };
  }

  async findOne(id: string): Promise<any> {
    const result = await this.drizzle.db
      .select()
      .from(societies)
      .where(eq(societies.id, id));

    if (!result.length) {
      throw new NotFoundException(`Society with ID ${id} not found`);
    }

    return result[0];
  }

  async findByType(churchId: string, type: SocietyType): Promise<any[]> {
    return this.drizzle.db
      .select()
      .from(societies)
      .where(and(eq(societies.churchId, churchId), eq(societies.type, type)));
  }

  async update(id: string, updateSocietyDto: UpdateSocietyDto): Promise<any> {
    try {
      const [updatedSociety] = await this.drizzle.db
        .update(societies)
        .set(updateSocietyDto)
        .where(eq(societies.id, id))
        .returning();

      if (!updatedSociety) {
        throw new NotFoundException(`Society with ID ${id} not found`);
      }

      return updatedSociety;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to update society',
        error,
      });
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const [deletedSociety] = await this.drizzle.db
        .delete(societies)
        .where(eq(societies.id, id))
        .returning();

      if (!deletedSociety) {
        throw new NotFoundException(`Society with ID ${id} not found`);
      }

      return deletedSociety;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to remove society',
        error,
      });
    }
  }

  // Society Members Implementation
  async addMember(societyId: string, addSocietyMemberDto: AddSocietyMemberDto): Promise<any> {
    try {
      const [member] = await this.drizzle.db
        .insert(societyMembers)
        .values({
          societyId,
          ...addSocietyMemberDto,
        })
        .returning();

      return member;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to add member to society',
        error,
      });
    }
  }

  async updateMember(societyId: string, memberId: string, updateSocietyMemberDto: UpdateSocietyMemberDto): Promise<any> {
    try {
      const [updatedMember] = await this.drizzle.db
        .update(societyMembers)
        .set(updateSocietyMemberDto)
        .where(and(eq(societyMembers.societyId, societyId), eq(societyMembers.memberId, memberId)))
        .returning();

      if (!updatedMember) {
        throw new NotFoundException(`Member with ID ${memberId} not found in society ${societyId}`);
      }

      return updatedMember;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to update member in society',
        error,
      });
    }
  }

  async removeMember(societyId: string, memberId: string): Promise<any> {
    try {
      const [removedMember] = await this.drizzle.db
        .delete(societyMembers)
        .where(and(eq(societyMembers.societyId, societyId), eq(societyMembers.memberId, memberId)))
        .returning();

      if (!removedMember) {
        throw new NotFoundException(`Member with ID ${memberId} not found in society ${societyId}`);
      }

      return removedMember;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to remove member from society',
        error,
      });
    }
  }

  async getMembers(societyId: string, includeInactive = false): Promise<any[]> {
    const conditions = includeInactive ? [] : [eq(societyMembers.isActive, true)];
    return this.drizzle.db
      .select()
      .from(societyMembers)
      .where(and(eq(societyMembers.societyId, societyId), ...conditions));
  }

  async getMemberSocieties(memberId: string, includeInactive = false): Promise<any[]> {
    const conditions = includeInactive ? [] : [eq(societyMembers.isActive, true)];
    return this.drizzle.db
      .select()
      .from(societyMembers)
      .where(and(eq(societyMembers.memberId, memberId), ...conditions));
  }
}
