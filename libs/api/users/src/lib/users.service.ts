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
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new BadRequestException(`User with email "${createUserDto.email}" already exists`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
          isActive: createUserDto.isActive ?? true,
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
      throw new BadRequestException(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve all users
   */
  async findAll(page = 1, limit = 10, includeInactive = false, churchId?: string, role?: string): Promise<{
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
      throw new BadRequestException(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        throw new NotFoundException(`User with email "${email}" not found`);
      }
      
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      throw new BadRequestException(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      throw new BadRequestException('Current password is incorrect');
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
      throw new BadRequestException(`Failed to update password: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      throw new BadRequestException(`Failed to remove user: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      throw new BadRequestException(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      throw new BadRequestException(`Failed to activate user: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      throw new BadRequestException(`Failed to deactivate user: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      throw new BadRequestException(`Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get users by church
   */
  async findByChurch(churchId: string, page = 1, limit = 10, includeInactive = false) {
    const skip = (page - 1) * limit;
    const where = { churchId, isActive: includeInactive ? undefined : true };

    try {
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
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
      throw new BadRequestException(`Failed to fetch users by church: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
