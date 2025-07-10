# Admin Routes Configuration

## Current Routes
- `/` - Redirect to `/dashboard`
- `/setup` - System setup page
- `/error` - Error page
- `/login` - Login page
- `/dashboard` - Dashboard page ✅

## New Routes to Implement

### Super Admin Only Routes
- `/churches` - Church management page
- `/statistics` - Global statistics page

### Church Admin and up Routes
- `/members` - Member management page
- `/events` - Event management page
- `/announcements` - Announcement management page

### Pastor, Treasurer, Church Admin Routes
- `/finances` - Financial management page

### Church Admin Routes
- `/users` - User management page

### Church Admin Only Routes
- `/church-settings` - Church settings page

### Authorized Roles Routes
- `/reports` - Reports page

## Route Guards

Each route should have appropriate guards to check user roles:

```typescript
{
  path: '/churches',
  name: 'churches',
  component: ChurchesView,
  meta: { 
    requiresAuth: true,
    requiredRole: UserRole.SUPER_ADMIN 
  }
},
{
  path: '/members',
  name: 'members',
  component: MembersView,
  meta: { 
    requiresAuth: true,
    requiredRoles: [
      UserRole.SUPER_ADMIN,
      UserRole.CHURCH_ADMIN,
      UserRole.PASTOR,
      UserRole.SECRETARY
    ]
  }
}
```

## Implementation Priority

1. **High Priority** (Core admin functionality):
   - `/members` - Member management
   - `/users` - User management
   - `/church-settings` - Church settings

2. **Medium Priority** (Extended functionality):
   - `/churches` - Church management (Super Admin)
   - `/events` - Event management
   - `/finances` - Financial management

3. **Low Priority** (Analytics and reporting):
   - `/statistics` - Global statistics
   - `/announcements` - Announcement management
   - `/reports` - Reports

## Next Steps

1. Create view components for each route
2. Update router configuration with new routes and guards
3. Implement role-based route protection
4. Create page layouts using AdminLayout component
5. Add proper navigation breadcrumbs
6. Implement API endpoints for each module
