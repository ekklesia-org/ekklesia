// Styles - Import this in your main application
import './styles/index.css';

// Common Components
export { default as AppButton } from './components/common/AppButton.vue';
export { default as AppCard } from './components/common/AppCard.vue';
export { default as AppStatsCard } from './components/common/AppStatsCard.vue';

// Form Components
export { default as AppInput } from './components/forms/AppInput.vue';

// Layout Components
export { default as AppHeader } from './components/layout/AppHeader.vue';

// Feedback Components
export { default as AppAlert } from './components/feedback/AppAlert.vue';

// Export local types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  churchId?: string;
  phone?: string;
  avatar?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// TODO: Export common types from shared library once available
// export * from '@ekklesia/shared';
