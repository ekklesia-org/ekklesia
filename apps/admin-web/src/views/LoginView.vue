<template>
  <div class="min-h-screen flex">
    <!-- Left side - Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
      <div class="absolute inset-0 bg-black opacity-20" />
      <div class="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
        <div class="text-center">
          <div class="mb-6">
            <img
              :src="EkklesiaLogo"
              :alt="t('auth.ekklesia_logo')"
              class="h-26 w-auto mx-auto filter brightness-0 invert"
            >
          </div>
          <p class="text-xl opacity-90 font-light">
            {{ $t('auth.admin_portal') }}
          </p>
        </div>
      </div>
      <!-- Decorative elements -->
      <div class="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full transform translate-x-40 -translate-y-40" />
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full transform -translate-x-32 translate-y-32" />
    </div>

    <!-- Right side - Login form -->
    <div class="flex-1 flex items-center justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div class="w-full max-w-md">
        <!-- Mobile header -->
        <div class="text-center mb-8 lg:hidden">
          <div class="mb-4">
            <img
              :src="EkklesiaLogo"
              alt="Ekklesia"
              class="h-18 w-auto mx-auto"
            >
          </div>
          <p class="text-gray-600">
            {{ $t('auth.admin_portal') }}
          </p>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <div class="mb-8">
            <h2 class="text-2xl font-light text-gray-900 mb-2">
              {{ $t('auth.login') }}
            </h2>
            <p class="text-gray-500 text-sm">
              Entre com suas credenciais para acessar o painel
            </p>
          </div>

          <form
            class="space-y-6"
            @submit.prevent="handleLogin"
          >
            <div class="space-y-1">
              <label
                for="email"
                class="block text-sm font-medium text-gray-700"
              >
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
              <p
                v-if="errors.email"
                class="text-sm text-red-600 mt-1"
              >
                {{ errors.email }}
              </p>
            </div>

            <div class="space-y-1">
              <label
                for="password"
                class="block text-sm font-medium text-gray-700"
              >
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
              <p
                v-if="errors.password"
                class="text-sm text-red-600 mt-1"
              >
                {{ errors.password }}
              </p>
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMessage"
              class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg"
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

            <button
              type="submit"
              class="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              :disabled="isLoading"
            >
              <span
                v-if="isLoading"
                class="flex items-center justify-center"
              >
                <svg
                  class="animate-spin -ml-1 mr-2 h-5 w-5"
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
                {{ $t('auth.logging_in') }}
              </span>
              <span v-else>{{ $t('auth.login') }}</span>
            </button>
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
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../stores/auth';
import { LoginCredentials } from '@ekklesia/shared';
import EkklesiaLogo from '../assets/ekklesia-logo.png';

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

