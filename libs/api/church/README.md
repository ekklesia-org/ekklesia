# Church Module

This module provides CRUD operations for managing churches in the Ekklesia system.

## Features

- **Create Church**: Create new churches with validation
- **Read Churches**: List all churches with pagination and filtering
- **Update Church**: Update existing church information
- **Delete Church**: Soft delete (deactivate) or hard delete churches
- **Church Settings**: Manage church-specific settings
- **Slug Support**: Automatic slug generation from church name
- **Unique Constraints**: Ensures unique slugs and email addresses

## API Endpoints

### Churches

- `POST /churches` - Create a new church
- `GET /churches` - List all churches (with pagination)
- `GET /churches/:id` - Get a church by ID
- `GET /churches/slug/:slug` - Get a church by slug
- `PUT /churches/:id` - Update a church
- `DELETE /churches/:id` - Soft delete a church
- `DELETE /churches/:id/hard` - Permanently delete a church

### Church Settings

- `POST /churches/settings` - Create church settings
- `GET /churches/settings/:churchId` - Get church settings
- `PUT /churches/settings/:churchId` - Update church settings

## Data Transfer Objects (DTOs)

### CreateChurchDto

```typescript
{
  name: string;           // Required: Church name
  slug?: string;          // Optional: Auto-generated if not provided
  email: string;          // Required: Unique email
  phone?: string;         // Optional: Phone number
  address?: string;       // Optional: Street address
  city?: string;          // Optional: City
  state?: string;         // Optional: State
  zipCode?: string;       // Optional: ZIP code
  website?: string;       // Optional: Website URL
  logoUrl?: string;       // Optional: Logo URL
  isActive?: boolean;     // Optional: Default true
}
```

### UpdateChurchDto

All fields from `CreateChurchDto` but optional.

### CreateChurchSettingsDto

```typescript
{
  churchId: string;           // Required: Church ID
  timezone?: string;          // Optional: Default "America/Sao_Paulo"
  currency?: string;          // Optional: Default "BRL"
  fiscalYear?: string;        // Optional: Default "calendar"
  enabledModules?: string[];  // Optional: Default []
  enableOCR?: boolean;        // Optional: Default false
  ocrApiKey?: string;         // Optional: OCR API key
  bankName?: string;          // Optional: Bank name
  accountNumber?: string;     // Optional: Account number
}
```

## Usage Examples

### Create a Church

```typescript
const church = await churchService.create({
  name: "First Baptist Church",
  email: "contact@firstbaptist.org",
  phone: "+1-555-123-4567",
  address: "123 Main Street",
  city: "Springfield",
  state: "IL",
  zipCode: "62701",
  website: "https://firstbaptist.org"
});
```

### Get Churches with Pagination

```typescript
const result = await churchService.findAll(1, 10, false);
// Returns: { churches, total, page, limit, totalPages }
```

### Update a Church

```typescript
const updatedChurch = await churchService.update(churchId, {
  name: "Updated Church Name",
  phone: "+1-555-987-6543"
});
```

### Create Church Settings

```typescript
const settings = await churchService.createSettings({
  churchId: "church-id",
  timezone: "America/New_York",
  currency: "USD",
  enabledModules: ["members", "finance", "events"],
  enableOCR: true
});
```

## Database Schema

The module works with the following Prisma models:

- `Church`: Main church entity
- `ChurchSettings`: Church-specific configuration
- `User`: Church users/staff
- `Member`: Church members
- `Transaction`: Financial transactions
- `AuditLog`: Audit trail

## Validation

All DTOs include comprehensive validation:

- **String length**: Name, slug, and other text fields have min/max length constraints
- **Email validation**: Ensures valid email format
- **URL validation**: Validates website and logo URLs
- **Unique constraints**: Prevents duplicate slugs and emails
- **Required fields**: Ensures essential data is provided

## Error Handling

The service includes proper error handling:

- `NotFoundException`: When church is not found
- `BadRequestException`: For validation errors, duplicate data, etc.
- Detailed error messages for troubleshooting

## Features

### Automatic Slug Generation

If no slug is provided, the service automatically generates one from the church name:
- Converts to lowercase
- Replaces spaces and special characters with hyphens
- Removes leading/trailing hyphens

### Soft Delete

Churches are soft-deleted by default (setting `isActive: false`). Use the hard delete endpoint only when permanent deletion is required.

### Pagination

The `findAll` method supports pagination with configurable page size and includes metadata about total records and pages.

### Relationships

Churches include related data:
- Church settings
- Users (with selected fields only)
- Members (when explicitly requested)
- Transactions (when explicitly requested)
- Audit logs (when explicitly requested)

## Running unit tests

Run `nx test church` to execute the unit tests via [Jest](https://jestjs.io).

## Future Enhancements

Potential future improvements:

1. **Search functionality**: Full-text search across church fields
2. **Bulk operations**: Import/export multiple churches
3. **Geolocation**: Store and search by coordinates
4. **Media management**: Handle multiple logos and images
5. **Audit logging**: Track all church modifications
6. **Church categories**: Denominations, sizes, etc.
7. **Contact management**: Multiple contact persons
8. **Social media links**: Twitter, Facebook, etc.
