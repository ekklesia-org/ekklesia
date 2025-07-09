// Import styles to be included in the build
import './styles/index.css';

// Common Components
export { default as AppButton } from './components/common/AppButton.vue';
export { default as AppCard } from './components/common/AppCard.vue';
export { default as AppStatsCard } from './components/common/AppStatsCard.vue';

// Form Components
export { default as AppInput } from './components/forms/AppInput.vue';

// Layout Components
export { default as AppHeader } from './components/layout/AppHeader.vue';
export { default as AppSidebar } from './components/layout/AppSidebar.vue';

// Feedback Components
export { default as AppAlert } from './components/feedback/AppAlert.vue';
export { default as AppToast } from './lib/components/AppToast.vue';
export { default as AppToastContainer } from './lib/components/AppToastContainer.vue';

// Composables
export { useToast } from './lib/composables/useToast';
export type { Toast } from './lib/composables/useToast';

// Export types from shared library
export type { User } from '@ekklesia/shared';
