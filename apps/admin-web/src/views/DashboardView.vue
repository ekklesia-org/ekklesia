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

// Icons (using inline SVG until heroicons are available)
const LogoutIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  `
};

const UsersIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  `
};

const CalendarIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  `
};

const CurrencyDollarIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  `
};

const SpeakerphoneIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  `
};

const UserAddIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  `
};

const PlusIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  `
};

const PencilIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  `
};

const { t } = useI18n();
const auth = useAuth();

// Dashboard data
const memberCount = ref(0);
const eventCount = ref(0);
const donationAmount = ref(0);
const announcementCount = ref(0);

// User data from auth store
const user = computed(() => auth.user);

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
