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

        <!-- Error Icon -->
        <div class="mb-4">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              class="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('error.title') }}
        </h1>
        <p class="text-gray-600 mb-4">
          {{ $t('error.server_unavailable') }}
        </p>
      </div>

      <AppCard
        variant="elevated"
        rounded="xl"
      >
        <div class="text-center space-y-4">
          <div class="text-sm text-gray-500">
            {{ $t('error.description') }}
          </div>

          <!-- Error Details (if available) -->
          <div
            v-if="errorDetails"
            class="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <h3 class="text-sm font-medium text-red-800 mb-2">
              {{ $t('error.technical_details') }}
            </h3>
            <div class="text-xs text-red-700 font-mono bg-red-100 p-2 rounded">
              {{ errorDetails }}
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
            <AppButton
              variant="primary"
              :is-loading="isRetrying"
              :loading-text="$t('error.checking')"
              full-width
              @click="checkStatus"
            >
              {{ $t('error.retry') }}
            </AppButton>

            <AppButton
              variant="secondary"
              full-width
              @click="refreshPage"
            >
              {{ $t('error.refresh_page') }}
            </AppButton>
          </div>
        </div>
      </AppCard>

      <!-- Status indicator -->
      <div class="text-center">
        <div class="inline-flex items-center space-x-2 text-sm text-gray-500">
          <div class="w-2 h-2 bg-red-500 rounded-full" />
          <span>{{ $t('error.status_offline') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { AppCard, AppButton } from '@ekklesia/ui';
import EkklesiaLogo from '../assets/ekklesia-logo.png';

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const isRetrying = ref(false);
const errorDetails = ref<string>('');

// Get error details from route query or store
onMounted(() => {
  const routeError = router.currentRoute.value.query.error as string;
  if (routeError) {
    errorDetails.value = routeError;
  }
});

const checkStatus = async () => {
  isRetrying.value = true;

  try {
    const systemStatus = await authStore.safeCheckSystemStatus();

    // If successful, redirect based on system status
    if (systemStatus) {
      if (systemStatus.needsSetup) {
        router.push('/setup');
      } else if (authStore.isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } else {
      // Still having issues, stay on error page
      console.error('Status check failed again');
    }
  } catch (error) {
    // Still having issues, stay on error page
    console.error('Status check failed again:', error);
  } finally {
    isRetrying.value = false;
  }
};

const refreshPage = () => {
  window.location.reload();
};
</script>
