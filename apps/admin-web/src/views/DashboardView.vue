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
            <ArrowRightOnRectangleIcon class="h-4 w-4" />
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
            <SpeakerWaveIcon />
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
              <UserPlusIcon class="h-6 w-6 text-blue-600 mr-3" />
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

// Heroicons
import {
  ArrowRightOnRectangleIcon,
  UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  SpeakerWaveIcon,
  UserPlusIcon,
  PlusIcon,
  PencilIcon,
} from '@heroicons/vue/24/outline';

const { t } = useI18n();
const auth = useAuth();

// Dashboard data
const memberCount = ref(0);
const eventCount = ref(0);
const donationAmount = ref(0);
const announcementCount = ref(0);

// User data from auth store
const user = computed(() => auth.user || undefined);

onMounted(() => {
  // Load dashboard data (mock data for now)
  loadDashboardData();
});

const loadDashboardData = () => {
  // Mock data - replace with actual API calls
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
