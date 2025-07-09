import { ref, computed } from 'vue';
import { Tenant, CreateTenantRequest, UpdateTenantRequest } from '@ekklesia/shared';

export const useTenantService = () => {
  const tenants = ref<Tenant[]>([]);
  const loading = ref(false);
  const error = ref<string>('');

  // Mock data for development
  const mockTenants: Tenant[] = [
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

  const activeTenants = computed(() => tenants.value.filter(t => t.isActive));
  const totalUsers = computed(() => tenants.value.reduce((sum, t) => sum + (t.userCount || 0), 0));

  const loadTenants = async () => {
    loading.value = true;
    error.value = '';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      tenants.value = mockTenants;
    } catch (err) {
      error.value = 'Failed to load tenants';
      console.error('Error loading tenants:', err);
    } finally {
      loading.value = false;
    }
  };

  const createTenant = async (data: CreateTenantRequest): Promise<Tenant> => {
    loading.value = true;
    error.value = '';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTenant: Tenant = {
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

      tenants.value.push(newTenant);
      return newTenant;
    } catch (err) {
      error.value = 'Failed to create tenant';
      console.error('Error creating tenant:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateTenant = async (id: string, data: UpdateTenantRequest): Promise<Tenant> => {
    loading.value = true;
    error.value = '';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = tenants.value.findIndex(t => t.id === id);
      if (index === -1) {
        throw new Error('Tenant not found');
      }

      const updatedTenant = {
        ...tenants.value[index],
        ...data,
        updatedAt: new Date(),
      };

      tenants.value[index] = updatedTenant;
      return updatedTenant;
    } catch (err) {
      error.value = 'Failed to update tenant';
      console.error('Error updating tenant:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteTenant = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = '';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = tenants.value.findIndex(t => t.id === id);
      if (index === -1) {
        throw new Error('Tenant not found');
      }

      tenants.value.splice(index, 1);
    } catch (err) {
      error.value = 'Failed to delete tenant';
      console.error('Error deleting tenant:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getTenantById = (id: string): Tenant | undefined => {
    return tenants.value.find(t => t.id === id);
  };

  return {
    tenants,
    loading,
    error,
    activeTenants,
    totalUsers,
    loadTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    getTenantById,
  };
};
