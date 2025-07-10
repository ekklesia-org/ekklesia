import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    updatePassword: jest.fn(),
    remove: jest.fn(),
    hardDelete: jest.fn(),
    activate: jest.fn(),
    deactivate: jest.fn(),
    updateRole: jest.fn(),
    findByChurch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'MEMBER' as any,
      };
      
      const expectedResult = { id: '1', ...createUserDto };
      mockUsersService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);
      
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const expectedResult = {
        users: [{ id: '1', email: 'test@example.com' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockUsersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(1, 10, false);
      
      expect(service.findAll).toHaveBeenCalledWith(1, 10, false, undefined, undefined, undefined);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const expectedResult = { id: '1', email: 'test@example.com' };
      mockUsersService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');
      
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = { firstName: 'Jane' };
      const expectedResult = { id: '1', firstName: 'Jane' };
      mockUsersService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateUserDto);
      
      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      const expectedResult = { id: '1', isActive: false };
      mockUsersService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');
      
      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedResult);
    });
  });
});
