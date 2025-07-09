import { Test, TestingModule } from '@nestjs/testing';
import { ChurchController } from './church.controller';
import { ChurchService } from './church.service';

describe('ChurchController', () => {
  let controller: ChurchController;
  let service: ChurchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChurchController],
      providers: [
        {
          provide: ChurchService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            createSettings: jest.fn(),
            updateSettings: jest.fn(),
            getSettings: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ChurchController>(ChurchController);
    service = module.get<ChurchService>(ChurchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a church', async () => {
    const createChurchDto = {
      name: 'Test Church',
      email: 'test@church.com',
    };

const mockChurch = {
      id: '1',
      name: 'Test Church',
      slug: 'test-church',
      email: 'test@church.com',
      phone: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      website: null,
      logoUrl: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: null,
      users: [],
    };

    jest.spyOn(service, 'create').mockResolvedValueOnce(mockChurch);

    const result = await controller.create(createChurchDto);

    expect(result).toEqual(mockChurch);
    expect(service.create).toHaveBeenCalledWith(createChurchDto);
  });

  it('should get all churches', async () => {
const mockResult = {
      churches: [
        {
          id: '1',
          name: 'Test Church',
          slug: 'test-church',
          email: 'test@church.com',
          phone: null,
          address: null,
          city: null,
          state: null,
          zipCode: null,
          website: null,
          logoUrl: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          settings: null,
          users: [],
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    jest.spyOn(service, 'findAll').mockResolvedValueOnce(mockResult);

    const result = await controller.findAll(1, 10, false);

    expect(result).toEqual(mockResult);
    expect(service.findAll).toHaveBeenCalledWith(1, 10, false);
  });

  it('should get a church by id', async () => {
    const mockChurch = {
      id: '1',
      name: 'Test Church',
      slug: 'test-church',
      email: 'test@church.com',
      phone: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      website: null,
      logoUrl: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: null,
      users: [],
    };

    jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockChurch);

    const result = await controller.findOne('1');

    expect(result).toEqual(mockChurch);
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('should update a church', async () => {
    const updateChurchDto = {
      name: 'Updated Church',
    };

    const mockChurch = {
      id: '1',
      name: 'Updated Church',
      slug: 'test-church',
      email: 'test@church.com',
      phone: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      website: null,
      logoUrl: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: null,
      users: [],
    };

    jest.spyOn(service, 'update').mockResolvedValueOnce(mockChurch);

    const result = await controller.update('1', updateChurchDto);

    expect(result).toEqual(mockChurch);
    expect(service.update).toHaveBeenCalledWith('1', updateChurchDto);
  });

  it('should remove a church', async () => {
    const mockChurch = {
      id: '1',
      name: 'Test Church',
      slug: 'test-church',
      email: 'test@church.com',
      phone: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      website: null,
      logoUrl: null,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: null,
      users: [],
    };

    jest.spyOn(service, 'remove').mockResolvedValueOnce(mockChurch);

    const result = await controller.remove('1');

    expect(result).toEqual(mockChurch);
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
