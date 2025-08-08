import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { SocietiesService } from '../services/societies.service';
import { auth, getAuthUser, churchContext } from '../middlewares/auth';
import { z } from 'zod';
import {
  CreateSocietySchema,
  UpdateSocietySchema,
  AddSocietyMemberSchema,
  UpdateSocietyMemberSchema,
  SocietyQuerySchema,
  SocietySchema,
  SocietyListResponseSchema,
  SocietyMemberSchema,
} from '../schemas/societies';

const societiesRouter = new OpenAPIHono();
const societiesService = new SocietiesService();

const ErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.any().optional()
});

const listSocietiesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Societies'],
  summary: 'List societies',
  description: 'Retrieve a paginated list of church societies with optional filters',
  security: [{ Bearer: [] }],
  request: { query: SocietyQuerySchema },
  responses: {
    200: {
      content: { 'application/json': { schema: SocietyListResponseSchema } },
      description: 'List of societies',
    },
    401: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Unauthorized',
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Internal server error',
    },
  },
});

societiesRouter.openapi(listSocietiesRoute, async (c) => {
  await auth(c, async () => {});
  await churchContext(c, async () => {});
  
  try {
    const user = getAuthUser(c);
    const query = c.req.valid('query');
    const churchId = user.role === 'SUPER_ADMIN' && query.churchId ? query.churchId : user.churchId!;
    const result = await societiesService.findAll(churchId, query.isActive !== undefined ? !query.isActive : false, query.page, query.limit);
    return c.json(result);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

export { societiesRouter };
