import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '@ekklesia/database';
import { users, churches, members } from '@ekklesia/database';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { eq, and, count, desc, sql, or } from 'drizzle-orm';
import { CurrentUserData } from '../../../src/lib/decorators/current-user.decorator';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';

@Injectable()
export class UsersServiceDrizzle extends UsersService {
  constructor(private drizzle: DrizzleService) {
    super();
  }

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto, currentUser?: CurrentUserData): Promise<any> {
    // Check if user already exists
    const existingUser = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.email, createUserDto.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new BadRequestException({
        message: 'User with this email already exists',
        translationKey: 'errors.user.already_exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    try {
      // If current user exists and is not a super admin, automatically set churchId
      let churchId = createUserDto.churchId;
      if (currentUser && currentUser.role !== 'SUPER_ADMIN' && currentUser.churchId) {
        churchId = currentUser.churchId;
      }

      const [newUser] = await this.drizzle.db
        .insert(users)
        .values({
          ...createUserDto,
          churchId,
          password: hashedPassword,
          isActive: true,
        })
        .returning();

      // Fetch user with relations
      const userWithRelations = await this.drizzle.db
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
      throw new BadRequestException({
        message: `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.create_failed'
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
      const usersList = await this.drizzle.db
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
      const countResult = await this.drizzle.db
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
      throw new BadRequestException({
        message: `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.fetch_failed'
      });
    }
  }

  /**
   * Retrieve a user by ID
   */
  async findOne(id: string): Promise<any> {
    try {
      const result = await this.drizzle.db
        .select()
        .from(users)
        .leftJoin(churches, eq(users.churchId, churches.id))
        .leftJoin(members, eq(members.userId, users.id))
        .where(eq(users.id, id))
        .limit(1);

      if (!result.length) {
        throw new NotFoundException({
          message: `User with ID "${id}" not found`,
          translationKey: 'errors.user.not_found'
        });
      }

      const { users: user, churches: church, members: member } = result[0];
      return {
        ...user,
        church: church?.id ? church : null,
        member: member?.id ? member : null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: `Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.fetch_failed'
      });
    }
  }

  /**
   * Retrieve a user by email (without password)
   */
  async findByEmail(email: string): Promise<any> {
    try {
      const result = await this.drizzle.db
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
        throw new NotFoundException({
          message: `User with email "${email}" not found`,
          translationKey: 'errors.user.not_found'
        });
      }

      const { user, church, member } = result[0];
      return {
        ...user,
        church: church?.id ? church : null,
        member: member?.id ? member : null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: `Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.fetch_failed'
      });
    }
  }

  /**
   * Update a user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    try {
      const [updatedUser] = await this.drizzle.db
        .update(users)
        .set({
          ...updateUserDto,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new NotFoundException({
          message: `User with ID "${id}" not found`,
          translationKey: 'errors.user.not_found'
        });
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.update_failed'
      });
    }
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, updatePasswordDto: UpdateUserPasswordDto): Promise<{ message: string }> {
    // Get user with password
    const userResult = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!userResult.length) {
      throw new NotFoundException({
        message: `User with ID "${id}" not found`,
        translationKey: 'errors.user.not_found'
      });
    }

    const user = userResult[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(updatePasswordDto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException({
        message: 'Current password is incorrect',
        translationKey: 'errors.user.current_password_incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

    try {
      await this.drizzle.db
        .update(users)
        .set({
          password: hashedNewPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, id));

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to update password: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.password_update_failed'
      });
    }
  }

  /**
   * Remove a user (soft delete)
   */
  async remove(id: string): Promise<any> {
    try {
      const [updatedUser] = await this.drizzle.db
        .update(users)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new NotFoundException({
          message: `User with ID "${id}" not found`,
          translationKey: 'errors.user.not_found'
        });
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: `Failed to remove user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.remove_failed'
      });
    }
  }

  /**
   * Permanently delete a user
   */
  async hardDelete(id: string): Promise<void> {
    try {
      const result = await this.drizzle.db
        .delete(users)
        .where(eq(users.id, id));

      if (!result.rowCount || result.rowCount === 0) {
        throw new NotFoundException({
          message: `User with ID "${id}" not found`,
          translationKey: 'errors.user.not_found'
        });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.delete_failed'
      });
    }
  }

  /**
   * Activate a user
   */
  async activate(id: string): Promise<any> {
    try {
      const [updatedUser] = await this.drizzle.db
        .update(users)
        .set({ 
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new NotFoundException({
          message: `User with ID "${id}" not found`,
          translationKey: 'errors.user.not_found'
        });
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: `Failed to activate user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.activate_failed'
      });
    }
  }

  /**
   * Deactivate a user
   */
  async deactivate(id: string): Promise<any> {
    try {
      const [updatedUser] = await this.drizzle.db
        .update(users)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new NotFoundException({
          message: `User with ID "${id}" not found`,
          translationKey: 'errors.user.not_found'
        });
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: `Failed to deactivate user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.deactivate_failed'
      });
    }
  }

  /**
   * Update user role
   */
  async updateRole(id: string, role: any): Promise<any> {
    try {
      const [updatedUser] = await this.drizzle.db
        .update(users)
        .set({ 
          role,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new NotFoundException({
          message: `User with ID "${id}" not found`,
          translationKey: 'errors.user.not_found'
        });
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: `Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.role_update_failed'
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
      throw new BadRequestException({
        message: 'You can only access users from your own church',
        translationKey: 'errors.user.access_denied'
      });
    }

    return this.findAll(page, limit, includeInactive, churchId, undefined, currentUser);
  }
}
