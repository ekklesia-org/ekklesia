import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

describe('MembersController', () => {
  let controller: MembersController;
  let service: MembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            hardDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MembersController>(MembersController);
    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a member', async () => {
    const createMemberDto = {
      churchId: 'church-id',
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao.silva@email.com',
    };

    const mockMember = {
      id: '1',
      churchId: 'church-id',
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao.silva@email.com',
      phone: null,
      dateOfBirth: null,
      cpf: null,
      rg: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      status: 'ACTIVE',
      maritalStatus: 'SINGLE',
      baptismDate: null,
      memberSince: new Date(),
      spouseId: null,
      profession: null,
      notes: null,
      photoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: null,
    };

    jest.spyOn(service, 'create').mockResolvedValueOnce(mockMember);

    const result = await controller.create(createMemberDto);

    expect(result).toEqual(mockMember);
    expect(service.create).toHaveBeenCalledWith(createMemberDto);
  });

  it('should get all members', async () => {
    const mockResult = {
      members: [
        {
          id: '1',
          churchId: 'church-id',
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao.silva@email.com',
          phone: null,
          dateOfBirth: null,
          cpf: null,
          rg: null,
          address: null,
          city: null,
          state: null,
          zipCode: null,
          status: 'ACTIVE',
          maritalStatus: 'SINGLE',
          baptismDate: null,
          memberSince: new Date(),
          spouseId: null,
          profession: null,
          notes: null,
          photoUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    jest.spyOn(service, 'findAll').mockResolvedValueOnce(mockResult);

    const result = await controller.findAll(1, 10);

    expect(result).toEqual(mockResult);
    expect(service.findAll).toHaveBeenCalledWith(1, 10, null);
  });

  it('should get a member by id', async () => {
    const mockMember = {
      id: '1',
      churchId: 'church-id',
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao.silva@email.com',
      phone: null,
      dateOfBirth: null,
      cpf: null,
      rg: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      status: 'ACTIVE',
      maritalStatus: 'SINGLE',
      baptismDate: null,
      memberSince: new Date(),
      spouseId: null,
      profession: null,
      notes: null,
      photoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: null,
    };

    jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockMember);

    const result = await controller.findOne('1');

    expect(result).toEqual(mockMember);
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

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
      phone: null,
      dateOfBirth: null,
      cpf: null,
      rg: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      status: 'ACTIVE',
      maritalStatus: 'SINGLE',
      baptismDate: null,
      memberSince: new Date(),
      spouseId: null,
      profession: null,
      notes: null,
      photoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: null,
    };

    jest.spyOn(service, 'update').mockResolvedValueOnce(mockMember);

    const result = await controller.update('1', updateMemberDto);

    expect(result).toEqual(mockMember);
    expect(service.update).toHaveBeenCalledWith('1', updateMemberDto);
  });

  it('should remove a member', async () => {
    const mockMember = {
      id: '1',
      churchId: 'church-id',
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao.silva@email.com',
      phone: null,
      dateOfBirth: null,
      cpf: null,
      rg: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      status: 'INACTIVE',
      maritalStatus: 'SINGLE',
      baptismDate: null,
      memberSince: new Date(),
      spouseId: null,
      profession: null,
      notes: null,
      photoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: null,
    };

    jest.spyOn(service, 'remove').mockResolvedValueOnce(mockMember);

    const result = await controller.remove('1');

    expect(result).toEqual(mockMember);
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
