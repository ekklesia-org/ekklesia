import { ref, computed } from 'vue';
import { Church, CreateChurchRequest, UpdateChurchRequest } from '@ekklesia/shared';

export const useChurchService = () => {
  const churches = ref<Church[]>([]);
  const loading = ref(false);
  const error = ref<string>('');

  // Mock data for development
  const mockChurches: Church[] = [
    {
      id: '1',
      name: 'Central Church',
      slug: 'central_church',
      email: 'info@centralchurch.org',
      phone: '+1234567890',
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      isActive: true,
      userCount: 50,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-12-01'),
    },
    {
      id: '2',
      name: 'Grace Community Church',
      slug: 'grace_community',
      email: 'contact@gracechurch.org',
      phone: '+1234567891',
      address: '456 Oak Ave',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62702',
      isActive: true,
      userCount: 75,
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date('2024-12-01'),
    },
    {
      id: '3',
      name: 'Faith Baptist Church',
      slug: 'faith_baptist',
      email: 'office@faithbaptist.org',
      phone: '+1234567892',
      address: '789 Pine St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62703',
      isActive: false,
      userCount: 25,
      createdAt: new Date('2023-06-10'),
      updatedAt: new Date('2024-12-01'),
    },
  ];

  const activeChurches = computed(() => churches.value.filter(c => c.isActive));
  const totalUsers = computed(() => churches.value.reduce((sum, c) => sum + (c.userCount || 0), 0));

  const loadChurches = async () => {
    loading.value = true;
    error.value = '';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      churches.value = mockChurches;
    } catch (err) {
      error.value = 'Failed to load churches';
      console.error('Error loading churches:', err);
    } finally {
      loading.value = false;
    }
  };

  const createChurch = async (data: CreateChurchRequest): Promise<Church> => {
    loading.value = true;
    error.value = '';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newChurch: Church = {
        id: Date.now().toString(),
        name: data.churchName,
        slug: data.churchName.toLowerCase().replace(/\s+/g, '_'),
        email: data.churchEmail,
        phone: data.churchPhone,
        address: data.churchAddress,
        city: data.churchCity,
        state: data.churchState,
        zipCode: data.churchZip,
        isActive: true,
        userCount: 1, // Admin user
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      churches.value.push(newChurch);
      return newChurch;
    } catch (err) {
      error.value = 'Failed to create church';
      console.error('Error creating church:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateChurch = async (id: string, data: UpdateChurchRequest): Promise<Church> => {
    loading.value = true;
    error.value = '';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = churches.value.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Church not found');
      }

      const updatedChurch = {
        ...churches.value[index],
        ...data,
        updatedAt: new Date(),
      };

      churches.value[index] = updatedChurch;
      return updatedChurch;
    } catch (err) {
      error.value = 'Failed to update church';
      console.error('Error updating church:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteChurch = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = '';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = churches.value.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Church not found');
      }

      churches.value.splice(index, 1);
    } catch (err) {
      error.value = 'Failed to delete church';
      console.error('Error deleting church:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getChurchById = (id: string): Church | undefined => {
    return churches.value.find(c => c.id === id);
  };

  return {
    churches,
    loading,
    error,
    activeChurches,
    totalUsers,
    loadChurches,
    createChurch,
    updateChurch,
    deleteChurch,
    getChurchById,
  };
};
