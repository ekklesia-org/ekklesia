import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { SetupService } from '../services/setup.service';
import { z } from 'zod';
import {
  SetupSchema,
  SystemStatusSchema,
  SetupResponseSchema,
} from '../schemas/setup';

const setupRouter = new OpenAPIHono();
const setupService = new SetupService();

// Error response schema
const ErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.any().optional()
});

// Get setup status route
const getSetupStatusRoute = createRoute({
  method: 'get',
  path: '/status',
  tags: ['Setup'],
  summary: 'Check if system is initialized',
  description: 'Check whether the system has been initialized with a super admin user',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SystemStatusSchema,
        },
      },
      description: 'System status',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Internal server error',
    },
  },
});

// Check system initialization status
setupRouter.openapi(getSetupStatusRoute, async (c) => {
  try {
    const isInitialized = await setupService.isSystemInitialized();
    return c.json({
      isInitialized,
      needsSetup: !isInitialized
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Initialize system route
const initializeSystemRoute = createRoute({
  method: 'post',
  path: '/initialize',
  tags: ['Setup'],
  summary: 'Initialize system with first admin user',
  description: 'Initialize the system by creating the first church and super admin user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: SetupSchema,
        },
      },
      description: 'Setup data including admin user and church details',
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: SetupResponseSchema,
        },
      },
      description: 'System initialized successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Bad request - System already initialized or invalid input',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Internal server error',
    },
  },
});

// Initialize system with first admin user
setupRouter.openapi(initializeSystemRoute, async (c) => {
  try {
    const isInitialized = await setupService.isSystemInitialized();
    
    if (isInitialized) {
      throw new HTTPException(400, {
        message: 'System is already initialized'
      });
    }

    const setupInput = c.req.valid('json');
    const result = await setupService.initializeSystem(setupInput);
    
    return c.json({
      message: 'System initialized successfully',
      user: result.user,
      church: result.church
    }, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

export { setupRouter };
