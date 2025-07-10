import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@ekklesia/database/lib/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { User, UserRole } from '@ekklesia/prisma';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto, currentUserId?: string): Promise<User> {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new BadRequestException({
        message: `User with email "${createUserDto.email}" already exists`,
        translationKey: 'errors.user.email_already_exists'
      });
    }

    let finalUserData = { ...createUserDto };
    
    // If a current user ID is provided, check if they are not a super admin
    // and automatically set the churchId to their church
    if (currentUserId) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: currentUserId },
        select: { role: true, churchId: true }
      });
      
      if (currentUser) {
        // Non-super admins cannot create super admin users
        if (currentUser.role !== 'SUPER_ADMIN' && finalUserData.role === 'SUPER_ADMIN') {
          throw new BadRequestException({
            message: 'You do not have permission to create super admin users',
            translationKey: 'errors.user.cannot_create_super_admin'
          });
        }
        
        // Non-super admins can only create users in their own church
        if (currentUser.role !== 'SUPER_ADMIN' && currentUser.churchId) {
          // Override any provided churchId with the current user's church
          finalUserData.churchId = currentUser.churchId;
        }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(finalUserData.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          ...finalUserData,
          password: hashedPassword,
          isActive: finalUserData.isActive ?? true,
        },
        include: {
          church: true,
          member: true,
        }
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return { ...userWithoutPassword } as unknown as User;
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.create_failed'
      });
    }
  }

  /**
   * Retrieve all users
   */
  async findAll(page = 1, limit = 10, includeInactive = false, churchId?: string, role?: string, currentUserId?: string): Promise<{
    users: Omit<User, 'password'>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (!includeInactive) {
      where.isActive = true;
    }
    if (churchId) where.churchId = churchId;
    if (role) where.role = role;
    
    // If a current user ID is provided, check if they are not a super admin
    // and automatically filter by their church
    if (currentUserId) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: currentUserId },
        select: { role: true, churchId: true }
      });
      
      if (currentUser && currentUser.role !== 'SUPER_ADMIN' && currentUser.churchId) {
        // Override any provided churchId with the current user's church
        where.churchId = currentUser.churchId;
      }
    }

    try {
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            isActive: true,
            role: true,
            churchId: true,
            createdAt: true,
            updatedAt: true,
            lastLogin: true,
            church: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            },
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                status: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        this.prisma.user.count({ where })
      ]);

      return {
        users,
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
  async findOne(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          church: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              status: true,
            }
          }
        }
      });
      
      if (!user) {
        throw new NotFoundException({
          message: `User with ID "${id}" not found`,
          translationKey: 'errors.user.not_found'
        });
      }
      
      return user;
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
   * Retrieve a user by email
   */
  async findByEmail(email: string): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          isActive: true,
          role: true,
          churchId: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true,
          church: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              status: true,
            }
          }
        }
      });
      
      if (!user) {
        throw new NotFoundException({
          message: `User with email "${email}" not found`,
          translationKey: 'errors.user.not_found'
        });
      }
      
      return user;
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
  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
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
    // Verify user exists
    const user = await this.findOne(id);

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
      await this.prisma.user.update({
        where: { id },
        data: { 
          password: hashedNewPassword,
          updatedAt: new Date()
        },
      });
      
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
  async remove(id: string) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      return user;
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to remove user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.remove_failed'
      });
    }
  }

  /**
   * Permanently delete a user
   */
  async hardDelete(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.delete_failed'
      });
    }
  }

  /**
   * Activate a user
   */
  async activate(id: string) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { isActive: true },
      });
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to activate user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.activate_failed'
      });
    }
  }

  /**
   * Deactivate a user
   */
  async deactivate(id: string) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to deactivate user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.deactivate_failed'
      });
    }
  }

  /**
   * Update user role
   */
  async updateRole(id: string, role: UserRole) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { role },
      });
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.role_update_failed'
      });
    }
  }

  /**
   * Get users by church
   */
  async findByChurch(churchId: string, page = 1, limit = 10, includeInactive = false, currentUserId?: string) {
    const skip = (page - 1) * limit;
    let finalChurchId = churchId;
    
    // If a current user ID is provided, check if they are not a super admin
    // and automatically filter by their church
    if (currentUserId) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: currentUserId },
        select: { role: true, churchId: true }
      });
      
      if (currentUser && currentUser.role !== 'SUPER_ADMIN' && currentUser.churchId) {
        // Override any provided churchId with the current user's church
        finalChurchId = currentUser.churchId;
      }
    }
    
    const where = { churchId: finalChurchId, isActive: includeInactive ? undefined : true };

    try {
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            isActive: true,
            role: true,
            churchId: true,
            createdAt: true,
            updatedAt: true,
            lastLogin: true,
            church: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            },
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                status: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        this.prisma.user.count({ where })
      ]);

      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to fetch users by church: ${error instanceof Error ? error.message : 'Unknown error'}`,
        translationKey: 'errors.user.fetch_by_church_failed'
      });
    }
  }
}
