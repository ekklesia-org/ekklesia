<template>
  <div class="app-sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">
        {{ title }}
      </h2>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li 
          v-for="item in menuItems" 
          :key="item.id"
          class="nav-item"
        >
          <router-link
            :to="item.to"
            class="nav-link"
            :class="{ active: isActive(item.to) }"
          >
            <component
              :is="item.icon"
              class="nav-icon"
            />
            <span class="nav-text">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { Component } from 'vue';

export interface MenuItem {
  id: string;
  label: string;
  to: string;
  icon: Component;
}

interface Props {
  title?: string;
  menuItems: MenuItem[];
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Ekklesia',
});

const route = useRoute();

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
