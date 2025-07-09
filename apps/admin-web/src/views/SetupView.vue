<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6">
      <div class="text-center">
        <div class="mb-4">
          <img
            :src="EkklesiaLogo"
            alt="Ekklesia"
            class="h-18 w-auto mx-auto"
          >
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('setup.title') }}
        </h1>
        <p class="text-gray-600">
          {{ $t('setup.subtitle') }}
        </p>
      </div>

      <AppCard
        variant="elevated"
        rounded="xl"
      >
        <div class="mb-6">
          <h2 class="text-xl font-light text-gray-900 mb-2">
            {{ $t('setup.create_admin') }}
          </h2>
          <p class="text-gray-500 text-sm">
            {{ $t('setup.admin_description') }}
          </p>
        </div>

        <form
          class="space-y-6"
          @submit.prevent="handleSetup"
        >
          <div class="grid grid-cols-2 gap-4">
            <AppInput
              id="firstName"
              v-model="form.firstName"
              :label="$t('setup.first_name')"
              type="text"
              autocomplete="given-name"
              :error="errors.firstName"
              required
            />

            <AppInput
              id="lastName"
              v-model="form.lastName"
              :label="$t('setup.last_name')"
              type="text"
              autocomplete="family-name"
              :error="errors.lastName"
              required
            />
          </div>

          <AppInput
            id="email"
            v-model="form.email"
            :label="$t('setup.email')"
            type="email"
            autocomplete="email"
            :error="errors.email"
            required
          />

          <AppInput
            id="password"
            v-model="form.password"
            :label="$t('setup.password')"
            type="password"
            autocomplete="new-password"
            :error="errors.password"
            :hint="$t('setup.password_hint')"
            required
          />

          <AppInput
            id="churchName"
            v-model="form.churchName"
            :label="$t('setup.church_name')"
            type="text"
            autocomplete="organization"
            :error="errors.churchName"
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
            :loading-text="$t('setup.setting_up')"
            full-width
          >
            {{ $t('setup.initialize_button') }}
          </AppButton>
        </form>
      </AppCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { AppCard, AppInput, AppButton, AppAlert, useToast } from '@ekklesia/ui';
import EkklesiaLogo from '../assets/ekklesia-logo.png';
import { useErrorHandler } from '../utils/errorHandler';

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();
const toast = useToast();
const { handleError, handleSuccess } = useErrorHandler();

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  churchName: '',
});

const errors = reactive<Record<string, string>>({});

const isLoading = computed(() => authStore.isLoading);
const errorMessage = computed(() => authStore.error);

const validateForm = (): boolean => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key]);

  if (!form.firstName.trim()) {
    errors.firstName = t('setup.validation.first_name_required');
  }

  if (!form.lastName.trim()) {
    errors.lastName = t('setup.validation.last_name_required');
  }

  if (!form.email.trim()) {
    errors.email = t('setup.validation.email_required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = t('setup.validation.email_invalid');
  }

  if (!form.password.trim()) {
    errors.password = t('setup.validation.password_required');
  } else if (form.password.length < 6) {
    errors.password = t('setup.validation.password_min_length');
  }

  if (!form.churchName.trim()) {
    errors.churchName = t('setup.validation.church_name_required');
  }

  return Object.keys(errors).length === 0;
};

const handleSetup = async () => {
  if (!validateForm()) {
    // Show validation errors as toast
    const firstError = Object.values(errors)[0];
    if (firstError) {
      toast.error(firstError);
    }
    return;
  }

  try {
    await authStore.initializeSystem(form);
    handleSuccess(t('setup.setup_success'));
    router.push('/login');
  } catch (error) {
    handleError(error, t('setup.setup_error'));
  }
};
</script>
