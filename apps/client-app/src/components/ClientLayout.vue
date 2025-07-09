<template>
  <div class="client-layout">
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
      >
        <template #userActions>
          <AppButton
            v-if="user"
            variant="danger"
            size="sm"
            @click="logout"
          >
            <template #icon>
              <ArrowRightOnRectangleIcon class="h-4 w-4" />
            </template>
            {{ $t('auth.logout') }}
          </AppButton>
          <AppButton
            v-else
            variant="primary"
            size="sm"
            @click="login"
          >
            <template #icon>
              <ArrowRightOnRectangleIcon class="h-4 w-4" />
            </template>
            {{ $t('auth.login') }}
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
import { useRouter } from 'vue-router';
import { AppSidebar, AppHeader, AppButton } from '@ekklesia/ui';
import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline';
import { useClientMenu } from '../composables/useClientMenu';

interface Props {
  title?: string;
  subtitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
});

const router = useRouter();

// Mock user - in real app this would come from auth store
const user = computed(() => null); // or auth.user
const pageTitle = computed(() => props.title || '');
const pageSubtitle = computed(() => props.subtitle || '');

// Generate menu items based on user role
const { menuItems } = useClientMenu(user.value);

const logout = () => {
  // Handle logout logic
  console.log('Logout clicked');
};

const login = () => {
  router.push('/login');
};
</script>

<style scoped>
.client-layout {
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
