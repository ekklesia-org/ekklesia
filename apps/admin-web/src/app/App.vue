<script setup lang="ts">
import { RouterView } from 'vue-router';
import { AppToastContainer } from '@ekklesia/ui';
</script>

<template>
  <div
    id="app"
    class="min-h-screen bg-gray-50"
  >
    <RouterView />
    <AppToastContainer />
  </div>
</template>
