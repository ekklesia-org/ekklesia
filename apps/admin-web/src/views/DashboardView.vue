<template>
  <AdminLayout
    :title="$t('dashboard.title')"
    :subtitle="$t('dashboard.welcome', { name: user?.firstName })"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Super Admin Stats -->
      <div
        v-if="isSuperAdmin"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <AppStatsCard
          :title="$t('churches.active_churches')"
          :value="churchCount"
          color="blue"
        >
          <template #icon>
            <BuildingOfficeIcon />
          </template>
        </AppStatsCard>

        <AppStatsCard
          :title="$t('churches.total_users')"
          :value="totalChurchUsers"
          color="green"
        >
          <template #icon>
            <UsersIcon />
          </template>
        </AppStatsCard>

        <AppStatsCard
          :title="$t('dashboard.total_events')"
          :value="totalEvents"
          color="yellow"
        >
          <template #icon>
            <CalendarIcon />
          </template>
        </AppStatsCard>

        <AppStatsCard
          :title="$t('dashboard.system_health')"
          :value="systemHealth"
          color="purple"
        >
          <template #icon>
            <CpuChipIcon />
          </template>
        </AppStatsCard>
      </div>

      <!-- Church Admin Stats -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
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

      <!-- Super Admin Quick Actions -->
      <AppCard
        v-if="isSuperAdmin"
        :title="$t('dashboard.quick_actions')"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AppButton
            variant="ghost"
            class="flex items-center p-4 justify-start"
            @click="createChurch"
          >
            <template #icon>
              <BuildingOfficeIcon class="h-6 w-6 text-blue-600 mr-3" />
            </template>
            {{ $t('dashboard.create_church') }}
          </AppButton>

          <AppButton
            variant="ghost"
            class="flex items-center p-4 justify-start"
            @click="manageUsers"
          >
            <template #icon>
              <UsersIcon class="h-6 w-6 text-green-600 mr-3" />
            </template>
            {{ $t('dashboard.manage_users') }}
          </AppButton>

          <AppButton
            variant="ghost"
            class="flex items-center p-4 justify-start"
            @click="systemSettings"
          >
            <template #icon>
              <CogIcon class="h-6 w-6 text-purple-600 mr-3" />
            </template>
            {{ $t('dashboard.system_settings') }}
          </AppButton>
        </div>
      </AppCard>

      <!-- Church Admin Quick Actions -->
      <AppCard
        v-else
        :title="$t('dashboard.quick_actions')"
      >
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
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/auth';
import {
  AppStatsCard,
  AppCard,
  AppButton,
} from '@ekklesia/ui';
import { UserRole } from '@ekklesia/shared';
import AdminLayout from '../components/AdminLayout.vue';
import { useChurchesStore } from '../stores/churches';

// Heroicons
import {
  UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  SpeakerWaveIcon,
  UserPlusIcon,
  PlusIcon,
  PencilIcon,
  BuildingOfficeIcon,
  CpuChipIcon,
  CogIcon,
} from '@heroicons/vue/24/outline';

const { t } = useI18n();
const router = useRouter();
const auth = useAuth();

// Dashboard data
const memberCount = ref(0);
const eventCount = ref(0);
const donationAmount = ref(0);
const announcementCount = ref(0);

// Super Admin specific stats
const totalEvents = ref(0);
const systemHealth = ref('Good');

// User data from auth store
const user = computed(() => auth.user || undefined);
const isSuperAdmin = computed(() => user.value?.role === UserRole.SUPER_ADMIN);

// Churches store for super admin
const churchesStore = useChurchesStore();
const churchCount = computed(() => churchesStore.activeChurches.length);
const totalChurchUsers = computed(() => churchesStore.totalUsers);

onMounted(() => {
  // Load dashboard data (mock data for now)
  loadDashboardData();
});

const loadDashboardData = async () => {
  // Mock data - replace with actual API calls
  memberCount.value = 125;
  eventCount.value = 8;
  donationAmount.value = 15420;
  announcementCount.value = 3;

  // Super Admin specific data
  if (isSuperAdmin.value) {
    totalEvents.value = 45;
    systemHealth.value = 'Good';
    await churchesStore.fetchChurches();
  }
};

const addMember = () => {
  router.push('/members');
};

const createEvent = () => {
  router.push('/events');
};

const newAnnouncement = () => {
  router.push('/announcements');
};

// Super Admin actions
const createChurch = () => {
  router.push('/churches');
};

const manageUsers = () => {
  router.push('/users');
};

const systemSettings = () => {
  router.push('/church-settings');
};

</script>
