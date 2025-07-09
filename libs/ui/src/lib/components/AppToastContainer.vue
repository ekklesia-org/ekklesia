<template>
  <div>
    <AppToast
      v-for="toast in toasts"
      :key="toast.id"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      :dismissible="toast.dismissible"
      :position="toast.position"
      @dismiss="removeToast(toast.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast';
import AppToast from './AppToast.vue';

const { toasts, removeToast } = useToast();
</script>
