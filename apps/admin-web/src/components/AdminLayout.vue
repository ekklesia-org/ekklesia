<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <AppSidebar
      :title="$t('app.title')"
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
import { useAuth } from '../stores/auth';
import { AppSidebar, AppHeader, AppButton } from '@ekklesia/ui';
import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline';
import { useAdminMenu } from '../composables/useAdminMenu';
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

const user = computed(() => auth.user || undefined);
const pageTitle = computed(() => props.title || '');
const pageSubtitle = computed(() => props.subtitle || '');

// Generate menu items based on user role
const { menuItems } = useAdminMenu(user.value ?? null);

const logout = () => {
  auth.logoutAndRedirect();
};
</script>

