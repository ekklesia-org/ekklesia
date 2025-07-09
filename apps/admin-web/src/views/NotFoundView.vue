<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-gray-900 mb-2">
          404
        </h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">
          {{ $t('not_found.title') }}
        </h2>
        <p class="text-gray-600 mb-6">
          {{ $t('not_found.description') }}
        </p>
      </div>

      <AppCard
        variant="elevated"
        rounded="xl"
      >
        <div class="text-center space-y-4">
          <!-- Requested URL -->
          <div
            v-if="requestedUrl"
            class="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <h3 class="text-sm font-medium text-gray-800 mb-2">
              {{ $t('not_found.requested_url') }}
            </h3>
            <div class="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded">
              {{ requestedUrl }}
            </div>
          </div>

          <!-- Suggestions -->
          <div class="text-left">
            <h3 class="text-sm font-medium text-gray-800 mb-3">
              {{ $t('not_found.suggestions.title') }}
            </h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-start">
                <span class="text-blue-600 mr-2">•</span>
                {{ $t('not_found.suggestions.check_url') }}
              </li>
              <li class="flex items-start">
                <span class="text-blue-600 mr-2">•</span>
                {{ $t('not_found.suggestions.use_navigation') }}
              </li>
              <li class="flex items-start">
                <span class="text-blue-600 mr-2">•</span>
                {{ $t('not_found.suggestions.contact_admin') }}
              </li>
            </ul>
          </div>

          <!-- Quick Links -->
          <div class="border-t pt-4">
            <h3 class="text-sm font-medium text-gray-800 mb-3">
              {{ $t('not_found.quick_links.title') }}
            </h3>
            <div class="grid grid-cols-1 gap-2">
              <AppButton
                variant="ghost"
                size="sm"
                class="justify-start"
                @click="goTo('/dashboard')"
              >
                <template #icon>
                  <HomeIcon class="h-4 w-4" />
                </template>
                {{ $t('not_found.quick_links.dashboard') }}
              </AppButton>

              <AppButton
                v-if="canManageChurches"
                variant="ghost"
                size="sm"
                class="justify-start"
                @click="goTo('/churches')"
              >
                <template #icon>
                  <BuildingOfficeIcon class="h-4 w-4" />
                </template>
                {{ $t('not_found.quick_links.churches') }}
              </AppButton>

              <AppButton
                variant="ghost"
                size="sm"
                class="justify-start"
                @click="goToComingSoon"
              >
                <template #icon>
                  <WrenchScrewdriverIcon class="h-4 w-4" />
                </template>
                {{ $t('not_found.quick_links.coming_soon') }}
              </AppButton>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-3 pt-4 border-t">
            <AppButton
              variant="primary"
              full-width
              @click="goBack"
            >
              <template #icon>
                <ArrowLeftIcon class="h-4 w-4" />
              </template>
              {{ $t('not_found.actions.go_back') }}
            </AppButton>

            <AppButton
              variant="secondary"
              full-width
              @click="goHome"
            >
              <template #icon>
                <HomeIcon class="h-4 w-4" />
              </template>
              {{ $t('not_found.actions.go_home') }}
            </AppButton>
          </div>
        </div>
      </AppCard>

      <!-- Status indicator -->
      <div class="text-center">
        <div class="inline-flex items-center space-x-2 text-sm text-gray-500">
          <div class="w-2 h-2 bg-yellow-500 rounded-full" />
          <span>{{ $t('not_found.status') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../stores/auth';
import { AppCard, AppButton } from '@ekklesia/ui';
import { UserRole } from '@ekklesia/shared';
import EkklesiaLogo from '../assets/ekklesia-logo.png';

// Heroicons
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/outline';

const router = useRouter();
const { t } = useI18n();
const auth = useAuth();

const requestedUrl = ref<string>('');

// User permissions
const canManageChurches = computed(() => {
  return auth.user?.role === UserRole.SUPER_ADMIN;
});

onMounted(() => {
  // Get the requested URL from the current route
  requestedUrl.value = router.currentRoute.value.fullPath;
});

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push('/dashboard');
  }
};

const goHome = () => {
  router.push('/dashboard');
};

const goTo = (path: string) => {
  router.push(path);
};

const goToComingSoon = () => {
  router.push('/coming-soon');
};
</script>
