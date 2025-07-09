<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <AppSidebar
      :title="$t('app.title')"
      :user="user"
      :translations="{
        dashboard: $t('sidebar.dashboard'),
        churches: $t('sidebar.churches'),
        statistics: $t('sidebar.statistics'),
        members: $t('sidebar.members'),
        events: $t('sidebar.events'),
        finances: $t('sidebar.finances'),
        announcements: $t('sidebar.announcements'),
        users: $t('sidebar.users'),
        church_settings: $t('sidebar.church_settings'),
        reports: $t('sidebar.reports')
      }"
    />

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Header -->
      <AppHeader
        :title="pageTitle"
        :subtitle="pageSubtitle"
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

      <!-- Page Content -->
      <main class="page-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '../stores/auth';
import { AppSidebar, AppHeader, AppButton } from '@ekklesia/ui';
import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline';

interface Props {
  title?: string;
  subtitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
});

const auth = useAuth();

const user = computed(() => auth.user || undefined);
const pageTitle = computed(() => props.title || '');
const pageSubtitle = computed(() => props.subtitle || '');

const logout = () => {
  auth.logoutAndRedirect();
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background-color: #f9fafb; /* bg-gray-50 */
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-content {
  flex: 1;
  overflow-y: auto;
}
</style>
