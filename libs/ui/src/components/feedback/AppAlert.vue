<template>
  <div :class="alertClasses">
    <div class="flex items-center">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <slot name="icon">
          <component
            :is="iconComponent"
            class="h-5 w-5"
          />
        </slot>
      </div>

      <!-- Content -->
      <div class="ml-3 flex-1">
        <slot>
          <div
            v-if="title"
            class="text-sm font-medium"
            :class="titleClasses"
          >
            {{ title }}
          </div>
          <div
            v-if="message"
            class="text-sm mt-1"
            :class="messageClasses"
          >
            {{ message }}
          </div>
        </slot>
      </div>

      <!-- Close button -->
      <div
        v-if="closeable"
        class="ml-auto pl-3"
      >
        <button
          type="button"
          :class="closeButtonClasses"
          @click="$emit('close')"
        >
          <span class="sr-only">Dismiss</span>
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Icons (these would come from your icon library)
const CheckCircleIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>
  `,
};

const ExclamationTriangleIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>
  `,
};

const XCircleIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
    </svg>
  `,
};

const InformationCircleIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
    </svg>
  `,
};

const XMarkIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  `,
};

interface Props {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  closeable?: boolean;
}

interface Emits {
  (e: 'close'): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  title: undefined,
  message: undefined,
  closeable: false,
});

defineEmits<Emits>();

const iconComponent = computed(() => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  };
  return icons[props.variant];
});

const alertClasses = computed(() => {
  const baseClasses = ['p-4 rounded-lg border-l-4'];

  const variantClasses = {
    success: 'bg-green-50 border-green-400',
    error: 'bg-red-50 border-red-400',
    warning: 'bg-yellow-50 border-yellow-400',
    info: 'bg-blue-50 border-blue-400',
  };

  return [
    ...baseClasses,
    variantClasses[props.variant],
  ].join(' ');
});

const titleClasses = computed(() => {
  const variantClasses = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  return variantClasses[props.variant];
});

const messageClasses = computed(() => {
  const variantClasses = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-yellow-700',
    info: 'text-blue-700',
  };

  return variantClasses[props.variant];
});

const closeButtonClasses = computed(() => {
  const variantClasses = {
    success: 'text-green-400 hover:text-green-600',
    error: 'text-red-400 hover:text-red-600',
    warning: 'text-yellow-400 hover:text-yellow-600',
    info: 'text-blue-400 hover:text-blue-600',
  };

  return [
    'p-1.5 rounded-md transition-colors',
    variantClasses[props.variant],
  ].join(' ');
});
</script>
