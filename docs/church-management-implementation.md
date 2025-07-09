# Church Management Implementation

This document describes the implementation of the church management module for the Ekklesia admin interface.

## Overview

The church management module allows Super Admins to manage churches within the Ekklesia system. It provides full CRUD operations for churches and integrates with the existing backend API.

## Components Implemented

### 1. Church Service (`/apps/admin-web/src/services/churchService.ts`)

A service class that handles all API interactions for church management:

- **Get Churches**: Paginated list of all churches
- **Get Church**: Single church by ID
- **Get Church by Slug**: Single church by slug
- **Create Church**: Create new church
- **Update Church**: Update existing church
- **Delete Church**: Soft delete church
- **Hard Delete Church**: Permanently delete church

### 2. Church Form Component (`/apps/admin-web/src/components/ChurchForm.vue`)

A reusable form component for creating and editing churches:

- **Form Sections**:
  - Basic Information (name, slug, email, phone, website)
  - Address Information (address, city, state, zip code)
  - Advanced Options (logo URL, active status)

- **Features**:
  - Auto-generates slug from church name
  - Form validation with error messages
  - Supports both create and edit modes
  - Responsive design

### 3. Church Manager View (`/apps/admin-web/src/views/ChurchManagerView.vue`)

The main view for managing churches:

- **Church List**: Display all churches with user information
- **Create Church**: Modal form for creating new churches
- **Edit Church**: Modal form for editing existing churches
- **Delete Church**: Confirmation dialog and soft delete
- **Responsive Layout**: Works on desktop and mobile

### 4. Router Configuration

Added `/churches` route to the admin router:

- **Route**: `/churches`
- **Component**: `ChurchManagerView`
- **Auth**: Requires authentication
- **Role**: Super Admin only (enforced by sidebar menu)

## API Integration

The implementation follows the existing backend API structure:

```typescript
// Backend endpoints used:
GET    /api/churches              // List churches
GET    /api/churches/:id          // Get church by ID
GET    /api/churches/slug/:slug   // Get church by slug
POST   /api/churches              // Create church
PUT    /api/churches/:id          // Update church
DELETE /api/churches/:id          // Soft delete church
DELETE /api/churches/:id/hard     // Hard delete church
```

## Data Types

### Church Interface
```typescript
interface ChurchWithUsers extends Church {
  users: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
  }[];
}
```

### Create Church DTO
```typescript
interface CreateChurchDto {
  name: string;
  slug?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  logoUrl?: string;
  isActive?: boolean;
}
```

## Translations

Added comprehensive translations for:

- **Portuguese (pt-BR)**: Complete translations for all UI elements
- **Form Labels**: All form fields and placeholders
- **Error Messages**: Validation error messages
- **Action Buttons**: Create, edit, delete, cancel buttons
- **Status Messages**: Success and error notifications

## Key Features

### 1. Auto-Generated Slugs
- When creating a new church, the slug is automatically generated from the church name
- Slugs are URL-friendly and follow the pattern: `church-name-becomes-church-name`

### 2. Form Validation
- Required field validation
- Email format validation
- URL format validation for website and logo
- Length validation for text fields

### 3. Responsive Design
- Mobile-first approach
- Grid layouts that adapt to screen size
- Touch-friendly buttons and forms

### 4. Error Handling
- Try-catch blocks for API calls
- User-friendly error messages
- Loading states during operations

## Security Considerations

### 1. Role-Based Access
- Only Super Admins can access the church management interface
- Route protection through authentication middleware
- Menu items shown based on user roles

### 2. Data Validation
- Client-side validation for user experience
- Server-side validation for security (handled by backend)
- Input sanitization and type checking

## Usage

### Accessing Church Management
1. Log in as Super Admin
2. Navigate to "Gerenciar Igrejas" from the sidebar
3. View list of all churches with user information

### Creating a Church
1. Click "Criar Igreja" button
2. Fill in the form with church information
3. Submit to create the church

### Editing a Church
1. Click "Editar" button on any church card
2. Modify the information in the form
3. Submit to update the church

### Deleting a Church
1. Click "Deletar" button on any church card
2. Confirm the deletion in the dialog
3. Church will be soft-deleted (marked as inactive)

## Future Enhancements

### 1. Advanced Features
- Church logo upload functionality
- Bulk operations for multiple churches
- Church statistics and analytics
- Export/import functionality

### 2. UI Improvements
- Table view with sorting and filtering
- Search functionality
- Pagination for large datasets
- Advanced form sections (settings, modules)

### 3. Integration Features
- Church settings management
- User management within churches
- Church-specific module configuration
- Integration with financial modules

## Testing

### Manual Testing Checklist
- [ ] Create new church with valid data
- [ ] Create church with invalid data (validation)
- [ ] Edit existing church
- [ ] Delete church (soft delete)
- [ ] Auto-generated slug functionality
- [ ] Responsive design on different screen sizes
- [ ] Form validation messages
- [ ] Loading states during operations

## Dependencies

### New Dependencies
- None (uses existing project dependencies)

### Modified Files
- `/apps/admin-web/src/router/index.ts` - Added church route
- `/apps/admin-web/src/i18n/locales/pt-BR.json` - Added translations

### New Files
- `/apps/admin-web/src/services/churchService.ts`
- `/apps/admin-web/src/components/ChurchForm.vue`
- `/apps/admin-web/src/views/ChurchManagerView.vue`
