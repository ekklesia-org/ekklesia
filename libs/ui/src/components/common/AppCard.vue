<template>
  <div :class="cardClasses">
    <!-- Header -->
    <div
      v-if="$slots.header || title"
      class="px-6 py-4 border-b border-gray-200"
    >
      <slot name="header">
        <h3 class="text-lg font-medium text-gray-900">
          {{ title }}
        </h3>
      </slot>
    </div>

    <!-- Content -->
    <div :class="contentClasses">
      <slot />
    </div>

    <!-- Footer -->
    <div
      v-if="$slots.footer"
      class="px-6 py-4 border-t border-gray-200 bg-gray-50"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title?: string;
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  variant: 'default',
  padding: 'md',
  rounded: 'lg',
});

const cardClasses = computed(() => {
  const baseClasses = ['bg-white overflow-hidden'];

  const variantClasses = {
    default: 'border border-gray-200',
    bordered: 'border-2 border-gray-300',
    elevated: 'shadow-lg border border-gray-100',
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  };

  return [
    ...baseClasses,
    variantClasses[props.variant],
    roundedClasses[props.rounded],
  ].join(' ');
});

const contentClasses = computed(() => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return paddingClasses[props.padding];
});
</script>
