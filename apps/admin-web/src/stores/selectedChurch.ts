import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ChurchWithUsers } from '../services/churchService';

export const useSelectedChurch = defineStore('selectedChurch', () => {
  // State
  const selectedChurch = ref<ChurchWithUsers | null>(null);

  // Getters
  const isChurchSelected = computed(() => selectedChurch.value !== null);
  const selectedChurchId = computed(() => selectedChurch.value?.id || null);
  const selectedChurchName = computed(() => selectedChurch.value?.name || '');

  // Actions
  const setSelectedChurch = (church: ChurchWithUsers | null) => {
    selectedChurch.value = church;
  };

  const clearSelectedChurch = () => {
    selectedChurch.value = null;
  };

  // Helper to get church context for API calls
  const getChurchContext = () => {
    return {
      churchId: selectedChurchId.value,
      churchName: selectedChurchName.value,
    };
  };

  return {
    // State
    selectedChurch,

    // Getters
    isChurchSelected,
    selectedChurchId,
    selectedChurchName,

    // Actions
    setSelectedChurch,
    clearSelectedChurch,
    getChurchContext,
  };
});
