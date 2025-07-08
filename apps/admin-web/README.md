# Ekklesia Admin Web Application

A modern church management admin dashboard built with Vue 3, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Authentication System** - Secure login with JWT tokens
- 🌐 **Internationalization** - Support for English, Spanish, and Portuguese (Brazil)
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 📊 **Dashboard** - Overview with statistics and quick actions
- ⚡ **Fast Development** - Hot module replacement with Vite
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS utilities

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vue Router** - Client-side routing
- **Vue i18n** - Internationalization
- **Axios** - HTTP client
- **Vite** - Fast build tool

## Project Structure

```
apps/admin-web/
├── src/
│   ├── app/
│   │   └── App.vue              # Root component
│   ├── views/
│   │   ├── LoginView.vue        # Login page
│   │   └── DashboardView.vue    # Main dashboard
│   ├── router/
│   │   └── index.ts             # Vue Router configuration
│   ├── i18n/
│   │   └── index.ts             # Internationalization setup
│   ├── main.ts                  # Application entry point
│   └── main.css                 # Global styles with Tailwind
├── tailwind.config.js           # Tailwind configuration  
├── postcss.config.js            # PostCSS configuration
└── README.md                    # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running Ekklesia API server

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx nx serve admin-web
```

3. Open your browser to `http://localhost:4200`

### Building for Production

```bash
npx nx build admin-web
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
VITE_API_URL=http://localhost:3000
```

### Tailwind CSS

The application uses a custom Tailwind configuration with:

- Custom color palette (primary, secondary)
- Extended font family
- Forms plugin for better form styling
- Responsive design utilities

### Internationalization

Supported languages:
- English (en) - Default
- Spanish (es) 
- Portuguese Brazil (pt-BR)

Translation files are shared from `@ekklesia/translations` library with admin-specific additions.

## Authentication

The application includes:

- JWT token-based authentication
- Automatic token refresh
- Route guards for protected pages
- Persistent login state

### Login Credentials

Use valid credentials from your Ekklesia API:
- Email: Valid user email
- Password: User password

## Dashboard Features

### Statistics Cards
- **Members Count** - Total registered members
- **Events** - Upcoming events count  
- **Donations** - Monthly donation amount
- **Announcements** - Active announcements

### Quick Actions
- Add New Member
- Create Event
- New Announcement

### User Profile
- User avatar with initials
- Full name and email display
- Logout functionality

## Styling with Tailwind CSS

The application has been fully refactored to use Tailwind CSS utility classes:

### Color Scheme
- **Primary**: Blue tones for main actions
- **Secondary**: Gray tones for neutral elements
- **Success**: Green for positive actions
- **Warning**: Yellow for cautionary elements
- **Danger**: Red for destructive actions

### Components
- Form elements with focus states
- Hover transitions
- Loading spinners
- Error states
- Responsive layouts

## Development

### Available Scripts

- `npx nx serve admin-web` - Start development server
- `npx nx build admin-web` - Build for production
- `npx nx test admin-web` - Run tests
- `npx nx lint admin-web` - Lint code

### Code Style

The project follows Vue 3 Composition API patterns with:
- TypeScript interfaces for type safety
- Reactive refs and computed properties
- Composable functions for reusability

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Add appropriate TypeScript types
3. Include translations for new text
4. Use Tailwind utility classes for styling
5. Test responsive design on mobile devices

## License

MIT License - see LICENSE file for details
