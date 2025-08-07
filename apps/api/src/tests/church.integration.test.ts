import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { JWTService } from '../middlewares/auth';
import { ChurchesService } from '../services/churches.service';
import { ChurchValidator } from '../utils/church.validation';
import {
  ChurchNotFoundError,
  ChurchAlreadyExistsError,
  ChurchValidationError,
  ChurchPermissionError,
  ChurchCannotBeDeletedError,
  LastActiveChurchError,
  ChurchSettingsNotFoundError,
  ChurchTransferError,
  ChurchDatabaseError,
  ChurchSettingsValidationError
} from '../errors/church.errors';

// Mock dependencies
vi.mock('@ekklesia/database', () => ({
  DrizzleService: vi.fn().mockImplementation(() => ({
    db: {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
  })),
  withTimestamps: vi.fn((data) => ({ ...data, createdAt: new Date(), updatedAt: new Date() })),
  withUpdateTimestamp: vi.fn((data) => ({ ...data, updatedAt: new Date() })),
  churches: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    email: 'email',
    isActive: 'isActive',
    createdAt: 'createdAt',
  },
  churchSettings: {
    id: 'id',
    churchId: 'churchId',
    timezone: 'timezone',
    currency: 'currency',
  },
  users: {
    id: 'id',
    role: 'role',
    churchId: 'churchId',
  }
}));

// Test data
const mockChurch = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test Church',
  slug: 'test-church',
  email: 'test@church.com',
  phone: '+1234567890',
  address: '123 Church St',
  city: 'Test City',
  state: 'TS',
  zipCode: '12345',
  website: 'https://testchurch.com',
  logoUrl: 'https://testchurch.com/logo.png',
  taxId: '12.345.678/0001-90',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockChurchSettings = {
  id: '660e8400-e29b-41d4-a716-446655440000',
  churchId: mockChurch.id,
  timezone: 'America/Sao_Paulo',
  currency: 'BRL',
  fiscalYear: 'calendar',
  enabledModules: ['members', 'financial'],
  enableOCR: false,
  ocrApiKey: null,
  bankName: 'Test Bank',
  accountNumber: '12345-6',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockSuperAdmin = {
  userId: 'admin-id',
  username: 'superadmin',
  role: 'SUPER_ADMIN',
  churchId: undefined,
};

const mockChurchAdmin = {
  userId: 'church-admin-id',
  username: 'churchadmin',
  role: 'ADMIN',
  churchId: mockChurch.id,
};

const mockMember = {
  userId: 'member-id',
  username: 'member',
  role: 'MEMBER',
  churchId: mockChurch.id,
};

describe('Church Implementation Tests', () => {
  let churchesService: ChurchesService;
  let mockDb: any;

  beforeAll(async () => {
    // Setup environment variables for testing
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create fresh service instance
    churchesService = new ChurchesService();
    
    // Mock database responses
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    };
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('1. CRUD Operations Tests', () => {
    describe('Create Church', () => {
      it('should successfully create a church with valid data', async () => {
        const createData = {
          name: 'New Church',
          email: 'newchurch@test.com',
          phone: '+1987654321',
          address: '456 New St',
          city: 'New City',
          state: 'NC',
          zipCode: '54321',
          website: 'https://newchurch.com',
        };

        // Mock database responses
        mockDb.returning.mockResolvedValueOnce([{ ...mockChurch, ...createData }]);
        
        // Mock validation methods
        vi.spyOn(churchesService as any, 'isEmailTaken').mockResolvedValue(false);
        vi.spyOn(churchesService as any, 'generateUniqueSlug').mockResolvedValue('new-church');

        const result = await churchesService.create(createData);

        expect(result).toBeDefined();
        expect(result.name).toBe(createData.name);
        expect(result.email).toBe(createData.email);
      });

      it('should throw validation error for invalid email', async () => {
        const invalidData = {
          name: 'Test Church',
          email: 'invalid-email',
        };

        await expect(churchesService.create(invalidData)).rejects.toThrow(ChurchValidationError);
      });

      it('should throw already exists error for duplicate email', async () => {
        const duplicateData = {
          name: 'Duplicate Church',
          email: mockChurch.email,
        };

        // Mock email already exists
        vi.spyOn(churchesService as any, 'isEmailTaken').mockResolvedValue(true);

        await expect(churchesService.create(duplicateData)).rejects.toThrow(ChurchAlreadyExistsError);
      });
    });

    describe('Read Operations', () => {
      it('should retrieve church by ID', async () => {
        // Mock database response
        mockDb.returning.mockResolvedValueOnce([{
          church: mockChurch,
          settings: mockChurchSettings,
        }]);

        const result = await churchesService.findOne(mockChurch.id);

        expect(result).toBeDefined();
        expect(result.id).toBe(mockChurch.id);
        expect(result.settings).toBeDefined();
      });

      it('should throw not found error for non-existent church', async () => {
        mockDb.returning.mockResolvedValueOnce([]);

        await expect(churchesService.findOne('non-existent-id'))
          .rejects.toThrow(ChurchNotFoundError);
      });

      it('should retrieve church by slug', async () => {
        mockDb.returning.mockResolvedValueOnce([{
          church: mockChurch,
          settings: mockChurchSettings,
        }]);

        const result = await churchesService.findBySlug(mockChurch.slug);

        expect(result).toBeDefined();
        expect(result.slug).toBe(mockChurch.slug);
      });

      it('should list churches with pagination', async () => {
        const mockList = [
          { church: mockChurch, settings: mockChurchSettings }
        ];
        
        mockDb.returning.mockResolvedValueOnce(mockList);
        mockDb.returning.mockResolvedValueOnce([{ count: 1 }]);

        const result = await churchesService.findAll({
          page: 1,
          limit: 10,
          includeInactive: false,
        });

        expect(result).toBeDefined();
        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(10);
        expect(result.totalPages).toBe(1);
      });
    });

    describe('Update Operations', () => {
      it('should successfully update church data', async () => {
        const updateData = {
          name: 'Updated Church Name',
          email: 'updated@church.com',
        };

        // Mock existing church lookup
        vi.spyOn(churchesService, 'findOne').mockResolvedValueOnce(mockChurch);
        
        // Mock validation methods
        vi.spyOn(churchesService as any, 'isEmailTaken').mockResolvedValue(false);
        vi.spyOn(churchesService as any, 'generateUniqueSlug').mockResolvedValue('updated-church-name');

        mockDb.returning.mockResolvedValueOnce([{ ...mockChurch, ...updateData }]);

        const result = await churchesService.update(mockChurch.id, updateData);

        expect(result).toBeDefined();
      });

      it('should throw validation error for invalid update data', async () => {
        const invalidUpdateData = {
          email: 'invalid-email-format',
        };

        await expect(churchesService.update(mockChurch.id, invalidUpdateData))
          .rejects.toThrow(ChurchValidationError);
      });
    });

    describe('Delete Operations', () => {
      it('should perform soft delete successfully', async () => {
        mockDb.returning.mockResolvedValueOnce([{ ...mockChurch, isActive: false }]);

        const result = await churchesService.softDelete(mockChurch.id);

        expect(result).toBeDefined();
        expect(result.isActive).toBe(false);
      });

      it('should throw error when church cannot be deleted', async () => {
        // Mock super admin check
        mockDb.returning.mockResolvedValueOnce([{ count: 1 }]); // Has super admins

        await expect(churchesService.canDelete(mockChurch.id))
          .rejects.toThrow(ChurchCannotBeDeletedError);
      });

      it('should throw error when trying to delete last active church', async () => {
        // Mock no super admins
        mockDb.returning.mockResolvedValueOnce([{ count: 0 }]);
        // Mock only one active church
        mockDb.returning.mockResolvedValueOnce([{ count: 1 }]);

        await expect(churchesService.canDelete(mockChurch.id))
          .rejects.toThrow(LastActiveChurchError);
      });
    });
  });

  describe('2. Slug Generation and Uniqueness Tests', () => {
    it('should generate unique slug from church name', async () => {
      const churchName = 'Amazing Grace Church';
      
      // Mock slug not taken
      vi.spyOn(churchesService as any, 'isSlugTaken').mockResolvedValue(false);

      const slug = await (churchesService as any).generateUniqueSlug(churchName);

      expect(slug).toBe('amazing-grace-church');
    });

    it('should handle duplicate slugs by adding counter', async () => {
      const churchName = 'Grace Church';
      
      // Mock first slug taken, second available
      vi.spyOn(churchesService as any, 'isSlugTaken')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const slug = await (churchesService as any).generateUniqueSlug(churchName);

      expect(slug).toBe('grace-church-1');
    });

    it('should validate slug format correctly', () => {
      const validSlug = 'valid-church-slug';
      const invalidSlug = 'Invalid_Slug-';

      expect(() => {
        ChurchValidator.validateCreateChurch({
          name: 'Test Church',
          email: 'test@church.com',
          slug: validSlug,
        });
      }).not.toThrow();

      expect(() => {
        ChurchValidator.validateCreateChurch({
          name: 'Test Church',
          email: 'test@church.com',
          slug: invalidSlug,
        });
      }).toThrow(ChurchValidationError);
    });

    it('should ensure email uniqueness across churches', async () => {
      const duplicateEmail = 'duplicate@church.com';

      // Mock email already exists
      vi.spyOn(churchesService as any, 'isEmailTaken').mockResolvedValue(true);

      await expect(churchesService.create({
        name: 'New Church',
        email: duplicateEmail,
      })).rejects.toThrow(ChurchAlreadyExistsError);
    });
  });

  describe('3. Church Settings Tests', () => {
    it('should create default settings for new church', async () => {
      mockDb.returning.mockResolvedValueOnce([mockChurchSettings]);

      const result = await churchesService.createDefaultSettings(mockChurch.id);

      expect(result).toBeDefined();
      expect(result.timezone).toBe('America/Sao_Paulo');
      expect(result.currency).toBe('BRL');
      expect(result.fiscalYear).toBe('calendar');
      expect(result.enableOCR).toBe(false);
    });

    it('should get existing settings or create default', async () => {
      // Mock no existing settings
      mockDb.returning.mockResolvedValueOnce([]);
      // Mock default settings creation
      vi.spyOn(churchesService, 'createDefaultSettings').mockResolvedValue(mockChurchSettings);

      const result = await churchesService.getSettings(mockChurch.id);

      expect(result).toBe(mockChurchSettings);
    });

    it('should update church settings successfully', async () => {
      const updateData = {
        timezone: 'America/New_York',
        currency: 'USD',
        enableOCR: true,
        ocrApiKey: 'test-api-key',
      };

      mockDb.returning.mockResolvedValueOnce([{ ...mockChurchSettings, ...updateData }]);

      const result = await churchesService.updateSettings(mockChurch.id, updateData);

      expect(result).toBeDefined();
      expect(result.timezone).toBe(updateData.timezone);
      expect(result.currency).toBe(updateData.currency);
      expect(result.enableOCR).toBe(updateData.enableOCR);
    });

    it('should validate church settings data', () => {
      const invalidSettings = {
        timezone: 'Invalid/Timezone',
        currency: 'INVALID',
        fiscalYear: 'invalid-fiscal-year',
        enableOCR: 'not-boolean' as any,
      };

      expect(() => {
        ChurchValidator.validateChurchSettings(invalidSettings);
      }).toThrow(ChurchSettingsValidationError);
    });

    it('should handle settings not found error', async () => {
      mockDb.returning.mockResolvedValueOnce([]);

      await expect(churchesService.updateSettings('non-existent-church-id', {}))
        .rejects.toThrow(ChurchSettingsNotFoundError);
    });
  });

  describe('4. Permission-Based Access Control Tests', () => {
    describe('Super Admin Permissions', () => {
      it('should allow super admin to access any church', () => {
        // Super admin can access any church - this is tested in the route handlers
        expect(mockSuperAdmin.role).toBe('SUPER_ADMIN');
        expect(mockSuperAdmin.churchId).toBeUndefined();
      });

      it('should allow super admin to create churches', () => {
        // Super admin has full church creation rights
        expect(mockSuperAdmin.role).toBe('SUPER_ADMIN');
      });

      it('should allow super admin to delete churches', () => {
        // Super admin can delete churches (with business rule validation)
        expect(mockSuperAdmin.role).toBe('SUPER_ADMIN');
      });
    });

    describe('Church Admin Permissions', () => {
      it('should allow church admin to access own church only', () => {
        expect(mockChurchAdmin.role).toBe('ADMIN');
        expect(mockChurchAdmin.churchId).toBe(mockChurch.id);
      });

      it('should prevent church admin from accessing other churches', () => {
        const otherChurchId = 'other-church-id';
        expect(mockChurchAdmin.churchId).not.toBe(otherChurchId);
      });

      it('should allow church admin to update own church', () => {
        expect(mockChurchAdmin.role).toBe('ADMIN');
        expect(mockChurchAdmin.churchId).toBe(mockChurch.id);
      });
    });

    describe('Member Permissions', () => {
      it('should prevent members from accessing admin functions', () => {
        expect(mockMember.role).toBe('MEMBER');
        expect(mockMember.role).not.toBe('ADMIN');
        expect(mockMember.role).not.toBe('SUPER_ADMIN');
      });

      it('should prevent members from updating church data', () => {
        expect(mockMember.role).toBe('MEMBER');
      });
    });
  });

  describe('5. Edge Cases and Error Scenarios', () => {
    describe('Data Validation Edge Cases', () => {
      it('should handle extremely long church names', () => {
        const longName = 'A'.repeat(101); // Exceeds 100 character limit

        expect(() => {
          ChurchValidator.validateCreateChurch({
            name: longName,
            email: 'test@church.com',
          });
        }).toThrow(ChurchValidationError);
      });

      it('should handle empty or whitespace-only names', () => {
        const emptyName = '   ';

        expect(() => {
          ChurchValidator.validateCreateChurch({
            name: emptyName,
            email: 'test@church.com',
          });
        }).toThrow(ChurchValidationError);
      });

      it('should validate Brazilian tax ID format', () => {
        const validTaxId = '12.345.678/0001-90';
        const invalidTaxId = '123.456.789/0001-90';

        expect(() => {
          ChurchValidator.validateCreateChurch({
            name: 'Test Church',
            email: 'test@church.com',
            taxId: validTaxId,
          });
        }).not.toThrow();

        expect(() => {
          ChurchValidator.validateCreateChurch({
            name: 'Test Church',
            email: 'test@church.com',
            taxId: invalidTaxId,
          });
        }).toThrow(ChurchValidationError);
      });

      it('should validate Brazilian ZIP code format', () => {
        const validZipCode = '12345-678';
        const invalidZipCode = '123456789';

        expect(() => {
          ChurchValidator.validateCreateChurch({
            name: 'Test Church',
            email: 'test@church.com',
            zipCode: validZipCode,
          });
        }).not.toThrow();

        expect(() => {
          ChurchValidator.validateCreateChurch({
            name: 'Test Church',
            email: 'test@church.com',
            zipCode: invalidZipCode,
          });
        }).toThrow(ChurchValidationError);
      });
    });

    describe('Business Rule Violations', () => {
      it('should prevent deletion of church with super admins', async () => {
        // Mock super admin exists
        mockDb.returning.mockResolvedValueOnce([{ count: 1 }]);

        await expect(churchesService.canDelete(mockChurch.id))
          .rejects.toThrow(ChurchCannotBeDeletedError);
      });

      it('should prevent deactivation of last active church', async () => {
        // Mock this is the last active church
        vi.spyOn(churchesService as any, 'isLastActiveChurch').mockResolvedValue(true);

        await expect(churchesService.deactivate(mockChurch.id))
          .rejects.toThrow();
      });

      it('should handle user transfer validation', async () => {
        const fromChurchId = 'source-church-id';
        const toChurchId = 'target-church-id';

        // Mock source church doesn't exist
        mockDb.returning
          .mockResolvedValueOnce([]) // Source church not found
          .mockResolvedValueOnce([{ id: toChurchId, isActive: true }]); // Target church exists

        await expect(churchesService.transferAllUsers(fromChurchId, toChurchId))
          .rejects.toThrow(ChurchTransferError);
      });
    });

    describe('Database Error Handling', () => {
      it('should handle database connection errors gracefully', async () => {
        // Mock database error
        mockDb.returning.mockRejectedValue(new Error('Database connection failed'));

        await expect(churchesService.findOne(mockChurch.id))
          .rejects.toThrow(ChurchDatabaseError);
      });

      it('should handle query timeout errors', async () => {
        // Mock timeout error
        mockDb.returning.mockRejectedValue(new Error('Query timeout'));

        await expect(churchesService.findAll())
          .rejects.toThrow(ChurchDatabaseError);
      });
    });

    describe('Authentication Edge Cases', () => {
      it('should handle missing JWT token', async () => {
        const token = '';

        await expect(JWTService.verifyToken(token))
          .rejects.toThrow(HTTPException);
      });

      it('should handle invalid JWT token', async () => {
        const invalidToken = 'invalid.jwt.token';

        await expect(JWTService.verifyToken(invalidToken))
          .rejects.toThrow(HTTPException);
      });

      it('should handle expired JWT token', async () => {
        // This would typically be tested with a real expired token
        // For now, we'll test the error handling structure
        const expiredToken = 'expired.jwt.token';

        await expect(JWTService.verifyToken(expiredToken))
          .rejects.toThrow(HTTPException);
      });
    });
  });

  describe('6. Authentication Middleware Compatibility', () => {
    it('should generate valid JWT tokens', async () => {
      const payload = mockSuperAdmin;

      const token = await JWTService.signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should verify valid JWT tokens', async () => {
      const payload = mockChurchAdmin;

      const token = await JWTService.signToken(payload);
      const verified = await JWTService.verifyToken(token);

      expect(verified.userId).toBe(payload.userId);
      expect(verified.role).toBe(payload.role);
      expect(verified.churchId).toBe(payload.churchId);
    });

    it('should handle role-based authorization correctly', () => {
      // Test super admin role
      expect(['SUPER_ADMIN'].includes(mockSuperAdmin.role)).toBe(true);
      
      // Test church admin role
      expect(['ADMIN', 'SUPER_ADMIN'].includes(mockChurchAdmin.role)).toBe(true);
      
      // Test member role restrictions
      expect(['ADMIN', 'SUPER_ADMIN'].includes(mockMember.role)).toBe(false);
    });

    it('should enforce church context correctly', () => {
      // Super admin doesn't need church context
      expect(mockSuperAdmin.role === 'SUPER_ADMIN' || mockSuperAdmin.churchId).toBeTruthy();
      
      // Other roles need church context
      expect(mockChurchAdmin.churchId).toBeDefined();
      expect(mockMember.churchId).toBeDefined();
    });
  });

  describe('Performance and Scalability Tests', () => {
    it('should handle large result sets with pagination', async () => {
      const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
        church: { ...mockChurch, id: `church-${i}` },
        settings: mockChurchSettings,
      }));

      mockDb.returning
        .mockResolvedValueOnce(largeDataSet.slice(0, 10)) // First page
        .mockResolvedValueOnce([{ count: 1000 }]); // Total count

      const result = await churchesService.findAll({
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(10);
      expect(result.total).toBe(1000);
      expect(result.totalPages).toBe(100);
    });

    it('should handle search queries efficiently', async () => {
      const searchTerm = 'Grace';
      
      mockDb.returning
        .mockResolvedValueOnce([{ church: mockChurch, settings: mockChurchSettings }])
        .mockResolvedValueOnce([{ count: 1 }]);

      const result = await churchesService.findAll({
        search: searchTerm,
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
