import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UserService } from '../services/userService';
import { User, CreateUserDto, UpdateUserDto } from '@ekklesia/shared';

export const useUsersStore = defineStore('users', () => {
  const userService = new UserService();

  // State
  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalCount = ref(0);
  const limit = ref(10);

  // Getters
  const activeUsers = computed(() =>
    users.value.filter(user => user.isActive)
  );

  const usersByRole = computed(() => {
    const roles: Record<string, User[]> = {};
    users.value.forEach(user => {
      if (!roles[user.role]) {
        roles[user.role] = [];
      }
      roles[user.role].push(user);
    });
    return roles;
  });

  const userCount = computed(() => users.value.length);

  const isLoading = computed(() => loading.value);

  const hasError = computed(() => !!error.value);

  // Actions
  const fetchUsers = async (page = 1, includeInactive = false, churchId?: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await userService.getUsers(page, limit.value, includeInactive, churchId);
      users.value = response.users;
      currentPage.value = response.page;
      totalPages.value = response.totalPages;
      totalCount.value = response.total;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users';
      console.error('Error fetching users:', err);
    } finally {
      loading.value = false;
    }
  };

  const getUserById = async (id: string): Promise<User | null> => {
    try {
      // First check if we already have it in our store
      const existingUser = users.value.find(user => user.id === id);
      if (existingUser) {
        return existingUser;
      }

      // If not, fetch it from the API
      const user = await userService.getUser(id);
      return user;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get user';
      console.error('Error getting user:', err);
      return null;
    }
  };

  const createUser = async (data: CreateUserDto): Promise<User | null> => {
    loading.value = true;
    error.value = null;

    try {
      const newUser = await userService.createUser(data);

      // Add to our local store
      users.value.unshift(newUser);
      totalCount.value += 1;

      return newUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create user';
      console.error('Error creating user:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (id: string, data: UpdateUserDto): Promise<User | null> => {
    loading.value = true;
    error.value = null;

    try {
      const updatedUser = await userService.updateUser(id, data);

      // Update in our local store
      const index = users.value.findIndex(user => user.id === id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }

      return updatedUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update user';
      console.error('Error updating user:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const activateUser = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await userService.activateUser(id);

      // Update in our local store
      const index = users.value.findIndex(user => user.id === id);
      if (index !== -1) {
        users.value[index].isActive = true;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to activate user';
      console.error('Error activating user:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deactivateUser = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await userService.deactivateUser(id);

      // Update in our local store
      const index = users.value.findIndex(user => user.id === id);
      if (index !== -1) {
        users.value[index].isActive = false;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to deactivate user';
      console.error('Error deactivating user:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await userService.deleteUser(id);

      // Remove from our local store
      const index = users.value.findIndex(user => user.id === id);
      if (index !== -1) {
        users.value.splice(index, 1);
        totalCount.value -= 1;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete user';
      console.error('Error deleting user:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const hardDeleteUser = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await userService.hardDeleteUser(id);

      // Remove from our local store
      const index = users.value.findIndex(user => user.id === id);
      if (index !== -1) {
        users.value.splice(index, 1);
        totalCount.value -= 1;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to permanently delete user';
      console.error('Error permanently deleting user:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const reset = () => {
    users.value = [];
    loading.value = false;
    error.value = null;
    currentPage.value = 1;
    totalPages.value = 1;
    totalCount.value = 0;
  };

  return {
    // State
    users,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    limit,

    // Getters
    activeUsers,
    usersByRole,
    userCount,
    isLoading,
    hasError,

    // Actions
    fetchUsers,
    getUserById,
    createUser,
    updateUser,
    activateUser,
    deactivateUser,
    deleteUser,
    hardDeleteUser,
    clearError,
    reset,
  };
});
