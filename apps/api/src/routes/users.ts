import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { auth, getAuthUser, churchContext } from '../middlewares/auth';
import { UsersService } from '../services/users.service';
import { z } from 'zod';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UpdatePasswordSchema,
  UpdateRoleSchema,
  UserListQuerySchema,
  UserByChurchQuerySchema,
  AvailableForMemberQuerySchema,
  UserSchema,
  UserListResponseSchema,
} from '../schemas/users';

const usersRouter = new OpenAPIHono();
const usersService = new UsersService();

// Error response schema
const ErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.any().optional()
});

// Success message schema
const MessageSchema = z.object({
  message: z.string()
});

// Create user route
const createUserRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Users'],
  summary: 'Create a new user',
  description: 'Create a new user account in the system',
  security: [{
    Bearer: []
  }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserSchema,
        },
      },
      description: 'User details',
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'User created successfully',
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
    409: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'User already exists',
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

// Create a new user
usersRouter.openapi(createUserRoute, async (c) => {
  // Apply auth and church context middleware
  await auth(c, async () => {});
  await churchContext(c, async () => {});

  try {
    const currentUser = getAuthUser(c);
    const input = c.req.valid('json');

    const user = await usersService.create(input, {
      ...currentUser,
      role: currentUser.role as any
    });
    return c.json(user, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// List users route
const listUsersRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Users'],
  summary: 'List users',
  description: 'Retrieve a paginated list of users with optional filters',
  security: [{
    Bearer: []
  }],
  request: {
    query: UserListQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserListResponseSchema,
        },
      },
      description: 'List of users',
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

// Get list of all users with pagination and filters
usersRouter.openapi(listUsersRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});

  try {
    const currentUser = getAuthUser(c);
    const query = c.req.valid('query');

    const result = await usersService.findAll(
      query.page,
      query.limit,
      query.includeInactive,
      query.churchId,
      query.role,
      {
        ...currentUser,
        role: currentUser.role as any
      }
    );

    return c.json(result);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Get available users for member linking route
const getAvailableUsersRoute = createRoute({
  method: 'get',
  path: '/available/for-member',
  tags: ['Users'],
  summary: 'Get available users for member linking',
  description: 'Retrieve users that can be linked to a member profile',
  security: [{
    Bearer: []
  }],
  request: {
    query: AvailableForMemberQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(UserSchema),
        },
      },
      description: 'List of available users',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
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

// Get users available for member linking
usersRouter.openapi(getAvailableUsersRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});

  try {
    const currentUser = getAuthUser(c);
    const query = c.req.valid('query');

    const users = await usersService.findAvailableForMember(
      query.churchId,
      query.excludeMemberId,
      {
        ...currentUser,
        role: currentUser.role as any
      }
    );

    return c.json(users);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Get user by email route
const getUserByEmailRoute = createRoute({
  method: 'get',
  path: '/email/{email}',
  tags: ['Users'],
  summary: 'Get user by email',
  description: 'Retrieve a user by their email address',
  security: [{
    Bearer: []
  }],
  request: {
    params: z.object({
      email: z.string().email(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'User details',
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
      description: 'User not found',
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

// Get user by email
usersRouter.openapi(getUserByEmailRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});

  try {
    const { email } = c.req.valid('param');
    const user = await usersService.findByEmail(email);
    return c.json(user);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Get users by church route
const getUsersByChurchRoute = createRoute({
  method: 'get',
  path: '/church/{churchId}',
  tags: ['Users'],
  summary: 'Get users by church',
  description: 'Retrieve all users belonging to a specific church',
  security: [{
    Bearer: []
  }],
  request: {
    params: z.object({
      churchId: z.string().uuid(),
    }),
    query: UserByChurchQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserListResponseSchema,
        },
      },
      description: 'List of church users',
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

// Get users by church ID
usersRouter.openapi(getUsersByChurchRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});

  try {
    const currentUser = getAuthUser(c);
    const { churchId } = c.req.valid('param');
    const query = c.req.valid('query');

    const result = await usersService.findByChurch(
      churchId,
      query.page,
      query.limit,
      query.includeInactive,
      {
        ...currentUser,
        role: currentUser.role as any
      }
    );

    return c.json(result);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Get user by ID route
const getUserByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Users'],
  summary: 'Get user by ID',
  description: 'Retrieve a specific user by their ID',
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
          schema: UserSchema,
        },
      },
      description: 'User details',
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
      description: 'User not found',
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

// Get user by ID
usersRouter.openapi(getUserByIdRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});

  try {
    const { id } = c.req.valid('param');
    const user = await usersService.findOne(id);
    return c.json(user);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Update user route
const updateUserRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Users'],
  summary: 'Update user',
  description: 'Update an existing user\'s information',
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
          schema: UpdateUserSchema,
        },
      },
      description: 'Updated user details',
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'User updated successfully',
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
      description: 'User not found',
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

// Update user
usersRouter.openapi(updateUserRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});

  try {
    const { id } = c.req.valid('param');
    const input = c.req.valid('json');
    const currentUser = getAuthUser(c);

    // Non-super admins can't change churchId
    if (currentUser.role !== 'SUPER_ADMIN' && input.churchId) {
      delete input.churchId;
    }

    const user = await usersService.update(id, input);
    return c.json(user);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Update user password route
const updatePasswordRoute = createRoute({
  method: 'put',
  path: '/{id}/password',
  tags: ['Users'],
  summary: 'Update user password',
  description: 'Update a user\'s password',
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
          schema: UpdatePasswordSchema,
        },
      },
      description: 'New password information',
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MessageSchema,
        },
      },
      description: 'Password updated successfully',
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
      description: 'User not found',
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

// Update user password
usersRouter.openapi(updatePasswordRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});

  try {
    const { id } = c.req.valid('param');
    const input = c.req.valid('json');
    const result = await usersService.updatePassword(id, input);
    return c.json(result);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Activate user route
const activateUserRoute = createRoute({
  method: 'put',
  path: '/{id}/activate',
  tags: ['Users'],
  summary: 'Activate user',
  description: 'Activate a deactivated user account',
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
          schema: UserSchema,
        },
      },
      description: 'User activated successfully',
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
      description: 'User not found',
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

// Activate user
usersRouter.openapi(activateUserRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});

  try {
    const { id } = c.req.valid('param');
    const user = await usersService.activate(id);
    return c.json(user);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Deactivate user
usersRouter.put('/:id/deactivate', auth, async (c) => {
  try {
    const id = c.req.param('id');
    const user = await usersService.deactivate(id);
    return c.json(user);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Update user role
usersRouter.put(
  '/:id/role',
  auth,
  zValidator('json', UpdateRoleSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const { role } = c.req.valid('json');
      const currentUser = getAuthUser(c);

      // Only super admins can change roles
      if (currentUser.role !== 'SUPER_ADMIN') {
        throw new HTTPException(403, {
          message: 'Only super administrators can change user roles'
        });
      }

      const user = await usersService.updateRole(id, role);
      return c.json(user);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Internal server error' });
    }
  }
);

// Soft delete user
usersRouter.delete('/:id', auth, async (c) => {
  try {
    const id = c.req.param('id');
    const currentUser = getAuthUser(c);
    const user = await usersService.remove(id, {
      ...currentUser,
      role: currentUser.role as any
    });
    return c.json(user);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Permanently delete user
usersRouter.delete('/:id/hard', auth, async (c) => {
  try {
    const id = c.req.param('id');
    const currentUser = getAuthUser(c);

    // Only super admins can permanently delete users
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new HTTPException(403, {
        message: 'Only super administrators can permanently delete users'
      });
    }

    await usersService.hardDelete(id, {
      ...currentUser,
      role: currentUser.role as any
    });
    return c.body(null, 204);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

export { usersRouter };
