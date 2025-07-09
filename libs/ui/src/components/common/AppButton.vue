<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || isLoading"
    v-bind="$attrs"
  >
    <span
      v-if="isLoading"
      class="flex items-center justify-center"
    >
      <ArrowPathIcon class="animate-spin -ml-1 mr-2 h-5 w-5" />
      <slot name="loading">{{ loadingText }}</slot>
    </span>
    <span
      v-else
      class="flex items-center justify-center"
    >
      <slot name="icon" />
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowPathIcon } from '@heroicons/vue/24/outline';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  isLoading: false,
  loadingText: 'Loading...',
  fullWidth: false,
});

const buttonClasses = computed(() => {
  const baseClasses = [
    'inline-flex items-center justify-center font-medium rounded-lg',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]',
    props.fullWidth ? 'w-full' : '',
  ];

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500 border border-gray-300',
  };

  return [
    ...baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
  ].join(' ');
});
</script>
