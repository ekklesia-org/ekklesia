<template>
  <div class="app-sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">
        {{ title }}
      </h2>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav-list">
        <!-- Dashboard - Always visible -->
        <li class="nav-item">
          <router-link
            to="/dashboard"
            class="nav-link"
            :class="{ active: isActive('/dashboard') }"
          >
            <component
              :is="DashboardIcon"
              class="nav-icon"
            />
            <span class="nav-text">{{ translations?.dashboard || 'Dashboard' }}</span>
          </router-link>
        </li>

        <!-- Super Admin Only - Church Management -->
        <li
          v-if="isSuperAdmin"
          class="nav-item"
        >
          <router-link
            to="/churches"
            class="nav-link"
            :class="{ active: isActive('/churches') }"
          >
            <component
              :is="BuildingOfficeIcon"
              class="nav-icon"
            />
            <span class="nav-text">{{ translations?.churches || 'Churches' }}</span>
          </router-link>
        </li>

        <!-- Super Admin Only - Global Statistics -->
        <li
          v-if="isSuperAdmin"
          class="nav-item"
        >
          <router-link
            to="/statistics"
            class="nav-link"
            :class="{ active: isActive('/statistics') }"
          >
            <component
              :is="ChartBarIcon"
              class="nav-icon"
            />
            <span class="nav-text">{{ translations?.statistics || 'Statistics' }}</span>
          </router-link>
        </li>

        <!-- Church Admin and up - Members Management -->
        <li
          v-if="canManageMembers"
          class="nav-item"
        >
          <router-link
            to="/members"
            class="nav-link"
            :class="{ active: isActive('/members') }"
          >
            <component
              :is="UsersIcon"
              class="nav-icon"
            />
            <span class="nav-text">{{ translations?.members || 'Members' }}</span>
          </router-link>
        </li>

        <!-- Church Admin and up - Events Management -->
        <li
          v-if="canManageEvents"
          class="nav-item"
        >
          <router-link
            to="/events"
            class="nav-link"
            :class="{ active: isActive('/events') }"
          >
            <component
              :is="CalendarIcon"
              class="nav-icon"
            />
            <span class="nav-text">{{ translations?.events || 'Events' }}</span>
          </router-link>
        </li>

        <!-- Pastor, Treasurer, Church Admin - Financial Management -->
        <li
          v-if="canManageFinances"
          class="nav-item"
        >
          <router-link
            to="/finances"
            class="nav-link"
            :class="{ active: isActive('/finances') }"
          >
            <component
              :is="CurrencyDollarIcon"
              class="nav-icon"
            />
            <span class="nav-text">{{ translations?.finances || 'Finances' }}</span>
          </router-link>
        </li>

        <!-- Church Admin and up - Announcements -->
        <li
          v-if="canManageAnnouncements"
          class="nav-item"
        >
          <router-link
            to="/announcements"
            class="nav-link"
            :class="{ active: isActive('/announcements') }"
          >
            <component
              :is="SpeakerWaveIcon"
              class="nav-icon"
            />
            <span class="nav-text">{{ translations?.announcements || 'Announcements' }}</span>
          </router-link>
        </li>

        <!-- Church Admin and up - User Management -->
        <li
          v-if="canManageUsers"
          class="nav-item"
        >
          <router-link
            to="/users"
            class="nav-link"
            :class="{ active: isActive('/users') }"
          >
            <component
              :is="UserGroupIcon"
              class="nav-icon"
            />
            <span class="nav-text">{{ translations?.users || 'Users' }}</span>
          </router-link>
        </li>

        <!-- Church Admin only - Church Settings -->
        <li
          v-if="isChurchAdmin"
          class="nav-item"
        >
          <router-link
            to="/church-settings"
            class="nav-link"
            :class="{ active: isActive('/church-settings') }"
          >
            <component
              :is="CogIcon"
              class="nav-icon"
            />
            <span class="nav-text">{{ translations?.church_settings || 'Church Settings' }}</span>
          </router-link>
        </li>

        <!-- Reports - For authorized roles -->
        <li
          v-if="canViewReports"
          class="nav-item"
        >
          <router-link
            to="/reports"
            class="nav-link"
            :class="{ active: isActive('/reports') }"
          >
            <component
              :is="DocumentChartBarIcon"
              class="nav-icon"
            />
            <span class="nav-text">{{ translations?.reports || 'Reports' }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { UserRole, User } from '@ekklesia/shared';
import {
  HomeIcon as DashboardIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  SpeakerWaveIcon,
  UserGroupIcon,
  CogIcon,
  DocumentChartBarIcon,
} from '@heroicons/vue/24/outline';

interface Props {
  title?: string;
  user?: User | null;
  translations?: {
    dashboard?: string;
    churches?: string;
    statistics?: string;
    members?: string;
    events?: string;
    finances?: string;
    announcements?: string;
    users?: string;
    church_settings?: string;
    reports?: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Ekklesia Admin',
  user: null,
  translations: () => ({}),
});

const route = useRoute();

// Role-based permissions
const isSuperAdmin = computed(() => props.user?.role === UserRole.SUPER_ADMIN);
const isChurchAdmin = computed(() => props.user?.role === UserRole.CHURCH_ADMIN);
const isPastor = computed(() => props.user?.role === UserRole.PASTOR);
const isTreasurer = computed(() => props.user?.role === UserRole.TREASURER);
const isSecretary = computed(() => props.user?.role === UserRole.SECRETARY);

// Permission checks
const canManageMembers = computed(() =>
  isSuperAdmin.value || isChurchAdmin.value || isPastor.value || isSecretary.value
);

const canManageEvents = computed(() =>
  isSuperAdmin.value || isChurchAdmin.value || isPastor.value || isSecretary.value
);

const canManageFinances = computed(() =>
  isSuperAdmin.value || isChurchAdmin.value || isPastor.value || isTreasurer.value
);

const canManageAnnouncements = computed(() =>
  isSuperAdmin.value || isChurchAdmin.value || isPastor.value || isSecretary.value
);

const canManageUsers = computed(() =>
  isSuperAdmin.value || isChurchAdmin.value
);

const canViewReports = computed(() =>
  isSuperAdmin.value || isChurchAdmin.value || isPastor.value || isTreasurer.value
);

// Check if current route is active
const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/');
};
</script>

<style scoped>
.app-sidebar {
  width: 16rem; /* w-64 */
  background-color: white;
  border-right: 1px solid #e5e7eb; /* border-r border-gray-200 */
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem 1.5rem; /* px-6 py-4 */
  border-bottom: 1px solid #e5e7eb; /* border-b border-gray-200 */
}

.sidebar-title {
  font-size: 1.125rem; /* text-lg */
  font-weight: 600; /* font-semibold */
  color: #111827; /* text-gray-900 */
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
}

.nav-list {
  padding: 1rem 0; /* py-4 */
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* space-y-1 */
}

.nav-item {
  padding: 0 0.75rem; /* px-3 */
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem; /* px-3 py-2 */
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  color: #4b5563; /* text-gray-600 */
  border-radius: 0.375rem; /* rounded-md */
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: #f9fafb; /* hover:bg-gray-50 */
  color: #111827; /* hover:text-gray-900 */
}

.nav-link.active {
  background-color: #eff6ff; /* bg-blue-50 */
  color: #1d4ed8; /* text-blue-700 */
  border-right: 2px solid #3b82f6; /* border-r-2 border-blue-500 */
}

.nav-icon {
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
  margin-right: 0.75rem; /* mr-3 */
  flex-shrink: 0;
}

.nav-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
