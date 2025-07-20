import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Society, ApiError, ICreateSocietyDto, IUpdateSocietyDto } from '@ekklesia/shared';
import { societiesApi } from '../services/societiesApi';
import { useSelectedChurch } from './selectedChurch';
import { useAuth } from './auth';

export const useSocietiesStore = defineStore('societies', () => {
  const selectedChurchStore = useSelectedChurch();
  const auth = useAuth();

  // State
  const societies = ref<Society[]>([]);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const limit = 10;

  // Getters
  const hasSocieties = computed(() => societies.value.length > 0);

  // Actions
  async function fetchSocieties(page = 1) {
    // For super admins, use the selected church. For regular admins, the API will use their church context
    const churchId = auth.user?.role === 'SUPER_ADMIN' ? selectedChurchStore.selectedChurchId ?? undefined : undefined;

    console.log('Fetching societies with:', {
      userRole: auth.user?.role,
      churchId,
      selectedChurchId: selectedChurchStore.selectedChurchId,
      page,
      limit
    });

    // If super admin and no church selected, show empty state
    if (auth.user?.role === 'SUPER_ADMIN' && !churchId) {
      societies.value = [];
      error.value = null;
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await societiesApi.getSocieties(churchId || '', { page, limit });
      console.log('Societies API response:', response);
      societies.value = response.data;
      currentPage.value = response.page;
      totalPages.value = response.totalPages;
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to fetch societies';
      console.error('Failed to fetch societies:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function createSociety(data: Omit<ICreateSocietyDto, 'churchId'>) {
    // For super admins, use the selected church. For regular admins, the API will use their church context
    const churchId = auth.user?.role === 'SUPER_ADMIN' ? selectedChurchStore.selectedChurchId ?? undefined : undefined;

    if (auth.user?.role === 'SUPER_ADMIN' && !churchId) {
      throw new Error('No church selected');
    }

    isSubmitting.value = true;
    error.value = null;

    try {
      const createData: ICreateSocietyDto = {
        ...data,
        churchId: churchId || '', // If not super admin, let the API determine the church
      };
      await societiesApi.createSociety(createData);
      await fetchSocieties(currentPage.value);
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to create society';
      console.error('Failed to create society:', err);
      throw err;
    } finally {
      isSubmitting.value = false;
    }
  }

  async function updateSociety(id: string, data: Partial<IUpdateSocietyDto>) {
    isSubmitting.value = true;
    error.value = null;

    try {
      await societiesApi.updateSociety(id, data);
      await fetchSocieties(currentPage.value);
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to update society';
      console.error('Failed to update society:', err);
      throw err;
    } finally {
      isSubmitting.value = false;
    }
  }

  async function deleteSociety(id: string) {
    isSubmitting.value = true;
    error.value = null;

    try {
      await societiesApi.deleteSociety(id);
      await fetchSocieties(currentPage.value);
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to delete society';
      console.error('Failed to delete society:', err);
      throw err;
    } finally {
      isSubmitting.value = false;
    }
  }

  async function deactivateSociety(id: string) {
    return updateSociety(id, { isActive: false });
  }

  async function activateSociety(id: string) {
    return updateSociety(id, { isActive: true });
  }

  return {
    // State
    societies,
    isLoading,
    isSubmitting,
    error,
    currentPage,
    totalPages,

    // Getters
    hasSocieties,

    // Actions
    fetchSocieties,
    createSociety,
    updateSociety,
    deleteSociety,
    deactivateSociety,
    activateSociety,
  };
});
