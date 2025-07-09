<template>
  <Teleport to="body">
    <div
      v-if="visible"
      :class="[
        'fixed z-50 flex items-center p-4 text-sm rounded-lg shadow-lg transition-all duration-300',
        positionClasses,
        typeClasses,
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      ]"
      role="alert"
    >
      <div class="flex items-center">
        <div class="flex-shrink-0 mr-3">
          <CheckCircleIcon
            v-if="type === 'success'"
            class="h-5 w-5"
          />
          <ExclamationTriangleIcon
            v-else-if="type === 'warning'"
            class="h-5 w-5"
          />
          <XCircleIcon
            v-else-if="type === 'error'"
            class="h-5 w-5"
          />
          <InformationCircleIcon
            v-else
            class="h-5 w-5"
          />
        </div>
        <div class="flex-1">
          <div
            v-if="title"
            class="font-medium"
          >
            {{ title }}
          </div>
          <div :class="{ 'mt-1': title }">
            {{ message }}
          </div>
        </div>
        <button
          v-if="dismissible"
          class="flex-shrink-0 ml-4 p-1 rounded-md hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-white"
          @click="dismiss"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/20/solid';

export interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 4000,
  dismissible: true,
  position: 'top-right',
});

const emit = defineEmits<{
  dismiss: [];
}>();

const visible = ref(false);
let timeoutId: number | null = null;

const positionClasses = computed(() => {
  switch (props.position) {
    case 'top-right':
      return 'top-4 right-4';
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'top-center':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'bottom-center':
      return 'bottom-4 left-1/2 transform -translate-x-1/2';
    default:
      return 'top-4 right-4';
  }
});

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-50 text-green-800 border border-green-200';
    case 'error':
      return 'bg-red-50 text-red-800 border border-red-200';
    case 'warning':
      return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
    case 'info':
    default:
      return 'bg-blue-50 text-blue-800 border border-blue-200';
  }
});

const dismiss = () => {
  visible.value = false;
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  setTimeout(() => {
    emit('dismiss');
  }, 300); // Wait for animation to complete
};

const show = () => {
  visible.value = true;
  if (props.duration > 0) {
    timeoutId = setTimeout(() => {
      dismiss();
    }, props.duration);
  }
};

onMounted(() => {
  show();
});

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});

defineExpose({
  show,
  dismiss,
});
</script>
