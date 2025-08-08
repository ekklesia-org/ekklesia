<template>
  <div
    v-bind="$attrs"
    class="transition-all duration-300 ease-in-out"
    :class="['relative md:h-full', desktopCollapsed ? 'md:w-0' : 'md:w-64']"
  >
    <!-- Mobile: Hamburger button -->
    <button
      type="button"
      class="fixed top-4 left-4 z-40 inline-flex items-center justify-center rounded-md p-2 bg-white/90 border border-gray-200 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      :aria-label="isDesktop ? (desktopCollapsed ? 'Open sidebar' : 'Hide sidebar') : 'Open menu'"
      @click="toggleMenu"
    >
      <!-- Simple hamburger icon -->
      <svg
        class="h-6 w-6 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <!-- Desktop sidebar -->
    <div
      class="w-64 bg-white border-r border-gray-200 h-full flex-col transition-all duration-300 ease-in-out"
      :class="desktopCollapsed ? 'md:hidden' : 'md:flex'"
    >
      <div class="px-6 py-4">
        <div
          v-if="logoSrc"
          class="flex items-center mb-2 justify-center"
        >
          <img
            :src="logoSrc"
            :alt="title"
            class="h-8 w-auto mr-3"
            :class="{ 'h-16': !title }"
          >
          <h2
            class="text-lg font-semibold text-gray-900"
          >
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

    <!-- Mobile overlay sidebar -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="md:hidden fixed inset-0 z-50"
        aria-modal="true"
        role="dialog"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50"
          @click="closeSidebar"
        />

        <!-- Panel -->
        <transition name="slide-in">
          <div
            v-if="isOpen"
            class="relative w-64 h-full bg-white shadow-xl border-r border-gray-200"
          >
            <div class="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <div class="flex items-center space-x-3">
                <img
                  v-if="logoSrc"
                  :src="logoSrc"
                  :alt="title"
                  class="h-8 w-auto"
                >
                <h2 class="text-lg font-semibold text-gray-900">
                  {{ title }}
                </h2>
              </div>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close menu"
                @click="closeSidebar"
              >
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
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
                    @click="closeSidebar"
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
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

defineOptions({ inheritAttrs: false });
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
  title: '',
  logoSrc: undefined,
});

const route = useRoute();
const isOpen = ref(false);
const desktopCollapsed = ref(false);
const isDesktop = ref(false);

const updateIsDesktop = () => {
  if (typeof window !== 'undefined') {
    isDesktop.value = window.matchMedia('(min-width: 768px)').matches;
  }
};

onMounted(() => {
  updateIsDesktop();
  window.addEventListener('resize', updateIsDesktop);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsDesktop);
});

const openSidebar = () => (isOpen.value = true);
const closeSidebar = () => (isOpen.value = false);

const toggleMenu = () => {
  updateIsDesktop();
  if (isDesktop.value) {
    desktopCollapsed.value = !desktopCollapsed.value;
  } else {
    isOpen.value = true;
  }
};

// Check if current route is active
const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/');
};
</script>

<style scoped>
/* Simple transitions for overlay/panel */
.fade-enter-active, .fade-leave-active { transition: opacity 200ms ease-out; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Smoother slide for mobile panel */
.slide-in-enter-active, .slide-in-leave-active { transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1); will-change: transform; }
.slide-in-enter-from, .slide-in-leave-to { transform: translateX(-100%); }
</style>

