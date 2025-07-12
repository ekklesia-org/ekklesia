import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '@ekklesia/database';
import { members } from '@ekklesia/database';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { eq, and, count } from 'drizzle-orm';

@Injectable()
export class MembersService {
  constructor(private drizzle: DrizzleService) {}

  /**
   * Create a new member
   */
  async create(createMemberDto: CreateMemberDto): Promise<any> {
    try {
      // Convert date strings to Date objects
      const memberData: any = {
        ...createMemberDto,
        dateOfBirth: createMemberDto.dateOfBirth ? new Date(createMemberDto.dateOfBirth) : undefined,
        baptismDate: createMemberDto.baptismDate ? new Date(createMemberDto.baptismDate) : undefined,
        memberSince: createMemberDto.memberSince ? new Date(createMemberDto.memberSince) : undefined,
      };
      
      const [member] = await this.drizzle.db
        .insert(members)
        .values(memberData)
        .returning();
      return member;
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to create member: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.member.create_failed'
      });
    }
  }

  /**
   * Get all members with pagination
   */
  async findAll(page = 1, limit = 10, churchId: string | null = null): Promise<{ members: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    
    // Build where conditions
    const conditions = [];
    if (churchId) {
      conditions.push(eq(members.churchId, churchId));
    }

    // Get members
    const membersList = await this.drizzle.db
      .select()
      .from(members)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await this.drizzle.db
      .select({ count: count() })
      .from(members)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = countResult[0]?.count || 0;

    return {
      members: membersList,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a member by ID
   */
  async findOne(id: string): Promise<any> {
    const result = await this.drizzle.db
      .select()
      .from(members)
      .where(eq(members.id, id))
      .limit(1);

    if (!result.length) {
      throw new NotFoundException({
        message: `Member with ID "${id}" not found`,
        translationKey: 'errors.member.not_found'
      });
    }

    return result[0];
  }

  /**
   * Update a member
   */
  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<any> {
    try {
      // Convert date strings to Date objects if present
      const updateData: any = {
        ...updateMemberDto,
        updatedAt: new Date()
      };
      
      if (updateMemberDto.dateOfBirth !== undefined) {
        updateData.dateOfBirth = updateMemberDto.dateOfBirth ? new Date(updateMemberDto.dateOfBirth) : undefined;
      }
      if (updateMemberDto.baptismDate !== undefined) {
        updateData.baptismDate = updateMemberDto.baptismDate ? new Date(updateMemberDto.baptismDate) : undefined;
      }
      if (updateMemberDto.memberSince !== undefined) {
        updateData.memberSince = updateMemberDto.memberSince ? new Date(updateMemberDto.memberSince) : undefined;
      }
      
      const [updatedMember] = await this.drizzle.db
        .update(members)
        .set(updateData)
        .where(eq(members.id, id))
        .returning();
      
      if (!updatedMember) {
        throw new NotFoundException({
          message: `Member with ID "${id}" not found`,
          translationKey: 'errors.member.not_found'
        });
      }
      
      return updatedMember;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: `Failed to update member: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.member.update_failed'
      });
    }
  }

  /**
   * Delete a member (soft delete by setting status to INACTIVE)
   */
  async remove(id: string): Promise<any> {
    try {
      const [updatedMember] = await this.drizzle.db
        .update(members)
        .set({ 
          status: 'INACTIVE',
          updatedAt: new Date()
        })
        .where(eq(members.id, id))
        .returning();
      
      if (!updatedMember) {
        throw new NotFoundException({
          message: `Member with ID "${id}" not found`,
          translationKey: 'errors.member.not_found'
        });
      }
      
      return updatedMember;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: `Failed to delete member: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.member.delete_failed'
      });
    }
  }

  /**
   * Permanently delete a member
   */
  async hardDelete(id: string): Promise<void> {
    try {
      const result = await this.drizzle.db
        .delete(members)
        .where(eq(members.id, id));
      
      if (!result.rowCount || result.rowCount === 0) {
        throw new NotFoundException({
          message: `Member with ID "${id}" not found`,
          translationKey: 'errors.member.not_found'
        });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: `Failed to permanently delete member: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.member.delete_failed'
      });
    }
  }
}

