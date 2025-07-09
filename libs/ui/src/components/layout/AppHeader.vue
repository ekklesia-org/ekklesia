<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Left side - Logo and Title -->
        <div class="flex items-center space-x-4">
          <div
            v-if="$slots.logo || logoSrc"
            class="flex-shrink-0"
          >
            <slot name="logo">
              <img
                v-if="logoSrc"
                :src="logoSrc"
                :alt="logoAlt"
                class="h-8 w-auto"
              >
            </slot>
          </div>

          <div v-if="title || subtitle">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ title }}
            </h1>
            <p
              v-if="subtitle"
              class="text-sm text-gray-600 mt-1"
            >
              {{ subtitle }}
            </p>
          </div>
        </div>

        <!-- Center - Navigation or Search -->
        <div
          v-if="$slots.center"
          class="flex-1 flex justify-center max-w-2xl mx-8"
        >
          <slot name="center" />
        </div>

        <!-- Right side - User menu and actions -->
        <div class="flex items-center space-x-4">
          <slot name="actions" />

          <!-- User Menu -->
          <div
            v-if="user"
            class="flex items-center space-x-3"
          >
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-white">
                {{ userInitials }}
              </span>
            </div>
            <div
              v-if="showUserInfo"
              class="hidden sm:block"
            >
              <p class="text-sm font-medium text-gray-900">
                {{ userFullName }}
              </p>
              <p class="text-xs text-gray-500">
                {{ user.email }}
              </p>
            </div>
          </div>

          <!-- User actions -->
          <slot name="userActions" />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '@ekklesia/shared';

interface Props {
  title?: string;
  subtitle?: string;
  logoSrc?: string;
  logoAlt?: string;
  user?: User;
  showUserInfo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  subtitle: undefined,
  logoSrc: undefined,
  logoAlt: 'Logo',
  user: undefined,
  showUserInfo: true,
});

const userInitials = computed(() => {
  if (!props.user) return '';

  const firstName = props.user.firstName || '';
  const lastName = props.user.lastName || '';

  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
});

const userFullName = computed(() => {
  if (!props.user) return '';

  return `${props.user.firstName} ${props.user.lastName}`.trim();
});
</script>
