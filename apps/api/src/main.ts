/**
 * Hono API Server
 * Church Management System API
 */

import { config } from 'dotenv';
config();

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';

// Import routers
import { authRouter } from './routes/auth';
import { churchRouter } from './routes/church';
import { membersRouter } from './routes/members';
import { societiesRouter } from './routes/societies';
import { usersRouter } from './routes/users';
import { healthRouter } from './routes/health';
import { financialRouter } from './routes/financial';

// Create main app with OpenAPI support
const app = new OpenAPIHono();

// Global middlewares
app.use('*', cors({
  origin: ['http://localhost:4200', 'http://localhost:4201'], // Frontend origins
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use('*', logger());
app.use('*', prettyJSON());

// API routes
app.route('/api/auth', authRouter);
app.route('/api/church', churchRouter);
app.route('/api/members', membersRouter);
app.route('/api/societies', societiesRouter);
app.route('/api/users', usersRouter);
app.route('/api/health', healthRouter);
app.route('/api/financial', financialRouter);

// Health check endpoint
app.get('/api', (c) => {
  return c.json({
    message: 'Ekklesia API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// OpenAPI documentation
app.doc('/api/docs/openapi.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Ekklesia API',
    description: 'Church Management System API',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
});

// Swagger UI
app.get('/api/docs', swaggerUI({
  url: '/api/docs/openapi.json',
  persistAuthorization: true,
}));

const port = Number(process.env.API_PORT) || 3000;

console.log(`🚀 Server is running on http://localhost:${port}/api`);
console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);

serve({
  fetch: app.fetch,
  port,
});
