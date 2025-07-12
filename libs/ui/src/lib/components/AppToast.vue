<template>
  <Teleport to="body">
    <Transition
      name="toast"
      appear
      @enter="onEnter"
      @leave="onLeave"
    >
      <div
        v-if="visible"
        :class="[
          'fixed z-50 flex flex-col overflow-hidden text-sm rounded-lg shadow-lg backdrop-blur-sm',
          positionClasses,
          typeClasses
        ]"
        :style="positionStyles"
        role="alert"
        @mouseenter="pauseTimer"
        @mouseleave="resumeTimer"
      >
        <!-- Main content -->
        <div class="flex items-center p-4">
          <div class="flex-shrink-0 mr-3">
            <CheckCircleIcon
              v-if="type === 'success'"
              class="h-5 w-5 animate-bounce-in"
            />
            <ExclamationTriangleIcon
              v-else-if="type === 'warning'"
              class="h-5 w-5 animate-bounce-in"
            />
            <XCircleIcon
              v-else-if="type === 'error'"
              class="h-5 w-5 animate-bounce-in"
            />
            <InformationCircleIcon
              v-else
              class="h-5 w-5 animate-bounce-in"
            />
          </div>
          <div class="flex-1">
            <div
              v-if="title"
              class="font-medium animate-slide-in"
            >
              {{ title }}
            </div>
            <div :class="['animate-slide-in', { 'mt-1': title }]">
              {{ message }}
            </div>
          </div>
          <button
            v-if="dismissible"
            class="flex-shrink-0 ml-4 p-1 rounded-md hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200 hover:scale-110"
            @click="dismiss"
          >
            <XMarkIcon class="h-4 w-4" />
          </button>
        </div>

        <!-- Countdown bar -->
        <div
          v-if="duration > 0 && showCountdown"
          class="h-1 bg-black bg-opacity-10 relative overflow-hidden"
        >
          <div
            :class="[
              'h-full transition-all ease-linear',
              countdownBarClasses
            ]"
            :style="progressBarStyle"
          />
        </div>
      </div>
    </Transition>
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
  showCountdown?: boolean;
  stackIndex?: number;
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  title: undefined,
  duration: 4000,
  dismissible: true,
  position: 'top-right',
  showCountdown: true,
  stackIndex: 0,
});

const emit = defineEmits<{
  dismiss: [];
}>();

const visible = ref(false);
const isPaused = ref(false);
const progressPercentage = ref(100);
const remainingTime = ref(0);
const showCountdown = ref(props.showCountdown);

let timeoutId: number | null = null;
let startTime: number = 0;
let pausedTime: number = 0;
let animationFrameId: number | null = null;

const progressBarStyle = computed(() => {
  return {
    width: `${progressPercentage.value}%`,
    transitionDuration: '50ms'
  }
});

const positionClasses = computed(() => {
  switch (props.position) {
    case 'top-right':
      return `right-4`;
    case 'top-left':
      return `left-4`;
    case 'bottom-right':
      return `right-4`;
    case 'bottom-left':
      return `left-4`;
    case 'top-center':
      return `left-1/2 transform -translate-x-1/2`;
    case 'bottom-center':
      return `left-1/2 transform -translate-x-1/2`;
    default:
      return `right-4`;
  }
});

const positionStyles = computed(() => {
  const stackOffset = props.stackIndex * 80; // 80px gap between toasts

  switch (props.position) {
    case 'top-right':
    case 'top-left':
    case 'top-center':
      return { top: `${16 + stackOffset}px` }; // 16px base + stack offset
    case 'bottom-right':
    case 'bottom-left':
    case 'bottom-center':
      return { bottom: `${16 + stackOffset}px` }; // 16px base + stack offset
    default:
      return { top: `${16 + stackOffset}px` };
  }
});

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-50/90 text-green-800 border border-green-200/50';
    case 'error':
      return 'bg-red-50/90 text-red-800 border border-red-200/50';
    case 'warning':
      return 'bg-yellow-50/90 text-yellow-800 border border-yellow-200/50';
    case 'info':
    default:
      return 'bg-blue-50/90 text-blue-800 border border-blue-200/50';
  }
});

const countdownBarClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-500';
    case 'error':
      return 'bg-red-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'info':
    default:
      return 'bg-blue-500';
  }
});

const updateProgress = () => {
  if (props.duration <= 0 || isPaused.value) return;

  const elapsed = Date.now() - startTime;
  const progress = Math.max(0, ((props.duration - elapsed) / props.duration) * 100);
  progressPercentage.value = progress;
  remainingTime.value = Math.max(0, props.duration - elapsed);

  if (elapsed < props.duration) {
    animationFrameId = requestAnimationFrame(updateProgress);
  } else {
    // Ensure progress reaches 0 when time is up
    progressPercentage.value = 0;
  }
};

const pauseTimer = () => {
  if (props.duration <= 0) return;

  isPaused.value = true;
  pausedTime = Date.now();

  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

const resumeTimer = () => {
  if (props.duration <= 0 || !isPaused.value) return;

  isPaused.value = false;
  const pauseDuration = Date.now() - pausedTime;
  startTime += pauseDuration;

  const remaining = remainingTime.value;
  if (remaining > 0) {
    timeoutId = window.setTimeout(() => {
      dismiss();
    }, remaining);

    animationFrameId = requestAnimationFrame(updateProgress);
  }
};

const dismiss = () => {
  visible.value = false;
  showCountdown.value = false;

  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

const show = () => {
  visible.value = true;
  showCountdown.value = props.showCountdown && props.duration > 0;

  if (props.duration > 0) {
    // Start timer immediately when show() is called
    startTime = Date.now();
    remainingTime.value = props.duration;
    progressPercentage.value = 100;

    timeoutId = window.setTimeout(() => {
      dismiss();
    }, props.duration);

    if (showCountdown.value) {
      animationFrameId = requestAnimationFrame(updateProgress);
    }
  }
};

// Transition hooks
const onEnter = (el: Element) => {
  // Toast has entered, nothing special needed
};

const onLeave = (el: Element) => {
  // Toast is leaving, emit dismiss after animation completes
  setTimeout(() => {
    emit('dismiss');
  }, 300);
};

onMounted(() => {
  // Show immediately but delay timer start to sync with visibility
  visible.value = true;
  showCountdown.value = props.showCountdown && props.duration > 0;

  // Delay timer start to match entrance animation
  setTimeout(() => {
    if (props.duration > 0) {
      startTime = Date.now();
      remainingTime.value = props.duration;
      progressPercentage.value = 100;

      timeoutId = window.setTimeout(() => {
        dismiss();
      }, props.duration);

      if (showCountdown.value) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    }
  }, 50);
});

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

defineExpose({
  show,
  dismiss,
  pauseTimer,
  resumeTimer,
});
</script>

<style scoped>
/* Toast entrance and exit animations */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) translateX(20px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) translateX(20px) scale(0.95);
}

/* Icon bounce animation */
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-10deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Text slide animation */
@keyframes slide-in {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.4s ease-out 0.2s both;
}

/* Countdown bar animation */
@keyframes countdown {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-countdown {
  animation: countdown linear;
}

/* Enhanced backdrop blur for better visual separation */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Smooth hover transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Enhanced shadow for better depth */
.shadow-lg {
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .toast-enter-from,
  .toast-leave-to {
    transform: translateY(-20px) scale(0.9);
  }

  .fixed {
    left: 1rem !important;
    right: 1rem !important;
    transform: none !important;
  }
}
</style>
