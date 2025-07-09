# Ekklesia - Church Management System

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

A comprehensive church management system built with modern technologies including NestJS, Vue.js, and Prisma, organized as an Nx monorepo.

## 🏗️ Architecture

This project consists of:
- **API**: NestJS backend with GraphQL/REST endpoints
- **Admin Web**: Vue.js administrative interface
- **Client App**: Vue.js client-facing application
- **Shared Libraries**: Common utilities, types, and database layer

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** (for PostgreSQL database)
- **Git**

### Installing Docker

- **macOS**: Download [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Windows**: Download [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- **Linux**: Follow the [Docker installation guide](https://docs.docker.com/engine/install/) for your distribution

**Note**: Make sure Docker is running before proceeding with the setup.

## 🚀 Quick Start

### Option A: Automated Setup (Recommended)

```bash
git clone git@github.com:ekklesia-org/ekklesia.git
cd ekklesia
./setup.sh
```

The setup script will:
- Install dependencies
- Start PostgreSQL with Docker
- Run database migrations
- Display next steps

### Option B: Manual Setup

### 1. Clone and Install Dependencies

```bash
git clone git@github.com:ekklesia-org/ekklesia.git
cd ekklesia
npm install --legacy-peer-deps
```

### 2. Start PostgreSQL with Docker

```bash
# Start PostgreSQL container
npm run db:up

# Check if database is running
npm run db:logs
```

### 3. Environment Setup

The `.env` file is already configured for Docker PostgreSQL:

- **Database**: `postgresql://postgres:postgres@localhost:5432/ekklesia_dev`
- **PostgreSQL Version**: 16 (matches Azure Database for PostgreSQL)
- **API Port**: `3000`
- **JWT Secret**: `ekklesia-super-secret-key-change-in-production`

### 4. Database Setup

```bash
# Run database migrations
npm run db:migrate

# Optional: Open Prisma Studio to view database
npm run db:studio
```

### 5. Start Development Servers

#### Option 1: Run All Applications (Recommended)
```bash
npm run dev
```

This will start:
- **API**: `http://localhost:3000/api`
- **Admin Web**: `http://localhost:4201/`
- **Client App**: `http://localhost:4200/`

#### Option 2: Run Applications Individually
```bash
# Backend API only
npm run dev:api

# Admin interface only
npm run dev:admin

# Client application only
npm run dev:client
```

## 📝 Available Scripts

### Development
- `npm run dev` - Start all applications (API + Admin + Client)
- `npm run dev:api` - Start API server only
- `npm run dev:admin` - Start admin web application only
- `npm run dev:client` - Start client application only

### Database (Docker)
- `npm run db:up` - Start PostgreSQL container
- `npm run db:down` - Stop and remove containers
- `npm run db:logs` - View PostgreSQL logs
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database (⚠️ destructive)

### Database Management UI (Optional)
- `npm run pgadmin:up` - Start pgAdmin container
- `npm run pgadmin:down` - Stop pgAdmin container
- **pgAdmin URL**: `http://localhost:5050` (admin@example.com / admin)

### Docker Management
- `npm run docker:up` - Start all containers (PostgreSQL + pgAdmin)
- `npm run docker:down` - Stop all containers
- `npm run docker:logs` - View all container logs

### Build & Production
- `npm run build:all` - Build all applications for production
- `npx nx build api` - Build API only
- `npx nx build admin-web` - Build admin web only
- `npx nx build client-app` - Build client app only

### Testing
- `npx nx test api` - Run API unit tests
- `npx nx test admin-web` - Run admin web tests
- `npx nx test client-app` - Run client app tests
- `npx nx e2e api-e2e` - Run API E2E tests
- `npx nx e2e admin-web-e2e` - Run admin web E2E tests
- `npx nx e2e client-app-e2e` - Run client app E2E tests

### Code Quality
- `npx nx lint api` - Lint API code
- `npx nx lint admin-web` - Lint admin web code
- `npx nx lint client-app` - Lint client app code

## 📜 Project Structure

```
ekklesia/
├── apps/
│   ├── api/                 # NestJS backend API (main application)
│   ├── api-e2e/             # API end-to-end tests
│   ├── admin-web/           # Vue.js admin interface
│   ├── admin-web-e2e/       # Admin web E2E tests
│   ├── client-app/          # Vue.js client application
│   └── client-app-e2e/      # Client app E2E tests
├── libs/
│   ├── api/                 # Feature modules (auth, financial, members, church)
│   ├── database/            # Database layer & Prisma service
│   ├── shared/              # Common types & interfaces
│   └── shared-utils/        # Utility functions
├── generated/
│   └── prisma/              # Generated Prisma client
├── prisma/
│   └── schema.prisma        # Database schema
├── .env                     # Environment variables
├── context.md               # Project context for AI assistance
├── nx.json                  # Nx workspace configuration
└── package.json             # Dependencies & scripts
```

## 💻 Tech Stack

### Backend
- **NestJS** - Node.js framework
- **Prisma** - Database ORM
- **PostgreSQL 16** - Database (via Docker)
- **TypeScript** - Programming language
- **JWT** - Authentication (with bcrypt password hashing)
- **Passport** - Authentication middleware

### Authentication Features
- ✓ **JWT Token-based** authentication
- ✓ **Secure password hashing** with bcrypt
- ✓ **Protected routes** with JWT guards
- ✓ **Multi-church support** (church-based isolation)
- ✓ **Role-based access control** (Super Admin, Church Admin, Pastor, etc.)
- ✓ **Token validation** endpoints

### Frontend
- **Vue 3** - Frontend framework
- **Quasar** - UI component library
- **Vue Router** - Routing
- **TypeScript** - Programming language
- **Vite** - Build tool

### Development Tools
- **Nx** - Monorepo management
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest/Vitest** - Testing
- **Playwright** - E2E testing

## 🔧 Troubleshooting

### Database Connection Issues

1. **Docker not running**:
   - Make sure Docker Desktop is running
   - Check with: `docker ps`

2. **PostgreSQL container not running**:
   ```bash
   npm run db:up
   npm run db:logs
   ```

3. **Container startup issues**:
   ```bash
   # Stop and restart containers
   npm run db:down
   npm run db:up
   
   # View detailed logs
   docker-compose logs postgres
   ```

4. **Port 5432 already in use**:
   - Stop local PostgreSQL if running: `brew services stop postgresql@16` or `brew services stop postgresql@14`
   - Or change the port in `docker-compose.yml`

### Port Conflicts

If ports are in use:
- API (3000): Update `API_PORT` in `.env`
- Frontend apps: Vite will automatically find available ports

### Dependency Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 🕰️ Production Deployment

### Build for Production
```bash
npm run build:all
```

### Environment Variables for Production
Update `.env` for production:
- Change `DATABASE_URL` to production database (e.g., Azure Database for PostgreSQL 16)
- Update `JWT_SECRET` to a secure secret
- Set `NODE_ENV=production`
- Configure `VUE_APP_API_URL` to production API URL

### Azure Database for PostgreSQL
This project is configured to work with Azure Database for PostgreSQL 16:
- The Docker setup uses PostgreSQL 16 to match Azure
- Prisma migrations are compatible with both environments
- Connection string format: `postgresql://username:password@server.postgres.database.azure.com:5432/database?sslmode=require`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests: `npx nx test-many -t test -p api admin-web client-app`
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## 📜 License

This project is licensed under the MIT License.

## 🚀 Next Steps

After setting up the project:
1. Explore the admin interface at `http://localhost:4201/`
2. Check the client application at `http://localhost:4200/`
3. Review the API endpoints at `http://localhost:3000/api`
4. Open Prisma Studio to manage database: `npm run db:studio`
