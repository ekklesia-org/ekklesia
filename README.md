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
- **PostgreSQL** (v14 or higher)
- **Git**

### Installing PostgreSQL (macOS)

```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14

# Create a database
createdb ekklesia_dev
```

### Installing PostgreSQL (Other platforms)

- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **Linux**: Use your package manager (e.g., `sudo apt install postgresql`)
- **Docker**: `docker run --name ekklesia-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ekklesia
npm install --legacy-peer-deps
```

### 2. Environment Setup

Copy and configure the environment variables:

```bash
# The .env file is already configured for local development
# Update DATABASE_URL in .env with your PostgreSQL username if different
# Example: postgresql://your_username@localhost:5432/ekklesia_dev
```

Default configuration:
- **Database**: `postgresql://[username]@localhost:5432/ekklesia_dev`
- **API Port**: `3000`
- **JWT Secret**: `ekklesia-super-secret-key-change-in-production`

### 3. Database Setup

```bash
# Run database migrations
npm run db:migrate

# Optional: Open Prisma Studio to view database
npm run db:studio
```

### 4. Start Development Servers

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

### Database
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database (⚠️ destructive)

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
│   ├── api/                 # NestJS backend API
│   ├── api-e2e/             # API end-to-end tests
│   ├── admin-web/           # Vue.js admin interface
│   ├── admin-web-e2e/       # Admin web E2E tests
│   ├── client-app/          # Vue.js client application
│   └── client-app-e2e/      # Client app E2E tests
├── libs/
│   ├── api/                 # Shared API logic
│   ├── database/            # Database layer & Prisma
│   ├── shared/              # Common types & interfaces
│   └── shared-utils/        # Utility functions
├── prisma/
│   └── schema.prisma        # Database schema
├── .env                     # Environment variables
├── nx.json                  # Nx workspace configuration
└── package.json             # Dependencies & scripts
```

## 💻 Tech Stack

### Backend
- **NestJS** - Node.js framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **TypeScript** - Programming language
- **JWT** - Authentication

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

1. **PostgreSQL not running**:
   ```bash
   brew services start postgresql@14  # macOS
   sudo service postgresql start      # Linux
   ```

2. **Database doesn't exist**:
   ```bash
   createdb ekklesia_dev
   ```

3. **Permission denied**:
   - Update `DATABASE_URL` in `.env` with your PostgreSQL username
   - Ensure your user has database creation privileges

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
- Change `DATABASE_URL` to production database
- Update `JWT_SECRET` to a secure secret
- Set `NODE_ENV=production`
- Configure `VUE_APP_API_URL` to production API URL

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
