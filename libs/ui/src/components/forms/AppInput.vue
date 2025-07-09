<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-red-500 ml-1"
      >*</span>
    </label>

    <div class="relative">
      <input
        :id="id"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :class="inputClasses"
        :autocomplete="autocomplete"
        :required="required"
        :disabled="disabled"
        v-bind="$attrs"
      >

      <!-- Icon slot -->
      <div
        v-if="$slots.icon"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <slot name="icon" />
      </div>

      <!-- Right icon/action -->
      <div
        v-if="$slots.rightIcon"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <slot name="rightIcon" />
      </div>
    </div>

    <!-- Error message -->
    <p
      v-if="error"
      class="text-sm text-red-600 mt-1"
    >
      {{ error }}
    </p>

    <!-- Help text -->
    <p
      v-if="helpText && !error"
      class="text-xs text-gray-500 mt-1"
    >
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';

interface Props {
  id?: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  modelValue?: string | number;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  autocomplete?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void;
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  label: undefined,
  type: 'text',
  placeholder: undefined,
  modelValue: undefined,
  error: undefined,
  helpText: undefined,
  required: false,
  disabled: false,
  autocomplete: undefined,
  size: 'md',
});

const emit = defineEmits<Emits>();
const attrs = useAttrs();

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value || ''),
});

const inputClasses = computed(() => {
  const baseClasses = [
    'w-full border rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'bg-gray-50 focus:bg-white',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ];

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-4 py-4 text-lg',
  };

  // Icon padding - simplified for now
  const iconPadding = ''; // TODO: Implement proper icon padding logic
  const rightIconPadding = ''; // TODO: Implement proper icon padding logic

  // Error state
  const errorClasses = props.error
    ? 'border-red-300 focus:ring-red-500 bg-red-50'
    : 'border-gray-200';

  return [
    ...baseClasses,
    sizeClasses[props.size],
    errorClasses,
    iconPadding,
    rightIconPadding,
  ].filter(Boolean).join(' ');
});
</script>
