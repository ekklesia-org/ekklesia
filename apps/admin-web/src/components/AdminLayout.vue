<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <AppSidebar
      :title="$t('app.title')"
      :menu-items="menuItems"
    />

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Header -->
      <AppHeader
        :title="pageTitle"
        :subtitle="pageSubtitle"
        :user="user"
        logo-src="@/assets/ekklesia-logo.png"
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
import { useAdminMenu } from '../composables/useAdminMenu';

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

// Generate menu items based on user role
const { menuItems } = useAdminMenu(user.value ?? null);

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
