# Ekklesia API

This is the Hono-based API server for the Ekklesia Church Management System.

## Technology Stack

- **Framework**: [Hono](https://hono.dev/) - Ultra-fast web framework for the Edge
- **Runtime**: Node.js with TypeScript
- **Development**: tsx for hot-reloading
- **API Documentation**: OpenAPI/Swagger
- **Database**: PostgreSQL with Drizzle ORM

## Build Configuration

The project uses Nx for monorepo management with the following targets:

### Development

```bash
# Start the development server with hot-reloading
nx serve api

# or
nx run api:serve:dev
```

This uses `tsx watch` to automatically restart the server when files change.

### Production Build

```bash
# Build the API for production
nx build api

# Run the production build
nx serve api --configuration=production
```

The production build:
- Compiles TypeScript to JavaScript using `tsc`
- Outputs to `dist/apps/api/`
- Generates source maps and type declarations
- Runs the compiled JavaScript with Node.js

### Other Commands

```bash
# Type checking without emitting files
nx run api:typecheck

# Run tests
nx test api

# Lint the code
nx lint api
```

## Environment Variables

The API uses environment variables for configuration. Create a `.env` file in the root directory based on the `.env.example` file in `apps/api/`:

```bash
# API Configuration
API_PORT=3000

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/ekklesia

# JWT Configuration
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:4200,http://localhost:4201

# Node Environment
NODE_ENV=development
```

## Project Structure

```
apps/api/
├── src/
│   ├── main.ts          # Application entry point
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Custom middleware
│   └── schemas/         # Zod validation schemas
├── project.json         # Nx project configuration
├── tsconfig.json        # TypeScript base config
├── tsconfig.app.json    # TypeScript app config
├── tsconfig.spec.json   # TypeScript test config
└── jest.config.ts       # Jest test configuration
```

## API Documentation

When the server is running, you can access:
- API Documentation: `http://localhost:3000/api/docs`
- OpenAPI Spec: `http://localhost:3000/api/docs/openapi.json`

## Notes

- The API uses CommonJS module system for Node.js compatibility
- Environment variables are loaded using the `--env-file` flag (Node.js 20.6+)
- The build configuration removes all NestJS-specific dependencies and configurations
- TypeScript strict mode is enabled for better type safety
