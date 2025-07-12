import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { DrizzleService } from '@ekklesia/database';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MembersService', () => {
  let service: MembersService;
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
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: DrizzleService,
          useValue: mockDrizzleService,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    drizzle = module.get<DrizzleService>(DrizzleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a member', async () => {
      const createMemberDto = {
        churchId: 'church-id',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@email.com',
      };

      const mockMember = {
        id: '1',
        ...createMemberDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDrizzleService.db.insert = jest.fn().mockReturnThis();
      mockDrizzleService.db.values = jest.fn().mockReturnThis();
      mockDrizzleService.db.returning = jest.fn().mockResolvedValueOnce([mockMember]);

      const result = await service.create(createMemberDto);

      expect(result).toEqual(mockMember);
      expect(mockDrizzleService.db.insert).toHaveBeenCalled();
    });

    it('should throw BadRequestException on error', async () => {
      const createMemberDto = {
        churchId: 'church-id',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@email.com',
      };

      mockDrizzleService.db.insert = jest.fn().mockReturnThis();
      mockDrizzleService.db.values = jest.fn().mockReturnThis();
      mockDrizzleService.db.returning = jest.fn().mockRejectedValueOnce(new Error('Database error'));

      await expect(service.create(createMemberDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated members', async () => {
      const mockMembers = [
        {
          id: '1',
          churchId: 'church-id',
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao.silva@email.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Mock for members query
      const membersQueryBuilder = createMockQueryBuilder();
      membersQueryBuilder.offset.mockResolvedValueOnce(mockMembers);
      mockDrizzleService.db.select = jest.fn().mockReturnValue(membersQueryBuilder);
      
      // Mock for count query
      const countQueryBuilder = createMockQueryBuilder();
      countQueryBuilder.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDrizzleService.db.select = jest.fn()
        .mockReturnValueOnce(membersQueryBuilder)
        .mockReturnValueOnce(countQueryBuilder);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        members: mockMembers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockDrizzleService.db.select).toHaveBeenCalled();
    });

    it('should filter by churchId when provided', async () => {
      const mockMembers: any[] = [];
      const churchId = 'church-id';

      // Mock for members query
      const membersQueryBuilder = createMockQueryBuilder();
      membersQueryBuilder.offset.mockResolvedValueOnce(mockMembers);
      mockDrizzleService.db.select = jest.fn().mockReturnValue(membersQueryBuilder);
      
      // Mock for count query
      const countQueryBuilder = createMockQueryBuilder();
      countQueryBuilder.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDrizzleService.db.select = jest.fn()
        .mockReturnValueOnce(membersQueryBuilder)
        .mockReturnValueOnce(countQueryBuilder);

      await service.findAll(1, 10, churchId);

      expect(mockDrizzleService.db.select).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a member by id', async () => {
      const mockMember = {
        id: '1',
        churchId: 'church-id',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@email.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const queryBuilder = createMockQueryBuilder();
      queryBuilder.limit.mockResolvedValueOnce([mockMember]);
      mockDrizzleService.db.select = jest.fn().mockReturnValue(queryBuilder);

      const result = await service.findOne('1');

      expect(result).toEqual(mockMember);
      expect(mockDrizzleService.db.select).toHaveBeenCalled();
    });

    it('should throw NotFoundException when member not found', async () => {
      const queryBuilder = createMockQueryBuilder();
      queryBuilder.limit.mockResolvedValueOnce([]);
      mockDrizzleService.db.select = jest.fn().mockReturnValue(queryBuilder);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a member', async () => {
      const updateMemberDto = {
        firstName: 'João Updated',
      };

      const mockMember = {
        id: '1',
        churchId: 'church-id',
        firstName: 'João Updated',
        lastName: 'Silva',
        email: 'joao.silva@email.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDrizzleService.db.update = jest.fn().mockReturnThis();
      mockDrizzleService.db.set = jest.fn().mockReturnThis();
      mockDrizzleService.db.where = jest.fn().mockReturnThis();
      mockDrizzleService.db.returning = jest.fn().mockResolvedValueOnce([mockMember]);

      const result = await service.update('1', updateMemberDto);

      expect(result).toEqual(mockMember);
      expect(mockDrizzleService.db.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException on error', async () => {
      const updateMemberDto = {
        firstName: 'João Updated',
      };

      mockDrizzleService.db.update = jest.fn().mockReturnThis();
      mockDrizzleService.db.set = jest.fn().mockReturnThis();
      mockDrizzleService.db.where = jest.fn().mockReturnThis();
      mockDrizzleService.db.returning = jest.fn().mockRejectedValueOnce(new Error('Database error'));

      await expect(service.update('1', updateMemberDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete a member', async () => {
      const mockMember = {
        id: '1',
        churchId: 'church-id',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@email.com',
        status: 'INACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDrizzleService.db.update = jest.fn().mockReturnThis();
      mockDrizzleService.db.set = jest.fn().mockReturnThis();
      mockDrizzleService.db.where = jest.fn().mockReturnThis();
      mockDrizzleService.db.returning = jest.fn().mockResolvedValueOnce([mockMember]);

      const result = await service.remove('1');

      expect(result).toEqual(mockMember);
      expect(mockDrizzleService.db.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException on error', async () => {
      mockDrizzleService.db.update = jest.fn().mockReturnThis();
      mockDrizzleService.db.set = jest.fn().mockReturnThis();
      mockDrizzleService.db.where = jest.fn().mockReturnThis();
      mockDrizzleService.db.returning = jest.fn().mockRejectedValueOnce(new Error('Database error'));

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete a member', async () => {
      const mockResult = { rowCount: 1 };
      mockDrizzleService.db.delete = jest.fn().mockReturnThis();
      mockDrizzleService.db.where = jest.fn().mockResolvedValueOnce(mockResult);

      await service.hardDelete('1');

      expect(mockDrizzleService.db.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException on error', async () => {
      const mockResult = { rowCount: 0 };
      mockDrizzleService.db.delete = jest.fn().mockReturnThis();
      mockDrizzleService.db.where = jest.fn().mockResolvedValueOnce(mockResult);

      await expect(service.hardDelete('1')).rejects.toThrow(NotFoundException);
    });
  });
});
