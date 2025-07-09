<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <AppSidebar
      :menu-items="menuItems"
      :logo-src="logo"
    />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <AppHeader
        :title="pageTitle"
        :subtitle="pageSubtitle"
        :user="user"
      >
        <template #actions>
          <ChurchSelector v-if="user?.role === 'SUPER_ADMIN' && shouldShowChurchSelector" />
        </template>
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
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../stores/auth';
import { AppSidebar, AppHeader, AppButton } from '@ekklesia/ui';
import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline';
import { useAdminMenu } from '../composables/useAdminMenu';
import ChurchSelector from './ChurchSelector.vue';
import logo from '../assets/ekklesia-logo.png';

interface Props {
  title?: string;
  subtitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
});

const auth = useAuth();
const route = useRoute();

const user = computed(() => auth.user || undefined);
const pageTitle = computed(() => props.title || '');
const pageSubtitle = computed(() => props.subtitle || '');

// Determine if church selector should be shown
const shouldShowChurchSelector = computed(() => {
  if (!user.value || user.value.role !== 'SUPER_ADMIN') return false;
  
  // Exclude church selector from specific routes
  const excludedRoutes = ['/churches', '/dashboard'];
  return !excludedRoutes.includes(route.path);
});

// Generate menu items based on user role
const { menuItems } = useAdminMenu(user.value ?? null);

const logout = () => {
  auth.logoutAndRedirect();
};
</script>

