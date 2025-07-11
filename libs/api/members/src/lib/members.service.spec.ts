import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { DatabaseService } from '@ekklesia/database/lib/database.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MembersService', () => {
  let service: MembersService;
  let prisma: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: DatabaseService,
          useValue: {
            member: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    prisma = module.get<DatabaseService>(DatabaseService);
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

      jest.spyOn(prisma.member, 'create').mockResolvedValueOnce(mockMember);

      const result = await service.create(createMemberDto);

      expect(result).toEqual(mockMember);
      expect(prisma.member.create).toHaveBeenCalledWith({
        data: createMemberDto,
      });
    });

    it('should throw BadRequestException on error', async () => {
      const createMemberDto = {
        churchId: 'church-id',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@email.com',
      };

      jest.spyOn(prisma.member, 'create').mockRejectedValueOnce(new Error('Database error'));

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

      jest.spyOn(prisma.member, 'findMany').mockResolvedValueOnce(mockMembers);
      jest.spyOn(prisma.member, 'count').mockResolvedValueOnce(1);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        members: mockMembers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(prisma.member.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
      });
      expect(prisma.member.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should filter by churchId when provided', async () => {
      const mockMembers = [];
      const churchId = 'church-id';

      jest.spyOn(prisma.member, 'findMany').mockResolvedValueOnce(mockMembers);
      jest.spyOn(prisma.member, 'count').mockResolvedValueOnce(0);

      await service.findAll(1, 10, churchId);

      expect(prisma.member.findMany).toHaveBeenCalledWith({
        where: { churchId },
        skip: 0,
        take: 10,
      });
      expect(prisma.member.count).toHaveBeenCalledWith({ where: { churchId } });
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

      jest.spyOn(prisma.member, 'findUnique').mockResolvedValueOnce(mockMember);

      const result = await service.findOne('1');

      expect(result).toEqual(mockMember);
      expect(prisma.member.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when member not found', async () => {
      jest.spyOn(prisma.member, 'findUnique').mockResolvedValueOnce(null);

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

      jest.spyOn(prisma.member, 'update').mockResolvedValueOnce(mockMember);

      const result = await service.update('1', updateMemberDto);

      expect(result).toEqual(mockMember);
      expect(prisma.member.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateMemberDto,
      });
    });

    it('should throw BadRequestException on error', async () => {
      const updateMemberDto = {
        firstName: 'João Updated',
      };

      jest.spyOn(prisma.member, 'update').mockRejectedValueOnce(new Error('Database error'));

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

      jest.spyOn(prisma.member, 'update').mockResolvedValueOnce(mockMember);

      const result = await service.remove('1');

      expect(result).toEqual(mockMember);
      expect(prisma.member.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'INACTIVE' },
      });
    });

    it('should throw BadRequestException on error', async () => {
      jest.spyOn(prisma.member, 'update').mockRejectedValueOnce(new Error('Database error'));

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete a member', async () => {
      jest.spyOn(prisma.member, 'delete').mockResolvedValueOnce({} as any);

      await service.hardDelete('1');

      expect(prisma.member.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw BadRequestException on error', async () => {
      jest.spyOn(prisma.member, 'delete').mockRejectedValueOnce(new Error('Database error'));

      await expect(service.hardDelete('1')).rejects.toThrow(BadRequestException);
    });
  });
});
