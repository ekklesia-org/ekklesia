<template>
  <div class="min-h-screen flex">
    <!-- Left side - Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
      <div class="absolute inset-0 bg-black opacity-20" />
      <div class="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
        <div class="text-center">
          <div class="mb-6">
            <img
              :src="EkklesiaLogoDark"
              :alt="t('auth.ekklesia_logo')"
              class="h-26 w-auto mx-auto"
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
        <AppCard
          variant="elevated"
          rounded="xl"
        >
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
import EkklesiaLogo from '../assets/ekklesia-logo.png';
import EkklesiaLogoDark from '../assets/ekklesia-logo-dark.png';

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

