import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersServiceDrizzle } from './users.service.drizzle';
import { DrizzleService } from '@ekklesia/database';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let drizzle: DrizzleService;

  const createMockQueryBuilder = () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    };
    return queryBuilder;
  };

  const mockDrizzleService = {
    db: {
      select: jest.fn(),
      from: jest.fn(),
      where: jest.fn(),
      insert: jest.fn(),
      values: jest.fn(),
      returning: jest.fn(),
      update: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      execute: jest.fn(),
      leftJoin: jest.fn(),
      limit: jest.fn(),
      offset: jest.fn(),
      orderBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useClass: UsersServiceDrizzle,
        },
        {
          provide: DrizzleService,
          useValue: mockDrizzleService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    drizzle = module.get<DrizzleService>(DrizzleService);
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

      const selectQueryBuilder = createMockQueryBuilder();
      selectQueryBuilder.limit.mockResolvedValueOnce([]);
      mockDrizzleService.db.select = jest.fn().mockReturnValue(selectQueryBuilder);
      
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockDrizzleService.db.insert = jest.fn().mockReturnThis();
      mockDrizzleService.db.values = jest.fn().mockReturnThis();
      mockDrizzleService.db.returning = jest.fn().mockResolvedValue([createdUser]);
      
      // Mock for the second select query (with relations)
      const selectWithRelationsQueryBuilder = createMockQueryBuilder();
      selectWithRelationsQueryBuilder.limit.mockResolvedValueOnce([]);
      mockDrizzleService.db.select = jest.fn()
        .mockReturnValueOnce(selectQueryBuilder)
        .mockReturnValueOnce(selectWithRelationsQueryBuilder);

      const currentUser = {
        userId: 'user1',
        username: 'admin@example.com',
        role: 'CHURCH_ADMIN',
        churchId: 'church1'
      };

      const result = await service.create(createUserDto, currentUser);

      expect(mockDrizzleService.db.select).toHaveBeenCalled();
      expect(selectQueryBuilder.where).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockDrizzleService.db.insert).toHaveBeenCalled();
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

      const selectQueryBuilder = createMockQueryBuilder();
      selectQueryBuilder.limit.mockResolvedValueOnce([{ id: '1' }]);
      mockDrizzleService.db.select = jest.fn().mockReturnValue(selectQueryBuilder);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [{ id: '1', email: 'test@example.com' }];
      const total = 1;

      const selectQueryBuilder = createMockQueryBuilder();
      selectQueryBuilder.offset.mockResolvedValueOnce([
        {
          user: { id: '1', email: 'test@example.com' },
          church: null,
          member: null
        }
      ]);
      
      // Mock for count query
      const countQueryBuilder = createMockQueryBuilder();
      countQueryBuilder.where.mockResolvedValueOnce([{ count: 1 }]);
      
      mockDrizzleService.db.select = jest.fn()
        .mockReturnValueOnce(selectQueryBuilder)
        .mockReturnValueOnce(countQueryBuilder);

      const currentUser = {
        userId: 'user1',
        username: 'admin@example.com',
        role: 'SUPER_ADMIN',
        churchId: 'church1'
      };

      const result = await service.findAll(1, 10, false, undefined, undefined, currentUser);

      expect(result).toEqual({
        users: [{ id: '1', email: 'test@example.com', church: null, member: null }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const selectQueryBuilder = createMockQueryBuilder();
      selectQueryBuilder.limit.mockResolvedValueOnce([{
        users: user,
        churches: null,
        members: null
      }]);
      mockDrizzleService.db.select = jest.fn().mockReturnValue(selectQueryBuilder);

      const result = await service.findOne('1');

      expect(mockDrizzleService.db.select).toHaveBeenCalled();
      expect(selectQueryBuilder.where).toHaveBeenCalled();
      expect(result).toEqual({ ...user, church: null, member: null });
    });

    it('should throw NotFoundException if user not found', async () => {
      const selectQueryBuilder = createMockQueryBuilder();
      selectQueryBuilder.limit.mockResolvedValueOnce([]);
      mockDrizzleService.db.select = jest.fn().mockReturnValue(selectQueryBuilder);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
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

      const selectQueryBuilder = createMockQueryBuilder();
      selectQueryBuilder.limit.mockResolvedValueOnce([user]);
      mockDrizzleService.db.select = jest.fn().mockReturnValue(selectQueryBuilder);
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue(newHashedPassword);
      mockDrizzleService.db.update = jest.fn().mockReturnThis();
      mockDrizzleService.db.set = jest.fn().mockReturnThis();
      mockDrizzleService.db.where = jest.fn().mockResolvedValue(undefined);

      const result = await service.updatePassword('1', updatePasswordDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        updatePasswordDto.currentPassword,
        user.password
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(updatePasswordDto.newPassword, 10);
      expect(mockDrizzleService.db.update).toHaveBeenCalled();
      expect(mockDrizzleService.db.set).toHaveBeenCalled();
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

      const selectQueryBuilder = createMockQueryBuilder();
      selectQueryBuilder.limit.mockResolvedValueOnce([user]);
      mockDrizzleService.db.select = jest.fn().mockReturnValue(selectQueryBuilder);
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.updatePassword('1', updatePasswordDto)).rejects.toThrow(BadRequestException);
    });
  });
});
