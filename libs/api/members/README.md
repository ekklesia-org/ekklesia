# Members Module

This module provides CRUD operations for managing church members in the Ekklesia system.

## Features

- **Create Member**: Create new members with validation
- **Read Members**: List all members with pagination and filtering
- **Update Member**: Update existing member information
- **Delete Member**: Soft delete (deactivate) or hard delete members
- **Church Filtering**: Filter members by church ID
- **Status Management**: Manage member status (Active, Inactive, Transferred, Deceased)
- **Marital Status**: Track member marital status
- **Personal Information**: Store comprehensive member details

## API Endpoints

### Members

- `POST /members` - Create a new member
- `GET /members` - List all members (with pagination and filtering)
- `GET /members/:id` - Get a member by ID
- `PUT /members/:id` - Update a member
- `DELETE /members/:id` - Soft delete a member
- `DELETE /members/:id/hard` - Permanently delete a member

## Data Transfer Objects (DTOs)

### CreateMemberDto

```typescript
{
  churchId: string;         // Required: Church ID
  firstName: string;        // Required: First name
  lastName: string;         // Required: Last name
  email?: string;           // Optional: Email address
  phone?: string;           // Optional: Phone number
  dateOfBirth?: string;     // Optional: Date of birth (ISO string)
  cpf?: string;             // Optional: Brazilian tax ID
  rg?: string;              // Optional: Brazilian ID
  address?: string;         // Optional: Street address
  city?: string;            // Optional: City
  state?: string;           // Optional: State
  zipCode?: string;         // Optional: ZIP code
  status?: MemberStatus;    // Optional: Default ACTIVE
  maritalStatus?: MaritalStatus; // Optional: Default SINGLE
  baptismDate?: string;     // Optional: Baptism date (ISO string)
  memberSince?: string;     // Optional: Member since date (ISO string)
  spouseId?: string;        // Optional: Spouse member ID
  profession?: string;      // Optional: Profession
  notes?: string;           // Optional: Additional notes
  photoUrl?: string;        // Optional: Photo URL
  userId?: string;          // Optional: Associated user ID
}
```

### UpdateMemberDto

All fields from `CreateMemberDto` but optional.

## Member Status Enum

```typescript
enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TRANSFERRED = 'TRANSFERRED',
  DECEASED = 'DECEASED'
}
```

## Marital Status Enum

```typescript
enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED'
}
```

## Usage Examples

### Create a Member

```typescript
const member = await membersService.create({
  churchId: "church-id",
  firstName: "João",
  lastName: "Silva",
  email: "joao.silva@email.com",
  phone: "+55 11 99999-9999",
  dateOfBirth: "1990-01-15",
  cpf: "123.456.789-00",
  address: "Rua das Flores, 123",
  city: "São Paulo",
  state: "SP",
  zipCode: "01234-567",
  status: MemberStatus.ACTIVE,
  maritalStatus: MaritalStatus.SINGLE,
  baptismDate: "2020-06-15",
  memberSince: "2020-01-01",
  profession: "Engenheiro",
  notes: "Líder do ministério de jovens"
});
```

### Get Members with Pagination

```typescript
const result = await membersService.findAll(1, 10);
// Returns: { members, total, page, limit, totalPages }
```

### Get Members by Church

```typescript
const result = await membersService.findAll(1, 10, "church-id");
// Returns members filtered by church ID
```

### Update a Member

```typescript
const updatedMember = await membersService.update(memberId, {
  firstName: "João Updated",
  phone: "+55 11 88888-8888"
});
```

### Soft Delete a Member

```typescript
const deletedMember = await membersService.remove(memberId);
// Sets status to INACTIVE
```

### Hard Delete a Member

```typescript
await membersService.hardDelete(memberId);
// Permanently removes from database
```

## Running unit tests

Run `nx test members` to execute the unit tests via [Jest](https://jestjs.io).

## Features

### Spouse Relationship

Members can be linked to their spouse through the `spouseId` field, creating a bidirectional relationship.

### User Account Integration

Members can be associated with system user accounts through the `userId` field, allowing them to log in and access the system.

### Church Association

All members must belong to a church, enforced through the required `churchId` field and foreign key constraint.

### Soft Delete

Members are soft-deleted by default (setting status to `INACTIVE`). Use the hard delete endpoint only when permanent deletion is required.

### Pagination

The `findAll` method supports pagination with configurable page size and includes metadata about total records and pages.

### Church Filtering

Members can be filtered by church ID in the `findAll` method, useful for multi-church installations.
