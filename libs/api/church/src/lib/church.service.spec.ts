import { Test, TestingModule } from '@nestjs/testing';
import { ChurchService } from './church.service';
import { PrismaService } from '@ekklesia/database/lib/database.service';

// Mock PrismaService
const mockPrismaService = {
  church: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  churchSettings: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('ChurchService', () => {
  let service: ChurchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChurchService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChurchService>(ChurchService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

    mockPrismaService.church.findUnique.mockResolvedValueOnce(null);
    mockPrismaService.church.create.mockResolvedValueOnce(mockChurch);

    const result = await service.create(createChurchDto);

    expect(result).toEqual(mockChurch);
    expect(mockPrismaService.church.create).toHaveBeenCalledWith({
      data: {
        name: 'Test Church',
        email: 'test@church.com',
        slug: 'test-church',
        isActive: true,
      },
      include: {
        settings: true,
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
          }
        }
      }
    });
  });

  it('should find all churches', async () => {
const mockChurches = [
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
    ];

    mockPrismaService.church.findMany.mockResolvedValueOnce(mockChurches);
    mockPrismaService.church.count.mockResolvedValueOnce(1);

    const result = await service.findAll(1, 10, false);

    expect(result.churches).toEqual(mockChurches);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
  });
});
