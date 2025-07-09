<template>
  <AdminLayout
    :title="$t('coming_soon.title')"
    :subtitle="$t('coming_soon.subtitle')"
  >
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AppCard class="text-center">
        <div class="py-12">
          <!-- Icon -->
          <div class="mb-8">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <WrenchScrewdriverIcon class="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <!-- Title -->
          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            {{ $t('coming_soon.main_title') }}
          </h1>

          <!-- Description -->
          <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {{ $t('coming_soon.description') }}
          </p>

          <!-- Feature List -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div 
              v-for="feature in features" 
              :key="feature.key"
              class="bg-gray-50 rounded-lg p-6"
            >
              <div class="flex items-center mb-3">
                <div class="flex-shrink-0">
                  <component 
                    :is="feature.icon" 
                    class="h-6 w-6 text-blue-600" 
                  />
                </div>
                <h3 class="ml-3 text-lg font-medium text-gray-900">
                  {{ $t(`coming_soon.features.${feature.key}.title`) }}
                </h3>
              </div>
              <p class="text-gray-600 text-sm">
                {{ $t(`coming_soon.features.${feature.key}.description`) }}
              </p>
            </div>
          </div>

          <!-- Status -->
          <div class="inline-flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span>{{ $t('coming_soon.status') }}</span>
          </div>

          <!-- Actions -->
          <div class="space-y-4">
            <AppButton
              variant="primary"
              size="lg"
              @click="goToDashboard"
            >
              <template #icon>
                <ArrowLeftIcon class="h-5 w-5" />
              </template>
              {{ $t('coming_soon.back_to_dashboard') }}
            </AppButton>
          </div>
        </div>
      </AppCard>

      <!-- Development Timeline -->
      <AppCard 
        :title="$t('coming_soon.timeline.title')"
        class="mt-8"
      >
        <div class="space-y-6">
          <div 
            v-for="phase in timeline" 
            :key="phase.key"
            class="flex items-start space-x-4"
          >
            <div class="flex-shrink-0">
              <div 
                :class="[
                  'w-4 h-4 rounded-full',
                  phase.status === 'completed' ? 'bg-green-500' : 
                  phase.status === 'in_progress' ? 'bg-blue-500' : 
                  'bg-gray-300'
                ]"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <h4 class="text-lg font-medium text-gray-900">
                  {{ $t(`coming_soon.timeline.${phase.key}.title`) }}
                </h4>
                <span 
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                    phase.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ $t(`coming_soon.timeline.status.${phase.status}`) }}
                </span>
              </div>
              <p class="text-gray-600 text-sm mt-1">
                {{ $t(`coming_soon.timeline.${phase.key}.description`) }}
              </p>
              <div class="mt-2">
                <div class="text-xs text-gray-500">
                  {{ $t(`coming_soon.timeline.${phase.key}.features`) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppCard>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { AppCard, AppButton } from '@ekklesia/ui';
import AdminLayout from '../components/AdminLayout.vue';

// Heroicons
import {
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
  UsersIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  SpeakerWaveIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  DocumentTextIcon,
} from '@heroicons/vue/24/outline';

const router = useRouter();
const { t } = useI18n();

// Features that will be implemented
const features = [
  { key: 'members', icon: UsersIcon },
  { key: 'events', icon: CalendarDaysIcon },
  { key: 'finances', icon: CurrencyDollarIcon },
  { key: 'announcements', icon: SpeakerWaveIcon },
  { key: 'users', icon: UserGroupIcon },
  { key: 'settings', icon: CogIcon },
  { key: 'statistics', icon: ChartBarIcon },
  { key: 'reports', icon: DocumentTextIcon },
];

// Development timeline
const timeline = [
  { key: 'phase1', status: 'completed' },
  { key: 'phase2', status: 'in_progress' },
  { key: 'phase3', status: 'planned' },
  { key: 'phase4', status: 'planned' },
];

const goToDashboard = () => {
  router.push('/dashboard');
};
</script>
