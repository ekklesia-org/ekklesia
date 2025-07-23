import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { auth, getAuthUser, churchContext } from '../middlewares/auth';
import { z } from 'zod';
import {
  MemberSchema,
  CreateMemberSchema,
  UpdateMemberSchema,
  MemberListQuerySchema,
  MemberListResponseSchema,
  MemberWithUserSchema,
  MemberStatisticsSchema,
} from '../schemas/members';

const membersRouter = new OpenAPIHono();

// Error response schema
const ErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.any().optional()
});

// List members route
const listMembersRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Members'],
  summary: 'List members',
  description: 'Retrieve a paginated list of church members with optional filters',
  security: [{
    Bearer: []
  }],
  request: {
    query: MemberListQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MemberListResponseSchema,
        },
      },
      description: 'List of members',
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

// List members endpoint
membersRouter.openapi(listMembersRoute, async (c) => {
  // Apply auth and church context middleware
  await auth(c, async () => {});
  await churchContext(c, async () => {});
  
  const user = getAuthUser(c);
  const query = c.req.valid('query');

  // TODO: Implement actual member service
  return c.json({
    data: [],
    total: 0,
    page: query.page,
    limit: query.limit,
    totalPages: 0,
  });
});

// Get member by ID route
const getMemberByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Members'],
  summary: 'Get member by ID',
  description: 'Retrieve a specific member by their ID',
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
          schema: MemberWithUserSchema,
        },
      },
      description: 'Member details',
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
      description: 'Member not found',
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

// Get member by ID endpoint
membersRouter.openapi(getMemberByIdRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});
  
  const { id } = c.req.valid('param');

  // TODO: Implement actual member service
  throw new HTTPException(404, { message: 'Member not found' });
});

// Create member route
const createMemberRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Members'],
  summary: 'Create a new member',
  description: 'Create a new member in the church',
  security: [{
    Bearer: []
  }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateMemberSchema,
        },
      },
      description: 'Member details',
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: MemberSchema,
        },
      },
      description: 'Member created successfully',
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
      description: 'Member already exists',
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

// Create member endpoint
membersRouter.openapi(createMemberRoute, async (c) => {
  // Apply auth and church context middleware
  await auth(c, async () => {});
  await churchContext(c, async () => {});
  
  const user = getAuthUser(c);
  const input = c.req.valid('json');

  // TODO: Check permissions
  // TODO: Implement actual member service

  throw new HTTPException(501, { message: 'Not implemented' });
});

// Update member route
const updateMemberRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Members'],
  summary: 'Update member',
  description: 'Update an existing member\'s information',
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
          schema: UpdateMemberSchema,
        },
      },
      description: 'Updated member details',
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MemberSchema,
        },
      },
      description: 'Member updated successfully',
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
      description: 'Member not found',
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

// Update member endpoint
membersRouter.openapi(updateMemberRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});
  
  const { id } = c.req.valid('param');
  const input = c.req.valid('json');

  // TODO: Check permissions
  // TODO: Implement actual member service

  throw new HTTPException(501, { message: 'Not implemented' });
});

// Delete member route
const deleteMemberRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Members'],
  summary: 'Delete member',
  description: 'Soft delete a member',
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
      description: 'Member deleted successfully',
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
      description: 'Member not found',
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

// Delete member endpoint
membersRouter.openapi(deleteMemberRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});
  
  const { id } = c.req.valid('param');

  // TODO: Check permissions
  // TODO: Implement actual member service

  throw new HTTPException(501, { message: 'Not implemented' });
});

// Get member statistics route
const getMemberStatisticsRoute = createRoute({
  method: 'get',
  path: '/statistics',
  tags: ['Members'],
  summary: 'Get member statistics',
  description: 'Retrieve statistics about church members',
  security: [{
    Bearer: []
  }],
  request: {
    query: z.object({
      churchId: z.string().uuid().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MemberStatisticsSchema,
        },
      },
      description: 'Member statistics',
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

// Get member statistics endpoint
membersRouter.openapi(getMemberStatisticsRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});
  
  const query = c.req.valid('query');

  // TODO: Implement actual statistics service
  return c.json({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    visitingMembers: 0,
    membersByMaritalStatus: {},
    membersByAgeGroup: {},
    recentBaptisms: 0,
    newMembersThisMonth: 0,
  });
});

// Search members route
const searchMembersRoute = createRoute({
  method: 'get',
  path: '/search',
  tags: ['Members'],
  summary: 'Search members',
  description: 'Search for members by name, email, or phone',
  security: [{
    Bearer: []
  }],
  request: {
    query: z.object({
      q: z.string().min(1),
      churchId: z.string().uuid().optional(),
      limit: z.coerce.number().int().positive().max(50).default(10),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(MemberSchema),
        },
      },
      description: 'Search results',
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

// Search members endpoint
membersRouter.openapi(searchMembersRoute, async (c) => {
  // Apply auth middleware
  await auth(c, async () => {});
  
  const query = c.req.valid('query');

  // TODO: Implement actual search service
  return c.json([]);
});

export { membersRouter };
