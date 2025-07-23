import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { DrizzleService } from '@ekklesia/database';
import { z } from 'zod';

const healthRouter = new OpenAPIHono();

// Health check response schemas
const ServiceStatusSchema = z.object({
  database: z.enum(['connected', 'disconnected']),
  api: z.enum(['running', 'stopped'])
});

const HealthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: z.string(),
  services: ServiceStatusSchema,
  error: z.string().optional()
});

// Health check route definition
const healthCheckRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Health'],
  summary: 'Health check',
  description: 'Check the health status of the API and its dependencies',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: HealthCheckResponseSchema,
        },
      },
      description: 'Service is healthy',
    },
    503: {
      content: {
        'application/json': {
          schema: HealthCheckResponseSchema,
        },
      },
      description: 'Service is unhealthy',
    },
  },
});

// Health check endpoint
healthRouter.openapi(healthCheckRoute, async (c) => {
  try {
    // Test database connection
    const drizzleService = new DrizzleService();
    await drizzleService.db.execute('SELECT 1');

    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running'
      }
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        api: 'running'
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 503);
  }
});

export { healthRouter };
