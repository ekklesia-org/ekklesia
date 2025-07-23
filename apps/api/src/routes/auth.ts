import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { AuthService } from '../services/auth.service';
import { auth, getAuthUser } from '../middlewares/auth';
import {
  LoginSchema,
  RegisterSchema,
  SetupSchema,
  AuthResponseSchema,
  UserProfileSchema,
  TokenVerificationSchema,
} from '../schemas/auth';
import { z } from 'zod';

const authRouter = new OpenAPIHono();
const authService = new AuthService();

// Error response schema
const ErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.any().optional()
});

// Setup status response schema
const SetupStatusSchema = z.object({
  needsSetup: z.boolean()
});

// Login route definition
const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Authentication'],
  summary: 'User login',
  description: 'Authenticate a user with email and password to receive a JWT token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginSchema,
        },
      },
      description: 'Login credentials',
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AuthResponseSchema,
        },
      },
      description: 'Successful authentication',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid credentials',
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

// Login endpoint
authRouter.openapi(loginRoute, async (c) => {
  try {
    const input = c.req.valid('json');
    const result = await authService.login(input);

    return c.json(result, 200);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Register route definition
const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  tags: ['Authentication'],
  summary: 'Register a new user',
  description: 'Create a new user account in the system',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterSchema,
        },
      },
      description: 'Registration details',
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: AuthResponseSchema,
        },
      },
      description: 'User successfully registered',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid registration data',
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

// Register endpoint
authRouter.openapi(registerRoute, async (c) => {
  try {
    const input = c.req.valid('json');
    const result = await authService.register(input);

    return c.json(result, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Setup route definition
const setupRoute = createRoute({
  method: 'post',
  path: '/setup',
  tags: ['Authentication'],
  summary: 'Initial system setup',
  description: 'Create the first admin user and church for initial system setup',
  request: {
    body: {
      content: {
        'application/json': {
          schema: SetupSchema,
        },
      },
      description: 'Initial setup details including admin user and church information',
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: AuthResponseSchema,
        },
      },
      description: 'System successfully set up',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid setup data',
    },
    409: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'System already set up',
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

// Setup endpoint (initial system setup)
authRouter.openapi(setupRoute, async (c) => {
  try {
    const input = c.req.valid('json');
    const result = await authService.setup(input);

    return c.json(result, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Profile route definition
const profileRoute = createRoute({
  method: 'get',
  path: '/profile',
  tags: ['Authentication'],
  summary: 'Get user profile',
  description: 'Retrieve the profile information of the authenticated user',
  security: [{
    Bearer: []
  }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserProfileSchema,
        },
      },
      description: 'User profile data',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized - Invalid or missing token',
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

// Get profile endpoint (protected)
authRouter.openapi(profileRoute, async (c) => {
  try {
    // Apply auth middleware manually
    await auth(c, async () => {});

    const user = getAuthUser(c);
    const profile = await authService.validateUser(user.userId);

    if (!profile) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    return c.json(profile, 200);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Verify route definition
const verifyRoute = createRoute({
  method: 'get',
  path: '/verify',
  tags: ['Authentication'],
  summary: 'Verify authentication token',
  description: 'Verify that the provided JWT token is valid and return basic user information',
  security: [{
    Bearer: []
  }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TokenVerificationSchema,
        },
      },
      description: 'Token is valid',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized - Invalid or missing token',
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

// Verify token endpoint (protected)
authRouter.openapi(verifyRoute, async (c) => {
  try {
    // Apply auth middleware manually
    await auth(c, async () => {});

    const user = getAuthUser(c);

    const verification = {
      valid: true,
      userId: user.userId,
      username: user.username
    };

    return c.json(verification, 200);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

// Setup status route definition
const setupStatusRoute = createRoute({
  method: 'get',
  path: '/setup-status',
  tags: ['Authentication'],
  summary: 'Check system setup status',
  description: 'Check whether the system needs initial setup (no users exist)',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SetupStatusSchema,
        },
      },
      description: 'Setup status',
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

// Check if system needs setup
authRouter.openapi(setupStatusRoute, async (c) => {
  try {
    // This would check if any users exist in the system
    // For now, we'll just return that setup is needed
    return c.json({ needsSetup: false }, 200);
  } catch (error) {
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

export { authRouter };
