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
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/20/solid';

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
