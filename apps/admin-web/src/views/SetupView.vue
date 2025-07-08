<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6">
      <div class="text-center">
        <div class="mb-4">
          <img
            :src="EkklesiaLogo"
            alt="Ekklesia"
            class="h-12 w-auto mx-auto"
          >
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('setup.title') }}
        </h1>
        <p class="text-gray-600">
          {{ $t('setup.subtitle') }}
        </p>
      </div>

      <div class="bg-white shadow-xl rounded-2xl p-8">
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
            <div>
              <label
                for="firstName"
                class="block text-sm font-medium text-gray-700"
              >
                {{ $t('setup.first_name') }}
              </label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                autocomplete="given-name"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                :class="{ 'border-red-300 focus:ring-red-500 bg-red-50': errors.firstName }"
              >
              <p
                v-if="errors.firstName"
                class="text-sm text-red-600 mt-1"
              >
                {{ errors.firstName }}
              </p>
            </div>

            <div>
              <label
                for="lastName"
                class="block text-sm font-medium text-gray-700"
              >
                {{ $t('setup.last_name') }}
              </label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                autocomplete="family-name"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                :class="{ 'border-red-300 focus:ring-red-500 bg-red-50': errors.lastName }"
              >
              <p
                v-if="errors.lastName"
                class="text-sm text-red-600 mt-1"
              >
                {{ errors.lastName }}
              </p>
            </div>
          </div>

          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700"
            >
              {{ $t('setup.email') }}
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              :class="{ 'border-red-300 focus:ring-red-500 bg-red-50': errors.email }"
            >
            <p
              v-if="errors.email"
              class="text-sm text-red-600 mt-1"
            >
              {{ errors.email }}
            </p>
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700"
            >
              {{ $t('setup.password') }}
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              required
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              :class="{ 'border-red-300 focus:ring-red-500 bg-red-50': errors.password }"
            >
            <p
              v-if="errors.password"
              class="text-sm text-red-600 mt-1"
            >
              {{ errors.password }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ $t('setup.password_hint') }}
            </p>
          </div>

          <div>
            <label
              for="churchName"
              class="block text-sm font-medium text-gray-700"
            >
              {{ $t('setup.church_name') }}
            </label>
            <input
              id="churchName"
              v-model="form.churchName"
              type="text"
              autocomplete="organization"
              required
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              :class="{ 'border-red-300 focus:ring-red-500 bg-red-50': errors.churchName }"
            >
            <p
              v-if="errors.churchName"
              class="text-sm text-red-600 mt-1"
            >
              {{ errors.churchName }}
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
              {{ $t('setup.setting_up') }}
            </span>
            <span v-else>{{ $t('setup.initialize_button') }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import EkklesiaLogo from '../assets/ekklesia-logo.png';

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

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
    return;
  }

  try {
    await authStore.initializeSystem(form);
    router.push('/login');
  } catch (error) {
    console.error('Setup failed', error);
  }
};
</script>
