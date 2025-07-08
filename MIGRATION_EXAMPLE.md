# Migration Example: Refactoring Admin-Web to Use Shared Components

This document shows how to refactor the existing admin-web application to use the new shared component library.

## Before: Original DashboardView.vue

```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ $t('dashboard.title') }}
            </h1>
            <p class="text-sm text-gray-600 mt-1">
              {{ $t('dashboard.welcome', { name: user?.firstName }) }}
            </p>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-white">
                  {{ userInitials }}
                </span>
              </div>
              <div class="hidden sm:block">
                <p class="text-sm font-medium text-gray-900">
                  {{ userFullName }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ user?.email }}
                </p>
              </div>
            </div>

            <button
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
              @click="logout"
            >
              <!-- SVG icon -->
              {{ $t('auth.logout') }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Members Card -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{ $t('dashboard.members') }}
                </dt>
                <dd class="text-2xl font-semibold text-gray-900">
                  {{ memberCount.toLocaleString() }}
                </dd>
              </div>
            </div>
          </div>
        </div>
        <!-- More cards... -->
      </div>

      <!-- Quick Actions -->
      <div class="bg-white shadow-sm rounded-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ $t('dashboard.quick_actions') }}
          </h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button class="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200">
              <!-- Icon and text -->
            </button>
            <!-- More buttons... -->
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../stores/auth';

const { t } = useI18n();
const auth = useAuth();

const memberCount = ref(0);
const eventCount = ref(0);
const donationAmount = ref(0);
const announcementCount = ref(0);

const user = computed(() => auth.user);
const userFullName = computed(() => auth.userFullName);
const userInitials = computed(() => auth.userInitials);

onMounted(() => {
  loadDashboardData();
});

const loadDashboardData = () => {
  memberCount.value = 125;
  eventCount.value = 8;
  donationAmount.value = 15420;
  announcementCount.value = 3;
};

const logout = () => {
  auth.logoutAndRedirect();
};
</script>
```

## After: Refactored DashboardView.vue

```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <AppHeader
      :title="$t('dashboard.title')"
      :subtitle="$t('dashboard.welcome', { name: user?.firstName })"
      :user="user"
    >
      <template #userActions>
        <AppButton
          variant="danger"
          size="sm"
          @click="logout"
        >
          <template #icon>
            <LogoutIcon class="h-4 w-4" />
          </template>
          {{ $t('auth.logout') }}
        </AppButton>
      </template>
    </AppHeader>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AppStatsCard
          :title="$t('dashboard.members')"
          :value="memberCount"
          color="blue"
        >
          <template #icon>
            <UsersIcon />
          </template>
        </AppStatsCard>

        <AppStatsCard
          :title="$t('dashboard.events')"
          :value="eventCount"
          color="green"
        >
          <template #icon>
            <CalendarIcon />
          </template>
        </AppStatsCard>

        <AppStatsCard
          :title="$t('dashboard.donations')"
          :value="donationAmount"
          color="yellow"
          format-as="currency"
        >
          <template #icon>
            <CurrencyDollarIcon />
          </template>
        </AppStatsCard>

        <AppStatsCard
          :title="$t('dashboard.announcements')"
          :value="announcementCount"
          color="purple"
        >
          <template #icon>
            <SpeakerphoneIcon />
          </template>
        </AppStatsCard>
      </div>

      <!-- Quick Actions -->
      <AppCard :title="$t('dashboard.quick_actions')">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AppButton
            variant="ghost"
            class="flex items-center p-4 justify-start"
            @click="addMember"
          >
            <template #icon>
              <UserAddIcon class="h-6 w-6 text-blue-600 mr-3" />
            </template>
            {{ $t('dashboard.add_member') }}
          </AppButton>

          <AppButton
            variant="ghost"
            class="flex items-center p-4 justify-start"
            @click="createEvent"
          >
            <template #icon>
              <PlusIcon class="h-6 w-6 text-green-600 mr-3" />
            </template>
            {{ $t('dashboard.create_event') }}
          </AppButton>

          <AppButton
            variant="ghost"
            class="flex items-center p-4 justify-start"
            @click="newAnnouncement"
          >
            <template #icon>
              <PencilIcon class="h-6 w-6 text-purple-600 mr-3" />
            </template>
            {{ $t('dashboard.new_announcement') }}
          </AppButton>
        </div>
      </AppCard>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../stores/auth';
import {
  AppHeader,
  AppStatsCard,
  AppCard,
  AppButton,
} from '@ekklesia/ui';

// Icons (from your icon library)
import {
  UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  SpeakerphoneIcon,
  UserAddIcon,
  PlusIcon,
  PencilIcon,
  LogoutIcon,
} from '@heroicons/vue/24/outline';

const { t } = useI18n();
const auth = useAuth();

const memberCount = ref(0);
const eventCount = ref(0);
const donationAmount = ref(0);
const announcementCount = ref(0);

const user = computed(() => auth.user);

onMounted(() => {
  loadDashboardData();
});

const loadDashboardData = () => {
  memberCount.value = 125;
  eventCount.value = 8;
  donationAmount.value = 15420;
  announcementCount.value = 3;
};

const logout = () => {
  auth.logoutAndRedirect();
};

const addMember = () => {
  // Navigate to add member page
  console.log('Add member clicked');
};

const createEvent = () => {
  // Navigate to create event page
  console.log('Create event clicked');
};

const newAnnouncement = () => {
  // Navigate to new announcement page
  console.log('New announcement clicked');
};
</script>
```

## Login View Migration

### Before: Original LoginView.vue (excerpt)

```vue
<template>
  <div class="min-h-screen flex">
    <!-- Login form -->
    <div class="flex-1 flex items-center justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div class="w-full max-w-md">
        <!-- Login Card -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <form class="space-y-6" @submit.prevent="handleLogin">
            <div class="space-y-1">
              <label for="email" class="block text-sm font-medium text-gray-700">
                {{ $t('auth.email') }}
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                :placeholder="$t('auth.email_placeholder')"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                :class="{ 'border-red-300 focus:ring-red-500 bg-red-50': errors.email }"
                required
              >
              <p v-if="errors.email" class="text-sm text-red-600 mt-1">
                {{ errors.email }}
              </p>
            </div>

            <div class="space-y-1">
              <label for="password" class="block text-sm font-medium text-gray-700">
                {{ $t('auth.password') }}
              </label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                :placeholder="$t('auth.password_placeholder')"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                :class="{ 'border-red-300 focus:ring-red-500 bg-red-50': errors.password }"
                required
              >
              <p v-if="errors.password" class="text-sm text-red-600 mt-1">
                {{ errors.password }}
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-red-700">{{ errorMessage }}</span>
              </div>
            </div>

            <button
              type="submit"
              class="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {{ $t('auth.logging_in') }}
              </span>
              <span v-else>{{ $t('auth.login') }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
```

### After: Refactored LoginView.vue

```vue
<template>
  <div class="min-h-screen flex">
    <!-- Left side - Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
      <!-- Branding content -->
    </div>

    <!-- Right side - Login form -->
    <div class="flex-1 flex items-center justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div class="w-full max-w-md">
        <!-- Login Card -->
        <AppCard variant="elevated" rounded="xl">
          <div class="mb-8">
            <h2 class="text-2xl font-light text-gray-900 mb-2">
              {{ $t('auth.login') }}
            </h2>
            <p class="text-gray-500 text-sm">
              Entre com suas credenciais para acessar o painel
            </p>
          </div>

          <form class="space-y-6" @submit.prevent="handleLogin">
            <AppInput
              id="email"
              v-model="formData.email"
              :label="$t('auth.email')"
              type="email"
              :placeholder="$t('auth.email_placeholder')"
              :error="errors.email"
              autocomplete="email"
              required
            />

            <AppInput
              id="password"
              v-model="formData.password"
              :label="$t('auth.password')"
              type="password"
              :placeholder="$t('auth.password_placeholder')"
              :error="errors.password"
              autocomplete="current-password"
              required
            />

            <!-- Error Message -->
            <AppAlert
              v-if="errorMessage"
              variant="error"
              :message="errorMessage"
            />

            <AppButton
              type="submit"
              variant="primary"
              :is-loading="isLoading"
              :loading-text="$t('auth.logging_in')"
              full-width
            >
              {{ $t('auth.login') }}
            </AppButton>
          </form>

          <!-- Footer -->
          <div class="mt-8 text-center">
            <p class="text-xs text-gray-500">
              {{ $t('auth.need_help') }}
            </p>
          </div>
        </AppCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../stores/auth';
import { LoginCredentials } from '@ekklesia/shared';
import { AppCard, AppInput, AppButton, AppAlert } from '@ekklesia/ui';

interface FormErrors {
  email?: string;
  password?: string;
}

const { t } = useI18n();
const auth = useAuth();

const formData = reactive<LoginCredentials>({
  email: '',
  password: ''
});

const errors = reactive<FormErrors>({});

const isLoading = computed(() => auth.isLoading);
const authError = computed(() => auth.error);

const errorMessage = computed(() => {
  if (!authError.value) return '';
  
  if (authError.value.startsWith('errors.') || authError.value.startsWith('validation.')) {
    return t(authError.value);
  }
  
  return authError.value;
});

watch([() => formData.email, () => formData.password], () => {
  auth.clearError();
});

const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => delete errors[key as keyof FormErrors]);

  if (!formData.email) {
    errors.email = t('validation.required', { field: t('auth.email') });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = t('validation.email_invalid');
  }

  if (!formData.password) {
    errors.password = t('validation.required', { field: t('auth.password') });
  } else if (formData.password.length < 6) {
    errors.password = t('validation.min_length', { field: t('auth.password'), min: 6 });
  }

  return Object.keys(errors).length === 0;
};

const handleLogin = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    await auth.loginAndRedirect(formData);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
</script>
```

## Summary of Changes

### Benefits of the Migration:

1. **Reduced Code Duplication**: The header, stats cards, inputs, and buttons are now reusable components.

2. **Consistent Design**: All components follow the same design system and patterns.

3. **Better Maintainability**: Changes to styling or behavior only need to be made in one place.

4. **Type Safety**: All components are fully typed with TypeScript.

5. **Improved Developer Experience**: Props and slots provide clear APIs for component usage.

6. **Easier Testing**: Components can be tested in isolation.

### Code Reduction:

- **Before**: ~300 lines of template code for dashboard
- **After**: ~150 lines of template code for dashboard
- **Reduction**: ~50% less code while maintaining the same functionality

### Steps to Complete the Migration:

1. Install the UI library in both admin-web and client-app applications
2. Replace existing components with shared components one by one
3. Update imports to use the shared library
4. Test thoroughly to ensure functionality is preserved
5. Remove unused CSS and component definitions
6. Update any custom styling to work with the shared components

This migration demonstrates how the shared component system significantly reduces code duplication while maintaining consistency across applications.
