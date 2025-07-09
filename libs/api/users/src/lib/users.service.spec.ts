import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '@ekklesia/database/lib/database.service';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'MEMBER' as any,
      };

      const hashedPassword = 'hashedPassword';
      const createdUser = {
        id: '1',
        ...createUserDto,
        password: hashedPassword,
        isActive: true,
        church: null,
        member: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: hashedPassword,
          isActive: true,
        },
        include: {
          church: true,
          member: true,
        },
      });
      expect(result).toEqual(expect.objectContaining({
        id: '1',
        email: createUserDto.email,
        firstName: createUserDto.firstName,
      }));
      expect(result).not.toHaveProperty('password');
    });

    it('should throw BadRequestException if user already exists', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'MEMBER' as any,
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(service.create(createUserDto)).rejects.toThrow(
        new BadRequestException('User with email "test@example.com" already exists')
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [{ id: '1', email: 'test@example.com' }];
      const total = 1;

      mockPrismaService.user.findMany.mockResolvedValue(users);
      mockPrismaService.user.count.mockResolvedValue(total);

      const result = await service.findAll(1, 10, false);

      expect(result).toEqual({
        users,
        total,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: '1', email: 'test@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          church: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              status: true,
            },
          },
        },
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(
        new NotFoundException('User with ID "1" not found')
      );
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'currentHashedPassword',
      };
      const updatePasswordDto = {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      };
      const newHashedPassword = 'newHashedPassword';

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue(newHashedPassword);
      mockPrismaService.user.update.mockResolvedValue(user);

      const result = await service.updatePassword('1', updatePasswordDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        updatePasswordDto.currentPassword,
        user.password
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(updatePasswordDto.newPassword, 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          password: newHashedPassword,
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual({ message: 'Password updated successfully' });
    });

    it('should throw BadRequestException if current password is incorrect', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'currentHashedPassword',
      };
      const updatePasswordDto = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.updatePassword('1', updatePasswordDto)).rejects.toThrow(
        new BadRequestException('Current password is incorrect')
      );
    });
  });
});
