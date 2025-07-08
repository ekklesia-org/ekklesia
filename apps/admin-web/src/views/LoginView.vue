<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo Section -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-white mb-2">
          {{ $t('app.title') }}
        </h1>
        <p class="text-blue-100 text-sm">
          {{ $t('auth.admin_portal') }}
        </p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-semibold text-gray-900">
            {{ $t('auth.login') }}
          </h2>
        </div>

        <form
          class="space-y-6"
          @submit.prevent="handleLogin"
        >
          <!-- Email Field -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('auth.email') }}
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              :placeholder="$t('auth.email_placeholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              :class="{ 'border-red-500 focus:ring-red-500': errors.email }"
              required
            >
            <p
              v-if="errors.email"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.email }}
            </p>
          </div>

          <!-- Password Field -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t('auth.password') }}
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              :placeholder="$t('auth.password_placeholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              :class="{ 'border-red-500 focus:ring-red-500': errors.password }"
              required
            >
            <p
              v-if="errors.password"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors.password }}
            </p>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              :disabled="isLoading"
            >
              <svg
                v-if="isLoading"
                class="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ isLoading ? $t('auth.logging_in') : $t('auth.login') }}
            </button>
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div class="flex items-center">
              <svg
                class="h-5 w-5 text-red-400 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-sm text-red-700">{{ errorMessage }}</span>
            </div>
          </div>
        </form>

        <!-- Footer -->
        <div class="mt-8 text-center">
          <p class="text-xs text-gray-500">
            {{ $t('auth.need_help') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../stores/auth';
import { LoginCredentials } from '@ekklesia/shared';

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

// Computed properties from auth store
const isLoading = computed(() => auth.isLoading);
const authError = computed(() => auth.error);

// Watch for auth errors and translate them
const errorMessage = computed(() => {
  if (!authError.value) return '';

  // Try to translate the error if it looks like a translation key
  if (authError.value.startsWith('errors.') || authError.value.startsWith('validation.')) {
    return t(authError.value);
  }

  // Return the error message as-is if not a translation key
  return authError.value;
});

// Clear auth errors when form data changes
watch([() => formData.email, () => formData.password], () => {
  auth.clearError();
});

const validateForm = (): boolean => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key as keyof FormErrors]);

  // Validate email
  if (!formData.email) {
    errors.email = t('validation.required', { field: t('auth.email') });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = t('validation.email_invalid');
  }

  // Validate password
  if (!formData.password) {
    errors.password = t('validation.required', { field: t('auth.password') });
  } else if (formData.password.length < 6) {
    errors.password = t('validation.min_length', { field: t('auth.password'), min: 6 });
  }

  return Object.keys(errors).length === 0;
};

const handleLogin = async () => {
  // Validate form first
  if (!validateForm()) {
    return;
  }

  try {
    // Use auth store to login and redirect
    await auth.loginAndRedirect(formData);
  } catch (error) {
    // Error is handled by the auth store
    console.error('Login failed:', error);
  }
};
</script>

