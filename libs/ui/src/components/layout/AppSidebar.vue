<template>
  <div class="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
    <div class="px-6 py-4 border-b border-gray-200">
      <div
        v-if="logoSrc"
        class="flex items-center mb-2"
      >
        <img
          :src="logoSrc"
          :alt="title"
          class="h-8 w-auto mr-3"
        >
        <h2 class="text-lg font-semibold text-gray-900">
          {{ title }}
        </h2>
      </div>
      <h2
        v-else
        class="text-lg font-semibold text-gray-900"
      >
        {{ title }}
      </h2>
    </div>

    <nav class="flex-1 overflow-y-auto">
      <ul class="py-4 flex flex-col space-y-1">
        <li
          v-for="item in menuItems"
          :key="item.id"
          class="px-3"
        >
          <router-link
            :to="item.to"
            class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
            :class="{
              'bg-blue-50 text-blue-700 border-r-2 border-blue-500': isActive(item.to)
            }"
          >
            <component
              :is="item.icon"
              class="w-5 h-5 mr-3 flex-shrink-0"
            />
            <span class="overflow-hidden text-ellipsis whitespace-nowrap">{{ item.label }}</span>
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
  logoSrc?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Ekklesia',
  logoSrc: undefined,
});

const route = useRoute();

// Check if current route is active
const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/');
};
</script>

