import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ChurchService } from '../services/churchService';
import { ChurchWithUsers, ICreateChurchDto, IUpdateChurchDto } from '@ekklesia/shared';

export const useChurchesStore = defineStore('churches', () => {
  const churchService = new ChurchService();

  // State
  const churches = ref<ChurchWithUsers[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalCount = ref(0);
  const limit = ref(10);

  // Getters
  const activeChurches = computed(() =>
    churches.value.filter(church => church.isActive)
  );

  const totalUsers = computed(() =>
    churches.value.reduce((sum, church) => sum + (church.userCount || 0), 0)
  );

  const churchCount = computed(() => churches.value.length);

  const isLoading = computed(() => loading.value);

  const hasError = computed(() => !!error.value);

  // Actions
  const fetchChurches = async (page = 1, includeInactive = false) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await churchService.getChurches(page, limit.value, includeInactive);
      churches.value = response.churches ?? [];
      currentPage.value = response.page;
      totalPages.value = response.totalPages;
      totalCount.value = response.total;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch churches';
      console.error('Error fetching churches:', err);
    } finally {
      loading.value = false;
    }
  };

  const getChurchById = async (id: string): Promise<ChurchWithUsers | null> => {
    try {
      // First check if we already have it in our store
      const existingChurch = churches.value.find(church => church.id === id);
      if (existingChurch) {
        return existingChurch;
      }

      // If not, fetch it from the API
      const church = await churchService.getChurch(id);
      return church;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get church';
      console.error('Error getting church:', err);
      return null;
    }
  };

  const getChurchBySlug = async (slug: string): Promise<ChurchWithUsers | null> => {
    try {
      // First check if we already have it in our store
      const existingChurch = churches.value.find(church => church.slug === slug);
      if (existingChurch) {
        return existingChurch;
      }

      // If not, fetch it from the API
      const church = await churchService.getChurchBySlug(slug);
      return church;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get church';
      console.error('Error getting church:', err);
      return null;
    }
  };

  const createChurch = async (data: ICreateChurchDto): Promise<ChurchWithUsers | null> => {
    loading.value = true;
    error.value = null;

    try {
      const newChurch = await churchService.createChurch(data);

      // Add to our local store
      churches.value.unshift(newChurch);
      totalCount.value += 1;

      return newChurch;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create church';
      console.error('Error creating church:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateChurch = async (id: string, data: IUpdateChurchDto): Promise<ChurchWithUsers | null> => {
    loading.value = true;
    error.value = null;

    try {
      const updatedChurch = await churchService.updateChurch(id, data);

      // Update in our local store
      const index = churches.value.findIndex(church => church.id === id);
      if (index !== -1) {
        churches.value[index] = updatedChurch;
      }

      return updatedChurch;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update church';
      console.error('Error updating church:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteChurch = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await churchService.deleteChurch(id);

      // Remove from our local store
      const index = churches.value.findIndex(church => church.id === id);
      if (index !== -1) {
        churches.value.splice(index, 1);
        totalCount.value -= 1;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete church';
      console.error('Error deleting church:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const hardDeleteChurch = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await churchService.hardDeleteChurch(id);

      // Remove from our local store
      const index = churches.value.findIndex(church => church.id === id);
      if (index !== -1) {
        churches.value.splice(index, 1);
        totalCount.value -= 1;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to permanently delete church';
      console.error('Error permanently deleting church:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const generateSlug = (name: string): string => {
    return churchService.generateSlug(name);
  };

  const clearError = () => {
    error.value = null;
  };

  const reset = () => {
    churches.value = [];
    loading.value = false;
    error.value = null;
    currentPage.value = 1;
    totalPages.value = 1;
    totalCount.value = 0;
  };

  return {
    // State
    churches,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    limit,

    // Getters
    activeChurches,
    totalUsers,
    churchCount,
    isLoading,
    hasError,

    // Actions
    fetchChurches,
    getChurchById,
    getChurchBySlug,
    createChurch,
    updateChurch,
    deleteChurch,
    hardDeleteChurch,
    generateSlug,
    clearError,
    reset,
  };
});
