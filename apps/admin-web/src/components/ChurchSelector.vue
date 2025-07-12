<template>
  <div class="relative">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ $t('churches.select_church') }}
    </label>
    <select
      v-model="selectedChurchId"
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      @change="handleChurchChange"
    >
      <option value="">
        {{ $t('churches.all_churches') || 'All Churches' }}
      </option>
      <option
        v-for="church in availableChurches"
        :key="church.id"
        :value="church.id"
      >
        {{ church.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useChurchesStore } from '../stores/churches';
import { useAuth } from '../stores/auth';
import { useSelectedChurch } from '../stores/selectedChurch';

const churchesStore = useChurchesStore();
const auth = useAuth();
const selectedChurchStore = useSelectedChurch();

const selectedChurchId = ref<string>('');

// Get available churches for selection
const availableChurches = computed(() => {
  return churchesStore.activeChurches.filter(church => church.isActive);
});

// Handle church selection change
const handleChurchChange = () => {
  if (selectedChurchId.value) {
    const church = availableChurches.value.find(c => c.id === selectedChurchId.value);
    if (church) {
      selectedChurchStore.setSelectedChurch(church);
    }
  } else {
    // Clear selected church when "All Churches" is selected
    selectedChurchStore.clearSelectedChurch();
  }
};

// Watch for changes in the selected church store
watch(
  () => selectedChurchStore.selectedChurch,
  (newChurch) => {
    if (newChurch) {
      selectedChurchId.value = newChurch.id;
    } else {
      selectedChurchId.value = '';
    }
  }
);

// Initialize component
onMounted(async () => {
  // Fetch churches if not already loaded
  if (churchesStore.churches.length === 0) {
    await churchesStore.fetchChurches();
  }

  // For super admins, default to "All Churches" (empty selection)
  // For other users, set default church to user's own church if available
  if (auth.user && auth.user.role !== 'SUPER_ADMIN' && auth.user.churchId) {
    selectedChurchId.value = auth.user.churchId;
    const userChurch = availableChurches.value.find(c => c.id === auth.user!.churchId);
    if (userChurch) {
      selectedChurchStore.setSelectedChurch(userChurch);
    }
  } else {
    // For super admins or when no specific church, default to "All Churches"
    selectedChurchId.value = '';
    selectedChurchStore.clearSelectedChurch();
  }
});
</script>
