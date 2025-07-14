import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '@ekklesia/database';
import { members } from '@ekklesia/database';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { eq, and, count } from 'drizzle-orm';
import { MembersService, Member, PaginatedMembersResult } from './members.service';

// Type definitions for Drizzle operations
type NewMember = typeof members.$inferInsert;

@Injectable()
export class MembersServiceDrizzle extends MembersService {
  constructor(private drizzle: DrizzleService) {
    super();
  }

  /**
   * Create a new member
   */
  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    try {
      // Convert date strings to Date objects
      const memberData = {
        ...createMemberDto,
        dateOfBirth: createMemberDto.dateOfBirth ? new Date(createMemberDto.dateOfBirth) : null,
        baptismDate: createMemberDto.baptismDate ? new Date(createMemberDto.baptismDate) : null,
        memberSince: createMemberDto.memberSince ? new Date(createMemberDto.memberSince) : new Date(),
      } as NewMember;
      
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
  async findAll(page = 1, limit = 10, churchId: string | null = null): Promise<PaginatedMembersResult> {
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
  async findOne(id: string): Promise<Member> {
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
  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    try {
      // Convert date strings to Date objects if present
      const { dateOfBirth, baptismDate, memberSince, ...otherFields } = updateMemberDto;
      const updateData = {
        ...otherFields,
        updatedAt: new Date()
      } as Partial<NewMember>;
      
      // Handle date fields separately
      if (dateOfBirth !== undefined) {
        updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      }

      if (baptismDate !== undefined) {
        updateData.baptismDate = baptismDate ? new Date(baptismDate) : null;
      }

      if (memberSince !== undefined) {
        updateData.memberSince = memberSince ? new Date(memberSince) : undefined;
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
  async remove(id: string): Promise<Member> {
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

  /**
   * Unlink user from member
   */
  async unlinkUser(id: string): Promise<Member> {
    try {
      // First, check if the member exists
      const member = await this.findOne(id);
      
      if (!member.userId) {
        throw new BadRequestException({
          message: 'This member is not linked to any user',
          translationKey: 'errors.member.no_user_linked'
        });
      }

      // Update member to remove userId
      const [updatedMember] = await this.drizzle.db
        .update(members)
        .set({
          userId: null,
          updatedAt: new Date()
        })
        .where(eq(members.id, id))
        .returning();

      return updatedMember;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: `Failed to unlink user from member: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.member.unlink_failed'
      });
    }
  }
}
