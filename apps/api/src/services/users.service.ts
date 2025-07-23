import { DrizzleService, withTimestamps, withUpdateTimestamp } from '@ekklesia/database';
import { users, churches, members } from '@ekklesia/database';
import { eq, and, count, desc, or, isNull } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { HTTPException } from 'hono/http-exception';

export type UserRole = 'SUPER_ADMIN' | 'CHURCH_ADMIN' | 'PASTOR' | 'TREASURER' | 'SECRETARY' | 'MEMBER';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  churchId?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  churchId?: string;
  isActive?: boolean;
}

export interface UpdateUserPasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface CurrentUserData {
  userId: string;
  username: string;
  role: UserRole;
  churchId?: string;
}

export class UsersService {
  private drizzleService: DrizzleService;

  constructor() {
    this.drizzleService = new DrizzleService();
  }

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto, currentUser?: CurrentUserData): Promise<any> {
    // Check if user already exists
    const existingUser = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.email, createUserDto.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new HTTPException(400, {
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Permission check
    if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && !currentUser.churchId)) {
      throw new HTTPException(403, {
        message: 'Current user does not have permission to create users without a church ID'
      });
    }

    try {
      // Church assignment logic
      let churchId = createUserDto.churchId;

      // If current user exists and is not a super admin, automatically set churchId to current user's church
      if (currentUser && currentUser.role !== 'SUPER_ADMIN' && currentUser.churchId) {
        churchId = currentUser.churchId;
      }

      const [newUser] = await this.drizzleService.db
        .insert(users)
        .values(withTimestamps({
          email: createUserDto.email,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          phone: createUserDto.phone,
          avatar: createUserDto.avatar,
          role: createUserDto.role as any, // Type assertion for enum
          churchId,
          password: hashedPassword,
          isActive: true,
        }))
        .returning();

      // Fetch user with relations
      const userWithRelations = await this.drizzleService.db
        .select()
        .from(users)
        .leftJoin(churches, eq(users.churchId, churches.id))
        .leftJoin(members, eq(members.userId, users.id))
        .where(eq(users.id, newUser.id))
        .limit(1);

      if (userWithRelations.length > 0) {
        const result = userWithRelations[0];
        const { password, ...userWithoutPassword } = result.users;
        return {
          ...userWithoutPassword,
          church: result.churches,
          member: result.members
        };
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      throw new HTTPException(400, {
        message: `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Retrieve all users with pagination
   */
  async findAll(
    page = 1,
    limit = 10,
    includeInactive = false,
    churchId?: string,
    role?: string,
    currentUser?: CurrentUserData
  ): Promise<{
    users: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (!includeInactive) {
      conditions.push(eq(users.isActive, true));
    }

    let finalChurchId = churchId;
    if (currentUser && currentUser.role !== 'SUPER_ADMIN' && currentUser.churchId) {
      finalChurchId = currentUser.churchId;
    }

    if (finalChurchId) {
      conditions.push(eq(users.churchId, finalChurchId));
    }

    if (role) {
      conditions.push(eq(users.role, role as any));
    }

    try {
      // Get users with relations
      const usersList = await this.drizzleService.db
        .select({
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone,
            avatar: users.avatar,
            isActive: users.isActive,
            role: users.role,
            churchId: users.churchId,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
            lastLogin: users.lastLogin,
          },
          church: {
            id: churches.id,
            name: churches.name,
            slug: churches.slug,
          },
          member: {
            id: members.id,
            firstName: members.firstName,
            lastName: members.lastName,
            status: members.status,
          }
        })
        .from(users)
        .leftJoin(churches, eq(users.churchId, churches.id))
        .leftJoin(members, eq(members.userId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const countResult = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = countResult[0]?.count || 0;

      // Format results
      const formattedUsers = usersList.map(result => ({
        ...result.user,
        church: result.church?.id ? result.church : null,
        member: result.member?.id ? result.member : null,
      }));

      return {
        users: formattedUsers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new HTTPException(400, {
        message: `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Retrieve a user by ID
   */
  async findOne(id: string): Promise<any> {
    try {
      const result = await this.drizzleService.db
        .select()
        .from(users)
        .leftJoin(churches, eq(users.churchId, churches.id))
        .leftJoin(members, eq(members.userId, users.id))
        .where(eq(users.id, id))
        .limit(1);

      if (!result.length) {
        throw new HTTPException(404, {
          message: `User with ID "${id}" not found`
        });
      }

      const { users: user, churches: church, members: member } = result[0];
      return {
        ...user,
        church: church?.id ? church : null,
        member: member?.id ? member : null,
      };
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Retrieve a user by email (without password)
   */
  async findByEmail(email: string): Promise<any> {
    try {
      const result = await this.drizzleService.db
        .select({
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone,
            avatar: users.avatar,
            isActive: users.isActive,
            role: users.role,
            churchId: users.churchId,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
            lastLogin: users.lastLogin,
          },
          church: {
            id: churches.id,
            name: churches.name,
            slug: churches.slug,
          },
          member: {
            id: members.id,
            firstName: members.firstName,
            lastName: members.lastName,
            status: members.status,
          }
        })
        .from(users)
        .leftJoin(churches, eq(users.churchId, churches.id))
        .leftJoin(members, eq(members.userId, users.id))
        .where(eq(users.email, email))
        .limit(1);

      if (!result.length) {
        throw new HTTPException(404, {
          message: `User with email "${email}" not found`
        });
      }

      const { user, church, member } = result[0];
      return {
        ...user,
        church: church?.id ? church : null,
        member: member?.id ? member : null,
      };
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Update a user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    try {
      const [updatedUser] = await this.drizzleService.db
        .update(users)
        .set({
          ...updateUserDto,
          role: updateUserDto.role as any, // Type assertion for enum
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new HTTPException(404, {
          message: `User with ID "${id}" not found`
        });
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, updatePasswordDto: UpdateUserPasswordDto): Promise<{ message: string }> {
    // Get user with password
    const userResult = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!userResult.length) {
      throw new HTTPException(404, {
        message: `User with ID "${id}" not found`
      });
    }

    const user = userResult[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(updatePasswordDto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new HTTPException(400, {
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

    try {
      await this.drizzleService.db
        .update(users)
        .set({
          password: hashedNewPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, id));

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new HTTPException(400, {
        message: `Failed to update password: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Remove a user (soft delete)
   */
  async remove(id: string, currentUser?: CurrentUserData): Promise<any> {
    // Prevent user from deleting themselves
    if (currentUser && currentUser.userId === id) {
      throw new HTTPException(400, {
        message: 'You cannot delete your own account'
      });
    }

    try {
      const [updatedUser] = await this.drizzleService.db
        .update(users)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new HTTPException(404, {
          message: `User with ID "${id}" not found`
        });
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to remove user: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Permanently delete a user
   */
  async hardDelete(id: string, currentUser?: CurrentUserData): Promise<void> {
    // Prevent user from deleting themselves
    if (currentUser && currentUser.userId === id) {
      throw new HTTPException(400, {
        message: 'You cannot delete your own account'
      });
    }

    try {
      const result = await this.drizzleService.db
        .delete(users)
        .where(eq(users.id, id));

      if (!result.rowCount || result.rowCount === 0) {
        throw new HTTPException(404, {
          message: `User with ID "${id}" not found`
        });
      }
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Activate a user
   */
  async activate(id: string): Promise<any> {
    try {
      const [updatedUser] = await this.drizzleService.db
        .update(users)
        .set({
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new HTTPException(404, {
          message: `User with ID "${id}" not found`
        });
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to activate user: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Deactivate a user
   */
  async deactivate(id: string): Promise<any> {
    try {
      const [updatedUser] = await this.drizzleService.db
        .update(users)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new HTTPException(404, {
          message: `User with ID "${id}" not found`
        });
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to deactivate user: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Update user role
   */
  async updateRole(id: string, role: UserRole): Promise<any> {
    try {
      const [updatedUser] = await this.drizzleService.db
        .update(users)
        .set({
          role,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new HTTPException(404, {
          message: `User with ID "${id}" not found`
        });
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(400, {
        message: `Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Find users by church ID
   */
  async findByChurch(
    churchId: string,
    page = 1,
    limit = 10,
    includeInactive = false,
    currentUser?: CurrentUserData
  ): Promise<{
    users: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // For non-super admin users, verify they're accessing their own church
    if (currentUser && currentUser.role !== 'SUPER_ADMIN' && currentUser.churchId !== churchId) {
      throw new HTTPException(403, {
        message: 'You can only access users from your own church'
      });
    }

    return this.findAll(page, limit, includeInactive, churchId, undefined, currentUser);
  }

  /**
   * Find users available to link to members
   */
  async findAvailableForMember(
    churchId?: string,
    excludeMemberId?: string,
    currentUser?: CurrentUserData
  ): Promise<any[]> {
    try {
      // Build the base query
      let query = this.drizzleService.db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          isActive: users.isActive,
          memberId: members.id,
        })
        .from(users)
        .leftJoin(members, eq(users.id, members.userId));

      // Apply filters
      const conditions = [];

      // Filter by church if specified
      if (churchId) {
        conditions.push(eq(users.churchId, churchId));
      } else if (currentUser && currentUser.role !== 'SUPER_ADMIN' && currentUser.churchId) {
        // Non-super admins can only see users from their church
        conditions.push(eq(users.churchId, currentUser.churchId));
      }

      // Only active users
      conditions.push(eq(users.isActive, true));

      // Either users without a member link OR the user linked to the specified member
      if (excludeMemberId) {
        conditions.push(
          or(
            isNull(members.id),
            eq(members.id, excludeMemberId)
          )
        );
      } else {
        // Only users without member links
        conditions.push(isNull(members.id));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }

      const result = await query;

      // Return only the user data, filtering out those already linked to other members
      return result
        .filter(row => !row.memberId || row.memberId === excludeMemberId)
        .map(({ memberId, ...user }) => user);
    } catch (error) {
      throw new HTTPException(400, {
        message: `Failed to fetch available users: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
}

