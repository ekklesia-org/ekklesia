# @ekklesia/ui

A shared UI component library for the Ekklesia church management system. This library provides reusable Vue 3 components that can be used across both the admin-web and client-app applications.

## Installation

```bash
npm install @ekklesia/ui
```

## Components

### Common Components

#### AppButton
A versatile button component with multiple variants and loading states.

#### AppCard
A container component for organizing content.

#### AppStatsCard
A specialized card component for displaying metrics and statistics.

### Form Components

#### AppInput
A flexible input component with validation and error handling.

### Layout Components

#### AppHeader
A header component for application navigation and branding.

### Feedback Components

#### AppAlert
An alert component for displaying messages and notifications.

## Development

### Building the Library

```bash
nx build ui
```

### Testing

```bash
nx test ui
```

### Linting

```bash
nx lint ui
```

## Dependencies

This library depends on:
- Vue 3
- Tailwind CSS
- @ekklesia/shared (for type definitions)
