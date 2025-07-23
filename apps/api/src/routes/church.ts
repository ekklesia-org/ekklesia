import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { auth, getAuthUser } from '../middlewares/auth';
import { z } from 'zod';
import {
  ChurchSchema,
  CreateChurchSchema,
  UpdateChurchSchema,
  ChurchListQuerySchema,
  ChurchListResponseSchema,
  ChurchSettingsSchema,
} from '../schemas/church';
import { ChurchesService } from '../services/churches.service';

const churchesRouter = new OpenAPIHono();
const churchesService = new ChurchesService();

// Error response schema
const ErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.any().optional()
});

// Get current user's church route
const getCurrentChurchRoute = createRoute({
  method: 'get',
  path: '/current',
  tags: ['Church'],
  summary: 'Get current user\'s church',
  description: 'Retrieve the church information for the authenticated user',
  security: [{
    Bearer: []
  }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ChurchSchema,
        },
      },
      description: 'Church information',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Church not found',
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

// Get current user's church
churchesRouter.openapi(getCurrentChurchRoute, async (c) => {
  try {
    // Apply auth middleware manually
    await auth(c, async () => {});

    const user = getAuthUser(c);

    // TODO: Implement actual church service
    return c.json({
      id: user.churchId || 'default-church-id',
      name: 'Default Church',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// List churches route (admin only)
const listChurchesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Church'],
  summary: 'List all churches',
  description: 'Retrieve a paginated list of all churches (admin only)',
  security: [{
    Bearer: []
  }],
  request: {
    query: ChurchListQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ChurchListResponseSchema,
        },
      },
      description: 'List of churches',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
    403: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Forbidden - Admin access required',
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

// List churches (admin only)
churchesRouter.openapi(listChurchesRoute, async (c) => {
  try {
    // Apply auth middleware manually
    await auth(c, async () => {});

    const user = getAuthUser(c);
    const query = c.req.valid('query');

    // TODO: Check admin permissions
    // TODO: Implement actual church service

    return c.json({
      data: [],
      total: 0,
      page: query.page,
      limit: query.limit,
      totalPages: 0,
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Get church by ID route
const getChurchByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Church'],
  summary: 'Get church by ID',
  description: 'Retrieve a specific church by its ID',
  security: [{
    Bearer: []
  }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ChurchSchema,
        },
      },
      description: 'Church details',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Church not found',
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

// Get church by ID
churchesRouter.openapi(getChurchByIdRoute, async (c) => {
  try {
    // Apply auth middleware manually
    await auth(c, async () => {});

    const { id } = c.req.valid('param');

    // TODO: Implement actual church service
    throw new HTTPException(404, { message: 'Church not found' });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Create church route (super admin only)
const createChurchRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Church'],
  summary: 'Create a new church',
  description: 'Create a new church in the system (super admin only)',
  security: [{
    Bearer: []
  }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateChurchSchema,
        },
      },
      description: 'Church details',
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: ChurchSchema,
        },
      },
      description: 'Church created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid input',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
    403: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Forbidden - Super admin access required',
    },
    409: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Church already exists',
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

// Create church (super admin only)
churchesRouter.openapi(createChurchRoute, async (c) => {
  try {
    // Apply auth middleware manually
    await auth(c, async () => {});

    const user = getAuthUser(c);
    const input = c.req.valid('json');

    // TODO: Check super admin permissions
    // TODO: Implement actual church service

    throw new HTTPException(501, { message: 'Not implemented' });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Update church route
const updateChurchRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Church'],
  summary: 'Update church',
  description: 'Update an existing church\'s information',
  security: [{
    Bearer: []
  }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateChurchSchema,
        },
      },
      description: 'Updated church details',
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ChurchSchema,
        },
      },
      description: 'Church updated successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid input',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
    403: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Forbidden',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Church not found',
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

// Update church
churchesRouter.openapi(updateChurchRoute, async (c) => {
  try {
    // Apply auth middleware manually
    await auth(c, async () => {});

    const { id } = c.req.valid('param');
    const input = c.req.valid('json');

    // TODO: Check permissions
    // TODO: Implement actual church service

    throw new HTTPException(501, { message: 'Not implemented' });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Delete church route (super admin only)
const deleteChurchRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Church'],
  summary: 'Delete church',
  description: 'Soft delete a church (super admin only)',
  security: [{
    Bearer: []
  }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    204: {
      description: 'Church deleted successfully',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
    403: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Forbidden - Super admin access required',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Church not found',
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

// Get church settings route
const getChurchSettingsRoute = createRoute({
  method: 'get',
  path: '/{id}/settings',
  tags: ['Church Settings'],
  summary: 'Get church settings',
  description: 'Retrieve the settings for a specific church',
  security: [{
    Bearer: []
  }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ChurchSettingsSchema,
        },
      },
      description: 'Church settings',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Settings not found',
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

// Get church settings
churchesRouter.openapi(getChurchSettingsRoute, async (c) => {
  try {
    // Apply auth middleware manually
    await auth(c, async () => {});

    const { id } = c.req.valid('param');

    const settings = await churchesService.getSettings(id);

    return c.json(settings);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Update church settings route
const updateChurchSettingsRoute = createRoute({
  method: 'put',
  path: '/{id}/settings',
  tags: ['Church Settings'],
  summary: 'Update church settings',
  description: 'Update the settings for a specific church',
  security: [{
    Bearer: []
  }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        'application/json': {
          schema: ChurchSettingsSchema,
        },
      },
      description: 'Updated church settings',
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ChurchSettingsSchema,
        },
      },
      description: 'Church settings updated',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid input',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Church not found',
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

// Update church settings
churchesRouter.openapi(updateChurchSettingsRoute, async (c) => {
  try {
    // Apply auth middleware manually
    await auth(c, async () => {});

    const { id } = c.req.valid('param');
    const input = c.req.valid('json');

    const updatedSettings = await churchesService.updateSettings(id, input);

    return c.json(updatedSettings);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Delete church (super admin only)
churchesRouter.openapi(deleteChurchRoute, async (c) => {
  try {
    // Apply auth middleware manually
    await auth(c, async () => {});

    const { id } = c.req.valid('param');

    // TODO: Check super admin permissions
    // TODO: Implement actual church service

    throw new HTTPException(501, { message: 'Not implemented' });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

export { churchesRouter };
