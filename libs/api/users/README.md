# Users Module

The Users module provides comprehensive user management functionality for the Ekklesia church management system.

## Features

### Core CRUD Operations
- **Create User**: Register new users with email validation and password hashing
- **Get Users**: Retrieve users with pagination, filtering, and church-specific queries
- **Update User**: Modify user information (excluding password)
- **Delete User**: Soft delete (deactivate) or hard delete users

### User Management
- **Password Management**: Secure password updates with current password verification
- **Role Management**: Update user roles (SUPER_ADMIN, CHURCH_ADMIN, PASTOR, TREASURER, SECRETARY, MEMBER)
- **Account Status**: Activate/deactivate user accounts
- **Church Association**: Filter and manage users by church

### Security Features
- **Password Hashing**: Uses bcryptjs for secure password storage
- **Input Validation**: Comprehensive validation using class-validator
- **Error Handling**: Consistent error responses with meaningful messages
- **Type Safety**: Full TypeScript support with Prisma types

## API Endpoints

### User CRUD
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users (with pagination, filtering)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user information
- `DELETE /api/users/:id` - Soft delete user
- `DELETE /api/users/:id/hard` - Permanently delete user

### User Queries
- `GET /api/users/email/:email` - Get user by email
- `GET /api/users/church/:churchId` - Get users by church

### User Management
- `PUT /api/users/:id/password` - Update user password
- `PUT /api/users/:id/role` - Update user role
- `PUT /api/users/:id/activate` - Activate user account
- `PUT /api/users/:id/deactivate` - Deactivate user account

## Data Transfer Objects (DTOs)

### CreateUserDto
```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  role: UserRole;
  churchId?: string;
}
```

### UpdateUserDto
- Extends CreateUserDto with all fields optional except password
- Password updates are handled separately for security

### UpdateUserPasswordDto
```typescript
{
  currentPassword: string;
  newPassword: string;
}
```

## User Roles

The system supports the following user roles:
- `SUPER_ADMIN`: Full system access
- `CHURCH_ADMIN`: Church-level administration  
- `PASTOR`: Pastoral functions
- `TREASURER`: Financial management
- `SECRETARY`: Administrative functions
- `MEMBER`: Basic member access

## Usage

### Import the Module
```typescript
import { UsersModule } from '@ekklesia/api/users';

@Module({
  imports: [UsersModule],
})
export class AppModule {}
```

### Use the Service
```typescript
import { UsersService } from '@ekklesia/api/users';

@Injectable()
export class SomeService {
  constructor(private usersService: UsersService) {}

  async createUser(userData: CreateUserDto) {
    return this.usersService.create(userData);
  }
}
```

## Database Schema

The Users module works with the following Prisma schema:

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String
  firstName String
  lastName  String
  phone     String?
  avatar    String?
  isActive  Boolean    @default(true)
  role      UserRole   @default(MEMBER)
  churchId  String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  lastLogin DateTime?
  
  church    Church?    @relation(fields: [churchId], references: [id])
  member    Member?
  auditLogs AuditLog[]
}
```

## Testing

The module includes comprehensive tests for both the controller and service layers:

- **Controller Tests**: Test HTTP endpoint behavior and request/response handling
- **Service Tests**: Test business logic, validation, and database operations
- **Integration Tests**: Test module integration with other system components

## Security Considerations

- Passwords are hashed using bcryptjs before storage
- User passwords are never returned in API responses
- Input validation prevents common security vulnerabilities
- Role-based access control through UserRole enum
- Secure password update process with current password verification

## Dependencies

- `@nestjs/common`: NestJS core functionality
- `@nestjs/swagger`: API documentation
- `@ekklesia/database`: Database service and Prisma client
- `@ekklesia/drizzle`: Generated Drizzle types
- `bcryptjs`: Password hashing
- `class-validator`: Input validation
- `class-transformer`: Data transformation

Run `nx test users` to execute the unit tests via [Jest](https://jestjs.io).
