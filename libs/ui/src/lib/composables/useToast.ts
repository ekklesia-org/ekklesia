import { ref } from 'vue';
import type { ToastProps } from '../components/AppToast.vue';

export interface Toast extends ToastProps {
  id: string;
}

const toasts = ref<Toast[]>([]);

export const useToast = () => {
  const addToast = (toast: Omit<Toast, 'id'>): string => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      ...toast,
    };

    toasts.value.push(newToast);
    return id;
  };

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearAll = () => {
    toasts.value = [];
  };

// Convenience methods
  const success = (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => {
    return addToast({
      type: 'success',
      message,
      showCountdown: true,
      ...options,
    });
  };

  const error = (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => {
    return addToast({
      type: 'error',
      message,
      showCountdown: true,
      ...options,
    });
  };

  const warning = (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => {
    return addToast({
      type: 'warning',
      message,
      showCountdown: true,
      ...options,
    });
  };

  const info = (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => {
    return addToast({
      type: 'info',
      message,
      showCountdown: true,
      ...options,
    });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };
};
