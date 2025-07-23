import { DrizzleService } from '@ekklesia/database';
import { societies, societyMembers, members } from '@ekklesia/database';
import { eq, and, count } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import type {
  CreateSocietyInput,
  UpdateSocietyInput,
  AddSocietyMemberInput,
  UpdateSocietyMemberInput,
  Society,
  SocietyMember,
  SocietyListResponse,
  SocietyType
} from '../schemas/societies';

export class SocietiesService {
  private drizzleService: DrizzleService;

  constructor() {
    this.drizzleService = new DrizzleService();
  }

  async create(input: CreateSocietyInput): Promise<Society> {
    try {
      const [society] = await this.drizzleService.db
        .insert(societies)
        .values({
          ...input,
          foundedDate: input.foundedDate || null,
        })
        .returning();

      return society as Society;
    } catch (error) {
      throw new HTTPException(400, {
        message: 'Failed to create society'
      });
    }
  }

  async findAll(
    churchId: string,
    includeInactive = false,
    page = 1,
    limit = 10
  ): Promise<SocietyListResponse> {
    const conditions = includeInactive ? [] : [eq(societies.isActive, true)];
    const whereClause = and(eq(societies.churchId, churchId), ...conditions);

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get paginated data
    const data = await this.drizzleService.db
      .select()
      .from(societies)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await this.drizzleService.db
      .select({ count: count() })
      .from(societies)
      .where(whereClause);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return {
      data: data as Society[],
      total,
      page,
      limit,
      totalPages
    };
  }

  async findOne(id: string): Promise<Society> {
    const result = await this.drizzleService.db
      .select()
      .from(societies)
      .where(eq(societies.id, id));

    if (!result.length) {
      throw new HTTPException(404, {
        message: `Society with ID ${id} not found`
      });
    }

    return result[0] as Society;
  }

  async findByType(churchId: string, type: SocietyType): Promise<Society[]> {
    const result = await this.drizzleService.db
      .select()
      .from(societies)
      .where(and(eq(societies.churchId, churchId), eq(societies.type, type)));

    return result as Society[];
  }

  async update(id: string, input: UpdateSocietyInput): Promise<Society> {
    try {
      const updateData = {
        ...input,
        foundedDate: input.foundedDate || undefined,
      };

      const [updatedSociety] = await this.drizzleService.db
        .update(societies)
        .set(updateData)
        .where(eq(societies.id, id))
        .returning();

      if (!updatedSociety) {
        throw new HTTPException(404, {
          message: `Society with ID ${id} not found`
        });
      }

      return updatedSociety as Society;
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(400, {
        message: 'Failed to update society'
      });
    }
  }

  async remove(id: string): Promise<Society> {
    try {
      const [deletedSociety] = await this.drizzleService.db
        .delete(societies)
        .where(eq(societies.id, id))
        .returning();

      if (!deletedSociety) {
        throw new HTTPException(404, {
          message: `Society with ID ${id} not found`
        });
      }

      return deletedSociety as Society;
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(400, {
        message: 'Failed to remove society'
      });
    }
  }

  // Society Members
  async addMember(societyId: string, input: AddSocietyMemberInput): Promise<SocietyMember> {
    try {
      const [member] = await this.drizzleService.db
        .insert(societyMembers)
        .values({
          societyId,
          ...input,
          joinedDate: input.joinedDate || new Date().toISOString(),
          position: input.position || 'MEMBER',
        })
        .returning();

      // Convert string dates to Date objects for proper typing
      const memberWithDates = {
        ...member,
        joinedDate: new Date(member.joinedDate),
        leftDate: member.leftDate ? new Date(member.leftDate) : null,
      };

      return memberWithDates as SocietyMember;
    } catch (error) {
      throw new HTTPException(400, {
        message: 'Failed to add member to society'
      });
    }
  }

  async updateMember(
    societyId: string,
    memberId: string,
    input: UpdateSocietyMemberInput
  ): Promise<SocietyMember> {
    try {
      const updateData = {
        ...input,
        leftDate: input.leftDate || undefined,
      };

      const [updatedMember] = await this.drizzleService.db
        .update(societyMembers)
        .set(updateData)
        .where(and(
          eq(societyMembers.societyId, societyId),
          eq(societyMembers.memberId, memberId)
        ))
        .returning();

      if (!updatedMember) {
        throw new HTTPException(404, {
          message: `Member with ID ${memberId} not found in society ${societyId}`
        });
      }

      // Convert string dates to Date objects for proper typing
      const memberWithDates = {
        ...updatedMember,
        joinedDate: new Date(updatedMember.joinedDate),
        leftDate: updatedMember.leftDate ? new Date(updatedMember.leftDate) : null,
      };

      return memberWithDates as SocietyMember;
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(400, {
        message: 'Failed to update member in society'
      });
    }
  }

  async removeMember(societyId: string, memberId: string): Promise<SocietyMember> {
    try {
      const [removedMember] = await this.drizzleService.db
        .delete(societyMembers)
        .where(and(
          eq(societyMembers.societyId, societyId),
          eq(societyMembers.memberId, memberId)
        ))
        .returning();

      if (!removedMember) {
        throw new HTTPException(404, {
          message: `Member with ID ${memberId} not found in society ${societyId}`
        });
      }

      // Convert string dates to Date objects for proper typing
      const memberWithDates = {
        ...removedMember,
        joinedDate: new Date(removedMember.joinedDate),
        leftDate: removedMember.leftDate ? new Date(removedMember.leftDate) : null,
      };

      return memberWithDates as SocietyMember;
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(400, {
        message: 'Failed to remove member from society'
      });
    }
  }

  async getMembers(societyId: string, includeInactive = false): Promise<SocietyMember[]> {
    const conditions = includeInactive ? [] : [eq(societyMembers.isActive, true)];
    const result = await this.drizzleService.db
      .select()
      .from(societyMembers)
      .where(and(eq(societyMembers.societyId, societyId), ...conditions));

    // Convert string dates to Date objects for proper typing
    const membersWithDates = result.map(member => ({
      ...member,
      joinedDate: new Date(member.joinedDate),
      leftDate: member.leftDate ? new Date(member.leftDate) : null,
    }));

    return membersWithDates as SocietyMember[];
  }

  async getMemberSocieties(memberId: string, includeInactive = false): Promise<SocietyMember[]> {
    const conditions = includeInactive ? [] : [eq(societyMembers.isActive, true)];
    const result = await this.drizzleService.db
      .select()
      .from(societyMembers)
      .where(and(eq(societyMembers.memberId, memberId), ...conditions));

    // Convert string dates to Date objects for proper typing
    const membersWithDates = result.map(member => ({
      ...member,
      joinedDate: new Date(member.joinedDate),
      leftDate: member.leftDate ? new Date(member.leftDate) : null,
    }));

    return membersWithDates as SocietyMember[];
  }
}
