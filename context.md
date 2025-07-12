# Context for Ekklesia Project

## Overview
Ekklesia is a comprehensive church management system developed using a modern, full-stack approach. It is structured as an Nx monorepo and designed to support multiple churches in a single system.

## Architecture

### Monorepo Structure (Nx)
- **API**: NestJS backend with REST/GraphQL
- **Admin Web**: Vue.js admin interface
- **Client App**: Vue.js client-facing application
- **Shared Libraries**:
  - **Database**: PostgreSQL with Drizzle ORM
  - **API Libraries**: Financial, members, and church management
  - **Shared**: Common types/interfaces
  - **Shared Utils**: Utility functions

## Technology Stack

### Backend
- **NestJS**, **PostgreSQL 16**, **Drizzle ORM**, **JWT**, **TypeScript**

### Frontend
- **Vue 3**, **Quasar**, **Vue Router**, **Vite**, **TypeScript**

### Dev & Testing
- **Nx**, **Jest/Vitest**, **Playwright**, **ESLint/Prettier**, **Docker**

## Key Features

### Multi-Module System
- **Health Check**: API status, uptime, and database connectivity monitoring
- **Authentication**: JWT-based authentication with login/register endpoints
- **Member Management**: Full member lifecycle
- **Financial Management**: Income/expenses, OCR, bank integration
- **User Management**: Roles/permissions
- **Audit Logging**: Activity tracking

### User Roles
- **Super Admin**: System-wide management
- **Church Admin**: Church-specific management
- **Pastor & Treasurer**: Leadership and financial roles
- **Secretary & Member**: Administrative and basic access

## Development Setup
- Dockerized PostgreSQL and pgAdmin
- Automated setup scripts
- Hot-reload development servers

## Production Ready
- Azure database compatibility
- Multi-church data isolation
- Comprehensive logging and reporting
- Responsive, modern UI

This context is intended to provide a quick overview of the Ekklesia project for efficient understanding and further requests.
