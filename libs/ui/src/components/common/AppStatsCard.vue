<template>
  <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
    <div class="p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div :class="iconClasses">
            <slot name="icon" />
          </div>
        </div>
        <div class="ml-4 w-0 flex-1">
          <dt class="text-sm font-medium text-gray-500 truncate">
            {{ title }}
          </dt>
          <dd class="text-2xl font-semibold text-gray-900">
            {{ formattedValue }}
          </dd>
          <div
            v-if="$slots.subtitle"
            class="text-sm text-gray-600 mt-1"
          >
            <slot name="subtitle" />
          </div>
        </div>
      </div>

      <!-- Trend indicator -->
      <div
        v-if="trend"
        class="mt-4 flex items-center text-sm"
      >
        <component
          :is="trendIcon"
          :class="trendIconClasses"
        />
        <span
          :class="trendTextClasses"
          class="ml-1"
        >
          {{ trend.value }}{{ trend.unit }}
        </span>
        <span class="text-gray-500 ml-2">
          {{ trend.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface TrendData {
  value: number;
  unit: string;
  label: string;
  direction: 'up' | 'down' | 'neutral';
}

interface Props {
  title: string;
  value: number | string;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray';
  formatAs?: 'number' | 'currency' | 'percentage';
  trend?: TrendData;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  formatAs: 'number',
  trend: undefined,
});

const TrendUpIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
    </svg>
  `,
};

const TrendDownIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd" />
    </svg>
  `,
};

const TrendNeutralIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
    </svg>
  `,
};

const iconClasses = computed(() => {
  const colorClasses = {
    blue: 'h-8 w-8 text-blue-600',
    green: 'h-8 w-8 text-green-600',
    yellow: 'h-8 w-8 text-yellow-600',
    purple: 'h-8 w-8 text-purple-600',
    red: 'h-8 w-8 text-red-600',
    gray: 'h-8 w-8 text-gray-600',
  };

  return colorClasses[props.color];
});

const formattedValue = computed(() => {
  if (typeof props.value === 'string') {
    return props.value;
  }

  switch (props.formatAs) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(props.value);
    case 'percentage':
      return `${props.value}%`;
    default:
      return props.value.toLocaleString();
  }
});

const trendIcon = computed(() => {
  if (!props.trend) return null;

  const icons = {
    up: TrendUpIcon,
    down: TrendDownIcon,
    neutral: TrendNeutralIcon,
  };

  return icons[props.trend.direction];
});

const trendIconClasses = computed(() => {
  if (!props.trend) return '';

  const classes = {
    up: 'h-4 w-4 text-green-600',
    down: 'h-4 w-4 text-red-600',
    neutral: 'h-4 w-4 text-gray-600',
  };

  return classes[props.trend.direction];
});

const trendTextClasses = computed(() => {
  if (!props.trend) return '';

  const classes = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return classes[props.trend.direction];
});
</script>
