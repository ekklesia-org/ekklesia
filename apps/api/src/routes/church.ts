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
import { ChurchError } from '../errors/church.errors';

const churchesRouter = new OpenAPIHono();
const churchesService = new ChurchesService();

// Error response schema
const ErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.any().optional()
});

// Helper function to handle custom church errors
function handleChurchError(error: unknown): never {
  if (error instanceof ChurchError) {
    throw new HTTPException(error.status, {
      message: error.message,
      code: error.code,
      details: error.details
    });
  }
  
  if (error instanceof HTTPException) {
    throw error;
  }
  
  // Fallback for unexpected errors
  console.error('Unexpected error in church route:', error);
  throw new HTTPException(500, { 
    message: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
}

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

    if (!user.churchId) {
      throw new HTTPException(404, { message: 'User has no associated church' });
    }

    const church = await churchesService.findOne(user.churchId);
    return c.json(church);
  } catch (error) {
    handleChurchError(error);
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

    // Check admin permissions (CHURCH_ADMIN or SUPER_ADMIN can list churches)
    if (user.role !== 'CHURCH_ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new HTTPException(403, { message: 'Admin access required' });
    }

    // Get churches list from service
    const result = await churchesService.findAll({
      page: query.page,
      limit: query.limit,
      includeInactive: query.includeInactive,
      search: query.search,
    });

    return c.json(result);
  } catch (error) {
    handleChurchError(error);
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

    const user = getAuthUser(c);
    const { id } = c.req.valid('param');

    // Permission check: Super admins can access any church, others only their own
    if (user.role !== 'SUPER_ADMIN' && user.churchId !== id) {
      throw new HTTPException(403, { message: 'Access denied to this church' });
    }

    const church = await churchesService.findOne(id);
    return c.json(church);
  } catch (error) {
    handleChurchError(error);
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

    // Check super admin permissions
    if (user.role !== 'SUPER_ADMIN') {
      throw new HTTPException(403, { message: 'Super admin access required' });
    }

    const church = await churchesService.create(input);
    return c.json(church, 201);
  } catch (error) {
    handleChurchError(error);
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

    const user = getAuthUser(c);
    const { id } = c.req.valid('param');
    const input = c.req.valid('json');

    // Permission check: Super admins can update any church, admins can only update their own
    if (user.role === 'SUPER_ADMIN') {
      // Super admins can update any church
    } else if (user.role === 'CHURCH_ADMIN' && user.churchId === id) {
      // Admins can only update their own church
    } else {
      throw new HTTPException(403, { message: 'Access denied to update this church' });
    }

    const updatedChurch = await churchesService.update(id, input);
    return c.json(updatedChurch);
  } catch (error) {
    handleChurchError(error);
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

    const user = getAuthUser(c);
    const { id } = c.req.valid('param');

    // Permission check: Super admins can access any church settings, others only their own
    if (user.role !== 'SUPER_ADMIN' && user.churchId !== id) {
      throw new HTTPException(403, { message: 'Access denied to this church settings' });
    }

    const settings = await churchesService.getSettings(id);
    return c.json(settings);
  } catch (error) {
    handleChurchError(error);
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

    const user = getAuthUser(c);
    const { id } = c.req.valid('param');
    const input = c.req.valid('json');

    // Permission check: Super admins can update any church settings, admins can only update their own
    if (user.role === 'SUPER_ADMIN') {
      // Super admins can update any church settings
    } else if (user.role === 'CHURCH_ADMIN' && user.churchId === id) {
      // Admins can only update their own church settings
    } else {
      throw new HTTPException(403, { message: 'Access denied to update this church settings' });
    }

    const updatedSettings = await churchesService.updateSettings(id, input);
    return c.json(updatedSettings);
  } catch (error) {
    handleChurchError(error);
  }
});

// Delete church (super admin only)
churchesRouter.openapi(deleteChurchRoute, async (c) => {
  try {
    // Apply auth middleware manually
    await auth(c, async () => {});

    const user = getAuthUser(c);
    const { id } = c.req.valid('param');

    // Check super admin permissions
    if (user.role !== 'SUPER_ADMIN') {
      throw new HTTPException(403, { message: 'Super admin access required' });
    }

    // The canDelete method now throws appropriate errors, so we can call it directly
    await churchesService.canDelete(id);
    await churchesService.softDelete(id);
    return c.body(null, 204);
  } catch (error) {
    handleChurchError(error);
  }
});

export { churchesRouter };
