import { Test, TestingModule } from '@nestjs/testing';
import { ChurchService } from './church.service';
import { ChurchServiceDrizzle } from './church.service.drizzle';
import { DrizzleService } from '@ekklesia/database';

// Create a mock query builder
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

// Mock DrizzleService
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
    groupBy: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    offset: jest.fn(),
  },
};

describe('ChurchService', () => {
  let service: ChurchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ChurchService,
          useClass: ChurchServiceDrizzle,
        },
        {
          provide: DrizzleService,
          useValue: mockDrizzleService,
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
      userCount: 0
    };

    // Mock slug check
    const slugCheckQuery = createMockQueryBuilder();
    slugCheckQuery.limit.mockResolvedValueOnce([]); // No existing church with slug
    
    // Mock email check
    const emailCheckQuery = createMockQueryBuilder();
    emailCheckQuery.limit.mockResolvedValueOnce([]); // No existing church with email
    
    // Mock insert
    mockDrizzleService.db.insert = jest.fn().mockReturnThis();
    mockDrizzleService.db.values = jest.fn().mockReturnThis();
    mockDrizzleService.db.returning = jest.fn().mockResolvedValueOnce([{ ...mockChurch, users: undefined, settings: undefined, userCount: undefined }]);
    
    // Mock getting church with relations
    const relationQuery = createMockQueryBuilder();
    relationQuery.where.mockResolvedValueOnce([{
      church: { ...mockChurch, users: undefined, settings: undefined, userCount: undefined },
      settings: null,
      user: null
    }]);
    
    // Set up select mock to return different query builders for each call
    mockDrizzleService.db.select = jest.fn()
      .mockReturnValueOnce(slugCheckQuery)
      .mockReturnValueOnce(emailCheckQuery)
      .mockReturnValueOnce(relationQuery);

    const result = await service.create(createChurchDto);

    expect(result).toHaveProperty('id', '1');
    expect(result).toHaveProperty('name', 'Test Church');
    expect(result).toHaveProperty('userCount', 0);
    expect(mockDrizzleService.db.insert).toHaveBeenCalled();
  });

  it('should find all churches', async () => {
    const mockChurchData = {
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
    };

    // Mock church list query
    const listQuery = createMockQueryBuilder();
    listQuery.offset.mockResolvedValueOnce([{
      church: mockChurchData,
      settings: null,
      userCount: 0
    }]);
    
    // Mock count query
    const countQuery = createMockQueryBuilder();
    countQuery.where.mockResolvedValueOnce([{ count: 1 }]);
    
    // Set up select mock to return different query builders for each call
    mockDrizzleService.db.select = jest.fn()
      .mockReturnValueOnce(listQuery)
      .mockReturnValueOnce(countQuery);

    const result = await service.findAll(1, 10, false);

    expect(result.churches).toHaveLength(1);
    expect(result.churches[0]).toHaveProperty('id', '1');
    expect(result.churches[0]).toHaveProperty('userCount', 0);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
  });
});
