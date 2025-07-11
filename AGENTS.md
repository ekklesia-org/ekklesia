# Ekklesia Monorepo Overview

Ekklesia is a comprehensive church management system organized as an Nx monorepo. It leverages modern technologies such as NestJS, Vue.js, and Prisma to provide robust solutions for managing church operations.

## Structure

### Apps

- **API**: NestJS backend providing GraphQL and RESTful APIs.
- **Admin Web**: Vue.js based administrative web interface.
- **Client App**: Vue.js client-facing application for general users.

### Libraries

- **api**: Houses feature modules such as authentication, financial, members, and church management.
- **database**: Database layer with Prisma service.
- **shared**: Common types and interfaces used across apps.
- **shared-utils**: General utility functions.
- **ui**: UI components shared across applications.
- **translations**: Manages multilingual support and translations.

## Technology Stack

- **Backend**: Built with NestJS and Prisma ORM, running PostgreSQL 16 via Docker.
- **Frontend**: Utilizes Vue 3 with Quasar for a responsive and modern UI.
- **DevOps**: Docker is used for containerization; the system is pre-configured to run with Azure Database for PostgreSQL.

## Development Tools

- **Nx**: Manages monorepo architecture effectively with commands for building, developing, and serving applications.
- **ESLint & Prettier**: Ensures code quality and consistency.
- **Jest & Vitest**: Implements unit and E2E testing frameworks.

## Installation & Setup

Refer to the `README.md` for detailed installation and setup instructions, including automated and manual setups, Docker commands, and development scripts.
